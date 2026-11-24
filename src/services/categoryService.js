const { Category, Product } = require("../models");

// Get all categories

// Get all categories with product count
// Get all categories with product count
const getAllCategories = () => {
  return Category.findAll({
    attributes: {
      include: [
        [
          require("sequelize").fn(
            "COUNT",
            require("sequelize").col("products.id"),
          ),
          "productCount",
        ],
      ],
    },
    include: [
      {
        model: Product,
        as: "products",
        attributes: [],
      },
    ],
    group: ["Category.id"],
    order: [["createdAt", "DESC"]],
  })
    .then((categories) => {
      return categories;
    })
    .catch((error) => {
      throw new Error("Error fetching categories: " + error.message);
    });
};

// Get products by category
const getCategoryWithProducts = (categoryId) => {
  return Category.findByPk(categoryId, {
    include: [
      {
        model: Product,
        as: "products",
      },
    ],
  })
    .then((category) => {
      if (!category) {
        throw new Error("Category not found");
      }

      return category;
    })
    .catch((error) => {
      throw new Error("Error fetching category products: " + error.message);
    });
};

// Create a new category
const createCategory = (categoryData) => {
  return Category.create({
    name: categoryData.name,
    description: categoryData.description,
  })
    .then((category) => {
      return category;
    })
    .catch((error) => {
      throw new Error("Error creating category: " + error.message);
    });
};

// Update a category

const updateCategory = (categoryId, categoryData) => {
  return Category.findByPk(categoryId)
    .then((category) => {
      if (!category) {
        throw new Error("Category not found");
      }

      return category.update({
        name: categoryData.name,
        description: categoryData.description,
      });
    })
    .then((updatedCategory) => {
      console.log("Category updated:", updatedCategory);
      return updatedCategory;
    })
    .catch((error) => {
      throw new Error("Error updating category: " + error.message);
    });
};

// Delete a category
const deleteCategory = (categoryId) => {
  return Category.findByPk(categoryId)
    .then((category) => {
      if (!category) {
        throw new Error("Category not found");
      }

      return category.destroy();
    })
    .then(() => {
      console.log("Category deleted");
      return true;
    })
    .catch((error) => {
      throw new Error("Error deleting category: " + error.message);
    });
};

module.exports = {
  getAllCategories,
  getCategoryWithProducts,
  createCategory,
  updateCategory,
  deleteCategory,
};
