const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const conn = require('./config/db');

// Import routes
const pageRoutes = require('./routes/pageRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

// Khởi tạo Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ============ ROUTES ============
// Page routes (render HTML)
app.use('/', pageRoutes);

// Admin routes
app.use('/', adminRoutes);

// API routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api', reportRoutes);
app.use('/auth', authRoutes);

// ============ ERROR HANDLING ============
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});

module.exports = app;
