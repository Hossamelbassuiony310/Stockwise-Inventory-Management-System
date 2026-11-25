const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");

const {
  Order,
  Customer,
  OrderItem,
  Product,
  StockMovement,
} = require("../models");

// Get all orders
const getAllOrders = () => {
  return Order.findAll({
    include: [
      {
        model: Customer,
        as: "customer",
      },
      {
        model: OrderItem,
        as: "items",
        attributes: ["id"],
      },
    ],
    order: [["createdAt", "DESC"]],
  })
    .then((orders) => {
      return orders;
    })
    .catch((error) => {
      throw new Error("Error fetching orders: " + error.message);
    });
};

// Get order by ID
const getOrderById = (orderId) => {
  return Order.findByPk(orderId, {
    include: [
      {
        model: Customer,
        as: "customer",
      },
    ],
  })
    .then((order) => {
      if (!order) {
        throw new Error("Order not found");
      }

      return order;
    })
    .catch((error) => {
      throw new Error("Error fetching order: " + error.message);
    });
};

// Generate order and invoice numbers
const generateOrderNumbers = (transaction) => {
  const year = new Date().getFullYear();

  return sequelize
    .query(
      `
      INSERT INTO order_sequences
        (year, last_number, created_at, updated_at)
      VALUES
        (:year, 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        last_number = last_number + 1,
        updated_at = NOW()
    `,
      {
        replacements: { year },
        transaction,
      },
    )
    .then(() => {
      return sequelize.query(
        `
          SELECT last_number
          FROM order_sequences
          WHERE year = :year
          FOR UPDATE
        `,
        {
          replacements: { year },
          transaction,
          type: QueryTypes.SELECT,
        },
      );
    })
    .then((rows) => {
      const sequence = String(rows[0].last_number).padStart(3, "0");

      return {
        order_number: `ORD-${year}-${sequence}`,
        invoice_number: `INV-${year}-${sequence}`,
      };
    });
};

// Create new order with order items
const createOrder = (orderData) => {
  const items = orderData.items;
  const discount = Number(orderData.discount || 0);
  const discountType = orderData.discount_type || "fixed";

  // Validate order items
  if (!Array.isArray(items) || items.length === 0) {
    return Promise.reject(new Error("Order must contain at least one product"));
  }

  if (!Number.isFinite(discount) || discount < 0) {
    return Promise.reject(new Error("Invalid discount"));
  }

  if (!["fixed", "percentage"].includes(discountType)) {
    return Promise.reject(new Error("Invalid discount type"));
  }

  // Validate products and quantities
  const productIds = items.map((item) => Number(item.product_id));

  const quantitiesAreValid = items.every((item) => {
    const quantity = Number(item.quantity);

    return (
      Number.isInteger(Number(item.product_id)) &&
      Number(item.product_id) > 0 &&
      Number.isInteger(quantity) &&
      quantity > 0
    );
  });

  if (!quantitiesAreValid) {
    return Promise.reject(new Error("Invalid product or quantity"));
  }

  // Prevent duplicate products in the same order
  if (new Set(productIds).size !== productIds.length) {
    return Promise.reject(new Error("Each product can only be added once"));
  }

  return sequelize
    .transaction((transaction) => {
      // Fetch selected products from database
      return Product.findAll({
        where: {
          id: productIds,
        },
        transaction,
      }).then((products) => {
        if (products.length !== productIds.length) {
          throw new Error("One or more products were not found");
        }

        // Calculate subtotal using database prices
        const orderItems = items.map((item) => {
          const product = products.find(
            (product) => product.id === Number(item.product_id),
          );

          const quantity = Number(item.quantity);
          const unitPrice = Number(product.selling_price);

          return {
            product_id: product.id,
            product_name: product.name,
            sku: product.sku,
            quantity,
            unit_price: unitPrice,
            line_total: (quantity * unitPrice).toFixed(2),
          };
        });

        const subtotal = orderItems.reduce(
          (sum, item) => sum + Number(item.line_total),
          0,
        );

        // Validate discount against calculated subtotal
        if (discountType === "percentage" && discount > 100) {
          throw new Error("Percentage discount cannot exceed 100");
        }

        if (discountType === "fixed" && discount > subtotal) {
          throw new Error("Fixed discount cannot exceed subtotal");
        }

        // Calculate order total
        const discountAmount =
          discountType === "percentage"
            ? (subtotal * discount) / 100
            : discount;

        const total = subtotal - discountAmount;

        // Generate order numbers
        return generateOrderNumbers(transaction).then((numbers) => {
          // Create order
          return Order.create(
            {
              customer_id: orderData.customer_id || null,
              order_number: numbers.order_number,
              invoice_number: numbers.invoice_number,
              subtotal: subtotal.toFixed(2),
              discount: discount,
              discount_type: discountType,
              total: total.toFixed(2),
              status: orderData.status || "pending",
            },
            { transaction },
          ).then((order) => {
            // Attach order ID to each item
            const itemsToCreate = orderItems.map((item) => ({
              ...item,
              order_id: order.id,
            }));

            // Save all order items
            return OrderItem.bulkCreate(itemsToCreate, {
              transaction,
            }).then(() => order);
          });
        });
      });
    })
    .then((order) => order)
    .catch((error) => {
      throw new Error("Error creating order: " + error.message);
    });
};

