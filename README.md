# Stockwise — Inventory Management System


## 1. Project Overview
Stockwise is a web-based Inventory Management System designed to help a single-store business manage its products, inventory, suppliers, customers, and sales orders.

The system provides a centralized interface for managing inventory operations, tracking sales, and generating PDF invoices.

## 2. Project Scope

Business Type: Single Store / Single Warehouse  
The system will support:  

- Product Management
- Category Management
- Supplier Management
- Customer Management
- Order Management
- Inventory Tracking
- Stock Movement History
- Cash Payment Management
- PDF Invoice Generation
- Dashboard Statistics


## 3. Business Requirements

### Product Management

- Create, view, update, and delete products.
- Assign every product to a category.
- Associate products with multiple suppliers.
- Require at least one supplier for every product.
- Upload and manage product images.
- Track selling prices and available stock.
- Configure low-stock thresholds.
- Use a unique SKU for every product.


### Category Management

- Create, view, update, and delete categories.
- Organize products into categories.
- Prevent products from existing without a category.

### Supplier Management

- Create and manage supplier information.
- Associate suppliers with multiple products.
- Allow products to have multiple suppliers.
- Store a separate current purchase price for each product-supplier relationship.

### Customer Management

- Create and manage customer records.
- View customer order history.
- Support orders without registered customers (Walk-in Customers).

### Order Management

- Create orders containing multiple products.
- Allow editing pending orders, including products, quantities, and discounts.
- Prevent editing completed orders.
- Prevent reopening cancelled orders.
- Generate unique automatic order numbers.
- Support percentage-based and fixed-amount discounts.
- Calculate order subtotals, discounts, and totals.
- Track order status.
- Generate PDF invoices when orders are created and completed.
- Use a separate unique invoice number for each order.
- Support order cancellation.

### Payment Management

- Support cash payments only.
- Require full payment before completing an order.
- Do not support partial payments.
- Do not integrate online payment gateways in the first version.


### Inventory Management

- Track current product quantities.
- Record all stock movements.
- Support manual stock adjustments.
- Deduct inventory when an order becomes completed.
- Restore inventory when a completed order is cancelled.
- Prevent sales that exceed available stock.
- Prevent duplicate inventory deductions or restorations.


### Dashboard

- Display total products.
- Display inventory value.
- Display low-stock products.
- Display orders statistics.
- Display sales overview for the last 7 days.
- Display stock distribution by category.
- Display recent orders.

### Search and Filtering

- Provide search and filtering capabilities on relevant pages.
- Support searching and filtering products, customers, and orders.


## 4. Confirmed Business Rules

### General Rules

1. The application supports one store and one warehouse.
2. Every product must belong to a category.
3. A product must have at least one supplier.
4. A product can have multiple suppliers.
5. Each product-supplier relationship has its own current purchase price.
6. SKU must be unique across the entire system.
7. The system uses EGP as its only currency.
8. Taxes and VAT are not included in the first version.

### Order Rules

9. Orders can be created with a registered customer or without a customer (Walk-in Customer).
10. The customer_id field in Orders is nullable.
11. Every order must have a unique automatically generated order number.
12. A product can appear only once within the same order.
13. Adding an existing product to an order updates its quantity instead of creating a duplicate order item.
14. Pending orders can be edited, including products, quantities, and discounts.
15. Completed orders cannot be edited.
16. Cancelled orders cannot be reopened.
17. A new order must be created instead of reopening a cancelled order.
18. Discounts can be percentage-based or fixed amounts.
19. Discount amounts must not exceed the order subtotal.

### Payment Rules

20. Cash is the only supported payment method.
21. Every order must be fully paid before it can become completed.
22. Partial payments are not supported.
23. Refunds are handled outside the system when an order is cancelled.

### Inventory Rules

24. Creating a pending order does not deduct inventory.
25. Inventory is deducted when an order transitions to completed.
26. Stock quantities must never become negative.
27. A completed order must not deduct inventory more than once.
28. Cancelling a pending order does not affect inventory.
29. Cancelling a completed order restores the sold quantities to inventory.
30. Every inventory restoration must create a stock movement of type RETURN.
31. Inventory must never be restored more than once for the same cancelled order.
32. Every manual stock adjustment must be recorded in StockMovements.
33. Insufficient stock prevents an order from becoming completed.

### Invoice Rules

34. Every order has a unique invoice number separate from its order number.
35. PDF invoices are generated when an order is created.
36. PDF invoices are generated again when an order becomes completed.


## 5. Database

**Database:** MySQL,   
**ORM:** Sequelize, 

### Database Tables

1. Categories
2. Suppliers
3. Products
4. ProductSuppliers
5. Customers
6. Orders
7. OrderItems
8. StockMovements

### Important Database Constraints

- Unique SKU.
- Unique Order Number.
- Unique Invoice Number.
- Unique combination of order_id and product_id in OrderItems.
- Composite Primary Key in ProductSuppliers.
- Foreign Keys for all relationships.
- Non-negative prices and stock quantities.
- Positive order item quantities.
- Non-negative order totals and discounts.

## 6. Technology Stack

* Node.js
* Express.js
* EJS
* MySQL
* Sequelize
* PDF Generation

## 7. Architecture

**Application Type:** Server-Side Rendered Web Application  

**rchitecture Pattern:** Model-View-Controller (MVC)  

The application will follow a modular and organized structure, separating database models, routes, controllers, and views.


## 8. Project Status

Currently completing Requirements Analysis and Business Rules.

The database design will be finalized based on the confirmed requirements before starting implementation.

## 9. Documentation

Additional technical documentation and architecture diagrams will be maintained in the docs/ directory.




