const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockMovement = sequelize.define(
  'StockMovement',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    movement_type: {
      type: DataTypes.ENUM(
        'IN',
        'OUT',
        'SALE',
        'RETURN',
        'ADJUSTMENT'
      ),
      allowNull: false,
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'stock_movements',
    timestamps: true,
    underscored: true,
  }
);

module.exports = StockMovement;
