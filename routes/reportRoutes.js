const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const ratingController = require('../controllers/ratingController');

// ============ REPORT ROUTES ============
// Create report (customer)
router.post('/reports', reportController.createReport);

// Get all reports (admin)
router.get('/reports', reportController.getAllReports);

// Get report by ID
router.get('/reports/:reportId', reportController.getReportById);

// Delete report
router.delete('/reports/:reportId', reportController.deleteReport);

// ============ RATING ROUTES ============
// Create or update rating (customer)
router.post('/ratings', ratingController.upsertRating);

// Get all ratings (admin)
router.get('/ratings', ratingController.getAllRatings);

// Get ratings by vehicle
router.get('/ratings/vehicle/:vehicleId', ratingController.getRatingsByVehicle);

// Delete rating
router.delete('/ratings/:customerID/:vehicleID', ratingController.deleteRating);

module.exports = router;
