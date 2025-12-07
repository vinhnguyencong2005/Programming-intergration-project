const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Create report (customer)
router.post('/reports', reportController.createReport);

// Get all reports (admin)
router.get('/reports', reportController.getAllReports);

// Get report by ID
router.get('/reports/:reportId', reportController.getReportById);

// Delete report
router.delete('/reports/:reportId', reportController.deleteReport);

module.exports = router;
