const orderModel = require('../models/ordermodel');

const orderController = {
  // Lấy tất cả orders
  getAllOrders: async (req, res) => {
    try {
      // Vì readOrder chỉ lấy 1 order, ta cần query trực tiếp database
      // Hoặc có thể thêm method getAllOrders vào model
      res.json({ success: true, data: [], message: 'Feature coming soon' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Lấy order theo customer ID
  getOrdersByCustomerId: async (req, res) => {
    try {
      const orders = await orderModel.readOrder('CustomerID', req.params.customerId);
      res.json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Lấy order theo ID
  getOrderById: async (req, res) => {
    try {
      const order = await orderModel.readOrder('OrderID', req.params.id);
      if (order) {
        res.json({ success: true, data: order });
      } else {
        res.status(404).json({ success: false, message: 'Order not found' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Tạo order mới
  createOrder: async (req, res) => {
    try {
      const { status, total, grandTotal, customerID } = req.body;
      const result = await orderModel.createOrder(status, total, grandTotal, customerID);
      res.json({ success: true, message: 'Order created successfully', data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // Cập nhật order
  updateOrder: (req, res) => {
    try {
      orderModel.updateOrder(req.params.id, req.body);
      res.json({ success: true, message: 'Order updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Xóa order
  deleteOrder: (req, res) => {
    try {
      orderModel.deleteOrder(req.params.id);
      res.json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = orderController;
