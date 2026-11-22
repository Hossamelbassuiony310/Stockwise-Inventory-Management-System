'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('suppliers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      company_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      contact_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      phone: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },

      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('suppliers');
  },
};
