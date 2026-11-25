const express = require("express");
const orderController = require("../controllers/orderController");

const router = express.Router();

// Get all orders
router.get("/", orderController.getOrders);

// Show create order page
router.get("/create", orderController.getCreateOrder);

// Show edit order page
router.get("/:id/edit", orderController.getEditOrder);

// Create new order
router.post("/", orderController.createOrder);

// Update order
router.post("/:id/update", orderController.updateOrder);

// Get order details
router.get("/:id", orderController.getOrderDetails);

// Delete order
router.post("/:id/delete", orderController.deleteOrder);

module.exports = router;
