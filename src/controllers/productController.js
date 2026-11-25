const productService = require("../services/productService");
const categoryService = require("../services/categoryService");
const supplierService = require("../services/supplierService");

// Get all products
const getProducts = (req, res) => {
  productService
    .getAllProducts()
    .then((products) => {
      res.render("products/index", {
        products: products,
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error fetching products");
    });
};

// Get product form
const getProductForm = (req, res) => {
  Promise.all([
    categoryService.getAllCategories(),
    supplierService.getAllSuppliers(),
  ])
    .then(([categories, suppliers]) => {
      res.render("products/form", {
        categories: categories,
        suppliers: suppliers,
        product: null,
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error fetching form data");
    });
};

// Get product details
const getProductDetails = (req, res) => {
  const productId = req.params.id;

  productService
    .getProductById(productId)
    .then((product) => {
      res.render("products/details", {
        product: product,
      });
    })
    .catch((error) => {
      console.error(error);

      if (error.message.includes("Product not found")) {
        return res.status(404).send("Product not found");
      }

      res.status(500).send("Error fetching product details");
    });
};

// Get product edit form
const getEditProductForm = (req, res) => {
  const productId = req.params.id;

  Promise.all([
    productService.getProductById(productId),
    categoryService.getAllCategories(),
    supplierService.getAllSuppliers(),
  ])
    .then(([product, categories, suppliers]) => {
      res.render("products/form", {
        product: product,
        categories: categories,
        suppliers: suppliers,
      });
    })
    .catch((error) => {
      console.error(error);

      if (error.message.includes("Product not found")) {
        return res.status(404).send("Product not found");
      }

      res.status(500).send("Error fetching product edit form");
    });
};

// Create a new product
const createProduct = (req, res) => {
  const productData = {
    ...req.body,
    image: Array.isArray(req.body.image)
      ? req.body.image.find(
          (value) => typeof value === "string" && value.trim() !== "",
        ) || ""
      : req.body.image,
  };
  productService
    .createProduct(productData)
    .then((product) => {
      res.redirect("/products");
    })
    .catch((error) => {
      console.error("Error creating product:", error);
      res.status(400).send(error.message);
    });
};

// Update product
const updateProduct = (req, res) => {
  const productId = req.params.id;

  const productData = {
    ...req.body,
    image: Array.isArray(req.body.image)
      ? req.body.image.find(
          (value) => typeof value === "string" && value.trim() !== "",
        ) || ""
      : req.body.image,
  };

  productService
    .updateProduct(productId, productData)
    .then(() => {
      res.redirect("/products");
    })
    .catch((error) => {
      console.error("Error updating product:", error);
      res.status(400).send(error.message);
    });
};

const deleteProduct = (req, res) => {
  const productId = req.params.id;

  productService
    .deleteProduct(productId)
    .then(() => {
      res.redirect("/products");
    })
    .catch((error) => {
      console.error("Error deleting product:", error);

      if (error.message.includes("Product not found")) {
        return res.status(404).send("Product not found");
      }

      if (error.message.includes("associated with existing orders")) {
        return res
          .status(400)
          .send(
            "Cannot delete this product because it is associated with existing orders.",
          );
      }

      res.status(500).send("An error occurred while deleting the product.");
    });
};

module.exports = {
  getProducts,
  getProductForm,
  getProductDetails,
  getEditProductForm,
  createProduct,
  updateProduct,
  deleteProduct,
};
