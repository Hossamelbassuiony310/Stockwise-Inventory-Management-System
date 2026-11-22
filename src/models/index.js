// Import all models
const Category = require('./Category');
const Product = require('./Product');
const Supplier = require('./Supplier');
const ProductSupplier = require('./ProductSupplier');
const Customer = require('./Customer');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const StockMovement = require('./StockMovement');

// Category - Product
Category.hasMany(Product, {
  foreignKey: 'category_id',
  as: 'products',
});

Product.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category',
});

// Product - Supplier (Many-to-Many)
Product.belongsToMany(Supplier, {
  through: ProductSupplier,
  foreignKey: 'product_id',
  otherKey: 'supplier_id',
  as: 'suppliers',
});

Supplier.belongsToMany(Product, {
  through: ProductSupplier,
  foreignKey: 'supplier_id',
  otherKey: 'product_id',
  as: 'products',
});

// Customer - Order
Customer.hasMany(Order, {
  foreignKey: 'customer_id',
  as: 'orders',
});

Order.belongsTo(Customer, {
  foreignKey: 'customer_id',
  as: 'customer',
});

// Order - OrderItem
Order.hasMany(OrderItem, {
  foreignKey: 'order_id',
  as: 'items',
});

OrderItem.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order',
});

// Product - OrderItem
Product.hasMany(OrderItem, {
  foreignKey: 'product_id',
  as: 'orderItems',
});

OrderItem.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
});

// Product - StockMovement
Product.hasMany(StockMovement, {
  foreignKey: 'product_id',
  as: 'stockMovements',
});

StockMovement.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
});

// Order - StockMovement
Order.hasMany(StockMovement, {
  foreignKey: 'order_id',
  as: 'stockMovements',
});

StockMovement.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order',
});

// Export all models
module.exports = {
  Category,
  Product,
  Supplier,
  ProductSupplier,
  Customer,
  Order,
  OrderItem,
  StockMovement,
};