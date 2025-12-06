const express = require('express');
const router = express.Router();
const path = require('path');
const adminController = require('../controllers/adminController');
const voucherController = require('../controllers/voucherController');

// ============ PAGE ROUTES ============
// Admin root - check login and redirect
router.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin-redirect.html'));
});

// Admin login page
router.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin-login.html'));
});

// Admin dashboard page
router.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin-dashboard.html'));
});

// Admin inventory page
router.get('/admin/inventory', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin-inventory.html'));
});

// Admin customers page
router.get('/admin/customers', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin-customers.html'));
});

// Admin vouchers page
router.get('/admin/vouchers', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin-vouchers.html'));
});

// ============ API ROUTES ============

// Dashboard API
router.get('/api/admin/dashboard', adminController.getDashboard);

// Orders API
router.get('/api/admin/orders', adminController.getAllOrders);
router.get('/api/admin/orders/:orderId', adminController.getOrderDetails);
router.put('/api/admin/orders/:orderId/status', adminController.updateOrderStatus);

// Inventory API
router.get('/api/admin/inventory', adminController.getInventory);
router.put('/api/admin/inventory/:vehicleId', adminController.updateStock);
router.delete('/api/admin/inventory/:vehicleId', adminController.deleteVehicle);

// Vehicles API (for full CRUD)
router.post('/api/admin/vehicles', adminController.createVehicle);
router.get('/api/admin/vehicles/:vehicleId', adminController.getVehicleById);
router.put('/api/admin/vehicles/:vehicleId', adminController.updateVehicle);

// Customers API
router.get('/api/admin/customers', adminController.getAllCustomers);
router.get('/api/admin/customers/:customerId', adminController.getCustomerById);

// Vouchers API
router.get('/api/admin/vouchers', voucherController.getAllVouchers);
router.get('/api/admin/vouchers/:code', voucherController.getVoucherByCode);
router.post('/api/admin/vouchers', voucherController.createVoucher);
router.put('/api/admin/vouchers/:code', voucherController.updateVoucher);
router.delete('/api/admin/vouchers/:code', voucherController.deleteVoucher);

module.exports = router;
