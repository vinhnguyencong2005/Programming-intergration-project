const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');

// Get customer wishlist
router.get('/:id', wishlistController.getCustomerWishlist);

// Add to wishlist
router.post('/add', wishlistController.addToWishlist);

// Remove from wishlist
router.delete('/remove', wishlistController.removeFromWishlist);

// Check if item in wishlist
router.get('/check', wishlistController.checkWishlist);

module.exports = router;
