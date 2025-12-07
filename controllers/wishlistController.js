const wishlistModel = require('../models/wishlistmodel');

// Get customer wishlist
const getCustomerWishlist = async (req, res) => {
    try {
        const customerID = req.params.id;
        const wishlistItems = await wishlistModel.readWishlist(customerID);
        
        res.json({
            success: true,
            data: wishlistItems
        });
    } catch (error) {
        console.error('Error getting wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tải wishlist'
        });
    }
};

// Add item to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { customerID, vehicleID } = req.body;

        if (!customerID || !vehicleID) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin customerID hoặc vehicleID'
            });
        }

        await wishlistModel.createWishlist(customerID, vehicleID);
        res.json({
            success: true,
            message: 'Đã thêm vào danh sách yêu thích'
        });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        
        if (error.message && error.message.includes('already in wishlist')) {
            res.status(400).json({
                success: false,
                message: 'Sản phẩm đã có trong danh sách yêu thích'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi thêm vào wishlist'
            });
        }
    }
};

// Remove item from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { customerID, vehicleID } = req.body;

        if (!customerID || !vehicleID) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin customerID hoặc vehicleID'
            });
        }

        await wishlistModel.deleteWishlist(customerID, vehicleID);
        res.json({
            success: true,
            message: 'Đã xóa khỏi danh sách yêu thích'
        });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa khỏi wishlist'
        });
    }
};

// Check if item is in wishlist
const checkWishlist = async (req, res) => {
    try {
        const { customerID, vehicleID } = req.query;

        if (!customerID || !vehicleID) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin customerID hoặc vehicleID'
            });
        }

        const inWishlist = await wishlistModel.checkWishlist(customerID, vehicleID);
        res.json({
            success: true,
            inWishlist: inWishlist
        });
    } catch (error) {
        console.error('Error checking wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi kiểm tra wishlist'
        });
    }
};

module.exports = {
    getCustomerWishlist,
    addToWishlist,
    removeFromWishlist,
    checkWishlist
};
