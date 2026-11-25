const sequelize = require("../config/database");
const { Op } = require("sequelize");

const {
  Product,
  Category,
  Supplier,
  ProductSupplier,
  OrderItem,
  StockMovement,
  Order,
} = require("../models");
// Get all products
const getAllProducts = () => {
  return Product.findAll({
    include: [
      {
        model: Category,
        as: "category",
      },
    ],
    order: [["createdAt", "DESC"]],
  })
    .then((products) => {
      return products;
    })
    .catch((error) => {
      throw new Error("Error fetching products: " + error.message);
    });
};

// Get low stock products
const getLowStockProducts = () => {
  return Product.findAll({
    where: sequelize.where(sequelize.col("stock_quantity"), {
      [Op.lte]: sequelize.col("low_stock_threshold"),
    }),
    include: [
      {
        model: Category,
        as: "category",
      },
    ],
    order: [["stock_quantity", "ASC"]],
  })
    .then((products) => products)
    .catch((error) => {
      throw new Error("Error fetching low stock products: " + error.message);
    });
};

// Get product by ID
const getProductById = (productId) => {
  return Product.findByPk(productId, {
    include: [
      {
        model: Category,
        as: "category",
      },
      {
        model: Supplier,
        as: "suppliers",
        through: {
          attributes: ["purchase_price"],
        },
      },
      {
        model: StockMovement,
        as: "stockMovements",
        include: [
          {
            model: Order,
            as: "order",
            attributes: ["id", "order_number"],
          },
        ],
      },
    ],
    order: [
      [{ model: StockMovement, as: "stockMovements" }, "createdAt", "DESC"],
    ],
  })
    .then((product) => {
      if (!product) {
        throw new Error("Product not found");
      }

      return product;
    })
    .catch((error) => {
      throw new Error("Error fetching product: " + error.message);
    });
};

// Create a new product
const createProduct = (productData) => {
  const categoryId = Number(productData.category_id);
  const supplierId = Number(productData.supplierId);
  const sellingPrice = Number(productData.selling_price);
  const purchasePrice = Number(productData.purchasePrice);
  const stockQuantity = Number(productData.stock_quantity);

  const lowStockThreshold =
    productData.low_stock_threshold === "" ||
    productData.low_stock_threshold === undefined
      ? 5
      : Number(productData.low_stock_threshold);

  // Validate required fields

  const name = productData.name ? productData.name.trim() : "";

  const sku = productData.sku ? productData.sku.trim() : "";

  if (!name || !sku) {
    return Promise.reject(new Error("Product name and SKU are required"));
  }

  const image =
    typeof productData.image === "string" && productData.image.trim() !== ""
      ? productData.image.trim()
      : null;

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return Promise.reject(new Error("Valid category is required"));
  }

  if (!Number.isInteger(supplierId) || supplierId <= 0) {
    return Promise.reject(new Error("Valid supplier is required"));
  }

  if (
    productData.selling_price === "" ||
    !Number.isFinite(sellingPrice) ||
    sellingPrice < 0
  ) {
    return Promise.reject(new Error("Valid selling price is required"));
  }

  if (
    productData.purchasePrice === "" ||
    !Number.isFinite(purchasePrice) ||
    purchasePrice < 0
  ) {
    return Promise.reject(new Error("Valid purchase price is required"));
  }

  if (
    productData.stock_quantity === "" ||
    !Number.isInteger(stockQuantity) ||
    stockQuantity < 0
  ) {
    return Promise.reject(new Error("Valid stock quantity is required"));
  }

  if (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0) {
    return Promise.reject(new Error("Invalid low stock threshold"));
  }

  // Create product and supplier relationship in one transaction
  return sequelize
    .transaction((transaction) => {
      return Promise.all([
        Category.findByPk(categoryId, { transaction }),
        Supplier.findByPk(supplierId, { transaction }),
      ])
        .then(([category, supplier]) => {
          if (!category) {
            throw new Error("Category not found");
          }

          if (!supplier) {
            throw new Error("Supplier not found");
          }

          return Product.create(
            {
              category_id: categoryId,
              name: productData.name.trim(),
              sku: productData.sku.trim(),
              description: productData.description || null,
              selling_price: sellingPrice,
              stock_quantity: stockQuantity,
              low_stock_threshold: lowStockThreshold,
              image: image,
            },
            { transaction },
          );
        })
        .then((product) => {
          return ProductSupplier.create(
            {
              product_id: product.id,
              supplier_id: supplierId,
              purchase_price: purchasePrice,
            },
            { transaction },
          ).then(() => product);
        });
    })
    .then((product) => {
      console.log("New Product created successfully");
      return product;
    })
    .catch((error) => {
      throw new Error("Error creating product: " + error);
    });
};

