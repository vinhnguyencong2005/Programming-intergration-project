const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// Lấy tất cả vehicles
router.get('/', vehicleController.getAllVehicles);

// Lấy vehicle theo ID
router.get('/:id', vehicleController.getVehicleById);

// Lấy hình ảnh của vehicle theo ID
router.get('/:id/images', vehicleController.getVehicleImages);

// Lấy vehicles theo brand
router.get('/brand/:brand', vehicleController.getVehiclesByBrand);

// Lấy vehicles theo type
router.get('/type/:type', vehicleController.getVehiclesByType);

// Tạo vehicle mới
router.post('/', vehicleController.createVehicle);

// Cập nhật vehicle
router.put('/:id', vehicleController.updateVehicle);

// Xóa vehicle
router.delete('/:id', vehicleController.deleteVehicle);

module.exports = router;
