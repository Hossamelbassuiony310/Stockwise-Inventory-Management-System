const supplierService = require('../services/supplierService');

// Get all suppliers
const getSuppliers = (req, res) => {
  supplierService.getAllSuppliers()
    .then((suppliers) => {
      res.render('suppliers/index', {
        suppliers: suppliers,
      });
    })
    .catch((error) => {
      console.error(error);

      res.status(500).send('Error fetching suppliers');
    });
};

// Create a new supplier
const createSupplier = (req, res) => {
  const supplierData = {
    company_name: req.body.company_name,
    contact_name: req.body.contact_name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
  }
  supplierService.createSupplier(supplierData)
    .then((supplier) => {
      res.redirect('/suppliers');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error creating supplier');
    });
};

// Update an existing supplier
const updateSupplier = (req, res) => {
    const supplierId = req.params.id;

    const supplierData = {
        company_name: req.body.company_name,
        contact_name: req.body.contact_name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
    }

    supplierService.updateSupplier(supplierId, supplierData)
        .then((updatedSupplier) => {
            res.redirect('/suppliers');
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error updating supplier');
        });
}

// Get supplier details
const getSupplierDetails = (req, res) => {
  const supplierId = req.params.id;

  supplierService.getSupplierById(supplierId)
    .then((supplier) => {
      res.render('suppliers/details', {
        supplier: supplier,
      });
    })
    .catch((error) => {
      console.error(error);

      res.status(404).send('Supplier not found');
    });
};

// Delete a supplier
const deleteSupplier = (req, res) => {
    const supplierId = req.params.id;
    supplierService.deleteSupplier(supplierId)
        .then(() => {
            res.redirect('/suppliers');
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error deleting supplier');
        });
}

module.exports = {
  getSuppliers,
  createSupplier,
  updateSupplier,
  getSupplierDetails,
  deleteSupplier
};
