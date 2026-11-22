const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    order_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    invoice_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    discount_type: {
      type: DataTypes.ENUM('percentage', 'fixed'),
      allowNull: false,
      defaultValue: 'fixed',
    },

    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
  },
  {
    tableName: 'orders',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Order;
