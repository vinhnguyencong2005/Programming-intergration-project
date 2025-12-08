const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Generate QR code for payment
router.post('/generate-qr', paymentController.generateQRCode);

// Get all transactions from Sepay
router.get('/transactions', paymentController.getTransactions);

// Check payment status for specific order
router.get('/check/:orderId', paymentController.checkPaymentStatus);

module.exports = router;
