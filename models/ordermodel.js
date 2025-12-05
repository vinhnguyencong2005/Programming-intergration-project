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
  }
};

module.exports = orderModel;