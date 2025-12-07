const vehicleModel = require('../models/vehiclemodel');

const vehicleController = {
  // Lấy tất cả xe
  getAllVehicles: async (req, res) => {
    try {
      const vehicles = await vehicleModel.readVehicle();
      res.json({ success: true, data: vehicles });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Lấy xe theo ID
  getVehicleById: async (req, res) => {
    try {
      const vehicles = await vehicleModel.readVehicle('VehicleID', req.params.id);
      if (vehicles.length > 0) {
        const vehicle = vehicles[0];
        
        // Calculate average rating from Rating table
        const avgRating = await vehicleModel.getAverageRating(req.params.id);
        vehicle.AverageRating = parseFloat(avgRating.avgRating) || 0;
        vehicle.TotalRatings = parseInt(avgRating.totalRatings) || 0;
        
        res.json({ success: true, data: vehicle });
      } else {
        res.status(404).json({ success: false, message: 'Vehicle not found' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Lấy hình ảnh của xe theo ID
  getVehicleImages: async (req, res) => {
    try {
      const images = await vehicleModel.getVehicleImages(req.params.id);
      res.json({ success: true, data: images });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Lấy xe theo brand
  getVehiclesByBrand: async (req, res) => {
    try {
      const vehicles = await vehicleModel.readVehicle('Brand', req.params.brand);
      res.json({ success: true, data: vehicles });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Lấy xe theo type
  getVehiclesByType: async (req, res) => {
    try {
      const vehicles = await vehicleModel.readVehicle('Type', req.params.type);
      res.json({ success: true, data: vehicles });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Tạo xe mới
  createVehicle: async (req, res) => {
    try {
      const { vehicleID, name, price, summary, rating, discount, slug, brand, stock, type, warehouseID } = req.body;
      const result = await vehicleModel.createVehicle(
        vehicleID, name, price, summary, rating, discount, slug, brand, stock, type, warehouseID
      );
      res.json({ success: true, message: 'Vehicle created successfully', data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Cập nhật xe
  updateVehicle: (req, res) => {
    try {
      vehicleModel.updateVehicle(req.params.id, req.body);
      res.json({ success: true, message: 'Vehicle updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Xóa xe
  deleteVehicle: (req, res) => {
    try {
      vehicleModel.deleteVehicle(req.params.id);
      res.json({ success: true, message: 'Vehicle deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = vehicleController;
