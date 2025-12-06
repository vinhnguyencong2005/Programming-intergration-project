const userModel = require('../models/usermodel');

const authController = {
  // Register new customer
  register: async (req, res) => {
    try {
      const { username, password, name, phone, email, address } = req.body;

      // Validate required fields
      if (!username || !password || !name) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username, password, and name are required' 
        });
      }

      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: 'Password must be at least 6 characters long' 
        });
      }

      const result = await userModel.registerCustomer(
        username, 
        password, 
        name, 
        phone || null, 
        email || null, 
        address || null
      );

      // Format response to match login response structure
      const responseData = {
        ID: result.insertId,
        Username: username,
        Name: name,
        Email: email,
        Phone: phone,
        Address: address
      };

      res.json({ 
        success: true, 
        message: 'Registration successful',
        data: responseData
      });
    } catch (error) {
      if (error.message === 'Username already exists') {
        res.status(409).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: error.message });
      }
    }
  },

  // Login customer
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Validate required fields
      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username and password are required' 
        });
      }

      const customer = await userModel.loginCustomer(username, password);

      res.json({ 
        success: true, 
        message: 'Login successful',
        data: customer
      });
    } catch (error) {
      if (error.message === 'Invalid username or password') {
        res.status(401).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: error.message });
      }
    }
  },

  // Login admin
  loginAdmin: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Validate required fields
      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username and password are required' 
        });
      }

      const admin = await userModel.loginAdmin(username, password);

      res.json({ 
        success: true, 
        message: 'Admin login successful',
        data: {
          ...admin,
          isAdmin: true
        }
      });
    } catch (error) {
      if (error.message === 'Invalid username or password') {
        res.status(401).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: error.message });
      }
    }
  },

  // Logout
  logout: (req, res) => {
    res.json({ 
      success: true, 
      message: 'Logout successful' 
    });
  }
};

module.exports = authController;
