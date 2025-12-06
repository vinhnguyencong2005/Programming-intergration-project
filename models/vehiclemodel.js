const conn = require("../config/db");

// Vehicle Model
const vehicleModel = {
  // CREATE
  createVehicle: (vehicleID, name, price, summary, rating, discount, slug, brand, stock, type, warehouseID) => {
    return new Promise((resolve, reject) => {
      // Check if VehicleID already exists
      const checkSql = `SELECT COUNT(*) AS count FROM Vehicle WHERE VehicleID = ?`;

      conn.query(checkSql, [vehicleID], (checkErr, checkResult) => {
        if (checkErr) {
          console.error("Failed to check VehicleID:", checkErr.message);
          reject(checkErr);
          return;
        }

        const count = checkResult[0].count;
        if (count > 0) {
          const error = new Error(`Vehicle with ID ${vehicleID} already exists. Insert aborted.`);
          console.warn(error.message);
          reject(error);
          return;
        }

        // Proceed to insert
        const insertSql = `
          INSERT INTO Vehicle (VehicleID, Name, Price, Summary, Rating, Discount, Slug, Brand, Stock, Type, WarehouseID)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [vehicleID, name, price, summary, rating, discount, slug, brand, stock, type, warehouseID];

        conn.query(insertSql, values, (err, result) => {
          if (err) {
            console.error(" Insert into Vehicle failed:", err.message);
            reject(err);
          } else {
            console.log(` Vehicle ${vehicleID} ("${name}") added successfully to Warehouse ${warehouseID}`);
            resolve(result);
          }
        });
      });
    });
  },

  // READ
  readVehicle: (field = null, value = null, targetField = null) => {
    const allowedFields = [
      "VehicleID",
      "Name",
      "Price",
      "Summary",
      "Rating",
      "Discount",
      "Slug",
      "Brand",
      "Stock",
      "Type",
      "WarehouseID"
    ];

    let sql, params;

    if (field && value) {
      if (!allowedFields.includes(field)) {
        console.error("Invalid field name!");
        return Promise.resolve([]);
      }
      sql = `SELECT * FROM Vehicle WHERE ${field} = ?`;
      params = [value];
    } else {
      // Nếu không truyền field thì lấy tất cả
      sql = `SELECT * FROM Vehicle`;
      params = [];
    }

    return new Promise((resolve, reject) => {
      conn.query(sql, params, (err, results) => {
        if (err) {
          console.error("Query failed:", err.message);
          reject(err);
          return;
        }

        if (results.length > 0) {
          if (targetField) {
            const values = results
              .map(row => row[targetField])
              .filter(v => v !== undefined);
            resolve(values.length === 1 ? values[0] : values);
          } else {
            resolve(results);
          }
        } else {
          console.log("No vehicles found.");
          resolve([]);
        }
      });
    });
  },

  // UPDATE
  updateVehicle: (vehicleID, updates) => {
    return new Promise((resolve, reject) => {
      const allowedFields = [
        "Name",
        "Price",
        "Summary",
        "Rating",
        "Discount",
        "Slug",
        "Brand",
        "Stock",
        "Type",
        "WarehouseID"
      ];

      const keys = Object.keys(updates).filter(k => allowedFields.includes(k));
      if (keys.length === 0) {
        console.error("No valid fields to update.");
        reject(new Error("No valid fields to update"));
        return;
      }

      // Check if vehicle exists first
      const checkSql = 'SELECT VehicleID FROM Vehicle WHERE VehicleID = ?';
      
      conn.query(checkSql, [vehicleID], (err, results) => {
        if (err) {
          console.error('Error checking vehicle:', err.message);
          reject(err);
          return;
        }
        
        if (results.length === 0) {
          console.log(`No vehicle found with ID ${vehicleID}`);
          resolve(false);
          return;
        }

        const setClause = keys.map(k => `${k} = ?`).join(", ");
        const values = keys.map(k => updates[k]);
        const sql = `UPDATE Vehicle SET ${setClause} WHERE VehicleID = ?`;

        conn.query(sql, [...values, vehicleID], (err, result) => {
          if (err) {
            console.error("Update failed:", err.message);
            reject(err);
          } else {
            console.log(`Vehicle ${vehicleID} updated successfully.`);
            resolve(result.affectedRows > 0);
          }
        });
      });
    });
  },

  // DELETE
  deleteVehicle: (vehicleID) => {
    return new Promise((resolve, reject) => {
      // Check if vehicle is in any pending orders
      const checkOrderSql = `
        SELECT COUNT(*) as count 
        FROM OrderItem oi
        JOIN Orders o ON oi.OrderID = o.OrderID
        WHERE oi.VehicleID = ? AND o.Status = 'Pending'
      `;
      
      conn.query(checkOrderSql, [vehicleID], (err, results) => {
        if (err) {
          console.error('Error checking vehicle in orders:', err.message);
          reject(err);
          return;
        }
        
        if (results[0].count > 0) {
          reject(new Error('Không thể xóa sản phẩm có trong đơn hàng đang chờ xử lý'));
          return;
        }
        
        // Check if vehicle exists
        const checkVehicleSql = 'SELECT VehicleID FROM Vehicle WHERE VehicleID = ?';
        
        conn.query(checkVehicleSql, [vehicleID], (err, vehicleResults) => {
          if (err) {
            console.error('Error checking vehicle:', err.message);
            reject(err);
            return;
          }
          
          if (vehicleResults.length === 0) {
            console.log('Vehicle not found:', vehicleID);
            resolve(false);
            return;
          }
          
          // Delete vehicle
          const deleteSql = 'DELETE FROM Vehicle WHERE VehicleID = ?';
          
          conn.query(deleteSql, [vehicleID], (err, result) => {
            if (err) {
              console.error('Delete vehicle failed:', err.message);
              reject(err);
            } else {
              console.log(`Vehicle ${vehicleID} deleted successfully`);
              resolve(result.affectedRows > 0);
            }
          });
        });
      });
    });
  },

  // GET VEHICLE IMAGES
  getVehicleImages: (vehicleID) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT VehicleID, ImagePriority, ImageLink FROM Images WHERE VehicleID = ? ORDER BY ImagePriority ASC`;
      
      conn.query(sql, [vehicleID], (err, results) => {
        if (err) {
          console.error("Failed to get vehicle images:", err.message);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  // ADD OR UPDATE VEHICLE IMAGE
  upsertVehicleImage: (vehicleID, imageUrl, priority = 1) => {
    return new Promise((resolve, reject) => {
      // Check if image already exists
      const checkSql = 'SELECT * FROM Images WHERE VehicleID = ? AND ImagePriority = ?';
      
      conn.query(checkSql, [vehicleID, priority], (err, results) => {
        if (err) {
          console.error('Error checking image:', err.message);
          reject(err);
          return;
        }

        if (results.length > 0) {
          // Update existing image
          const updateSql = 'UPDATE Images SET ImageLink = ? WHERE VehicleID = ? AND ImagePriority = ?';
          
          conn.query(updateSql, [imageUrl, vehicleID, priority], (err, result) => {
            if (err) {
              console.error('Error updating image:', err.message);
              reject(err);
            } else {
              console.log(`Image updated for vehicle ${vehicleID}`);
              resolve(result);
            }
          });
        } else {
          // Insert new image
          const insertSql = 'INSERT INTO Images (VehicleID, ImagePriority, ImageLink) VALUES (?, ?, ?)';
          
          conn.query(insertSql, [vehicleID, priority, imageUrl], (err, result) => {
            if (err) {
              console.error('Error inserting image:', err.message);
              reject(err);
            } else {
              console.log(`Image added for vehicle ${vehicleID}`);
              resolve(result);
            }
          });
        }
      });
    });
  }
};

module.exports = vehicleModel;
