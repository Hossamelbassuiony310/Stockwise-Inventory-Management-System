const orderItemService = require("../services/orderItemService");

// Add product to order
const addOrderItem = (req, res) => {
  const { orderId } = req.params;
  const { product_id, quantity } = req.body;

  orderItemService
    .addOrderItem(orderId, product_id, quantity)
    .then(() => {
      res.redirect(`/orders/${orderId}/edit`);
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send(error.message);
    });
};

// Update order item quantity
const updateOrderItem = (req, res) => {
  const { orderId, itemId } = req.params;
  const { quantity } = req.body;

  orderItemService
    .updateOrderItem(orderId, itemId, quantity)
    .then(() => {
      res.redirect(`/orders/${orderId}/edit`);
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send(error.message);
    });
};

// Delete order item
const deleteOrderItem = (req, res) => {
  const { orderId, itemId } = req.params;

  orderItemService
    .deleteOrderItem(orderId, itemId)
    .then(() => {
      res.redirect(`/orders/${orderId}/edit`);
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send(error.message);
    });
};

module.exports = {
  addOrderItem,
  updateOrderItem,
  deleteOrderItem,
};
