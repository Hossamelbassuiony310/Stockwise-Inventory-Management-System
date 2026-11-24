const express = require("express");
const customerController = require("../controllers/customerController");

const router = express.Router();

// Get all customers
router.get("/", customerController.getCustomers);

// Get customer details
router.get("/:id", customerController.getCustomerDetails);

// Create a new customer
router.post("/", customerController.createCustomer);

// Update customer
router.post("/:id/update", customerController.updateCustomer);

// Delete customer
router.post("/:id/delete", customerController.deleteCustomer);

module.exports = router;
