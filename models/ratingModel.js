const conn = require("../config/db");

const ratingModel = {
  // Create or update rating
  upsertRating: (customerID, vehicleID, star, information) => {
    return new Promise((resolve, reject) => {
      // Check if rating already exists
      const checkSql = `SELECT * FROM Rating WHERE CustomerID = ? AND VehicleID = ?`;
      
      conn.query(checkSql, [customerID, vehicleID], (err, results) => {
        if (err) {
          console.error("Check rating failed:", err.message);
          reject(err);
          return;
        }

        if (results.length > 0) {
          // Update existing rating
          const updateSql = `
            UPDATE Rating 
            SET Star = ?, Information = ?, CreateDate = CURRENT_TIMESTAMP
            WHERE CustomerID = ? AND VehicleID = ?
          `;
          
          conn.query(updateSql, [star, information, customerID, vehicleID], (err, result) => {
            if (err) {
              console.error("Update rating failed:", err.message);
              reject(err);
            } else {
              console.log(`Rating updated for Customer ${customerID}, Vehicle ${vehicleID}`);
              resolve(result);
            }
          });
        } else {
          // Insert new rating
          const insertSql = `
            INSERT INTO Rating (CustomerID, VehicleID, Star, Information)
            VALUES (?, ?, ?, ?)
          `;
          
          conn.query(insertSql, [customerID, vehicleID, star, information], (err, result) => {
            if (err) {
              console.error("Insert rating failed:", err.message);
              reject(err);
            } else {
              console.log(`Rating created for Customer ${customerID}, Vehicle ${vehicleID}`);
              resolve(result);
            }
          });
        }
      });
    });
  },

  // Get all ratings with customer and vehicle info
  getAllRatings: () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          r.CustomerID,
          r.VehicleID,
          r.Star,
          r.Information,
          r.CreateDate,
          c.Name as customerName,
          c.Email as customerEmail,
          c.Phone as customerPhone,
          v.Name as vehicleName,
          v.Brand as vehicleBrand
        FROM Rating r
        JOIN Customer c ON r.CustomerID = c.ID
        LEFT JOIN Vehicle v ON r.VehicleID = v.VehicleID
        ORDER BY r.CreateDate DESC
      `;

      conn.query(sql, (err, results) => {
        if (err) {
          console.error("Get all ratings failed:", err.message);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  // Get ratings by vehicle
  getRatingsByVehicle: (vehicleID) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          r.CustomerID,
          r.VehicleID,
          r.Star,
          r.Information,
          r.CreateDate,
          c.Name as customerName
        FROM Rating r
        JOIN Customer c ON r.CustomerID = c.ID
        WHERE r.VehicleID = ?
        ORDER BY r.CreateDate DESC
      `;

      conn.query(sql, [vehicleID], (err, results) => {
        if (err) {
          console.error("Get ratings by vehicle failed:", err.message);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  // Delete rating
  deleteRating: (customerID, vehicleID) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM Rating WHERE CustomerID = ? AND VehicleID = ?`;

      conn.query(sql, [customerID, vehicleID], (err, result) => {
        if (err) {
          console.error("Delete rating failed:", err.message);
          reject(err);
        } else {
          console.log(`Rating deleted: Customer ${customerID}, Vehicle ${vehicleID}`);
          resolve(result.affectedRows > 0);
        }
      });
    });
  }
};

module.exports = ratingModel;
