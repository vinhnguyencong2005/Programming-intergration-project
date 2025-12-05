const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Lấy tất cả orders
router.get('/', orderController.getAllOrders);

// Lấy orders theo customer ID
router.get('/customer/:customerId', orderController.getOrdersByCustomerId);

// Lấy order theo ID
router.get('/:id', orderController.getOrderById);

// Tạo order mới
router.post('/', orderController.createOrder);

// Cập nhật order
router.put('/:id', orderController.updateOrder);

// Xóa order
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
