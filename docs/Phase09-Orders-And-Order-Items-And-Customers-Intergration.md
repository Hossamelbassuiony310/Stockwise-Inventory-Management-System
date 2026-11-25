# Phase 09 --- Orders, Order Items & Customer Integration

**Project:** Stockwise --- Inventory Management System\
**Phase:** 09\
**Stack:** Node.js, Express.js, EJS, Sequelize, MySQL

---

## 1. Phase Overview

Phase 09 adds order management to Stockwise, connects orders with
customers, manages the products included in each order, and protects
historical order data from accidental deletion.

The phase is divided into four areas:

1.  Orders CRUD
2.  Order Items
3.  Customer & Orders Integration
4.  Product Deletion Protection

---

## 2. Part 1 --- Orders CRUD

Implemented the main order-management operations:

- **Create Order:** Create a new order and optionally associate it
  with a customer.
- **View All Orders:** Display orders with customer, date, item count,
  total, and status.
- **View Order Details:** Display order information and its associated
  products.
- **Update Order:** Update customer, discount, discount type, and
  status according to the order's business rules.
- **Delete Order:** Delete an order; its order items are removed
  through the configured database relationship.
- **Customer Relationship:** Each order can be associated with a
  customer. The `customer_id` field is nullable.

### Order Number Generation

Order and invoice numbers are generated automatically by the service. A
yearly sequence is maintained in the `order_sequences` table.

Examples:

- Order Number: `ORD-2026-001`
- Invoice Number: `INV-2026-001`

The order number and invoice number use the same yearly sequence counter
while remaining separate values.

### Discount and Total Calculation

Orders support two discount types:

- **Fixed discount:** A fixed amount is deducted from the subtotal.
- **Percentage discount:** A percentage is deducted from the subtotal.

The service calculates the subtotal and total on the server; it does not
rely on totals or product prices submitted by the browser.

Validations include:

- Discount cannot be negative.
- Percentage discount cannot exceed 100%.
- Fixed discount cannot exceed the order subtotal.
- Only pending orders can be edited.

### Order Routes

| Method | Route                | Purpose                       |
| ------ | -------------------- | ----------------------------- |
| `GET`  | `/orders`            | View all orders               |
| `GET`  | `/orders/create`     | Display the create-order form |
| `POST` | `/orders`            | Create an order               |
| `GET`  | `/orders/:id`        | View order details            |
| `GET`  | `/orders/:id/edit`   | Display the edit-order form   |
| `POST` | `/orders/:id/update` | Update order information      |
| `POST` | `/orders/:id/delete` | Delete an order               |

## 3. Part 2 --- Order Items

Implemented management of products inside an order.

### Features

- Add products to an order.
- Specify a quantity for each product.
- Display product name and SKU on the order item.
- Save the product's selling price at the time the order item is
  created.
- Calculate each order item's line total.
- Calculate the order subtotal from its order items.
- Calculate the final order total after applying the discount.
- Update an order item's quantity.
- Delete an order item.
- Add, update, or delete order items only while the order is pending.

### Price Snapshot

The order item stores the product name, SKU, and unit price at the time
it is added to the order. This preserves historical order details if the
product's name, SKU, or selling price changes later.

### Calculations

For each order item:

`Line Total = Quantity × Unit Price`

For the order:

`Subtotal = Sum of all Order Item Line Totals`

The final total is calculated after applying the selected discount:

- Fixed: `Total = Subtotal - Discount`
- Percentage: `Total = Subtotal - (Subtotal × Discount / 100)`

Product prices are retrieved from the database by the service. Values
submitted by the browser are not trusted for order pricing.

### Order Item Routes

| Method | Route                                   | Purpose                         |
| ------ | --------------------------------------- | ------------------------------- |
| `POST` | `/orders/:orderId/items`                | Add a product to an order       |
| `POST` | `/orders/:orderId/items/:itemId/update` | Update an order item's quantity |
| `POST` | `/orders/:orderId/items/:itemId/delete` | Delete an order item            |

## 4. Part 3 --- Customer & Orders Integration

Completed the customer-related tasks deferred from Phase 08.

### Customer Orders

- The customer details page displays the customer's orders.
- Each order displays its products and their details.
- Order item information includes product name, SKU, unit price,
  quantity, and line total.

### Customer Deletion Protection

