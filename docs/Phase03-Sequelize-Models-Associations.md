# Phase 03 — Sequelize Models & Associations

## 1. Overview

This phase focused on defining the Stockwise database models using Sequelize ORM and establishing the relationships between them.

The main objectives were:

- Creating Sequelize models for all database entities.
- Defining model attributes and data types.
- Configuring primary keys and unique constraints.
- Establishing relationships between models.
- Testing model loading and association initialization.
- Ensuring consistency between the Sequelize models and the database design defined in Phase 01.

**ORM:** Sequelize 6
**Database:** MySQL 8
**Language:** JavaScript (CommonJS)

## 2. Models Structure

All Sequelize models are located inside:

``` text
src/models/
```

The project contains eight models:

| Model           | Database Table    | Description                                                  |
|-----------------|-------------------|--------------------------------------------------------------|
| Category        | categories        | Manages product categories.                                  |
| Product         | products          | Stores product details and inventory information.            |
| Supplier        | suppliers         | Stores supplier contact information.                         |
| ProductSupplier | product_suppliers | Connects products with suppliers and stores purchase prices. |
| Customer        | customers         | Stores customer information.                                 |
| Order           | orders            | Manages sales orders and invoice information.                |
| OrderItem       | order_items       | Stores individual products within each order.                |
| StockMovement   | stock_movements   | Tracks inventory movements.                                  |

## 3. Model Configuration

All models follow a consistent configuration pattern.

**Common Settings**

- timestamps: true — Enables automatic timestamp management.
- underscored: true — Uses snake_case for database column names.
- Explicit tableName — Defines the database table name.
- DataTypes — Defines the data type of each attribute.
- allowNull — Controls whether a column accepts NULL values.
- primaryKey — Defines primary key attributes.
- autoIncrement — Enables automatic ID generation where applicable.

**Example: Category Model**

``` javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define(
  'Category',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    tableName: 'categories',
    timestamps: true,
    underscored: true
  }
);

module.exports = Category;
```

## 4. Important Model Design Decisions

**Category**

- Each category has a unique name.
- A category can contain multiple products.

**Product**

- Each product belongs to one category.
- SKU must be unique.
- Selling price uses DECIMAL(10, 2).
- Default stock quantity is 0.
- Default low stock threshold is 5.
- Product image is optional.

**Supplier**

- Stores company name, contact name, email, phone, and address.
- Contact information fields are optional except company name.

**ProductSupplier**

- Implements the many-to-many relationship between products and suppliers.
- Uses a composite primary key consisting of:
  - product_id
  - supplier_id
- Stores purchase_price for each product-supplier relationship.

**Customer**

- Stores customer name and contact information.
- Email, phone, and address are optional.

**Order**

- Supports orders without a registered customer through nullable customer_id.
- order_number is unique.
- invoice_number is unique and separate from the order number.
- Supports percentage and fixed discounts.
- Default discount is 0.
- Order status supports:
  - pending
  - completed
  - cancelled

**OrderItem**

- Stores the products included in each order.
- Keeps a snapshot of product name and SKU at the time of the transaction.
- Stores quantity, unit price, and line total.
- Uses a unique composite index on (order_id, product_id) to prevent duplicate product entries within the same order.


**StockMovement**

- Tracks changes in product inventory.
- Supports the following movement types:
  - IN
  - OUT
  - SALE
  - RETURN
  - ADJUSTMENT
- Each movement belongs to a product.
- order_id is nullable to support inventory movements unrelated to sales orders.

## 5. Model Associations

All model relationships are defined centrally in:

```text
src/models/index.js
```

### 5.1 Category & Product

One-to-Many

``` javascript
Category.hasMany(Product, {
  foreignKey: 'category_id',
  as: 'products'
});

Product.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});
```

A category can contain multiple products, while each product belongs to one category.

### 5.2 Product & Supplier

Many-to-Many

``` javascript
Product.belongsToMany(Supplier, {
  through: ProductSupplier,
  foreignKey: 'product_id',
  otherKey: 'supplier_id',
  as: 'suppliers'
});

Supplier.belongsToMany(Product, {
  through: ProductSupplier,
  foreignKey: 'supplier_id',
  otherKey: 'product_id',
  as: 'products'
});
```

A product can have multiple suppliers, and a supplier can provide multiple products.

The ProductSupplier model acts as the junction table.

### 5.3 Customer & Order

One-to-Many

``` javascript
Customer.hasMany(Order, {
  foreignKey: 'customer_id',
  as: 'orders'
});

Order.belongsTo(Customer, {
  foreignKey: 'customer_id',
  as: 'customer'
});
```

A customer can have multiple orders, while an order can belong to one customer or no registered customer.

### 5.4 Order & OrderItem

One-to-Many

``` javascript
Order.hasMany(OrderItem, {
  foreignKey: 'order_id',
  as: 'items'
});

OrderItem.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order'
});
```

An order contains multiple order items, and each order item belongs to one order.

### 5.5 Product & OrderItem

One-to-Many

``` javascript
Product.hasMany(OrderItem, {
  foreignKey: 'product_id',
  as: 'orderItems'
});

OrderItem.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});
```

A product can appear in multiple order items across different orders.

### 5.6 Product & StockMovement

One-to-Many

``` javascript
Product.hasMany(StockMovement, {
  foreignKey: 'product_id',
  as: 'stockMovements'
});

StockMovement.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});
```

A product can have multiple stock movement records.

### 5.7 Order & StockMovement

One-to-Many

``` javascript
Order.hasMany(StockMovement, {
  foreignKey: 'order_id',
  as: 'stockMovements'
});

StockMovement.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order'
});
```

An order can be associated with multiple stock movements, while a stock movement can optionally reference an order.

## 6. Associations Summary

| Relationship            | Type         | Foreign Key             |
|-------------------------|--------------|-------------------------|
| Category → Product      | One-to-Many  | category_id             |
| Product ↔ Supplier      | Many-to-Many | product_id, supplier_id |
| Customer → Order        | One-to-Many  | customer_id             |
| Order → OrderItem       | One-to-Many  | order_id                |
| Product → OrderItem     | One-to-Many  | product_id              |
| Product → StockMovement | One-to-Many  | product_id              |
| Order → StockMovement   | One-to-Many  | order_id                |

## 7. Models Index

- The central models file is responsible for:
- Importing all model definitions.
- Establishing model associations.
- Exporting all models for use throughout the application.

Location:

``` text
src/models/index.js
```

The exported models can be imported elsewhere in the application:

``` javascript
const {
  Category,
  Product,
  Supplier,
  ProductSupplier,
  Customer,
  Order,
  OrderItem,
  StockMovement
} = require('../models');
```

## 8. Testing & Verification

The following checks were completed:

- All eight model files were created.
- All models successfully loaded through src/models/index.js.
- Sequelize associations were initialized successfully.
- Model definitions were checked against the Phase 01 database design.
- Composite primary key configuration was defined for ProductSupplier.
- Unique index configuration was defined for OrderItem.
- Model attributes and data types were reviewed.

**Important:** Model loading and association initialization tests verify the Sequelize application definitions. They do not create physical MySQL tables.

Physical database schema creation is handled separately through Sequelize migrations in Phase 04.

## 9. Final Status

**Phase 03: COMPLETED**

All eight Sequelize models have been defined, and their relationships have been configured successfully.

The project is ready for database schema creation through Sequelize CLI migrations.