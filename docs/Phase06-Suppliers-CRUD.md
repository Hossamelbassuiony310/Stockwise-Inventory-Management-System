# Phase 06 --- Suppliers CRUD

## Overview

Phase 06 implements Suppliers management for **Stockwise --- Inventory
Management System** using Node.js, Express.js, EJS, Sequelize, and
MySQL.

The implementation follows the existing MVC-style structure:

-   **Routes** receive HTTP requests.
-   **Controllers** handle request data and responses.
-   **Services** contain database operations and business logic.
-   **Models** represent database tables through Sequelize.

The existing Frontend Starter was reused.

## Implemented Features

### 1. READ --- Display Suppliers

-   Retrieve all suppliers from the database.
-   Sort suppliers by `createdAt` in descending order.
-   Render the list in `views/suppliers/index.ejs`.
-   Display company name, contact name, email, and phone.
-   Display an empty state when no suppliers exist.
-   Provide a Supplier Details page.

| Method | Route           | Purpose                         |
|--------|-----------------|---------------------------------|
| `GET`  | `/suppliers`    | Display all suppliers           |
| `GET`  | `/suppliers/:id` | Display one supplier's details |

### 2. CREATE --- Add Supplier

-   Add a supplier using the Add Supplier modal.
-   Submit the form using `POST`.
-   Store supplier data in MySQL through Sequelize.
-   Redirect to the suppliers list after successful creation.

| Field          | Requirement |
|----------------|-------------|
| `company_name` | Required    |
| `contact_name` | Optional    |
| `email`        | Optional    |
| `phone`        | Optional    |
| `address`      | Optional    |


| Method | Route        | Purpose           |
|--------|--------------|-------------------|
| `POST` | `/suppliers` | Create a supplier |
### 3. UPDATE --- Edit Supplier

-   Open an Edit Supplier modal for the selected supplier.
-   Pre-fill the form with the supplier's current information.
-   Find the supplier using its ID and update the editable fields.
-   Redirect to the suppliers list after successful update.

| Method | Route                    | Purpose           |
|--------|--------------------------|-------------------|
| `POST` | `/suppliers/:id/update`  | Update a supplier |

### 4. DELETE --- Delete Supplier

-   Add a Delete button to each supplier card.
-   Submit the deletion request using a POST form.
-   Display a browser confirmation dialog before submitting.
-   Find the supplier by ID and delete it using Sequelize `destroy()`.
-   Redirect to the suppliers list after successful deletion.

| Method | Route                    | Purpose           |
|--------|--------------------------|-------------------|
| `POST` | `/suppliers/:id/delete` | Delete a supplier |

> **Important --- Deferred relationship protection:** The current
> Supplier DELETE implementation does not yet check whether the supplier
> is associated with products through `product_suppliers`. This is
> intentionally deferred until Phase 07, when Products CRUD and the
> product-supplier relationship are implemented. The current deletion
> flow is not yet the final relationship-safe implementation.

## Project Files

``` text
src/
├── controllers/
│   └── supplierController.js
├── routes/
│   └── supplierRoutes.js
├── services/
│   └── supplierService.js
└── models/
    ├── Supplier.js
    └── ProductSupplier.js

views/
└── suppliers/
    ├── index.ejs
    └── details.ejs
```

`ProductSupplier.js` is part of the existing model structure, but
product-supplier relationship behavior is not yet implemented in the
Suppliers CRUD workflow.

## Implementation Notes

-   Supplier routes are mounted in `src/app.js` under `/suppliers`.
-   EJS renders the supplier list and details page.
-   HTML forms use `POST` for create, update, and delete operations.
-   Promise chains with `.then()` and `.catch()` are used for
    asynchronous database operations.
-   Sequelize models are used for database access.
-   Database schema changes are managed through Sequelize migrations;
    `sequelize.sync()` is not used.

## Testing Performed

-   [x] Display suppliers.
-   [x] Display the empty state when there are no suppliers.
-   [x] Create a supplier.
-   [x] Open the Edit Supplier modal and load existing values.
-   [x] Update a supplier.
-   [x] Open the Supplier Details page.
-   [x] Cancel a deletion from the confirmation dialog.
-   [x] Confirm a deletion and return to the suppliers list.

## Deferred Work for Phase 07 --- Products CRUD

The following items must be revisited when Products CRUD and the
`product_suppliers` relationship are implemented.

### 1. Supplier DELETE Relationship Protection

-   Check whether a supplier is linked to one or more products through
    `product_suppliers`.
-   Prevent deleting a supplier that is currently associated with
    products.
-   Return a clear user-facing message explaining why deletion was
    blocked.
-   Allow deletion only when the supplier has no product associations.

### 2. Review the `product_suppliers` Foreign Key

The current migration defines the `supplier_id` foreign key with:

``` js
onDelete: 'CASCADE'
```

This means deleting a supplier can automatically delete its matching
rows in `product_suppliers`.

Review this behavior and consider a safer constraint, such as `RESTRICT`
or `NO ACTION`, so the database also protects supplier-product
relationships. If the migration has already been applied, create a new
migration to change the foreign key; do not silently edit an
already-applied migration.

### 3. Product DELETE Relationship Rules

When implementing Products CRUD, define and enforce what happens when a
product is associated with suppliers, order items, or stock movements.
Do not allow product deletion to silently destroy business history or
related records. Preserve historical order and inventory records
according to the project's business rules.

### 4. Test Relationship Scenarios

-   [ ] Supplier with no associated products can be deleted.
-   [ ] Supplier associated with a product cannot be deleted.
-   [ ] Removing or changing a product-supplier association behaves as
    intended.
-   [ ] Product deletion is blocked or handled safely when historical
    records exist.
-   [ ] Database foreign-key constraints provide a final layer of
    protection.

## Phase 06 Status

**Completed:** Suppliers READ, CREATE, UPDATE, DELETE, and Supplier
Details were implemented and manually tested.

**Pending for Phase 07:** Relationship-aware deletion rules and database
foreign-key protection for suppliers and products.
