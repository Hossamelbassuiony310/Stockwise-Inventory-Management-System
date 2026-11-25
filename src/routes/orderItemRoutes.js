const express = require("express");
const router = express.Router();

const orderItemController = require("../controllers/orderItemController");

// Add product to order
router.post("/:orderId/items", orderItemController.addOrderItem);

// Update order item quantity
router.post(
  "/:orderId/items/:itemId/update",
  orderItemController.updateOrderItem,
);

// Delete order item
router.post(
  "/:orderId/items/:itemId/delete",
  orderItemController.deleteOrderItem,
);

module.exports = router;
