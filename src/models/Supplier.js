const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Supplier = sequelize.define(
  'Supplier',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    company_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    contact_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
    tableName: 'suppliers',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Supplier;
