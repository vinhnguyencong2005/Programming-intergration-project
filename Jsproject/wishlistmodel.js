import conn from "./server.js";

// CREATE
function createWishlist(customerID, vehicleID) {
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

      // Insert into Wishlist
      const insertSql = `
        INSERT INTO AddToWishlist (CustomerID, VehicleID)
        VALUES (?, ?)
      `;
      const values = [customerID, vehicleID];

      conn.query(insertSql, values, (err, result) => {
        if (err) {
          console.error("Insert into AddToWishlist failed:", err.message);
        } else {
          console.log(
            `Vehicle ${vehicleID} successfully added to wishlist of Customer ${customerID}`
          );
        }
      });
    });
  });
}

// READ
/*
function readWishlist(field, value) {
  const allowedFields = ["CustomerID", "VehicleID"];
  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return;
  }

  const sql = `SELECT * FROM AddToWishlist WHERE ${field} = ?`;
  conn.query(sql, [value], (err, results) => {
    if (err) {
      console.error("Query failed:", err.message);
      return;
    }

    if (results.length > 0) {
      console.log("Wishlist records found:");
      results.forEach((row) => {
        console.log(`CustomerID: ${row.CustomerID}, VehicleID: ${row.VehicleID}`);
      });
    } else {
      console.log("No wishlist records found.");
    }
  });
}*/
function readWishlist(field, value, targetField = null) {
  const allowedFields = ["CustomerID", "VehicleID"];

  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return Promise.resolve([]);
  }

  const sql = `SELECT * FROM AddToWishlist WHERE ${field} = ?`;

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
        console.log("No wishlist records found.");
        resolve([]);
      }
    });
  });
}


// DELETE
function deleteWishlist(customerID, vehicleID) {
  const sql = `DELETE FROM AddToWishlist WHERE CustomerID = ? AND VehicleID = ?`;
  conn.query(sql, [customerID, vehicleID], (err, result) => {
    if (err) {
      console.error("Delete failed:", err.message);
    } else if (result.affectedRows === 0) {
      console.log(`No wishlist record found for Customer ${customerID} and Vehicle ${vehicleID}`);
    } else {
      console.log(`Wishlist item deleted for Customer ${customerID} and Vehicle ${vehicleID}`);
    }
  });
}

// Example usage:

//createWishlist(1, 'Vario125_BD');
//createWishlist(2, 'Vario125_BD');
//const wishlistItems = await readWishlist('VehicleID', 'Vario125_BD','CustomerID');
//console.log(wishlistItems);
//deleteWishlist(1, '9002');


export { createWishlist, readWishlist, deleteWishlist };
