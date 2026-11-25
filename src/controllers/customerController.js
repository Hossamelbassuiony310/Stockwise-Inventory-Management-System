const customerService = require("../services/customerService");

// Get all customers
const getCustomers = (req, res) => {
  customerService
    .getAllCustomers()
    .then((customers) => {
      const customersWithStats = customers.map((customer) => {
        const orders = customer.orders || [];

        const totalSpent = orders
          .filter((order) => order.status === "completed")
          .reduce((sum, order) => {
            return sum + Number(order.total);
          }, 0);

        return {
          ...customer.get({ plain: true }),
          ordersCount: orders.length,
          totalSpent: totalSpent,
        };
      });

      res.render("customers/index", {
        customers: customersWithStats,
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error fetching customers");
    });
};

// Create a new customer
const createCustomer = (req, res) => {
  const customerData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
  };

  customerService
    .createCustomer(customerData)
    .then((customer) => {
      res.redirect("/customers");
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error creating customer");
    });
};

// Get customer details
const getCustomerDetails = (req, res) => {
  const customerId = req.params.id;

  customerService
    .getCustomerById(customerId)
    .then((customer) => {
      res.render("customers/details", {
        customer: customer,
        orders: customer.orders,
      });
    })
    .catch((error) => {
      console.error(error);

      if (error.message.includes("Customer not found")) {
        return res.status(404).send("Customer not found");
      }

      res.status(500).send("Error fetching customer");
    });
};

// Update customer
const updateCustomer = (req, res) => {
  const customerId = req.params.id;

  const customerData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
  };

  customerService
    .updateCustomer(customerId, customerData)
    .then((customer) => {
      res.redirect(`/customers/${customer.id}`);
    })
    .catch((error) => {
      console.error(error);

      if (error.message.includes("Customer not found")) {
        return res.status(404).send("Customer not found");
      }

      res.status(500).send("Error updating customer");
    });
};

// Delete customer
const deleteCustomer = (req, res) => {
  const customerId = req.params.id;

  customerService
    .deleteCustomer(customerId)
    .then(() => {
      res.redirect("/customers");
    })
    .catch((error) => {
      console.error(error);

      if (error.message.includes("Customer not found")) {
        return res.status(404).send("Customer not found");
      }

      if (error.message.includes("existing orders")) {
        return res
          .status(400)
          .send(
            "Cannot delete this customer because they have existing orders.",
          );
      }

      res.status(500).send("Error deleting customer");
    });
};

module.exports = {
  getCustomers,
  createCustomer,
  getCustomerDetails,
  updateCustomer,
  deleteCustomer,
};
