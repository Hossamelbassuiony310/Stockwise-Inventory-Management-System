# PHASE 11 --- Dashboard Statistics

## Overview

Phase 11 focused on building the Stockwise dashboard and connecting it to real database statistics. The dashboard provides a quick overview of products, inventory, orders, sales performance, and recent activity.

The dashboard is available through both `/` and `/dashboard`. Both routes use the same controller and render `dashboard.ejs`.

## 1. Dashboard Architecture

```text
src/
├── controllers/
│   └── dashboardController.js
├── routes/
│   └── dashboardRoutes.js
└── services/
    └── dashboardService.js

views/
└── dashboard.ejs
```

## 2. Dashboard Routes

**File:** `src/routes/dashboardRoutes.js`

| Method | Route        | Description                                      |
| ------ | ------------ | ------------------------------------------------ |
| `GET`  | `/`          | Displays the dashboard as the home page.         |
| `GET`  | `/dashboard` | Displays the dashboard through its explicit URL. |

The routes are mounted in `src/app.js`:

```js
app.use("/", dashboardRoutes);
```

## 3. Dashboard Controller

**File:** `src/controllers/dashboardController.js`

The `getDashboard` controller requests eight data sections from `dashboardService`:

1. Overview statistics
2. Sales statistics
3. Total inventory value
4. Low-stock count
5. Order status statistics
6. Sales chart data
7. Recent orders
8. Top-selling products

`Promise.all()` waits for all service calls. When they resolve, the controller passes the results to `dashboard.ejs` through `res.render()`.

If a request fails, the error is logged and the server responds with HTTP `500` and `Error loading dashboard`.

## 4. Dashboard Service Functions

**File:** `src/services/dashboardService.js`

### 4.1 `getOverviewStats()`

Returns the total counts of products, customers, suppliers, and orders.

**Returned fields:**

- `totalProducts`
- `totalCustomers`
- `totalSuppliers`
- `totalOrders`

### 4.2 `getSalesStats()`

Calculates total revenue by summing the `total` field of orders whose status is `completed`.

Only completed orders contribute to revenue. If there are no completed orders, the result is `0`.

**Returned field:** `totalRevenue`.

### 4.3 `getTotalInventoryValue()`

Calculates an estimated value for current inventory:

1. Reads each product's `stock_quantity`.
2. Reads supplier purchase prices from the product-supplier relationships.
3. Calculates the average purchase price across the product's linked suppliers.
4. Multiplies the average purchase price by the current stock quantity.
5. Adds the product value to the overall inventory value.

**Important notes:**

- Purchase prices are stored in `product_suppliers`, not directly on the Product model.
- Products without linked suppliers are excluded because no supplier purchase price is available.
- This is an estimated valuation based on the average purchase price of linked suppliers.

### 4.4 `getLowStockCount()`

Counts products whose current stock is less than or equal to their low-stock threshold:

```text
stock_quantity <= low_stock_threshold
```

## 5. Dashboard User Interface

File: `views/dashboard.ejs`

### 5.1 Header

Includes the `Welcome to Stockwise` heading and an Add Product action.

### 5.2 Summary Cards

| Card                  | Data Source                   |
| --------------------- | ----------------------------- |
| Total Products        | `overviewStats.totalProducts` |
| Total Inventory Value | `totalInventoryValue`         |
| Low Stock Items       | `lowStockCount`               |
| Orders                | `overviewStats.totalOrders`   |

The Orders card also displays pending, completed, and cancelled counts from `orderStats`.

Inventory value is formatted for display using `toLocaleString()`.

### 5.3 Sales Overview

Displays total revenue from `salesStats.totalRevenue`. This value
includes completed orders only.

### 5.4 Sales Chart

The view includes:

```html
<canvas id="salesChart"></canvas>
```

Chart.js is loaded from its CDN and used to render the sales chart.

To avoid placing EJS interpolation directly inside a JavaScript
expression, chart data is embedded as JSON and parsed separately:

```ejs
<script type="application/json" id="sales-chart-data">
  <%- JSON.stringify(salesChart || []) %>
</script>
```

```js
const salesData = JSON.parse(
  document.getElementById("sales-chart-data").textContent,
);
```

The JavaScript extracts the dates and revenue values and passes them to
Chart.js.

### 5.5 Stock by Category

The dashboard contains a Stock by Category section. At the time of this
documentation, this section is a UI placeholder and is not connected to
category-based stock statistics.

### 5.6 Recent Orders Table

Displays the latest five orders with:

- Order number
- Customer name
- Total
- Status
- Creation date
- Link to order details at `/orders/:id`

### 5.7 Top-Selling Products Table

Displays up to five products with their total quantities sold. Only
completed orders are included.

## 6. Business Rules Applied

1.  Only completed orders contribute to total sales revenue.
2.  Only completed orders contribute to top-selling product quantities.
3.  Inventory value is estimated using average purchase prices from
    linked suppliers.
4.  Products without suppliers are excluded from inventory valuation.
5.  A product is low stock when `stock_quantity <= low_stock_threshold`.
6.  Recent Orders displays the five most recently created orders.
7.  Order status counts are separated into pending, completed, and
    cancelled.

## 7. Error Handling

Dashboard loading failures are handled by the controller's `.catch()`
block:

- The error is written to the server console.
- The dashboard is not rendered with incomplete data.
- The request receives HTTP status `500`.

## 8. Dependencies and Model Associations

The dashboard uses existing project dependencies and models:

- Express
- EJS
- Sequelize
- MySQL
- Chart.js (loaded through a CDN in the dashboard view)

Relevant Sequelize associations include:

- Order → Customer (`customer`)
- OrderItem → Order (`order`)
- Product → Supplier (`suppliers`)

## 9. Testing and Verification Checklist

Verify each item against the running application and database before
marking it complete:

- [ ] `/` opens the dashboard.
- [ ] `/dashboard` opens the same dashboard.
- [ ] Product, customer, supplier, and order counts match the
      database.
- [ ] Revenue includes completed orders only.
- [ ] Inventory value uses linked supplier purchase prices.
- [ ] Products without suppliers are excluded from inventory
      valuation.
- [ ] Low-stock count follows `stock_quantity <= low_stock_threshold`.
- [ ] Pending, completed, and cancelled counts are correct.
- [ ] The sales chart loads and displays the returned data.
- [ ] Recent Orders shows no more than five latest orders.
- [ ] Customer names display correctly, including the walk-in
      fallback.
- [ ] Top-selling products include completed orders only.
- [ ] Top-selling products are ordered by quantity sold.
- [ ] A dashboard query failure is logged and returns HTTP 500.

## 10. Phase Completion Summary

### Implemented

- Dashboard routes for `/` and `/dashboard`.
- Dashboard controller.
- Dashboard service and statistics queries.
- Overview cards for products, inventory value, low stock, and orders.
- Completed-order revenue calculation.
- Order status counts.
- Seven-day sales data retrieval.
- Recent orders table.
- Top-selling products calculation.
- Chart.js integration for the sales chart.
- Dashboard error handling.

### Follow-up / Verification Notes

- Verify all dashboard values against the database.
- Test the sales chart with dates that have no sales and confirm the
  desired zero-value behavior.
- Verify the top-selling products query on the project's MySQL
  configuration, particularly if `ONLY_FULL_GROUP_BY` is enabled.
- The Stock by Category section remains a placeholder until its
  statistics query and UI are implemented.

## Result

Phase 11 establishes a centralized dashboard for viewing the current
state of Stockwise. It brings together product, inventory, order, and
sales information using the existing database models and service
architecture, without changing the underlying order or stock-management
workflows.
