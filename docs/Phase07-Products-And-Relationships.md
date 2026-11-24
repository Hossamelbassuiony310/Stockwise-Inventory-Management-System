# Phase 07 --- Products CRUD & Relationships

**Project:** Stockwise --- Inventory Management System\
**Status:** Completed, with product-deletion safeguards intentionally
deferred\
**Stack:** Node.js, Express, EJS, Sequelize, MySQL

---

## 1. Phase Overview

Phase 07 focused on implementing Product CRUD and completing related
Category and Supplier workflows that had been deferred during their
earlier CRUD phases.

The phase covered:

- Creating, viewing, updating, and deleting products.
- Assigning products to categories.
- Linking products with suppliers through the many-to-many
  relationship.
- Storing `purchase_price` for each Product--Supplier relationship.
- Displaying product counts and products belonging to a category.
- Preventing deletion of suppliers that are linked to products.
- Strengthening the database foreign-key constraint for supplier
  relationships.

The implementation uses Sequelize models, services, controllers, Express
routes, EJS views, and database migrations. Database schema changes are
managed through migrations rather than `sequelize.sync()`.

---

## 2. Product CRUD

### 2.1 Create Product

- Products are created through the product form.
- Each product is assigned to a category through `category_id`.
- A product can be linked to a supplier.
- The relationship is stored in `product_suppliers`.
- The relationship-specific `purchase_price` is saved in the join
  table.
- Product creation and its supplier relationship are handled within a
  Sequelize transaction.

### 2.2 Read Products

- The products page displays the products.
- Product details can be opened from the products list.
- Product queries include associated Category and Supplier data where
  needed.

### 2.3 Update Product

- Existing product information can be edited.
- The current category and supplier are displayed in the edit form.
- A product can be reassigned to another category.
- The supplier relationship can be changed.
- The `purchase_price` for the Product--Supplier relationship can be
  updated.
- Updating an existing Product--Supplier pair does not create a
  duplicate row.
- Product updates and relationship changes are handled within a
  Sequelize transaction.

### 2.4 Delete Product

- A product can currently be deleted through the Product service.
- The delete operation validates the product ID and checks that the
  product exists.
- The operation uses a Sequelize transaction.
- The current implementation is temporary with respect to historical
  business records.

**Deferred safeguard:** Product deletion must be protected against
removing products referenced by Orders / Order Items or Stock Movements.
This is intentionally deferred until:

- **Phase 09 --- Orders & Order Items**
- **Phase 10 --- Stock Management Logic**

After those modules and relationships are implemented, product deletion
rules must be revisited. Products with historical order or
stock-movement records must not be deleted in a way that destroys
business history.

---

## 3. Category CRUD --- Deferred Enhancements Completed

The following Category enhancements, originally deferred from the
Category CRUD work, were completed during Phase 07.

### 3.1 Product Count per Category

- The categories query includes an aggregated count of related
  products.
- The count is calculated using Sequelize `COUNT` and a grouped query.
- The EJS view reads the computed value using
  `category.get('productCount')`.
- Categories with no products display a count of zero.

### 3.2 View Products in a Category

- Each category card has a **View products** link.
- The link opens `/categories/:id/products`.
- The category is retrieved together with its associated products.
- A dedicated EJS page displays the products belonging to that
  category.
- The page handles categories with no products.
- Duplicate `View products` markup was removed so the link renders and
  works correctly.

### 3.3 Product--Category Assignment

- Product creation saves the selected category through `category_id`.
- Product editing displays the current category.
- The category can be changed from the product edit form.
- The selected category change is persisted successfully.

### 3.4 Remove / Reassign Product

- A product can be reassigned by editing it and selecting another
  category.
- Category deletion is blocked by the existing database relationship
  when products are still assigned to that category.
- Products do not need to be deleted in order to move them to another
  category.

---

## 4. Supplier CRUD --- Deferred Enhancements Completed

### 4.1 Prevent Deleting a Supplier Linked to Products

The Supplier service checks the `product_suppliers` join table before
deleting a supplier.

- `ProductSupplier.count()` checks how many product relationships
  reference the supplier.
- If at least one product is linked, the service rejects the deletion.
- If no products are linked, deletion is allowed by the service.

### 4.2 Allow Deleting an Unlinked Supplier

- A supplier with no rows in `product_suppliers` can be deleted.
- A missing supplier is handled as a not-found case.
- The Supplier controller distinguishes the linked-supplier case from
  not-found and unexpected errors.

### 4.3 Product--Supplier Relationship Management

- Product creation creates the Product--Supplier relationship.
- `purchase_price` is stored on the join-table record.
- Product update can change the supplier.
- Product update can change the relationship's purchase price.
- Updating an existing Product--Supplier pair does not create a
  duplicate row.
- The user tested changing the supplier and confirmed that the
  relationship and price update correctly.

---

## 5. Database Relationship Safety --- `product_suppliers`

The original migration, `20261122115651-create-product-suppliers.js`,
created two foreign keys with `ON DELETE CASCADE`:

- `product_id` references `products.id`.
- `supplier_id` references `suppliers.id`.

