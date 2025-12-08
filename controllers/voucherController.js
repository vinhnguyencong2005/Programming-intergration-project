const voucherModel = require('../models/voucherModel');

const voucherController = {
  // Get all vouchers
  getAllVouchers: async (req, res) => {
    try {
      const vouchers = await voucherModel.getAllVouchers();
      res.json({ success: true, data: vouchers });
    } catch (error) {
      console.error('Get vouchers error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy danh sách voucher' 
      });
    }
  },

  // Get voucher by code
  getVoucherByCode: async (req, res) => {
    try {
      const { code } = req.params;
      const voucher = await voucherModel.getVoucherByCode(code);

      if (voucher) {
        res.json({ success: true, data: voucher });
      } else {
        res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy voucher' 
        });
      }
    } catch (error) {
      console.error('Get voucher error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy thông tin voucher' 
      });
    }
  },

  // Create voucher
  createVoucher: async (req, res) => {
    try {
      const { code, reduction, startDate, endDate, quantity, conditions } = req.body;

      // Validation
      if (!code || !reduction || !startDate || !endDate || !quantity || conditions === undefined) {
        return res.status(400).json({ 
          success: false, 
          message: 'Vui lòng điền đầy đủ thông tin' 
        });
      }

      // Validate conditions >= reduction to prevent negative grand total
      if (parseFloat(conditions) < parseFloat(reduction)) {
        return res.status(400).json({
          success: false,
          message: 'Điều kiện áp dụng phải lớn hơn hoặc bằng giá trị giảm'
        });
      }

      // Check if voucher code already exists
      const existingVoucher = await voucherModel.getVoucherByCode(code);
      if (existingVoucher) {
        return res.status(400).json({ 
          success: false, 
          message: 'Mã voucher đã tồn tại' 
        });
      }

      const created = await voucherModel.createVoucher({
        code,
        reduction,
        startDate,
        endDate,
        quantity,
        conditions
      });

      if (created) {
        res.json({ success: true, message: 'Tạo voucher thành công' });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Không thể tạo voucher' 
        });
      }
    } catch (error) {
      console.error('Create voucher error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi tạo voucher' 
      });
    }
  },

  // Update voucher
  updateVoucher: async (req, res) => {
    try {
      const { code } = req.params;
      const { reduction, startDate, endDate, quantity, conditions } = req.body;

      // Validation
      if (!reduction || !startDate || !endDate || !quantity || conditions === undefined) {
        return res.status(400).json({ 
          success: false, 
          message: 'Vui lòng điền đầy đủ thông tin' 
        });
      }

      // Validate conditions >= reduction to prevent negative grand total
      if (parseFloat(conditions) < parseFloat(reduction)) {
        return res.status(400).json({
          success: false,
          message: 'Điều kiện áp dụng phải lớn hơn hoặc bằng giá trị giảm'
        });
      }

      const updated = await voucherModel.updateVoucher(code, {
        reduction,
        startDate,
        endDate,
        quantity,
        conditions
      });

      if (updated) {
        res.json({ success: true, message: 'Cập nhật voucher thành công' });
      } else {
        res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy voucher' 
        });
      }
    } catch (error) {
      console.error('Update voucher error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi cập nhật voucher' 
      });
    }
  },

  // Delete voucher
  deleteVoucher: async (req, res) => {
    try {
      const { code } = req.params;
      const deleted = await voucherModel.deleteVoucher(code);

      if (deleted) {
        res.json({ success: true, message: 'Xóa voucher thành công' });
      } else {
        res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy voucher' 
        });
      }
    } catch (error) {
      console.error('Delete voucher error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi xóa voucher' 
      });
    }
  }
};

module.exports = voucherController;