// Update order
const updateOrder = (orderId, orderData) => {
  const discount = Number(orderData.discount || 0);
  const discountType = orderData.discount_type || "fixed";

  // Validate discount
  if (!Number.isFinite(discount) || discount < 0) {
    return Promise.reject(new Error("Invalid discount"));
  }

  if (!["fixed", "percentage"].includes(discountType)) {
    return Promise.reject(new Error("Invalid discount type"));
  }

  return sequelize
    .transaction((transaction) => {
      return Order.findByPk(orderId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      }).then((order) => {
        if (!order) {
          throw new Error("Order not found");
        }

        // Only pending orders can be edited
        if (order.status !== "pending") {
          throw new Error("Only pending orders can be updated");
        }

        const newStatus = orderData.status || order.status;

        // Validate order status
        if (!["pending", "completed", "cancelled"].includes(newStatus)) {
          throw new Error("Invalid order status");
        }

        // Get order items
        return OrderItem.findAll({
          where: { order_id: orderId },
          attributes: ["product_id", "quantity", "line_total"],
          order: [["product_id", "ASC"]],
          transaction,
        }).then((items) => {
          const subtotal = items.reduce(
            (sum, item) => sum + Number(item.line_total),
            0,
          );

          // Validate discount
          if (discountType === "percentage" && discount > 100) {
            throw new Error("Percentage discount cannot exceed 100");
          }

          if (discountType === "fixed" && discount > subtotal) {
            throw new Error("Fixed discount cannot exceed subtotal");
          }

          // Calculate total
          const discountAmount =
            discountType === "percentage"
              ? (subtotal * discount) / 100
              : discount;

          const total = subtotal - discountAmount;

          // Deduct stock when completing an order
          let stockPromise = Promise.resolve();

          if (newStatus === "completed") {
            if (items.length === 0) {
              throw new Error("Cannot complete an order without items");
            }

            stockPromise = items.reduce((promise, item) => {
              return promise.then(() => {
                const quantity = Number(item.quantity);

                if (!Number.isInteger(quantity) || quantity <= 0) {
                  throw new Error("Invalid order item quantity");
                }

                return Product.findByPk(item.product_id, {
                  transaction,
                  lock: transaction.LOCK.UPDATE,
                }).then((product) => {
                  if (!product) {
                    throw new Error(`Product not found: ${item.product_id}`);
                  }

                  // Check available stock
                  if (product.stock_quantity < quantity) {
                    throw new Error(
                      `Insufficient stock for product ${product.name}. Available: ${product.stock_quantity}, Required: ${quantity}`,
                    );
                  }

                  const newStock = product.stock_quantity - quantity;

                  // Update product stock
                  return product
                    .update({ stock_quantity: newStock }, { transaction })
                    .then(() => {
                      // Record SALE movement
                      return StockMovement.create(
                        {
                          product_id: product.id,
                          order_id: order.id,
                          movement_type: "SALE",
                          quantity: quantity,
                        },
                        { transaction },
                      );
                    });
                });
              });
            }, Promise.resolve());
          }

          // Wait for stock operations before updating order
          return stockPromise.then(() => {
            return order.update(
              {
                customer_id: orderData.customer_id || null,
                subtotal: subtotal.toFixed(2),
                discount: discount,
                discount_type: discountType,
                total: total.toFixed(2),
                status: newStatus,
              },
              { transaction },
            );
          });
        });
      });
    })
    .then((order) => order)
    .catch((error) => {
      throw new Error("Error updating order: " + error.message);
    });
};

// Delete order
const deleteOrder = (orderId) => {
  return sequelize
    .transaction((transaction) => {
      return Order.findByPk(orderId, { transaction }).then((order) => {
        if (!order) {
          throw new Error("Order not found");
        }

        return order.destroy({ transaction });
      });
    })
    .then(() => {
      return true;
    })
    .catch((error) => {
      throw new Error("Error deleting order: " + error.message);
    });
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
