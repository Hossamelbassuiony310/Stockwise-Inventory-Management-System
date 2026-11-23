# Phase 05 --- Categories CRUD

## Overview

Phase 05 implements the Category management workflow for the Stockwise
Inventory Management System.

The application uses a server-side rendered architecture with **Node.js,
Express.js, EJS, Sequelize, and MySQL**. Category operations are
organized using the existing MVC-style structure:

-   **Routes** receive HTTP requests and connect them to controller
    actions.
-   **Controllers** handle request data and determine the response.
-   **Services** contain the database operations using Sequelize.
-   **EJS Views** render the Categories interface.

The existing frontend starter was retained and integrated with the
Categories functionality.

## Implemented Features

### 1. Read Categories

-   Retrieve all categories from the database.
-   Display categories on the Categories page.
-   Sort categories by `createdAt` in descending order (newest first).
-   Display the category name and description.
-   Display a placeholder (`—`) for the product count until the
    product-count feature is implemented in Phase 07.

### 2. Create Category

-   Display an Add Category modal.
-   Submit the category name and description through an HTML form.
-   Process the form using Express URL-encoded request data.
-   Create the category through the Category Service.
-   Redirect to the Categories page after successful creation.

### 3. Update Category

-   Display an Edit action on each category card.
-   Open a category-specific edit modal.
-   Pre-fill the form with the category's current name and description.
-   Submit the changes using `POST`.
-   Find the category by its primary key and update its data.
-   Redirect to the Categories page after a successful update.

### 4. Delete Category

-   Display a Delete action on each category card.
-   Ask the user for confirmation before submitting the delete form.
-   Find the category by its primary key and delete it.
-   Redirect to the Categories page after successful deletion.

**Deletion rule:** A category must not be deleted while products are
associated with it. The database foreign-key constraint is expected to
prevent deleting a referenced category. Deleting a category must never
delete its products.

## Project Structure

The Categories feature uses the following files:

``` text
src/
├── controllers/
│   └── categoryController.js
├── routes/
│   └── categoryRoutes.js
└── services/
    └── categoryService.js

views/
└── categories/
    └── index.ejs
```

The category routes are mounted in the Express application under:

``` text
/categories
```
## Routes

| Method | Route                     | Controller Action | Purpose             |
|--------|---------------------------|-------------------|---------------------|
| `GET`  | `/categories`             | `getCategories`   | Display all categories |
| `POST` | `/categories`             | `createCategory`  | Create a category   |
| `POST` | `/categories/:id/update`  | `updateCategory`  | Update a category   |
| `POST` | `/categories/:id/delete`  | `deleteCategory`  | Delete a category   |

HTML forms submit `POST` requests for create, update, and delete operations. No method-override middleware is used in this phase.

## Database and Model

The feature uses the existing Sequelize `Category` model and the
`categories` table created during the database setup and migration
phases.

The Category model includes:

| Field         | Description                          |
|---------------|--------------------------------------|
| `id`          | Auto-incrementing primary key       |
| `name`        | Required, unique category name       |
| `description` | Optional category description        |
| `created_at`  | Creation timestamp                   |
| `updated_at`  | Last update timestamp                |

The model uses Sequelize timestamps and `underscored: true`.

## Request Handling

Express is configured to parse HTML form submissions using:

``` js
app.use(express.urlencoded({ extended: true }));
```

The Categories feature uses Promise chaining with `.then()` and
`.catch()` for asynchronous database operations.

## UI Notes

-   The existing frontend layout and styling are reused.
-   Add and Edit forms are displayed in modals using the existing modal
    controls.
-   Each category card includes Edit and Delete actions.
-   Delete requires a browser confirmation before the form is submitted.
-   The product count is currently shown as a placeholder because
    product-related functionality is scheduled for Phase 07.

## Deferred Work --- Phase 07: Products CRUD

The following category-related enhancements are intentionally postponed
until **Phase 07 --- Products CRUD**, when product data and
product-category relationships are implemented in the application:

1.  **Display the number of products in each category**
    -   Calculate and display the actual number of products associated
        with each category.
    -   The count should be retrieved from the product-category
        relationship rather than maintained as a manually updated
        counter.
2.  **View products inside a category**
    -   Add a way to open or filter the products belonging to a selected
        category.
    -   Display the products associated with that category.
3.  **Manage product-category assignment**
    -   Support assigning products to categories through the Products
        workflow.
    -   Support changing a product's category as part of product
        editing.
4.  **Remove a product from a category**
    -   Handle category reassignment or removal through the
        product-management workflow without deleting the product itself.

These items are not considered incomplete Category CRUD operations. They
are product-related features that depend on the Products CRUD
implementation in Phase 07.

## Phase 05 Completion Checklist

-   [x] Display all categories.
-   [x] Create a category.
-   [x] Update a category's name and description.
-   [x] Delete a category.
-   [x] Prevent deletion of categories that are referenced by products
    through the database foreign-key constraint.
-   [x] Reuse the existing frontend starter and modal behavior.
-   [ ] Display the number of products in each category --- planned for
    Phase 07.
-   [ ] View products belonging to a category --- planned for Phase 07.
-   [ ] Manage product-category assignment --- planned for Phase 07.
-   [ ] Remove or reassign a product from a category --- planned for
    Phase 07.

**Status:** Phase 05 --- Categories CRUD is complete. The deferred
product-related enhancements are planned for Phase 07 --- Products CRUD.
