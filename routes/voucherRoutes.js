const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');

// Get all vouchers
router.get('/', voucherController.getAllVouchers);

// Get voucher by code
router.get('/:code', voucherController.getVoucherByCode);

// Create voucher (admin only - can add middleware later)
router.post('/', voucherController.createVoucher);

// Update voucher (admin only - can add middleware later)
router.put('/:code', voucherController.updateVoucher);

// Delete voucher (admin only - can add middleware later)
router.delete('/:code', voucherController.deleteVoucher);

module.exports = router;
