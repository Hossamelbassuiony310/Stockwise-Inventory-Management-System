
const express = require('express');

const supplierController = require('../controllers/supplierController');

const router = express.Router();

// Get all suppliers route
router.get('/', supplierController.getSuppliers);

// Get supplier details route
router.get('/:id', supplierController.getSupplierDetails);

// Create supplier route
router.post('/', supplierController.createSupplier);

// Update supplier route
router.post('/:id/update', supplierController.updateSupplier);

// Delete supplier route
router.post('/:id/delete', supplierController.deleteSupplier);

module.exports = router;