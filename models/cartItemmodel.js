const conn = require("../config/db");

// CartItem Model
const cartItemModel = {
  // Add item to cart (or update quantity if already exists)
  addToCart: (customerID, vehicleID, quantity, price, discount = 0) => {
    return new Promise((resolve, reject) => {
      // Check if item already exists in cart
      const checkSql = `SELECT * FROM CartItem WHERE CustomerID = ? AND VehicleID = ?`;
      
      conn.query(checkSql, [customerID, vehicleID], (err, results) => {
        if (err) {
          console.error("Error checking cart item:", err.message);
          reject(err);
          return;
        }

        if (results.length > 0) {
          // Item exists, update quantity
          const existingItem = results[0];
          const newQuantity = existingItem.Quantity + quantity;
          const updateSql = `UPDATE CartItem SET Quantity = ? WHERE CartItemID = ?`;
          
          conn.query(updateSql, [newQuantity, existingItem.CartItemID], (err, result) => {
            if (err) {
              console.error("Update cart item failed:", err.message);
              reject(err);
            } else {
              console.log(`CartItem updated successfully`);
              resolve({ ...existingItem, Quantity: newQuantity });
            }
          });
        } else {
          // Item doesn't exist, insert new
          const insertSql = `
            INSERT INTO CartItem (Quantity, Price, Discount, CustomerID, VehicleID)
            VALUES (?, ?, ?, ?, ?)
          `;
          const values = [quantity, price, discount, customerID, vehicleID];

          conn.query(insertSql, values, (err, result) => {
            if (err) {
              console.error("Insert into CartItem failed:", err.message);
              reject(err);
            } else {
              console.log(`CartItem created successfully with ID: ${result.insertId}`);
              resolve({ CartItemID: result.insertId, Quantity: quantity, Price: price, Discount: discount, CustomerID: customerID, VehicleID: vehicleID });
            }
          });
        }
      });
    });
  },

  // Get all cart items for a customer with vehicle details and image
  getCartItems: (customerID) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          ci.CartItemID,
          ci.Quantity,
          ci.Price,
          ci.Discount,
          ci.CreateDate,
          ci.VehicleID,
          v.Name as VehicleName,
          v.Price as CurrentPrice,
          i.ImageLink
        FROM CartItem ci
        JOIN Vehicle v ON ci.VehicleID = v.VehicleID
        LEFT JOIN Images i ON v.VehicleID = i.VehicleID AND i.ImagePriority = 1
        WHERE ci.CustomerID = ?
        ORDER BY ci.CreateDate DESC
      `;

      conn.query(sql, [customerID], (err, results) => {
        if (err) {
          console.error("Get cart items failed:", err.message);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  // Update cart item quantity
  updateCartItem: (cartItemID, updates) => {
    return new Promise((resolve, reject) => {
      const allowedFields = ["Quantity", "Price", "Discount"];
      const keys = Object.keys(updates).filter((k) => allowedFields.includes(k));

      if (keys.length === 0) {
        reject(new Error("No valid fields to update"));
        return;
      }

      const setClause = keys.map((k) => `${k} = ?`).join(", ");
      const values = keys.map((k) => updates[k]);
      const sql = `UPDATE CartItem SET ${setClause} WHERE CartItemID = ?`;

      conn.query(sql, [...values, cartItemID], (err, result) => {
        if (err) {
          console.error("Update failed:", err.message);
          reject(err);
        } else if (result.affectedRows === 0) {
          reject(new Error(`No cart item found with ID ${cartItemID}`));
        } else {
          console.log(`CartItem ${cartItemID} updated successfully`);
          resolve(result);
        }
      });
    });
  },

  // Delete cart item
  deleteCartItem: (cartItemID) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM CartItem WHERE CartItemID = ?`;
      
      conn.query(sql, [cartItemID], (err, result) => {
        if (err) {
          console.error("Delete failed:", err.message);
          reject(err);
        } else if (result.affectedRows === 0) {
          reject(new Error(`No cart item found with ID ${cartItemID}`));
        } else {
          console.log(`CartItem ${cartItemID} deleted successfully`);
          resolve(result);
        }
      });
    });
  },

  // Clear all cart items for a customer
  clearCart: (customerID) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM CartItem WHERE CustomerID = ?`;
      
      conn.query(sql, [customerID], (err, result) => {
        if (err) {
          console.error("Clear cart failed:", err.message);
          reject(err);
        } else {
          console.log(`Cart cleared for customer ${customerID}`);
          resolve(result);
        }
      });
    });
  },

  // Get cart item count for a customer
  getCartCount: (customerID) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT COUNT(*) as count FROM CartItem WHERE CustomerID = ?`;
      
      conn.query(sql, [customerID], (err, results) => {
        if (err) {
          console.error("Get cart count failed:", err.message);
          reject(err);
        } else {
          resolve(results[0].count);
        }
      });
    });
  }
};

module.exports = cartItemModel;
