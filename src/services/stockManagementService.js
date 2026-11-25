const sequelize = require("../config/database");

const { Product, StockMovement } = require("../models");

// Add stock to a product
const addStock = (productId, quantity) => {
  const id = Number(productId);
  const amount = Number(quantity);

  // Validate product ID
  if (!Number.isInteger(id) || id <= 0) {
    return Promise.reject(new Error("Invalid product ID"));
  }

  // Validate quantity
  if (!Number.isInteger(amount) || amount <= 0) {
    return Promise.reject(new Error("Quantity must be a positive integer"));
  }

  return sequelize
    .transaction((transaction) => {
      return Product.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      }).then((product) => {
        if (!product) {
          throw new Error("Product not found");
        }

        const newStock = product.stock_quantity + amount;

        return product
          .update(
            {
              stock_quantity: newStock,
            },
            { transaction },
          )
          .then(() => {
            return StockMovement.create(
              {
                product_id: id,
                order_id: null,
                movement_type: "IN",
                quantity: amount,
              },
              { transaction },
            );
          })
          .then(() => product);
      });
    })
    .then((product) => {
      console.log(`Stock added successfully for product ${id}`);
      return product;
    })
    .catch((error) => {
      console.error("Error adding stock:", error);
      throw error;
    });
};

// Remove stock from a product
const removeStock = (productId, quantity) => {
  const id = Number(productId);
  const amount = Number(quantity);

  // Validate product ID
  if (!Number.isInteger(id) || id <= 0) {
    return Promise.reject(new Error("Invalid product ID"));
  }

  // Validate quantity
  if (!Number.isInteger(amount) || amount <= 0) {
    return Promise.reject(new Error("Quantity must be a positive integer"));
  }

  return sequelize
    .transaction((transaction) => {
      return Product.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      }).then((product) => {
        if (!product) {
          throw new Error("Product not found");
        }

        if (product.stock_quantity < amount) {
          throw new Error("Insufficient stock quantity");
        }

        const newStock = product.stock_quantity - amount;

        return product
          .update(
            {
              stock_quantity: newStock,
            },
            { transaction },
          )
          .then(() => {
            return StockMovement.create(
              {
                product_id: id,
                order_id: null,
                movement_type: "OUT",
                quantity: amount,
              },
              { transaction },
            );
          })
          .then(() => product);
      });
    })
    .then((product) => {
      console.log(`Stock removed successfully for product ${id}`);
      return product;
    })
    .catch((error) => {
      console.error("Error removing stock:", error);
      throw error;
    });
};

module.exports = {
  addStock,
  removeStock,
};
