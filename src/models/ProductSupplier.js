const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductSupplier = sequelize.define(
  'ProductSupplier',
  {
    product_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },

    supplier_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },

    purchase_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: 'product_suppliers',
    timestamps: true,
    underscored: true,
  }
);

module.exports = ProductSupplier;
