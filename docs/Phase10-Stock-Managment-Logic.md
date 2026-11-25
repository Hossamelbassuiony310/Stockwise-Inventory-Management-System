# Phase 10 --- Stock Management Logic

## Overview

This phase implements the inventory-management logic for **Stockwise**.
It covers stock movement records, manual stock adjustments, automatic
stock deduction when an order is completed, stock validation, low-stock
reporting, and product-level stock history.

The implementation follows the existing project architecture: - Node.js
and Express - Sequelize ORM and MySQL - Server-rendered EJS views -
Promise chains using `.then()` and `.catch()` (without `async/await`) -
Database transactions for stock changes that must succeed or fail
together

---

## Part 1 --- Stock Movements Foundation

### StockMovement Model

The `StockMovement` model maps to `stock_movements` and contains:

| Field           | Description                                  |
| --------------- | -------------------------------------------- |
| `id`            | Primary key                                  |
| `product_id`    | Product affected by the movement             |
| `order_id`      | Related order; nullable for manual movements |
| `movement_type` | Type of stock movement                       |
| `quantity`      | Quantity recorded for the movement           |
| `createdAt`     | Creation timestamp                           |
| `updatedAt`     | Update timestamp                             |

**Supported Movement Types:**

- `IN` — Manually added stock.
- `OUT` — Manually removed stock.
- `SALE` — Stock deducted when an order is completed.
- `RETURN` — Supported by the model, but not used by the selected cancellation policy.
- `ADJUSTMENT` — Available movement type in the model.

### Associations

- Product has many StockMovements.
- StockMovement belongs to Product.
- Order has many StockMovements.
- StockMovement belongs to Order.

The product foreign key uses `ON DELETE RESTRICT`. The order foreign key is nullable and uses `ON DELETE SET NULL`.

---

## Part 2 --- Manual Stock Adjustment

Implemented in `src/services/stockManagementService.js`:

- `addStock(productId, quantity)`
- `removeStock(productId, quantity)`

Both functions validate the product ID and require a positive integer
quantity. They use a database transaction and lock the product row
before changing stock.

### Add Stock

1.  Validate product ID and quantity.
2.  Start a transaction and lock the product.
3.  Increase `stock_quantity`.
4.  Create an `IN` movement.
5.  Commit both changes together.

### Remove Stock

1.  Validate product ID and quantity.
2.  Start a transaction and lock the product.
3.  Reject the operation if the requested quantity exceeds current
    stock.
4.  Decrease `stock_quantity`.
5.  Create an `OUT` movement.
6.  Commit both changes together.

If an operation fails, the transaction prevents the product quantity and
movement history from becoming inconsistent.

### Website interface

Manual stock adjustment is available on `views/products/details.ejs`
through: - **Add Stock (IN)** - **Remove Stock (OUT)**

### Routes

| Method | Endpoint                     | Purpose      |
| ------ | ---------------------------- | ------------ |
| `POST` | `/products/:id/stock/add`    | Add stock    |
| `POST` | `/products/:id/stock/remove` | Remove stock |

## Part 3 --- Order Stock Deduction

When an order changes from `pending` to `completed`:

1.  The order is loaded and locked inside a transaction.
2.  Its status is checked to ensure it is currently `pending`.
3.  Its order items are loaded.
4.  An order with no items is rejected.
5.  Each product is loaded and locked.
6.  Available stock is checked against the order-item quantity.
7.  Product stock is decreased.
8.  A `SALE` movement is created and linked to the order.
9.  The order status is updated to `completed`.

Stock updates, movement records, and the order status update are part of
the same transaction. If validation or a database operation fails, the
transaction rolls back.

The existing order-update flow only allows pending orders to be updated,
preventing a completed order from being completed again through that
flow.

---

## Part 4 --- Stock Validation

### Add Order Item

`addOrderItem` validates that:

- Quantity is a positive integer.
- The order exists and is `pending`.
- The product exists.
- The resulting quantity for that product in the order does not exceed current product stock.

The order and product rows are locked during the transaction.

### Update Order Item

`updateOrderItem` validates that:

- Quantity is a positive integer.
- The order item and order exist.
- The order is `pending`.
- The product exists.
- The requested quantity does not exceed current product stock.

The order and product rows are locked during the transaction.

### Completing an Order

Stock is checked again when an order is completed because inventory may have changed after the order items were first added.

### Pending-Order Policy

Pending orders do **not** reserve stock. Add and update operations check actual current stock, and stock is checked again when the order is completed.

**Example:**

- Current stock is 20.
- Pending Order A requests 15 units.
- Pending Order B requests 15 units.
- Both pending orders can be saved because pending orders do not reserve stock.
- Completing one order reduces stock to 5.
- Completing the other order is rejected because only 5 units remain.

---

## Part 5 --- Order Cancellation & Stock Policy

The selected business rule is:

- A `pending` order can be cancelled without changing product stock,
  because stock has not yet been deducted.
- A `completed` order must not be cancelled through the system.
- Stock deducted for a completed order is not automatically returned
  to inventory.
- Refunds, if any, are handled outside Stockwise.
- A cancelled order cannot be cancelled again.

**Implementation note:** This policy was agreed during the phase. The
final code-level enforcement of the completed-order cancellation
restriction should be verified in the final regression test before
treating the policy as fully implemented.

The `RETURN` movement type remains available in the model, but it is not
part of the selected cancellation workflow.

---

