const categoryService = require('../services/categoryService');

// Get all categories
const getCategories = (req, res) => {
  categoryService.getAllCategories()
    .then((categories) => {
      res.render('categories/index', {
        categories: categories,
      });
    })
    .catch((error) => {
      console.error(error);

      res.status(500).send('Error fetching categories');
    });
};

// Create a new category
const createCategory = (req, res) => {
  const categoryData = {
    name: req.body.name,
    description: req.body.description,
  };

  categoryService.createCategory(categoryData)
    .then((category) => {
      console.log('Category created:', category);
      res.redirect('/categories');
    })
    .catch((error) => {
      console.error(error);

      res.status(500).send('Error creating category');
    });
};

const updateCategory = (req, res) => {
  const categoryId = req.params.id;

  const categoryData = {
    name: req.body.name,
    description: req.body.description,
  };

  categoryService.updateCategory(categoryId, categoryData)
    .then((updatedCategory) => {
      res.redirect('/categories');
    })
    .catch((error) => {
      console.error(error);

      res.status(500).send('Error updating category');
    });
};

// Delete a category
const deleteCategory = (req, res) => {
  const categoryId = req.params.id;

  categoryService.deleteCategory(categoryId)
    .then(() => {
      res.redirect('/categories');
    })
    .catch((error) => {
      console.error(error);

      res.status(500).send('Error deleting category');
    });
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};