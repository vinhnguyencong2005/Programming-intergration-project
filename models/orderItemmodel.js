const conn = require("../config/db");

// OrderItem Model
const orderItemModel = {
  // Create order item
  createOrderItem: (quantity, price, discount, orderID, vehicleID) => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO OrderItem (Quantity, Price, Discount, OrderID, VehicleID)
        VALUES (?, ?, ?, ?, ?)
      `;
      const values = [quantity, price, discount, orderID, vehicleID];

      conn.query(sql, values, (err, result) => {
        if (err) {
          console.error("Insert into OrderItem failed:", err.message);
          reject(err);
        } else {
          console.log(`OrderItem created successfully for Order ${orderID} and Vehicle ${vehicleID}`);
          resolve(result);
        }
      });
    });
  },

  // Get order items by order ID
  getOrderItems: (orderID) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          oi.OrderItemID,
          oi.Quantity,
          oi.Price,
          oi.Discount,
          oi.CreateDate,
          oi.VehicleID,
          v.Name as VehicleName,
          v.Color,
          v.Price as CurrentPrice
        FROM OrderItem oi
        JOIN Vehicle v ON oi.VehicleID = v.VehicleID
        WHERE oi.OrderID = ?
      `;

      conn.query(sql, [orderID], (err, results) => {
        if (err) {
          console.error("Get order items failed:", err.message);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  // Update order item
  updateOrderItem: (orderItemID, updates) => {
    return new Promise((resolve, reject) => {
      const allowedFields = ["Quantity", "Price", "Discount", "OrderID", "VehicleID"];
      const keys = Object.keys(updates).filter((k) => allowedFields.includes(k));

      if (keys.length === 0) {
        reject(new Error("No valid fields to update"));
        return;
      }

      const setClause = keys.map((k) => `${k} = ?`).join(", ");
      const values = keys.map((k) => updates[k]);
      const sql = `UPDATE OrderItem SET ${setClause} WHERE OrderItemID = ?`;

      conn.query(sql, [...values, orderItemID], (err, result) => {
        if (err) {
          console.error("Update failed:", err.message);
          reject(err);
        } else if (result.affectedRows === 0) {
          reject(new Error(`No OrderItem found with ID ${orderItemID}`));
        } else {
          console.log(`OrderItem ${orderItemID} updated successfully`);
          resolve(result);
        }
      });
    });
  },

  // Delete order item
  deleteOrderItem: (orderItemID) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM OrderItem WHERE OrderItemID = ?`;
      
      conn.query(sql, [orderItemID], (err, result) => {
        if (err) {
          console.error("Delete failed:", err.message);
          reject(err);
        } else if (result.affectedRows === 0) {
          reject(new Error(`No OrderItem found with ID ${orderItemID}`));
        } else {
          console.log(`OrderItem ${orderItemID} deleted successfully`);
          resolve(result);
        }
      });
    });
  },

  // Check if customer has purchased a vehicle
  checkCustomerPurchased: (customerID, vehicleID) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT COUNT(*) as count
        FROM OrderItem oi
        JOIN Orders o ON oi.OrderID = o.OrderID
        WHERE o.CustomerID = ?
          AND oi.VehicleID = ?
          AND o.Status IN ('Accepted', 'Delivered')
      `;

      conn.query(sql, [customerID, vehicleID], (err, results) => {
        if (err) {
          console.error("Check customer purchased failed:", err.message);
          reject(err);
        } else {
          resolve(results[0].count > 0);
        }
      });
    });
  }
};

module.exports = orderItemModel;