## Part 6 --- Low Stock Management

A product is considered low stock when:

`stock_quantity <= low_stock_threshold`

The Product model already contains:

- `stock_quantity` — current stock quantity.
- `low_stock_threshold` — minimum stock threshold, defaulting to 5.

A `getLowStockProducts` service function retrieves products meeting this condition and includes their category. The controller renders `products/low-stock`.

### Route and View

| Method | Endpoint              | View                           |
| ------ | --------------------- | ------------------------------ |
| `GET`  | `/products/low-stock` | `views/products/low-stock.ejs` |

The Products page includes a **Low Stock** link. The low-stock page displays product information, current stock, minimum stock, and status.

Products with zero stock are labelled **Out of stock**.

---

## Part 7 --- Stock History

The product details query includes:

- Product category.
- Product suppliers.
- Product stock movements.
- Related order ID and order number, when a movement is linked to an order.

Movements are ordered from newest to oldest.

The product details controller passes the movements to `views/products/details.ejs`.

### Stock Movement History

The **Stock Movement History** table displays:

| Column   | Description                                                             |
| -------- | ----------------------------------------------------------------------- |
| Type     | Movement type (`IN`, `OUT`, `SALE`, etc.)                               |
| Quantity | Positive sign for `IN` and `RETURN`; negative sign for `OUT` and `SALE` |
| Order    | Related order number, when available                                    |
| Date     | Movement timestamp                                                      |

When a movement is linked to an order, its order number links to the order details page. If there are no movements, the page displays an empty-state message.

The product details page also contains the manual stock adjustment forms, allowing users to add or remove stock and see the resulting movement in the history.

---

## Part 8 — Testing

### Checks Performed During Implementation

#### Manual Stock Adjustment

| Scenario                                      | Observed Result                                    |
| --------------------------------------------- | -------------------------------------------------- |
| Add 5 units to Product ID 1, initially 25     | Stock became 30                                    |
| Remove 3 units from Product ID 1              | Stock became 27                                    |
| Attempt to remove 100 units when stock was 27 | Rejected with insufficient-stock error             |
| Inspect movement records                      | `IN` quantity 5 and `OUT` quantity 3 were recorded |

#### Order Completion

A test pending order was completed:

| Item                    | Observed Result                           |
| ----------------------- | ----------------------------------------- |
| Test order              | Order ID 10                               |
| Product                 | Product ID 6                              |
| Quantity                | 1                                         |
| Stock before completion | 20                                        |
| Stock after completion  | 19                                        |
| Order status            | `completed`                               |
| Movement                | `SALE`, quantity 1, linked to Order ID 10 |

An attempt to edit the completed order through the existing order update flow was rejected.

#### Website Stock Validation

The following website checks were reported as successful:

- Adding an order item with an available quantity.
- Attempting to add an order item with a quantity greater than available stock; the operation was rejected.

### Remaining Final Regression Checks

Before marking Part 8 fully complete, verify and record:

- Update an order item to a quantity within available stock.
- Attempt to update an order item above available stock and confirm the existing item and order totals remain unchanged.
- Complete an order with sufficient stock.
- Attempt to complete an order with insufficient stock and confirm the transaction rolls back.
- Confirm a completed order cannot be completed a second time.
- Cancel a pending order and confirm stock does not change.
- Confirm the system rejects cancellation of a completed order.
- Confirm low-stock results include products at the threshold and exclude products above it.
- Confirm product stock history displays `IN`, `OUT`, and `SALE` movements in descending date order.
- Confirm an unsuccessful manual stock operation creates no movement record.

---

## Phase 10 Completion Status

| Part   | Description                | Status                                                       |
| ------ | -------------------------- | ------------------------------------------------------------ |
| Part 1 | Stock Movements Foundation | Completed                                                    |
| Part 2 | Manual Stock Adjustment    | Implemented and manually tested                              |
| Part 3 | Order Stock Deduction      | Implemented and tested with a completed order                |
| Part 4 | Stock Validation           | Implemented; final regression checks remain                  |
| Part 5 | Order Cancellation         | Policy defined; code-level enforcement requires verification |
| Part 6 | Low Stock Management       | Implemented                                                  |
| Part 7 | Stock History              | Implemented                                                  |
| Part 8 | Testing                    | Partially tested; final regression checklist remains         |

**Phase 10 has its main features implemented.**

Complete the remaining Part 8 regression checks and verify the Part 5 cancellation restriction before marking the phase fully complete.

---

## Main Files Involved

| File                                     | Responsibility                                           |
| ---------------------------------------- | -------------------------------------------------------- |
| `src/models/StockMovement.js`            | Stock movement model                                     |
| `src/models/index.js`                    | Product, Order, and StockMovement associations           |
| `src/services/stockManagementService.js` | Manual stock add/remove logic                            |
| `src/services/orderService.js`           | Order completion and stock deduction                     |
| `src/services/orderItemService.js`       | Order-item stock validation                              |
| `src/services/productService.js`         | Product retrieval, low-stock query, and movement history |
| `src/controllers/productController.js`   | Product, low-stock, and stock-adjustment controllers     |
| `src/routes/productRoutes.js`            | Product and stock-adjustment routes                      |
| `views/products/index.ejs`               | Products list and Low Stock link                         |
| `views/products/low-stock.ejs`           | Low-stock products page                                  |
| `views/products/details.ejs`             | Product details, stock adjustment, and stock history     |
