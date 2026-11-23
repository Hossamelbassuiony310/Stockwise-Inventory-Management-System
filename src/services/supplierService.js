
const { Supplier } = require('../models');

// Get all suppliers
const getAllSuppliers = () => {
  return Supplier.findAll({
    order: [['createdAt', 'DESC']],
  })
    .then((suppliers) => {
      return suppliers;
    })
    .catch((error) => {
      throw new Error('Error fetching suppliers: ' + error.message);
    });
};

// Create a new supplier
const createSupplier = (supplierData) => {
    return Supplier.create({
        company_name: supplierData.company_name,
        contact_name: supplierData.contact_name,
        email: supplierData.email,
        phone: supplierData.phone,
        address: supplierData.address,
    })
    .then((supplier) => {
        console.log('New supplier was created');
        return supplier;
    })
    .catch((error) => {
        throw new Error('Error creating supplier: ' + error.message);
    });
}

// Update an existing supplier
const updateSupplier = (supplierId, supplierData) => {
    return Supplier.findByPk(supplierId)
    .then((supplier) => {
        if (!supplier) {
            throw new Error('Supplier not found');
        }

        return supplier.update({
            company_name: supplierData.company_name,
            contact_name: supplierData.contact_name,
            email: supplierData.email,
            phone: supplierData.phone,
            address: supplierData.address,
        });
    })
    .then((updatedSupplier) => {
        console.log('Supplier updated:', updatedSupplier.id);
        return updatedSupplier;
    })
    .catch((error) => {
        throw new Error('Error updating supplier: ' + error.message);
    });

}

// Get supplier by ID
const getSupplierById = (supplierId) => {
  return Supplier.findByPk(supplierId)
    .then((supplier) => {
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      return supplier;
    })
    .catch((error) => {
      throw new Error('Error fetching supplier: ' + error.message);
    });
};

// Delete a supplier by ID

const deleteSupplier = (supplierId) => {
    return Supplier.findByPk(supplierId)
    .then((supplier) => {
        if (!supplier) {
            throw new Error('Supplier not found');
        }

        return supplier.destroy();
    })
    .then(() => {
        console.log('Supplier deleted:', supplierId);
    })
    .catch((error) => {
        throw new Error('Error deleting supplier: ' + error.message);
    });
}

module.exports = {
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  getSupplierById,
  deleteSupplier
};