// Update an existing product
const updateProduct = (productId, productData) => {
  const id = Number(productId);
  const categoryId = Number(productData.category_id);
  const supplierId = Number(productData.supplierId);
  const sellingPrice = Number(productData.selling_price);
  const purchasePrice = Number(productData.purchasePrice);

  const lowStockThreshold =
    productData.low_stock_threshold === "" ||
    productData.low_stock_threshold === undefined
      ? 5
      : Number(productData.low_stock_threshold);

  const name = productData.name ? productData.name.trim() : "";
  const sku = productData.sku ? productData.sku.trim() : "";

  // Validate product ID
  if (!Number.isInteger(id) || id <= 0) {
    return Promise.reject(new Error("Invalid product ID"));
  }

  // Validate required fields
  if (!name || !sku) {
    return Promise.reject(new Error("Product name and SKU are required"));
  }

  const image =
    typeof productData.image === "string" && productData.image.trim() !== ""
      ? productData.image.trim()
      : null;

  // Validate category
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return Promise.reject(new Error("Valid category is required"));
  }

  // Validate supplier
  if (!Number.isInteger(supplierId) || supplierId <= 0) {
    return Promise.reject(new Error("Valid supplier is required"));
  }

  // Validate selling price
  if (
    productData.selling_price === "" ||
    !Number.isFinite(sellingPrice) ||
    sellingPrice < 0
  ) {
    return Promise.reject(new Error("Valid selling price is required"));
  }

  // Validate purchase price
  if (
    productData.purchasePrice === "" ||
    !Number.isFinite(purchasePrice) ||
    purchasePrice < 0
  ) {
    return Promise.reject(new Error("Valid purchase price is required"));
  }

  // Validate low stock threshold
  if (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0) {
    return Promise.reject(new Error("Invalid low stock threshold"));
  }

  return sequelize
    .transaction((transaction) => {
      return Promise.all([
        Product.findByPk(id, { transaction }),
        Category.findByPk(categoryId, { transaction }),
        Supplier.findByPk(supplierId, { transaction }),
      ])
        .then(([product, category, supplier]) => {
          if (!product) {
            throw new Error("Product not found");
          }

          if (!category) {
            throw new Error("Category not found");
          }

          if (!supplier) {
            throw new Error("Supplier not found");
          }

          return product.update(
            {
              category_id: categoryId,
              name,
              sku,
              description: productData.description || null,
              selling_price: sellingPrice,
              low_stock_threshold: lowStockThreshold,
              image,
            },
            { transaction },
          );
        })
        .then((product) => {
          return ProductSupplier.findOne({
            where: { product_id: id },
            transaction,
          }).then((productSupplier) => {
            if (productSupplier) {
              return productSupplier
                .update(
                  {
                    supplier_id: supplierId,
                    purchase_price: purchasePrice,
                  },
                  { transaction },
                )
                .then(() => product);
            }

            return ProductSupplier.create(
              {
                product_id: id,
                supplier_id: supplierId,
                purchase_price: purchasePrice,
              },
              { transaction },
            ).then(() => product);
          });
        });
    })
    .then((product) => {
      console.log("Product updated successfully");
      return product;
    })
    .catch((error) => {
      console.error("Error updating product:", error);
      throw error;
    });
};

const deleteProduct = (productId) => {
  const id = Number(productId);

  if (!Number.isInteger(id) || id <= 0) {
    return Promise.reject(new Error("Invalid product ID"));
  }

  return sequelize
    .transaction((transaction) => {
      return Product.findByPk(id, { transaction }).then((product) => {
        if (!product) {
          throw new Error("Product not found");
        }

        return OrderItem.count({
          where: {
            product_id: id,
          },
          transaction,
        }).then((orderItemsCount) => {
          if (orderItemsCount > 0) {
            throw new Error(
              "Cannot delete product because it is associated with existing orders",
            );
          }

          return product.destroy({ transaction });
        });
      });
    })
    .then(() => {
      console.log(`Product ${id} deleted successfully`);
      return true;
    })
    .catch((error) => {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    });
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
};
