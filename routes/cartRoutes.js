const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

// Get all cart items
router.get("/", cartController.getCart);

// Get cart count
router.get("/count", cartController.getCartCount);

// Add item to cart
router.post("/add", cartController.addToCart);

// Update cart item
router.put("/:id", cartController.updateCartItem);

// Remove item from cart
router.delete("/:id", cartController.removeCartItem);

// Clear cart
router.delete("/clear/all", cartController.clearCart);

module.exports = router;
