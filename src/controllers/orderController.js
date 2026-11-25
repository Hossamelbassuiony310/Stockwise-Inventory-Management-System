const orderService = require("../services/orderService");
const customerService = require("../services/customerService");
const orderItemService = require("../services/orderItemService");
const productService = require("../services/productService");

// Get all orders
const getOrders = (req, res) => {
  orderService
    .getAllOrders()
    .then((orders) => {
      res.render("orders/index", {
        orders: orders,
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error fetching orders");
    });
};

// Show create order page
const getCreateOrder = (req, res) => {
  Promise.all([
    customerService.getAllCustomers(),
    productService.getAllProducts(),
  ])
    .then(([customers, products]) => {
      res.render("orders/create", {
        customers: customers,
        products: products,
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error loading create order page");
    });
};

// Get order details
const getOrderDetails = (req, res) => {
  const orderId = req.params.id;

  Promise.all([
    orderService.getOrderById(orderId),
    orderItemService.getOrderItems(orderId),
    productService.getAllProducts(),
  ])
    .then(([order, items, products]) => {
      res.render("orders/details", {
        order: order,
        items: items,
        products: products,
      });
    })
    .catch((error) => {
      console.error(error);

      if (error.message.includes("Order not found")) {
        return res.status(404).send("Order not found");
      }

      res.status(500).send("Error fetching order");
    });
};

// Show edit order page
const getEditOrder = (req, res) => {
  const orderId = req.params.id;

  Promise.all([
    orderService.getOrderById(orderId),
    customerService.getAllCustomers(),
    orderItemService.getOrderItems(orderId),
    productService.getAllProducts(),
  ])
    .then(([order, customers, items, products]) => {
      res.render("orders/edit", {
        order,
        customers,
        items,
        products,
      });
    })
    .catch((error) => {
      console.error(error);

      if (error.message.includes("Order not found")) {
        return res.status(404).send("Order not found");
      }

      res.status(500).send("Error loading edit order page");
    });
};

// Create new order
const createOrder = (req, res) => {
  const orderData = {
    customer_id: req.body.customer_id,
    discount: req.body.discount,
    discount_type: req.body.discount_type,
    status: req.body.status,
    items: req.body.items,
  };

  orderService
    .createOrder(orderData)
    .then((order) => {
      res.redirect(`/orders/${order.id}`);
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send(error.message);
    });
};

// Update order
const updateOrder = (req, res) => {
  const orderId = req.params.id;

  const orderData = {
    customer_id: req.body.customer_id,
    discount: req.body.discount,
    discount_type: req.body.discount_type,
    status: req.body.status,
  };

  orderService
    .updateOrder(orderId, orderData)
    .then((order) => {
      res.redirect(`/orders/${order.id}`);
    })
    .catch((error) => {
      console.error(error);

      if (error.message.includes("Order not found")) {
        return res.status(404).send("Order not found");
      }

      res.status(400).send(error.message);
    });
};

// Delete order
const deleteOrder = (req, res) => {
  const orderId = req.params.id;

  orderService
    .deleteOrder(orderId)
    .then(() => {
      res.redirect("/orders");
    })
    .catch((error) => {
      console.error(error);

      if (error.message.includes("Order not found")) {
        return res.status(404).send("Order not found");
      }

      res.status(400).send(error.message);
    });
};

module.exports = {
  getOrders,
  getOrderDetails,
  getCreateOrder,
  createOrder,
  getEditOrder,
  updateOrder,
  deleteOrder,
};
