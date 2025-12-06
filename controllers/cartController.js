const cartItemModel = require("../models/cartItemmodel");

const cartController = {
  // Get all cart items for logged-in customer
  getCart: async (req, res) => {
    try {
      const { customerID } = req.query;

      if (!customerID) {
        return res.status(400).json({ 
          success: false, 
          message: "Customer ID is required" 
        });
      }

      const cartItems = await cartItemModel.getCartItems(customerID);
      
      res.json({ 
        success: true, 
        data: cartItems 
      });
    } catch (error) {
      console.error("Get cart error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to get cart items" 
      });
    }
  },

  // Add item to cart
  addToCart: async (req, res) => {
    try {
      const { customerID, vehicleID, quantity, price, discount } = req.body;

      if (!customerID || !vehicleID || !quantity || !price) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing required fields" 
        });
      }

      const result = await cartItemModel.addToCart(
        customerID, 
        vehicleID, 
        quantity, 
        price, 
        discount || 0
      );

      res.json({ 
        success: true, 
        message: "Item added to cart successfully",
        data: result 
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to add item to cart" 
      });
    }
  },

  // Update cart item quantity
  updateCartItem: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: "Cart item ID is required" 
        });
      }

      await cartItemModel.updateCartItem(id, updates);

      res.json({ 
        success: true, 
        message: "Cart item updated successfully" 
      });
    } catch (error) {
      console.error("Update cart item error:", error);
      res.status(500).json({ 
        success: false, 
        message: error.message || "Failed to update cart item" 
      });
    }
  },

  // Remove item from cart
  removeCartItem: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: "Cart item ID is required" 
        });
      }

      await cartItemModel.deleteCartItem(id);

      res.json({ 
        success: true, 
        message: "Item removed from cart successfully" 
      });
    } catch (error) {
      console.error("Remove cart item error:", error);
      res.status(500).json({ 
        success: false, 
        message: error.message || "Failed to remove item from cart" 
      });
    }
  },

  // Clear all cart items
  clearCart: async (req, res) => {
    try {
      const { customerID } = req.body;

      if (!customerID) {
        return res.status(400).json({ 
          success: false, 
          message: "Customer ID is required" 
        });
      }

      await cartItemModel.clearCart(customerID);

      res.json({ 
        success: true, 
        message: "Cart cleared successfully" 
      });
    } catch (error) {
      console.error("Clear cart error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to clear cart" 
      });
    }
  },

  // Get cart item count
  getCartCount: async (req, res) => {
    try {
      const { customerID } = req.query;

      if (!customerID) {
        return res.status(400).json({ 
          success: false, 
          message: "Customer ID is required" 
        });
      }

      const count = await cartItemModel.getCartCount(customerID);

      res.json({ 
        success: true, 
        count: count 
      });
    } catch (error) {
      console.error("Get cart count error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to get cart count" 
      });
    }
  }
};

module.exports = cartController;
