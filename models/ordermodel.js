const conn = require("../config/db");
const userModel = require("./usermodel");

// Order Model
const orderModel = {
  // CREATE
  createOrder: (status, total, grandTotal, customerID) => {
    return new Promise((resolve, reject) => {
      // Check if the customer exists first
      const checkSql = `SELECT * FROM Customer WHERE ID = ?`;
      conn.query(checkSql, [customerID], (err, results) => {
        if (err) {
          console.error("Error checking customer:", err.message);
          reject(err);
          return;
        }
        if (results.length === 0) {
          const error = new Error(`Customer with ID ${customerID} does not exist.`);
          console.error(error.message);
          reject(error);
          return;
        }

        // If customer exists → proceed with creating order
        const sql = `
          INSERT INTO Orders (Status, Total, GrandTotal, CustomerID)
          VALUES (?, ?, ?, ?)
        `;
        const values = [status, total, grandTotal, customerID];

        conn.query(sql, values, (err, result) => {
          if (err) {
            console.error("Insert into Orders failed:", err.message);
            reject(err);
          } else {
            console.log(`Order created successfully for Customer ${customerID}`);
            resolve(result);
          }
        });
      });
    });
  },

  // READ
  readOrder: (field, value, targetField = null) => {
    const allowedFields = ["OrderID", "Status", "CreateDate", "Total", "GrandTotal", "CustomerID"];
    if (!allowedFields.includes(field)) {
      console.error("Invalid field name!");
      return Promise.resolve(null);
    }

    const sql = `SELECT * FROM Orders WHERE ${field} = ?`;

    return new Promise((resolve, reject) => {
      conn.query(sql, [value], (err, results) => {
        if (err) {
          console.error("Query failed:", err.message);
          reject(err);
          return;
        }

        if (results.length > 0) {
          const order = results[0];

          // If user asks for a specific field, return only that field’s value
          if (targetField) {
            if (targetField in order) {
              resolve(order[targetField]);
            } else {
              console.error("Target field not found in result!");
              resolve(null);
            }
          } else {
            // Otherwise, return the full order object
            resolve(order);
          }
        } else {
          resolve(null);
        }
      });
    });
  },

  // UPDATE
  updateOrder: (orderID, updates) => {
    const allowedFields = ["Status", "Total", "GrandTotal", "CustomerID"];
    const keys = Object.keys(updates).filter((k) => allowedFields.includes(k));

    if (keys.length === 0) {
      console.error("No valid fields to update.");
      return;
    }

    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    const values = keys.map((k) => updates[k]);
    const sql = `UPDATE Orders SET ${setClause} WHERE OrderID = ?`;

    conn.query(sql, [...values, orderID], (err, result) => {
      if (err) {
        console.error("Update failed:", err.message);
      } else if (result.affectedRows === 0) {
        console.log(`No order found with ID ${orderID}`);
      } else {
        console.log(`Order ${orderID} updated successfully.`);
      }
    });
  },

  // DELETE
  deleteOrder: (orderID) => {
    const sql = `DELETE FROM Orders WHERE OrderID = ?`;
    conn.query(sql, [orderID], (err, result) => {
      if (err) {
        console.error("Delete failed:", err.message);
      } else if (result.affectedRows === 0) {
        console.log(`No order found with ID ${orderID}`);
      } else {
        console.log(`Order ${orderID} deleted successfully.`);
      }
    });
  },

  // Get all orders with customer info
  getAllOrdersWithCustomer: () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          o.OrderID,
          o.Status,
          o.CreateDate,
          o.Total,
          o.GrandTotal,
          o.CustomerID,
          c.Name as customerName,
          c.Phone as customerPhone,
          c.Email as customerEmail,
          c.Address as customerAddress
        FROM Orders o
        JOIN Customer c ON o.CustomerID = c.ID
        ORDER BY o.CreateDate DESC
      `;
      
      conn.query(sql, (err, results) => {
        if (err) {
          console.error('Error getting orders:', err.message);
          reject(err);
        } else {
          console.log(`Retrieved ${results.length} orders`);
          resolve(results);
        }
      });
    });
  },

  // Get order details with items
  getOrderDetails: (orderId) => {
    return new Promise((resolve, reject) => {
      // Get order info
      const orderSql = `
        SELECT 
          o.OrderID,
          o.Status,
          o.CreateDate,
          o.Total,
          o.GrandTotal,
          o.CustomerID,
          c.Name as customerName,
          c.Phone as customerPhone,
          c.Email as customerEmail,
          c.Address as customerAddress
        FROM Orders o
        JOIN Customer c ON o.CustomerID = c.ID
        WHERE o.OrderID = ?
      `;
      
      conn.query(orderSql, [orderId], (err, orderResult) => {
        if (err) {
          console.error('Error getting order:', err.message);
          reject(err);
          return;
        }
        
        if (orderResult.length === 0) {
          console.log('Order not found:', orderId);
          resolve(null);
          return;
        }
        
        // Get order items
        const itemsSql = `
          SELECT 
            oi.VehicleID,
            oi.Quantity,
            oi.Price,
            v.Name as vehicleName,
            v.Brand,
            (SELECT ImageLink FROM Images WHERE VehicleID = oi.VehicleID AND ImagePriority = 1 LIMIT 1) as imageUrl
          FROM OrderItem oi
          LEFT JOIN Vehicle v ON oi.VehicleID = v.VehicleID
          WHERE oi.OrderID = ?
        `;
        
        conn.query(itemsSql, [orderId], (err, itemsResult) => {
          if (err) {
            console.error('Error getting order items:', err.message);
            reject(err);
          } else {
            console.log(`Retrieved order ${orderId} with ${itemsResult.length} items`);
            resolve({
              ...orderResult[0],
              items: itemsResult
            });
          }
        });
      });
    });
  },

  // Update order status
  updateOrderStatus: (orderId, status) => {
    return new Promise((resolve, reject) => {
      // Check if order exists first
      const checkSql = 'SELECT * FROM Orders WHERE OrderID = ?';
      
      conn.query(checkSql, [orderId], (err, results) => {
        if (err) {
          console.error('Error checking order:', err.message);
          reject(err);
          return;
        }
        
        if (results.length === 0) {
          const error = new Error(`Order with ID ${orderId} does not exist`);
          console.error(error.message);
          reject(error);
          return;
        }
        
        // Update order status
        const updateSql = 'UPDATE Orders SET Status = ? WHERE OrderID = ?';
        
        conn.query(updateSql, [status, orderId], (err, result) => {
          if (err) {
            console.error('Update order status failed:', err.message);
            reject(err);
          } else {
            console.log(`Order ${orderId} status updated to ${status}`);
            resolve(result);
          }
        });
      });
    });
  },

  // Get orders by customer ID with order items and vehicle details
  getOrdersByCustomer: (customerId) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          o.OrderID,
          o.CreateDate as OrderDate,
          o.Status,
          o.GrandTotal as TotalAmount,
          oi.VehicleID,
          oi.Quantity,
          oi.Price,
          v.Name as VehicleName,
          img.ImageLink
        FROM Orders o
        INNER JOIN OrderItem oi ON o.OrderID = oi.OrderID
        LEFT JOIN Vehicle v ON oi.VehicleID = v.VehicleID
        LEFT JOIN (
          SELECT VehicleID, ImageLink
          FROM Images
          WHERE ImagePriority = 1
        ) img ON oi.VehicleID = img.VehicleID
        WHERE o.CustomerID = ?
        ORDER BY o.CreateDate DESC
      `;
      
      conn.query(sql, [customerId], (err, results) => {
        if (err) {
          console.error('Error getting orders by customer:', err.message);
          reject(err);
        } else {
          console.log(`Retrieved ${results.length} order items for customer ${customerId}`);
          resolve(results);
        }
      });
    });
  }
};

module.exports = orderModel;