- A customer cannot be deleted while they have associated orders.
- The service checks for related orders before deleting the customer.
- The application returns an error when deletion is blocked.

### Customer--Order Relationship

The Sequelize relationship is configured in both directions:

- A customer has many orders.
- An order belongs to a customer.

Aliases used by the application:

- `Customer.hasMany(Order, { as: "orders" })`
- `Order.belongsTo(Customer, { as: "customer" })`

The database relationship uses `orders.customer_id` as a foreign key
referencing `customers.id`.

### Customer List Statistics

The customers list uses related orders to display:

- **Orders Count:** Number of orders associated with the customer.
- **Total Spent:** Sum of the customer's completed orders only.

---

## 5. Deferred Tasks --- Product Deletion Protection

Implemented protection against deleting products that are part of
existing orders.

### Order Items Protection

- Before deleting a product, the service checks whether any
  `OrderItem` records reference it.
- If related order items exist, deletion is rejected.
- The protection applies regardless of order status, preserving
  historical order records.

### Product Deletion Validation

The product deletion service validates:

1.  The product ID is a valid positive integer.
2.  The product exists.
3.  No order items are associated with the product.

The checks and deletion are performed inside a database transaction.

### Deletion Testing

| Test Case                                              | Expected Result                |
| ------------------------------------------------------ | ------------------------------ |
| Delete a product referenced by one or more order items | Deletion is rejected.          |
| Delete a product with no related order items           | Deletion succeeds.             |
| Delete a product using an invalid ID                   | Deletion is rejected.          |
| Delete a product that does not exist                   | A not-found error is returned. |

Run these cases against the development database to verify both successful deletion and deletion protection.

### Intentionally Postponed

Stock Movement protection is **not included** in this phase because
Stock Movements functionality has not been implemented yet.

Product deletion protection against `StockMovement` records should be
added when the Stock Movements feature is developed.

---

## 6. Main Database Relationships Used

| Relationship          | Description                                                     |
| --------------------- | --------------------------------------------------------------- |
| Customer → Orders     | One customer can have many orders.                              |
| Order → Customer      | An order can belong to one customer; `customer_id` is nullable. |
| Order → Order Items   | One order can contain multiple order items.                     |
| Order Item → Order    | Each order item belongs to one order.                           |
| Product → Order Items | A product can be referenced by multiple order items.            |
| Order Item → Product  | Each order item references one product.                         |

### Important Foreign-Key Behavior

- Deleting an order cascades to its order items.
- The application blocks deleting a product when order items reference
  it.
- The application blocks deleting a customer when the customer has
  orders.
- The customer foreign key is configured with `ON DELETE SET NULL`,
  providing a database-level fallback if a customer is deleted outside
  the application's service layer.

---

## 7. Business Rules Implemented in This Phase

- Order numbers and invoice numbers are generated automatically.
- Order and invoice numbering uses a yearly sequence.
- An order can optionally be linked to a customer.
- Product prices are read from the database when adding order items.
- Product name, SKU, and unit price are stored on the order item as a
  historical snapshot.
- Subtotal is calculated from order items.
- Total is calculated by applying the order discount.
- Discounts can be fixed amounts or percentages.
- Discount values are validated.
- Only pending orders can be edited.
- Order items can only be added, updated, or deleted while the order
  is pending.
- Customers with existing orders cannot be deleted.
- Products referenced by order items cannot be deleted.

---

## 8. Scope Notes & Future Work

The following items are outside the implemented scope of Phase 09 and
remain for future phases:

- Stock Movements functionality.
- Product deletion protection against Stock Movement records.
- Stock deduction when an order changes to `completed`.
- Stock availability validation when adding or updating order items.
- Additional inventory workflows around order completion and
  cancellation.

These items should be implemented together with the Stock Movements and
inventory workflow so that stock changes remain consistent and
traceable.

---

## 9. Phase 09 Completion Summary

Area Result

---

Orders CRUD Implemented
Order number and invoice number generation Implemented
Order Items management Implemented
Order subtotal and total calculations Implemented
Fixed and percentage discounts Implemented
Customer--Order integration Implemented
Customer orders on customer details page Implemented
Customer deletion protection Implemented
Product deletion protection via Order Items Implemented
Stock Movement deletion protection Postponed

**Phase 09 adds order and order-item management, integrates orders with
customers, and protects customer and product records referenced by
historical orders.**
