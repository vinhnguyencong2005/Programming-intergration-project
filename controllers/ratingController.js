const ratingModel = require('../models/ratingModel');

const ratingController = {
  // Create or update rating
  upsertRating: async (req, res) => {
    try {
      const { customerID, vehicleID, star, information } = req.body;

      if (!customerID || !vehicleID || !star) {
        return res.status(400).json({ 
          success: false, 
          message: 'Thiếu thông tin bắt buộc' 
        });
      }

      if (star < 1 || star > 5) {
        return res.status(400).json({ 
          success: false, 
          message: 'Số sao phải từ 1 đến 5' 
        });
      }

      await ratingModel.upsertRating(customerID, vehicleID, star, information || null);

      res.json({ 
        success: true, 
        message: 'Gửi đánh giá thành công' 
      });
    } catch (error) {
      console.error('Upsert rating error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi gửi đánh giá' 
      });
    }
  },

  // Get all ratings (admin only)
  getAllRatings: async (req, res) => {
    try {
      const ratings = await ratingModel.getAllRatings();
      res.json({ 
        success: true, 
        data: ratings 
      });
    } catch (error) {
      console.error('Get all ratings error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy danh sách đánh giá' 
      });
    }
  },

  // Get ratings by vehicle
  getRatingsByVehicle: async (req, res) => {
    try {
      const { vehicleId } = req.params;
      const ratings = await ratingModel.getRatingsByVehicle(vehicleId);
      
      res.json({ 
        success: true, 
        data: ratings 
      });
    } catch (error) {
      console.error('Get ratings by vehicle error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy đánh giá sản phẩm' 
      });
    }
  },

  // Delete rating
  deleteRating: async (req, res) => {
    try {
      const { customerID, vehicleID } = req.params;
      const deleted = await ratingModel.deleteRating(customerID, vehicleID);

      if (deleted) {
        res.json({ 
          success: true, 
          message: 'Xóa đánh giá thành công' 
        });
      } else {
        res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy đánh giá' 
        });
      }
    } catch (error) {
      console.error('Delete rating error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi xóa đánh giá' 
      });
    }
  }
};

module.exports = ratingController;
