# Phase 04 — Database Migrations & Schema Creation

## 1. Overview

This phase focused on creating the Stockwise database schema using Sequelize CLI migrations.

Instead of using sequelize.sync(), the project uses explicit migrations to create and manage database tables in a controlled, versioned, and reversible way.

The main objectives were:

- Configuring Sequelize CLI.
- Setting up migration and seeder directories.
- Creating migrations for all eight database tables.
- Defining primary keys and foreign key constraints.
- Configuring unique constraints and indexes.
- Defining ENUM fields and default values.
- Executing migrations against the MySQL database.
- Verifying the generated database schema.

**ORM:** Sequelize 6.37.8
**Migration Tool:** Sequelize CLI 6.6.5
**Database: MySQL 8**
**Database Driver:** mysql2
**Language:** JavaScript (CommonJS)

## 2. Sequelize CLI Configuration

Sequelize CLI was installed as a development dependency:
``` text
npm install --save-dev sequelize-cli
```

The installed version was verified using:

``` text
npx sequelize-cli --version
```

### 2.1 Project Configuration

A .sequelizerc file was created in the project root to configure Sequelize CLI paths.

``` javascript
const path = require('path');

module.exports = {
  config: path.resolve('src/config', 'config.js'),
  'models-path': path.resolve('src/models'),
  'seeders-path': path.resolve('src/seeders'),
  'migrations-path': path.resolve('src/migrations'),
};
```

### 2.2 Database Configuration

The Sequelize CLI database configuration is located at:

``` text
src/config/config.js
```

It loads database credentials from environment variables using dotenv.

Three environments were configured:

- development
- test
- production

Each environment uses MySQL with the database connection settings provided through .env.

### 2.3 Project Directories

The following directories were created:

``` text
src/
├── config/
│   ├── database.js
│   └── config.js
│
├── migrations/
│
└── seeders/
```

- migrations/ stores database schema changes.
- seeders/ is prepared for inserting initial and sample data in a later phase.

## 3. Migration Strategy

The project uses Sequelize migrations instead of sequelize.sync().

Each migration contains two main methods:

**up()**

Defines the database changes to apply, such as creating a table, adding columns, or defining indexes.

**down()**

Defines how to reverse the migration.

For example:

``` javascript
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('categories', {
      // Table columns
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('categories');
  },
};
```

This approach makes database schema changes version-controlled and reversible.


## 4. Database Tables Created

A total of eight application tables were successfully created.

| Model           | Database Table    | Description                                                  |
|-----------------|-------------------|--------------------------------------------------------------|
| Category        | categories        | Manages product categories.                                  |
| Supplier        | suppliers         | Stores supplier information.                                 |
| Customer        | customers         | Stores customer information.                                 |
| Product         | products          | Stores product details and inventory information.            |
| ProductSupplier | product_suppliers | Connects products with suppliers and stores purchase prices. |
| Order           | orders            | Stores sales orders and invoice information.                 |
| OrderItem       | order_items       | Stores individual products within each order.                |
| StockMovement   | stock_movements   | Tracks inventory movements.                                  |


## 5. Migration Files

All migration files are located inside:

```text
src/migrations/
```

The migrations were generated and executed in the following order:

| # | Migration File                               | Table Created     |
|---|----------------------------------------------|-------------------|
| 1 | `20261122114435-create-categories.js`        | categories        |
| 2 | `20261122115037-create-suppliers.js`         | suppliers         |
| 3 | `20261122115247-create-customers.js`         | customers         |
| 4 | `20261122115432-create-products.js`          | products          |
| 5 | `20261122115651-create-product-suppliers.js` | product_suppliers |
| 6 | `20261122115844-create-orders.js`            | orders            |
| 7 | `20261122120041-create-order-items.js`       | order_items       |
| 8 | `20261122120221-create-stock-movements.js`   | stock_movements   |

The execution order was selected to ensure that referenced tables existed before creating tables containing foreign keys.


## 6. Important Database Constraints

### 6.1 Primary Keys

- Main tables use auto-incrementing integer primary keys.
- product_suppliers uses a composite primary key consisting of product_id and supplier_id.

### 6.2 Foreign Keys

Foreign keys were defined to maintain referential integrity between related tables.

| Table             | Foreign Key | References    |
|-------------------|-------------|---------------|
| products          | category_id | categories.id |
| product_suppliers | product_id  | products.id   |
| product_suppliers | supplier_id | suppliers.id  |
| orders            | customer_id | customers.id  |
| order_items       | order_id    | orders.id     |
| order_items       | product_id  | products.id   |
| stock_movements   | product_id  | products.id   |
| stock_movements   | order_id    | orders.id     |

### 6.3 Referential Actions

The migrations use the following deletion and update rules:

## Foreign Key Actions

