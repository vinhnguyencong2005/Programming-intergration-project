import conn from "./server.js";

// CREATE
function createRating(customerID, vehicleID, information, star) {
  // Check if Customer exists
  const checkCustomerSql = `SELECT * FROM Customer WHERE ID = ?`;
  conn.query(checkCustomerSql, [customerID], (err, customerResults) => {
    if (err) {
      console.error("Error checking Customer:", err.message);
      return;
    }
    if (customerResults.length === 0) {
      console.error(`Customer with ID ${customerID} does not exist.`);
      return;
    }

    // Check if Vehicle exists
    const checkVehicleSql = `SELECT * FROM Vehicle WHERE VehicleID = ?`;
    conn.query(checkVehicleSql, [vehicleID], (err, vehicleResults) => {
      if (err) {
        console.error("Error checking Vehicle:", err.message);
        return;
      }
      if (vehicleResults.length === 0) {
        console.error(`Vehicle with ID ${vehicleID} does not exist.`);
        return;
      }

      // Insert Rating
      const insertSql = `
        INSERT INTO Rating (CustomerID, VehicleID, Information, Star)
        VALUES (?, ?, ?, ?)
      `;
      const values = [customerID, vehicleID, information, star];

      conn.query(insertSql, values, (err, result) => {
        if (err) {
          console.error("Insert into Rating failed:", err.message);
        } else {
          console.log(
            `Rating added successfully for Vehicle ${vehicleID} by Customer ${customerID}`
          );
        }
      });
    });
  });
}

// READ
/*
function readRating(field, value) {
  const allowedFields = ["CustomerID", "VehicleID", "Information", "Star", "CreateDate"];
  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return;
  }

  const sql = `SELECT * FROM Rating WHERE ${field} = ?`;
  conn.query(sql, [value], (err, results) => {
    if (err) {
      console.error("Query failed:", err.message);
      return;
    }

    if (results.length > 0) {
      console.log("Rating records found:");
      results.forEach((row) => {
        console.log(
          `CustomerID: ${row.CustomerID}, VehicleID: ${row.VehicleID}, Star: ${row.Star}, Info: ${row.Information}, Date: ${row.CreateDate}`
        );
      });
    } else {
      console.log("No ratings found.");
    }
  });
}*/
function readRating(field, value, targetField = null) {
  const allowedFields = ["CustomerID", "VehicleID", "Information", "Star", "CreateDate"];
  
  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return Promise.resolve([]);
  }

  const sql = `SELECT * FROM Rating WHERE ${field} = ?`;

  return new Promise((resolve, reject) => {
    conn.query(sql, [value], (err, results) => {
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

          if (values.length === 0) {
            console.error("Target field not found in results.");
            resolve([]);
          } else {
            resolve(values.length === 1 ? values[0] : values);
          }
        } else {
        
          resolve(results);
        }
      } else {
        console.log("No ratings found.");
        resolve([]);
      }
    });
  });
}


// UPDATE
function updateRating(customerID, vehicleID, updates) {
  const allowedFields = ["Information", "Star"];
  const keys = Object.keys(updates).filter((k) => allowedFields.includes(k));

  if (keys.length === 0) {
    console.error("No valid fields to update.");
    return;
  }

  const setClause = keys.map((k) => `${k} = ?`).join(", ");
  const values = keys.map((k) => updates[k]);
  const sql = `UPDATE Rating SET ${setClause} WHERE CustomerID = ? AND VehicleID = ?`;

  conn.query(sql, [...values, customerID, vehicleID], (err, result) => {
    if (err) {
      console.error("Update failed:", err.message);
    } else if (result.affectedRows === 0) {
      console.log(`No rating found for Customer ${customerID} and Vehicle ${vehicleID}`);
    } else {
      console.log(`Rating for Vehicle ${vehicleID} updated successfully.`);
    }
  });
}

// DELETE
function deleteRating(customerID, vehicleID) {
  const sql = `DELETE FROM Rating WHERE CustomerID = ? AND VehicleID = ?`;
  conn.query(sql, [customerID, vehicleID], (err, result) => {
    if (err) {
      console.error("Delete failed:", err.message);
    } else if (result.affectedRows === 0) {
      console.log(`No rating found for Customer ${customerID} and Vehicle ${vehicleID}`);
    } else {
      console.log(`Rating deleted successfully for Vehicle ${vehicleID} by Customer ${customerID}`);
    }
  });
}

// Example usage:

//createRating(2, 'Vario125_BD', 'Great car, very smooth ride!', 5.5);
//readRating('VehicleID', 'Wave_D');
//updateRating(1, 'Wave_D', { Star: 4, Information: 'Still good, but could be cheaper' });
//deleteRating(1, 'Wave_D');


export { createRating, readRating, updateRating, deleteRating };