The original migration had already been applied, so it was not edited. A
new migration was generated:

`20261124170531-update-product-suppliers-supplier-fk.js`

### 5.1 Final Foreign-Key Behavior

| Relationship                                     | `ON DELETE` | Purpose                                                                     |
| ------------------------------------------------ | ----------- | --------------------------------------------------------------------------- |
| `product_suppliers.product_id` → `products.id`   | `CASCADE`   | Remove dependent join-table rows when a product is deleted.                 |
| `product_suppliers.supplier_id` → `suppliers.id` | `RESTRICT`  | Prevent deleting a supplier while product relationships still reference it. |

The supplier constraint was recreated with the name
`fk_product_suppliers_supplier`.

The migration's `down` function restores the previous supplier `CASCADE`
behavior if the migration is rolled back.

### 5.2 Verification

The migration ran successfully using:

```bash
npx sequelize-cli db:migrate
```

The resulting table definition was inspected using:

```sql
SHOW CREATE TABLE product_suppliers;
```

The output confirmed:

- `product_suppliers_ibfk_1` uses `ON DELETE CASCADE` for
  `product_id`.
- `fk_product_suppliers_supplier` uses `ON DELETE RESTRICT` for
  `supplier_id`.

### 5.3 Database-Level RESTRICT Test

The database-level protection was tested directly in MySQL:

```sql
START TRANSACTION;

DELETE FROM suppliers
WHERE id = 1;

ROLLBACK;
```

Supplier `1` was linked to two products. MySQL rejected the delete with
error `1451`, identifying the `fk_product_suppliers_supplier`
constraint. After `ROLLBACK`, the supplier was queried and confirmed to
still exist.

This verified that the foreign key protects the relationship even when a
delete is attempted directly in the database, bypassing the application
service.

## 6. Current Completion Status

| Item                                                                       | Status                                           |
| -------------------------------------------------------------------------- | ------------------------------------------------ |
| Product Create                                                             | Completed                                        |
| Product Read / Details                                                     | Completed                                        |
| Product Update                                                             | Completed                                        |
| Product Delete — basic implementation                                      | Completed; historical-record safeguards deferred |
| Product–Category assignment on create and update                           | Completed                                        |
| Product count per category                                                 | Completed                                        |
| View products by category                                                  | Completed                                        |
| Reassign product to another category                                       | Completed                                        |
| Prevent deleting a category that still has products                        | Existing database relationship protection        |
| Supplier Create / Read / Update / Delete                                   | Completed                                        |
| Prevent deleting a supplier linked to products                             | Completed                                        |
| Allow deleting a supplier with no product links                            | Implemented in service logic                     |
| Product–Supplier relationship on product creation                          | Completed                                        |
| Product–Supplier relationship on product update                            | Completed and tested                             |
| Update `purchase_price` without duplicate relationship rows                | Completed and tested                             |
| Supplier foreign key changed from `CASCADE` to `RESTRICT`                  | Completed                                        |
| Database-level supplier delete restriction test                            | Passed                                           |
| Product deletion protection for Orders / Order Items                       | Deferred                                         |
| Product deletion protection for Stock Movements                            | Deferred                                         |
| Full relationship/deletion test suite including Orders and Stock Movements | Deferred                                         |

## 7. Explicitly Deferred Until Later Phases

The following work is intentionally not considered complete in Phase 07.

### Phase 09 --- Orders & Order Items

After Orders and Order Items are implemented:

- Review product references from order items.
- Define and implement the rule preventing deletion of products that
  have order history.
- Verify the relevant foreign-key behavior and application-level
  handling.

### Phase 10 --- Stock Management Logic

After Stock Management is implemented:

- Review product references from stock movements.
- Define and implement the rule preventing deletion of products that
  have stock-movement history.
- Verify the relevant foreign-key behavior and application-level
  handling.

### Final Relationship and Deletion Testing

After both Phase 09 and Phase 10 are complete:

- Run comprehensive relationship and deletion scenarios.
- Verify deletion of products with and without historical records.
- Verify supplier deletion for linked and unlinked suppliers.
- Verify category deletion for categories with and without products.
- Verify Product--Supplier and Product--Category relationship changes.
- Confirm that historical business records are preserved.

---

## 8. Useful Commands

Check migration status:

```bash
npx sequelize-cli db:migrate:status
```

Run pending migrations:

```bash
npx sequelize-cli db:migrate
```

Roll back the latest migration when appropriate:

```bash
npx sequelize-cli db:migrate:undo
```

Inspect the Product--Supplier table in MySQL:

```sql
SHOW CREATE TABLE product_suppliers;
```

---

## 9. Phase 07 Final Note

Phase 07 is complete for Product CRUD and the deferred Category and
Supplier relationship enhancements described above.

The only intentionally deferred part is the final protection and
comprehensive testing of product deletion against Orders / Order Items
and Stock Movements. Those rules depend on the relationships and
business logic that will be implemented in **Phase 09** and **Phase
10**.

Do not treat the current basic Product delete operation as the final
historical-data deletion policy until those later phases are complete.
