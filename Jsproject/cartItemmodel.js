import conn from "./server.js";
import { readCustomer } from "./usermodel.js";
import { readVehicle } from "./vehiclemodel.js";

// CREATE
function createCartItem(quantity, price, discount, customerID, vehicleID) {
  // Check if customer exists
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

    // Check if vehicle exists
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

      // Check if the vehicle is already in the customer's cart
      const checkDuplicateSql = `
        SELECT * FROM CartItem WHERE CustomerID = ? AND VehicleID = ?
      `;
      conn.query(checkDuplicateSql, [customerID, vehicleID], (err, duplicateResults) => {
        if (err) {
          console.error("Error checking CartItem:", err.message);
          return;
        }
        if (duplicateResults.length > 0) {
          console.error("This vehicle is already added to the cart.");
          return;
        }

        // Insert into CartItem
        const sql = `
          INSERT INTO CartItem (Quantity, Price, Discount, CustomerID, VehicleID)
          VALUES (?, ?, ?, ?, ?)
        `;
        const values = [quantity, price, discount, customerID, vehicleID];

        conn.query(sql, values, (err, result) => {
          if (err) {
            console.error("Insert into CartItem failed:", err.message);
          } else {
            console.log(`CartItem created successfully with ID: ${result.insertId}`);
          }
        });
      });
    });
  });
}

// READ
/*
function readCartItem(field, value) {
  const allowedFields = [
    "CartItemID",
    "Quantity",
    "Price",
    "Discount",
    "CreateDate",
    "CustomerID",
    "VehicleID"
  ];
  if (!allowedFields.includes(field)) {
    console.error(" Invalid field name!");
    return;
  }

  const sql = `SELECT * FROM CartItem WHERE ${field} = ?`;
  conn.query(sql, [value], (err, results) => {
    if (err) {
      console.error(" Query failed:", err.message);
      return;
    }

    if (results.length > 0) {
      console.log(" CartItem records found:");
      results.forEach((row) => {
        console.log(
          `CartItemID: ${row.CartItemID}, Quantity: ${row.Quantity}, Price: ${row.Price}, Discount: ${row.Discount}, CreateDate: ${row.CreateDate}, CustomerID: ${row.CustomerID}, VehicleID: ${row.VehicleID}`
        );
      });
    } else {
      console.log("No cart items found.");
    }
  });
}*/
function readCartItem(field, value, targetField = null) {
  const allowedFields = [
    "CartItemID",
    "Quantity",
    "Price",
    "Discount",
    "CreateDate",
    "CustomerID",
    "VehicleID"
  ];

  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return Promise.resolve(null);
  }

  const sql = `SELECT * FROM CartItem WHERE ${field} = ?`;

  return new Promise((resolve, reject) => {
    conn.query(sql, [value], (err, results) => {
      if (err) {
        console.error("Query failed:", err.message);
        reject(err);
        return;
      }

      if (results.length > 0) {
        const cartItem = results;

        
        if (targetField) {
          if (targetField in cartItem) {
            resolve(cartItem[targetField]);
          } else {
            console.error("Target field not found in result!");
            resolve(null);
          }
        } else {
          
          resolve(cartItem);
        }
      } else {
        console.log("No cart items found.");
        resolve(null);
      }
    });
  });
}


// UPDATE
function updateCartItem(cartItemID, updates) {
  const allowedFields = ["Quantity", "Price", "Discount", "CustomerID", "VehicleID"];
  const keys = Object.keys(updates).filter((k) => allowedFields.includes(k));

  if (keys.length === 0) {
    console.error(" No valid fields to update.");
    return;
  }

  const setClause = keys.map((k) => `${k} = ?`).join(", ");
  const values = keys.map((k) => updates[k]);
  const sql = `UPDATE CartItem SET ${setClause} WHERE CartItemID = ?`;

  conn.query(sql, [...values, cartItemID], (err, result) => {
    if (err) {
      console.error(" Update failed:", err.message);
    } else if (result.affectedRows === 0) {
      console.log(` No cart item found with ID ${cartItemID}`);
    } else {
      console.log(` CartItem ${cartItemID} updated successfully.`);
    }
  });
}

// DELETE
function deleteCartItem(cartItemID) {
  const sql = `DELETE FROM CartItem WHERE CartItemID = ?`;
  conn.query(sql, [cartItemID], (err, result) => {
    if (err) {
      console.error(" Delete failed:", err.message);
    } else if (result.affectedRows === 0) {
      console.log(` No cart item found with ID ${cartItemID}`);
    } else {
      console.log(` CartItem ${cartItemID} deleted successfully.`);
    }
  });
}

// Example Tests
//createCartItem(2, 250000000, 0.2, 1, "Wave_D");
//createCartItem(2, 250000000, 0.2, 2, "CBR150R_BAC");
// readCartItem("CustomerID", 2353330);
// updateCartItem(1, { Quantity: 3, Discount: 0.1 });
// deleteCartItem(1);

export { createCartItem, readCartItem, updateCartItem, deleteCartItem };
