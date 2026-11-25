const sequelize = require("../config/database");
const { Op } = require("sequelize");

const {
  Product,
  Order,
  OrderItem,
  Category,
  Customer,
  Supplier,
} = require("../models");

const getOverviewStats = () => {
  return Promise.all([
    Product.count(),
    Customer.count(),
    Supplier.count(),
    Order.count(),
  ]).then(([totalProducts, totalCustomers, totalSuppliers, totalOrders]) => {
    return {
      totalProducts,
      totalCustomers,
      totalSuppliers,
      totalOrders,
    };
  });
};

const getSalesStats = () => {
  return Order.sum("total", {
    where: {
      status: "completed",
    },
  }).then((totalRevenue) => {
    return {
      totalRevenue: Number(totalRevenue || 0),
    };
  });
};

const getTotalInventoryValue = () => {
  return Product.findAll({
    attributes: ["id", "stock_quantity"],
    include: [
      {
        model: Supplier,
        as: "suppliers",
        attributes: ["id"],
        through: {
          attributes: ["purchase_price"],
        },
      },
    ],
  }).then((products) => {
    const totalValue = products.reduce((total, product) => {
      const suppliers = product.suppliers || [];

      if (suppliers.length === 0) {
        return total;
      }

      const totalPurchasePrice = suppliers.reduce((sum, supplier) => {
        return sum + Number(supplier.ProductSupplier.purchase_price);
      }, 0);

      const averagePurchasePrice = totalPurchasePrice / suppliers.length;

      return total + averagePurchasePrice * product.stock_quantity;
    }, 0);

    return Number(totalValue.toFixed(2));
  });
};

const getLowStockCount = () => {
  return Product.count({
    where: sequelize.where(sequelize.col("stock_quantity"), {
      [Op.lte]: sequelize.col("low_stock_threshold"),
    }),
  });
};

const getOrderStats = () => {
  return Promise.all([
    Order.count({
      where: {
        status: "pending",
      },
    }),

    Order.count({
      where: {
        status: "completed",
      },
    }),

    Order.count({
      where: {
        status: "cancelled",
      },
    }),
  ]).then(([pendingOrders, completedOrders, cancelledOrders]) => {
    return {
      pendingOrders,
      completedOrders,
      cancelledOrders,
    };
  });
};

// Sales Chart
const getSalesChart = () => {
  const startDate = new Date();

  // Last 7 days, including today
  startDate.setDate(startDate.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);

  return Order.findAll({
    attributes: [
      [sequelize.fn("DATE", sequelize.col("created_at")), "date"],
      [sequelize.fn("SUM", sequelize.col("total")), "revenue"],
    ],
    where: {
      status: "completed",
      created_at: {
        [Op.gte]: startDate,
      },
    },
    group: [sequelize.fn("DATE", sequelize.col("created_at"))],
    order: [[sequelize.fn("DATE", sequelize.col("created_at")), "ASC"]],
    raw: true,
  }).then((salesData) => {
    return salesData.map((item) => ({
      date: item.date,
      revenue: Number(item.revenue),
    }));
  });
};

// Recent Orders
const getRecentOrders = () => {
  return Order.findAll({
    attributes: ["id", "order_number", "total", "status", "createdAt"],
    include: [
      {
        model: Customer,
        as: "customer",
        attributes: ["name"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit: 5,
  });
};

const getTopSellingProducts = () => {
  return OrderItem.findAll({
    attributes: [
      "product_id",
      [sequelize.fn("MAX", sequelize.col("product_name")), "productName"],
      [sequelize.fn("SUM", sequelize.col("quantity")), "totalSold"],
    ],
    include: [
      {
        model: Order,
        as: "order",
        attributes: [],
        where: {
          status: "completed",
        },
        required: true,
      },
    ],
    group: ["OrderItem.product_id"],
    order: [[sequelize.fn("SUM", sequelize.col("quantity")), "DESC"]],
    limit: 5,
    raw: true,
  }).then((products) => {
    return products.map((product) => ({
      productId: product.product_id,
      productName: product.productName,
      totalSold: Number(product.totalSold),
    }));
  });
};

module.exports = {
  getOverviewStats,
  getSalesStats,
  getTotalInventoryValue,
  getLowStockCount,
  getOrderStats,
  getSalesChart,
  getRecentOrders,
  getTopSellingProducts,
};
