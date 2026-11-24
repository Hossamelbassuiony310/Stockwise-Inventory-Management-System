# Phase 08 --- Customers CRUD

## 1. Overview

This phase implements the basic Customers CRUD functionality in the
Stockwise Inventory Management System.

The Customers module allows users to: - View all customers. - Create new
customers. - View customer details. - Update customer information. -
Delete customers.

**Scope note:** This phase covers standalone Customer management.
Functionality that depends on Orders or Order Items is deferred to
**Phase 09 --- Orders & Order Items**.

## 2. Database Structure

### Customers Table

The `customers` table was created with the following fields:

| Column       | Type                                 | Nullable | Description                |
| ------------ | ------------------------------------ | -------- | -------------------------- |
| `id`         | INTEGER, Primary Key, Auto Increment | No       | Unique customer identifier |
| `name`       | STRING(255)                          | No       | Customer name              |
| `email`      | STRING(255)                          | Yes      | Customer email             |
| `phone`      | STRING(50)                           | Yes      | Customer phone number      |
| `address`    | TEXT                                 | Yes      | Customer address           |
| `created_at` | DATE                                 | No       | Record creation timestamp  |
| `updated_at` | DATE                                 | No       | Last update timestamp      |

The Sequelize model uses `tableName: 'customers'`, `timestamps: true`, and `underscored: true`.

No unique constraint was added to the email or phone fields.

## 3. Implemented Features

### 3.1. View All Customers

**Route:** `GET /customers`

- Retrieves all customers from the database.
- Sorts customers by `createdAt` in descending order.
- Renders the customers list in `views/customers/index.ejs`.
- Displays customer name, email, and phone.
- Orders and Total Spent columns remain placeholders until the Orders
  module is implemented.

### 3.2. Create Customer

**Route:** `POST /customers`

- Accepts customer name, email, phone, and address.
- Creates a new customer record.
- Redirects to the customers list after successful creation.
- Uses the Add Customer modal in `views/customers/index.ejs`.

### 3.3. View Customer Details

**Route:** `GET /customers/:id`

- Retrieves a customer using its ID.
- Returns a 404 response if the customer does not exist.
- Renders `views/customers/details.ejs`.
- Displays the customer's name, ID, email, phone, address, and
  creation date.

### 3.4. Update Customer

**Route:** `POST /customers/:id/update`

- Retrieves the customer by ID.
- Updates the name, email, phone, and address.
- Returns a 404 response if the customer does not exist.
- Redirects to the updated customer's details page.
- Uses the Edit Customer modal in `views/customers/details.ejs`.
- The edit form is pre-filled with the customer's current information.

### 3.5. Delete Customer

**Route:** `POST /customers/:id/delete`

- Retrieves the customer by ID.
- Returns a 404 response if the customer does not exist.
- Deletes the customer record.
- Redirects to the customers list after successful deletion.
- Includes a browser confirmation prompt before submitting the delete
  form.

**Important:** The current deletion implementation does not yet check
whether the customer has related Orders. Customer deletion protection is
deferred until the Orders module is implemented.

## 4. Project Files

| File                                                | Responsibility                                                        |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| `src/migrations/20261122115247-create-customers.js` | Creates the customers table.                                          |
| `src/models/Customer.js`                            | Defines the Customer Sequelize model.                                 |
| `src/models/index.js`                               | Defines model associations, including the Customer–Order association. |
| `src/services/customerService.js`                   | Contains customer database operations.                                |
| `src/controllers/customerController.js`             | Handles customer requests and responses.                              |
| `src/routes/customerRoutes.js`                      | Defines customer routes.                                              |
| `views/customers/index.ejs`                         | Displays the customers list and Add Customer modal.                   |
| `views/customers/details.ejs`                       | Displays customer details and Edit/Delete actions.                    |

The Customer–Order association is defined in the models, but Orders-dependent functionality is not implemented in this phase.

## 5. Routes Summary

| Method | Route                   | Description              |
| ------ | ----------------------- | ------------------------ |
| `GET`  | `/customers`            | Display all customers    |
| `POST` | `/customers`            | Create a customer        |
| `GET`  | `/customers/:id`        | Display customer details |
| `POST` | `/customers/:id/update` | Update a customer        |
| `POST` | `/customers/:id/delete` | Delete a customer        |

## 6. Deferred Tasks — Customer & Orders Integration

The following tasks were intentionally postponed because the Orders and
Order Items modules have not been implemented yet.

| Task                         | Details                                                                           | Planned Phase                   |
| ---------------------------- | --------------------------------------------------------------------------------- | ------------------------------- |
| Customer Orders              | Display all Orders belonging to a specific customer on the customer details page. | Phase 09 — Orders & Order Items |
| Customer Deletion Protection | Prevent deleting a customer if the customer has related Orders.                   | Phase 09 — Orders & Order Items |
| Order Relationship           | Implement and use the Customer–Order relationship as part of the Orders workflow. | Phase 09 — Orders & Order Items |
| Order Items Integration      | Display the products, quantities, and prices included in the customer's Orders.   | Phase 09 — Orders & Order Items |

These tasks will be completed as part of **Phase 09 — Orders & Order Items**, once the required Orders and Order Items functionality is available.

## 7. Current Completion Status

Feature Status

---

Customers database migration Completed
Customer Sequelize model Completed
Get all customers Completed
Create customer Completed
Get customer details Completed
Update customer Completed
Delete customer Completed
Customer Orders display Deferred to Phase 09
Customer deletion protection based on Orders Deferred to Phase 09
Customer--Order workflow integration Deferred to Phase 09
Order Items details in customer Orders Deferred to Phase 09

---

## 8. Phase Conclusion

**Phase 08 --- Customers CRUD** is complete for standalone customer
management.

The application can now create, list, view, update, and delete customer
records. Features that depend on Orders and Order Items have been
explicitly deferred and are planned for **Phase 09 --- Orders & Order
Items**.
