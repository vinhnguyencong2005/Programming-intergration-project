const userModel = require('../models/usermodel');

const customerController = {
  // Lấy tất cả customer
  getAllCustomers: async (req, res) => {
    try {
      const customers = await userModel.readCustomer();
      res.json({ success: true, data: customers });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Lấy customer theo ID
  getCustomerById: async (req, res) => {
    try {
      const customers = await userModel.readCustomer('ID', req.params.id);
      if (customers.length > 0) {
        res.json({ success: true, data: customers[0] });
      } else {
        res.status(404).json({ success: false, message: 'Customer not found' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Tạo customer mới
  createCustomer: async (req, res) => {
    try {
      const { username, password, name, phone, email, address } = req.body;
      const result = await userModel.createCustomer(username, password, name, phone, email, address);
      res.json({ success: true, message: 'Customer created successfully', data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // Cập nhật customer
  updateCustomer: (req, res) => {
    try {
      userModel.updateCustomer(req.params.id, req.body);
      res.json({ success: true, message: 'Customer updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Xóa customer
  deleteCustomer: (req, res) => {
    try {
      userModel.deleteCustomer(req.params.id);
      res.json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = customerController;
