const conn = require("../config/db");

// Wishlist Model
const wishlistModel = {
  // CREATE - Add item to wishlist
  createWishlist: (customerID, vehicleID) => {
    return new Promise((resolve, reject) => {
      // Check if already in wishlist
      const checkSql = `SELECT * FROM AddToWishlist WHERE CustomerID = ? AND VehicleID = ?`;
      
      conn.query(checkSql, [customerID, vehicleID], (err, results) => {
        if (err) {
          console.error("Error checking wishlist:", err.message);
          reject(err);
          return;
        }

        if (results.length > 0) {
          const error = new Error(`Vehicle ${vehicleID} already in wishlist for Customer ${customerID}`);
          console.warn(error.message);
          reject(error);
          return;
        }

        // Insert into Wishlist
        const insertSql = `INSERT INTO AddToWishlist (CustomerID, VehicleID) VALUES (?, ?)`;
        
        conn.query(insertSql, [customerID, vehicleID], (err, result) => {
          if (err) {
            console.error("Insert into AddToWishlist failed:", err.message);
            reject(err);
          } else {
            console.log(`Vehicle ${vehicleID} added to wishlist for Customer ${customerID}`);
            resolve(result);
          }
        });
      });
    });
  },

  // READ - Get wishlist items for a customer
  readWishlist: (customerID) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          w.CustomerID,
          w.VehicleID,
          v.Name as VehicleName,
          v.Price,
          v.Brand,
          v.Type,
          v.Stock,
          i.ImageLink
        FROM AddToWishlist w
        INNER JOIN Vehicle v ON w.VehicleID = v.VehicleID
        LEFT JOIN Images i ON v.VehicleID = i.VehicleID AND i.ImagePriority = 1
        WHERE w.CustomerID = ?
        ORDER BY v.Name
      `;

      conn.query(sql, [customerID], (err, results) => {
        if (err) {
          console.error("Error reading wishlist:", err.message);
          reject(err);
        } else {
          console.log(`Retrieved ${results.length} wishlist items for Customer ${customerID}`);
          resolve(results);
        }
      });
    });
  },

  // CHECK - Check if item is in wishlist
  checkWishlist: (customerID, vehicleID) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM AddToWishlist WHERE CustomerID = ? AND VehicleID = ?`;
      
      conn.query(sql, [customerID, vehicleID], (err, results) => {
        if (err) {
          console.error("Error checking wishlist:", err.message);
          reject(err);
        } else {
          resolve(results.length > 0);
        }
      });
    });
  },

  // DELETE - Remove item from wishlist
  deleteWishlist: (customerID, vehicleID) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM AddToWishlist WHERE CustomerID = ? AND VehicleID = ?`;
      
      conn.query(sql, [customerID, vehicleID], (err, result) => {
        if (err) {
          console.error("Delete from AddToWishlist failed:", err.message);
          reject(err);
        } else if (result.affectedRows === 0) {
          console.warn(`Vehicle ${vehicleID} not found in wishlist for Customer ${customerID}`);
          resolve(result);
        } else {
          console.log(`Vehicle ${vehicleID} removed from wishlist for Customer ${customerID}`);
          resolve(result);
        }
      });
    });
  }
};

module.exports = wishlistModel;
