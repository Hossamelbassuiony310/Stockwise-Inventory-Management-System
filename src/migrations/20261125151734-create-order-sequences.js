"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("order_sequences", {
      year: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
      },

      last_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    await queryInterface.dropTable("order_sequences");
  },
};
