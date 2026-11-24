const categoryService = require("../services/categoryService");

// Get all categories
const getCategories = (req, res) => {
  categoryService
    .getAllCategories()
    .then((categories) => {
      res.render("categories/index", {
        categories: categories,
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error fetching categories");
    });
};

// Get products by category
const getCategoryProducts = (req, res) => {
  const categoryId = req.params.id;

  categoryService
    .getCategoryWithProducts(categoryId)
    .then((category) => {
      res.render("categories/products", {
        category: category,
        products: category.products,
      });
    })
    .catch((error) => {
      console.error(error);

      if (error.message.includes("Category not found")) {
        return res.status(404).send("Category not found");
      }

      res.status(500).send("Error fetching category products");
    });
};

// Create a new category
const createCategory = (req, res) => {
  const categoryData = {
    name: req.body.name,
    description: req.body.description,
  };

  categoryService
    .createCategory(categoryData)
    .then((category) => {
      console.log("Category created:", category);
      res.redirect("/categories");
    })
    .catch((error) => {
      console.error(error);

      res.status(500).send("Error creating category");
    });
};

const updateCategory = (req, res) => {
  const categoryId = req.params.id;

  const categoryData = {
    name: req.body.name,
    description: req.body.description,
  };

  categoryService
    .updateCategory(categoryId, categoryData)
    .then((updatedCategory) => {
      res.redirect("/categories");
    })
    .catch((error) => {
      console.error(error);

      res.status(500).send("Error updating category");
    });
};

// Delete a category
const deleteCategory = (req, res) => {
  const categoryId = req.params.id;

  categoryService
    .deleteCategory(categoryId)
    .then(() => {
      res.redirect("/categories");
    })
    .catch((error) => {
      console.error(error);

      res.status(500).send("Error deleting category");
    });
};

module.exports = {
  getCategories,
  getCategoryProducts,
  createCategory,
  updateCategory,
  deleteCategory,
};