| Relationship               | ON UPDATE | ON DELETE |
|----------------------------|-----------|-----------|
| Product → Category         | CASCADE   | RESTRICT  |
| ProductSupplier → Product  | CASCADE   | CASCADE   |
| ProductSupplier → Supplier | CASCADE   | CASCADE   |
| Order → Customer           | CASCADE   | SET NULL  |
| OrderItem → Order          | CASCADE   | CASCADE   |
| OrderItem → Product        | CASCADE   | RESTRICT  |
| StockMovement → Product    | CASCADE   | RESTRICT  |
| StockMovement → Order      | CASCADE   | SET NULL  |

These rules help preserve data integrity and historical inventory records.

### 6.4 Unique Constraints

The following unique constraints were configured:

- categories.name
- products.sku
- orders.order_number
- orders.invoice_number

An additional composite unique index was created on:

``` javascript
order_items(order_id, product_id)
```

This prevents the same product from appearing more than once in a single order.

### 6.5 Default Values

The following default values were configured:

| Table    | Column              | Default Value |
|----------|---------------------|---------------|
| products | stock_quantity      | 0             |
| products | low_stock_threshold | 5             |
| orders   | discount            | 0             |
| orders   | discount_type       | fixed         |
| orders   | status              | pending       |


## 7. ENUM Fields

The following ENUM fields were defined in the database.

### 7.1 Order Discount Type

Table: orders

Column: discount_type

Allowed values:

- percentage
- fixed

Default value: fixed

### 7.2 Order Status

Table: orders

Column: status

Allowed values:
- pending
- completed
- cancelled

Default value: pending

### 7.3 Stock Movement Type

Table: stock_movements

Column: movement_type

Allowed values:
- IN
- OUT
- SALE
- RETURN
- ADJUSTMENT

## 8. Important Database Design Decisions

### 8.1 Products

- Each product references an existing category.
- SKU is unique.
- Selling price uses DECIMAL(10, 2).
- Initial stock quantity defaults to zero.
- Low stock threshold defaults to five.

### 8.2 Product Suppliers

The product_suppliers table implements the many-to-many relationship between products and suppliers.

It uses:

- product_id
- supplier_id
- purchase_price

The combination of product_id and supplier_id forms the composite primary key.

### 8.3 Orders

The orders table supports:

- Registered customers.
- Walk-in customers through nullable customer_id.
- Separate order and invoice numbers.
- Fixed and percentage discounts.
- Pending, completed, and cancelled statuses.

### 8.4 Order Items

The order_items table stores a snapshot of product information at the time of the order.

Snapshot fields include:

- product_name
- sku
- quantity
- unit_price
- line_total

This preserves historical order information even if the original product details change later.


### 8.5 Stock Movements

The stock_movements table records inventory changes.

Each movement references a product and can optionally reference an order through nullable order_id.

This supports both order-related movements and inventory movements unrelated to sales orders.

## 9. Migration Execution

All migrations were executed using:

``` text
npx sequelize-cli db:migrate
```

Sequelize CLI successfully executed all eight migrations.

**Migration Status Verification**

The following command was used to verify migration status:

``` text
npx sequelize-cli db:migrate:status
```

The result confirmed that all eight migrations were executed successfully:

``` text
up 20261122114435-create-categories.js
up 20261122115037-create-suppliers.js
up 20261122115247-create-customers.js
up 20261122115432-create-products.js
up 20261122115651-create-product-suppliers.js
up 20261122115844-create-orders.js
up 20261122120041-create-order-items.js
up 20261122120221-create-stock-movements.js
```

All migrations returned the status up.

## 10. Database Verification

The MySQL database was inspected to verify that all tables were created correctly.

### 10.1 Tables Verification

The following command was executed:

``` text
SHOW TABLES;
```

The result contained nine tables:

``` text
SequelizeMeta
categories
customers
order_items
orders
product_suppliers
products
stock_movements
suppliers
```

**Note:** SequelizeMeta is an internal Sequelize CLI table used to track executed migrations. It is not an application table.

Therefore, the database contains:

- 8 application tables.
- 1 internal migration tracking table.

### 10.2 Table Structure Verification

The following command was used to inspect table columns and data types:

``` text
DESCRIBE table_name;
```

The structure of the eight application tables was verified.

### 10.3 Composite Primary Key Verification

The composite primary key in product_suppliers was verified using:

``` text
SHOW INDEX FROM product_suppliers;
```

The result confirmed that both product_id and supplier_id belong to the PRIMARY index.

### 10.4 Unique Composite Index Verification

The unique composite index in order_items was verified using:

``` text
SHOW INDEX FROM order_items;
```

The result confirmed the presence of:

``` text
order_items_order_product_unique
```

with:

1. order_id

2. product_id

## 11. Final Database Structure

The final database structure is:

``` text
stockwise_db
│
├── categories
├── suppliers
├── customers
├── products
├── product_suppliers
├── orders
├── order_items
├── stock_movements
│
└── SequelizeMeta
```

## 12. Final Status

**Phase 04: COMPLETED**

All eight application tables were successfully created using Sequelize CLI migrations.

The database schema, primary keys, foreign keys, unique constraints, indexes, default values, and ENUM fields were configured and verified.

All eight migrations are recorded as successfully executed.

The Stockwise database schema is now ready for the next development phase: Database Seeding & Initial Data.