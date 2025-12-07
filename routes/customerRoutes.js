const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Lấy tất cả customers
router.get('/', customerController.getAllCustomers);

// Lấy customer theo ID
router.get('/:id', customerController.getCustomerById);

// Tạo customer mới
router.post('/', customerController.createCustomer);

// Cập nhật customer
router.put('/:id', customerController.updateCustomer);

// Xóa customer
router.delete('/:id', customerController.deleteCustomer);

// Lấy orders của customer
router.get('/:id/orders', customerController.getCustomerOrders);

module.exports = router;
