const { Customer } = require("../models");

// Get all customers
const getAllCustomers = () => {
  return Customer.findAll({
    order: [["createdAt", "DESC"]],
  })
    .then((customers) => {
      return customers;
    })
    .catch((error) => {
      throw new Error("Error fetching customers: " + error.message);
    });
};

// Create a new customer
const createCustomer = (customerData) => {
  return Customer.create({
    name: customerData.name,
    email: customerData.email,
    phone: customerData.phone,
    address: customerData.address,
  })
    .then((customer) => {
      console.log("New customer was created:", customer.id);
      return customer;
    })
    .catch((error) => {
      throw new Error("Error creating customer: " + error.message);
    });
};

// Get customer by ID
const getCustomerById = (customerId) => {
  return Customer.findByPk(customerId)
    .then((customer) => {
      if (!customer) {
        throw new Error("Customer not found");
      }

      return customer;
    })
    .catch((error) => {
      throw new Error("Error fetching customer: " + error.message);
    });
};

// Update customer
const updateCustomer = (customerId, customerData) => {
  return Customer.findByPk(customerId)
    .then((customer) => {
      if (!customer) {
        throw new Error("Customer not found");
      }

      return customer.update({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
      });
    })
    .then((updatedCustomer) => {
      console.log("Customer was updated:", updatedCustomer.id);
      return updatedCustomer;
    })
    .catch((error) => {
      throw new Error("Error updating customer: " + error.message);
    });
};

// Delete customer
const deleteCustomer = (customerId) => {
  return Customer.findByPk(customerId)
    .then((customer) => {
      if (!customer) {
        throw new Error("Customer not found");
      }

      return customer.destroy();
    })
    .then(() => {
      console.log("Customer was deleted:", customerId);
      return true;
    })
    .catch((error) => {
      throw new Error("Error deleting customer: " + error.message);
    });
};

module.exports = {
  getAllCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
