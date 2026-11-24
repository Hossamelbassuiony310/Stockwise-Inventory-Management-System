const express = require("express");

const categoryController = require("../controllers/categoryController");

const router = express.Router();

// Get all categories route
router.get("/", categoryController.getCategories);
// Get products by category
router.get("/:id/products", categoryController.getCategoryProducts);
// Create a new category route
router.post("/", categoryController.createCategory);
// Update a category route
router.post("/:id/update", categoryController.updateCategory);
// Delete a category route
router.post("/:id/delete", categoryController.deleteCategory);

module.exports = router;
