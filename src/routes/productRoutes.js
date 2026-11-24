const express = require("express");
const productController = require("../controllers/productController");

const router = express.Router();

// Get all products
router.get("/", productController.getProducts);

// Get product form
router.get("/new", productController.getProductForm);

// Create a new product
router.post("/", productController.createProduct);

// Get product edit form
router.get("/:id/edit", productController.getEditProductForm);

// Update product
router.post("/:id/update", productController.updateProduct);

// Get product details
router.get("/:id", productController.getProductDetails);

// Delete product
router.post("/:id/delete", productController.deleteProduct);

module.exports = router;
