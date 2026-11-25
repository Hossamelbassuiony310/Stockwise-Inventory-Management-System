const sequelize = require("../config/database");

const { Order, OrderItem, Product } = require("../models");

// Get all items for a specific order
const getOrderItems = (orderId) => {
  return OrderItem.findAll({
    where: {
      order_id: orderId,
    },
    include: [
      {
        model: Product,
        as: "product",
      },
    ],
    order: [["createdAt", "ASC"]],
  })
    .then((items) => items)
    .catch((error) => {
      throw new Error("Error fetching order items: " + error.message);
    });
};

const updateOrderTotals = (orderId, transaction) => {
  return OrderItem.findAll({
    where: {
      order_id: orderId,
    },
    attributes: ["line_total"],
    transaction,
  }).then((items) => {
    const subtotal = items.reduce((sum, item) => {
      return sum + Number(item.line_total);
    }, 0);

    return Order.findByPk(orderId, { transaction }).then((order) => {
      if (!order) {
        throw new Error("Order not found");
      }

      const discount = Number(order.discount);

      if (discount < 0) {
        throw new Error("Discount cannot be negative");
      }

      if (order.discount_type === "percentage" && discount > 100) {
        throw new Error("Discount percentage cannot exceed 100%");
      }

      if (order.discount_type === "fixed" && discount > subtotal) {
        throw new Error("Discount cannot exceed order subtotal");
      }

      let total = subtotal;

      if (order.discount_type === "percentage") {
        total = subtotal - (subtotal * discount) / 100;
      } else {
        total = subtotal - discount;
      }

      return order.update(
        {
          subtotal: subtotal.toFixed(2),
          total: total.toFixed(2),
        },
        { transaction },
      );
    });
  });
};

// Add product to order
const addOrderItem = (orderId, productId, quantity) => {
  quantity = Number(quantity);

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return Promise.reject(new Error("Quantity must be a positive integer"));
  }

  return sequelize
    .transaction((transaction) => {
      return Promise.all([
        Order.findByPk(orderId, { transaction }),
        Product.findByPk(productId, { transaction }),
      ]).then(([order, product]) => {
        if (!order) {
          throw new Error("Order not found");
        }

        if (!product) {
          throw new Error("Product not found");
        }

        if (order.status !== "pending") {
          throw new Error("Only pending orders can be modified");
        }

        return OrderItem.findOne({
          where: {
            order_id: orderId,
            product_id: productId,
          },
          transaction,
        }).then((existingItem) => {
          let itemPromise;

          if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;

            itemPromise = existingItem.update(
              {
                quantity: newQuantity,
                line_total: (
                  newQuantity * Number(existingItem.unit_price)
                ).toFixed(2),
              },
              { transaction },
            );
          } else {
            itemPromise = OrderItem.create(
              {
                order_id: orderId,
                product_id: product.id,
                product_name: product.name,
                sku: product.sku,
                quantity,
                unit_price: product.selling_price,
                line_total: (quantity * Number(product.selling_price)).toFixed(
                  2,
                ),
              },
              { transaction },
            );
          }

          return itemPromise.then((item) => {
            return updateOrderTotals(orderId, transaction).then(() => item);
          });
        });
      });
    })
    .catch((error) => {
      throw new Error("Error adding order item: " + error.message);
    });
};

// Update order item quantity
const updateOrderItem = (orderId, itemId, quantity) => {
  quantity = Number(quantity);

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return Promise.reject(new Error("Quantity must be a positive integer"));
  }

  return sequelize
    .transaction((transaction) => {
      return OrderItem.findOne({
        where: {
          id: itemId,
          order_id: orderId,
        },
        transaction,
      }).then((item) => {
        if (!item) {
          throw new Error("Order item not found");
        }

        return Order.findByPk(orderId, { transaction }).then((order) => {
          if (!order) {
            throw new Error("Order not found");
          }

          if (order.status !== "pending") {
            throw new Error("Only pending orders can be modified");
          }

          return item
            .update(
              {
                quantity,
                line_total: (quantity * Number(item.unit_price)).toFixed(2),
              },
              { transaction },
            )
            .then((updatedItem) => {
              return updateOrderTotals(orderId, transaction).then(() => {
                return updatedItem;
              });
            });
        });
      });
    })
    .catch((error) => {
      throw new Error("Error updating order item: " + error.message);
    });
};

// Delete order item
const deleteOrderItem = (orderId, itemId) => {
  return sequelize
    .transaction((transaction) => {
      return OrderItem.findOne({
        where: {
          id: itemId,
          order_id: orderId,
        },
        transaction,
      }).then((item) => {
        if (!item) {
          throw new Error("Order item not found");
        }

        return Order.findByPk(orderId, { transaction }).then((order) => {
          if (!order) {
            throw new Error("Order not found");
          }

          if (order.status !== "pending") {
            throw new Error("Only pending orders can be modified");
          }

          return item.destroy({ transaction }).then(() => {
            return updateOrderTotals(orderId, transaction).then(() => true);
          });
        });
      });
    })
    .catch((error) => {
      throw new Error("Error deleting order item: " + error.message);
    });
};

module.exports = {
  getOrderItems,
  addOrderItem,
  updateOrderTotals,
  updateOrderItem,
  deleteOrderItem,
};
