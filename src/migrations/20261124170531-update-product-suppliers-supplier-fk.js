"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the old Supplier foreign key
    await queryInterface.removeConstraint(
      "product_suppliers",
      "product_suppliers_ibfk_2",
    );

    // Add the new Supplier foreign key with RESTRICT
    await queryInterface.addConstraint("product_suppliers", {
      fields: ["supplier_id"],
      type: "foreign key",
      name: "fk_product_suppliers_supplier",
      references: {
        table: "suppliers",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the new Supplier foreign key
    await queryInterface.removeConstraint(
      "product_suppliers",
      "fk_product_suppliers_supplier",
    );

    // Restore the old CASCADE behavior
    await queryInterface.addConstraint("product_suppliers", {
      fields: ["supplier_id"],
      type: "foreign key",
      name: "product_suppliers_ibfk_2",
      references: {
        table: "suppliers",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },
};
