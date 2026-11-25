const dashboardService = require("../services/dashboardService");

const getDashboard = (req, res) => {
  Promise.all([
    dashboardService.getOverviewStats(),
    dashboardService.getSalesStats(),
    dashboardService.getTotalInventoryValue(),
    dashboardService.getLowStockCount(),
    dashboardService.getOrderStats(),
    dashboardService.getSalesChart(),
    dashboardService.getRecentOrders(),
    dashboardService.getTopSellingProducts(),
  ])
    .then(
      ([
        overviewStats,
        salesStats,
        totalInventoryValue,
        lowStockCount,
        orderStats,
        salesChart,
        recentOrders,
        topSellingProducts,
      ]) => {
        res.render("dashboard", {
          overviewStats,
          salesStats,
          totalInventoryValue,
          lowStockCount,
          orderStats,
          salesChart,
          recentOrders,
          topSellingProducts,
        });
      },
    )
    .catch((error) => {
      console.error("Dashboard Error:", error);
      res.status(500).send("Error loading dashboard");
    });
};

module.exports = {
  getDashboard,
};
