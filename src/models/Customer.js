const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define(
  'Customer',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'customers',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Customer;
