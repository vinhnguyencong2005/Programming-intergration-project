const express = require('express');
const path = require('path');
const router = express.Router();

// Render trang chủ
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

// Render trang sản phẩm
router.get('/vehicles', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/vehicles.html'));
});

// Render trang chi tiết sản phẩm
router.get('/vehicle-detail', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/vehicle-detail.html'));
});

// Render trang khách hàng
router.get('/customers', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/customers.html'));
});

// Render trang đơn hàng
router.get('/orders', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/orders.html'));
});

module.exports = router;
