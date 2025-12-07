const reportModel = require('../models/reportModel');

const reportController = {
  // Create report
  createReport: async (req, res) => {
    try {
      const { title, information, customerID } = req.body;

      if (!title || !information || !customerID) {
        return res.status(400).json({ 
          success: false, 
          message: 'Thiếu thông tin bắt buộc' 
        });
      }

      await reportModel.createReport(title, information, customerID);

      res.json({ 
        success: true, 
        message: 'Gửi báo cáo thành công' 
      });
    } catch (error) {
      console.error('Create report error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi tạo báo cáo' 
      });
    }
  },

  // Get all reports (admin only)
  getAllReports: async (req, res) => {
    try {
      const reports = await reportModel.getAllReports();
      res.json({ 
        success: true, 
        data: reports 
      });
    } catch (error) {
      console.error('Get all reports error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy danh sách báo cáo' 
      });
    }
  },

  // Get report by ID
  getReportById: async (req, res) => {
    try {
      const { reportId } = req.params;
      const report = await reportModel.getReportById(reportId);

      if (report) {
        res.json({ 
          success: true, 
          data: report 
        });
      } else {
        res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy báo cáo' 
        });
      }
    } catch (error) {
      console.error('Get report by ID error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy thông tin báo cáo' 
      });
    }
  },

  // Delete report
  deleteReport: async (req, res) => {
    try {
      const { reportId } = req.params;
      const deleted = await reportModel.deleteReport(reportId);

      if (deleted) {
        res.json({ 
          success: true, 
          message: 'Xóa báo cáo thành công' 
        });
      } else {
        res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy báo cáo' 
        });
      }
    } catch (error) {
      console.error('Delete report error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi xóa báo cáo' 
      });
    }
  }
};

module.exports = reportController;
