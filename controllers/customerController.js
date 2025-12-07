const userModel = require('../models/usermodel');
const orderModel = require('../models/ordermodel');

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
      if (customers && customers.length > 0) {
        const customer = customers[0];
        // Map field names for frontend
        const profileData = {
          CustomerID: customer.ID,
          Username: customer.Username,
          FullName: customer.Name,
          PhoneNumber: customer.Phone,
          Email: customer.Email,
          Address: customer.Address,
          CreateDate: customer.CreateDate
        };
        res.json({ success: true, data: profileData });
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
  updateCustomer: async (req, res) => {
    try {
      // Map frontend field names to database field names
      const updates = {};
      if (req.body.fullName !== undefined) updates.Name = req.body.fullName;
      if (req.body.phoneNumber !== undefined) updates.Phone = req.body.phoneNumber;
      if (req.body.address !== undefined) updates.Address = req.body.address;
      // Gender field doesn't exist in DB, ignore it
      
      const result = await userModel.updateCustomer(req.params.id, updates);
      if (result.affectedRows > 0) {
        res.json({ success: true, message: 'Customer updated successfully' });
      } else {
        res.status(404).json({ success: false, message: 'Customer not found' });
      }
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
  },

  // Lấy orders của customer
  getCustomerOrders: async (req, res) => {
    try {
      const orders = await orderModel.getOrdersByCustomer(req.params.id);
      res.json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = customerController;
