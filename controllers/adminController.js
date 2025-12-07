const adminModel = require('../models/adminModel');
const userModel = require('../models/usermodel');
const orderModel = require('../models/ordermodel');
const vehicleModel = require('../models/vehiclemodel');

const adminController = {
  // Dashboard
  getDashboard: async (req, res) => {
    try {
      const stats = await adminModel.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy thống kê dashboard' 
      });
    }
  },

  // Get all orders
  getAllOrders: async (req, res) => {
    try {
      const orders = await orderModel.getAllOrdersWithCustomer();
      res.json({ success: true, data: orders });
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy danh sách đơn hàng' 
      });
    }
  },

  // Update order status
  updateOrderStatus: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      if (!['Pending', 'Accepted', 'Cancel'].includes(status)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Trạng thái không hợp lệ' 
        });
      }

      const updated = await orderModel.updateOrderStatus(orderId, status);

      if (updated) {
        res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
      } else {
        res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy đơn hàng' 
        });
      }
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi cập nhật trạng thái đơn hàng' 
      });
    }
  },

  getOrderDetails: async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await orderModel.getOrderDetails(orderId);

      if (order) {
        res.json({ success: true, data: order });
      } else {
        res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy đơn hàng' 
        });
      }
    } catch (error) {
      console.error('Get order details error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy chi tiết đơn hàng' 
      });
    }
  },

  // Inventory management
  getInventory: async (req, res) => {
    try {
      const inventory = await adminModel.getInventory();
      res.json({ success: true, data: inventory });
    } catch (error) {
      console.error('Get inventory error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy danh sách tồn kho' 
      });
    }
  },

  updateStock: async (req, res) => {
    try {
      const { vehicleId } = req.params;
      const { stock } = req.body;

      if (stock === undefined || stock < 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Số lượng tồn kho không hợp lệ' 
        });
      }

      const updated = await adminModel.updateStock(vehicleId, stock);

      if (updated) {
        res.json({ success: true, message: 'Cập nhật tồn kho thành công' });
      } else {
        res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy sản phẩm' 
        });
      }
    } catch (error) {
      console.error('Update stock error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi cập nhật tồn kho' 
      });
    }
  },

  deleteVehicle: async (req, res) => {
    try {
      const { vehicleId } = req.params;
      const deleted = await vehicleModel.deleteVehicle(vehicleId);

      if (deleted) {
        res.json({ success: true, message: 'Xóa sản phẩm thành công' });
      } else {
        res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy sản phẩm' 
        });
      }
    } catch (error) {
      console.error('Delete vehicle error:', error);
      res.status(400).json({ 
        success: false, 
        message: error.message || 'Lỗi khi xóa sản phẩm' 
      });
    }
  },

  createVehicle: async (req, res) => {
    try {
      const { vehicleId, name, brand, type, price, discount, stock, rating, warehouseID, summary, slug, imageUrls } = req.body;

      if (!vehicleId || !name || !brand || price === undefined || stock === undefined) {
        return res.status(400).json({ 
          success: false, 
          message: 'Vui lòng điền đầy đủ thông tin bắt buộc' 
        });
      }

      await vehicleModel.createVehicle(
        vehicleId,
        name,
        price,
        summary || null,
        rating || 0,
        discount || 0,
        slug,
        brand,
        stock,
        type || null,
        warehouseID || null
      );

      // Add multiple images if provided
      if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
        for (const img of imageUrls) {
          if (img.url && img.priority) {
            await vehicleModel.upsertVehicleImage(vehicleId, img.url, img.priority);
          }
        }
      }

      res.json({ success: true, message: 'Thêm sản phẩm thành công' });
    } catch (error) {
      console.error('Create vehicle error:', error);
      res.status(400).json({ 
        success: false, 
        message: error.message || 'Lỗi khi thêm sản phẩm' 
      });
    }
  },

  getVehicleById: async (req, res) => {
    try {
      const { vehicleId } = req.params;
      const vehicle = await vehicleModel.readVehicle('VehicleID', vehicleId);

      if (vehicle && vehicle.length > 0) {
        res.json({ success: true, data: vehicle[0] });
      } else {
        res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy sản phẩm' 
        });
      }
    } catch (error) {
      console.error('Get vehicle error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy thông tin sản phẩm' 
      });
    }
  },

  updateVehicle: async (req, res) => {
    try {
      const { vehicleId } = req.params;
      const body = { ...req.body };
      
      // Extract imageUrls separately
      const imageUrls = body.imageUrls;
      delete body.imageUrls;

      // Map frontend field names to database field names
      const fieldMapping = {
        name: 'Name',
        price: 'Price',
        summary: 'Summary',
        rating: 'Rating',
        discount: 'Discount',
        slug: 'Slug',
        brand: 'Brand',
        stock: 'Stock',
        type: 'Type',
        warehouseID: 'WarehouseID'
      };

      const updates = {};
      Object.keys(body).forEach(key => {
        if (fieldMapping[key]) {
          updates[fieldMapping[key]] = body[key];
        }
      });

      // Update vehicle fields (name, price, stock, etc.) if there are any
      if (Object.keys(updates).length > 0) {
        const updated = await vehicleModel.updateVehicle(vehicleId, updates);
        
        if (!updated) {
          return res.status(404).json({ 
            success: false, 
            message: 'Không tìm thấy sản phẩm' 
          });
        }
      }

      // Handle image updates separately: delete all old images then insert new ones
      if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
        // Delete all existing images
        await vehicleModel.deleteAllVehicleImages(vehicleId);
        
        // Insert new images
        for (const img of imageUrls) {
          if (img.url && img.priority) {
            await vehicleModel.upsertVehicleImage(vehicleId, img.url, img.priority);
          }
        }
      }

      res.json({ success: true, message: 'Cập nhật sản phẩm thành công' });
    } catch (error) {
      console.error('Update vehicle error:', error);
      res.status(400).json({ 
        success: false, 
        message: error.message || 'Lỗi khi cập nhật sản phẩm' 
      });
    }
  },

  // Customer management
  getAllCustomers: async (req, res) => {
    try {
      const customers = await userModel.getAllCustomers();
      res.json({ success: true, data: customers });
    } catch (error) {
      console.error('Get customers error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy danh sách khách hàng' 
      });
    }
  },

  getCustomerById: async (req, res) => {
    try {
      const { customerId } = req.params;
      const customer = await userModel.getCustomerById(customerId);

      if (customer) {
        res.json({ success: true, data: customer });
      } else {
        res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy khách hàng' 
        });
      }
    } catch (error) {
      console.error('Get customer error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy thông tin khách hàng' 
      });
    }
  }
};

module.exports = adminController;
