import conn from "./server.js";
import { readOrder } from "./ordermodel.js";
import { readVehicle } from "./vehiclemodel.js";

// CREATE
function createOrderItem(quantity, price, discount, orderID, vehicleID) {
  // Check if Order exists
  const checkOrderSql = `SELECT * FROM Orders WHERE OrderID = ?`;
  conn.query(checkOrderSql, [orderID], (err, orderResults) => {
    if (err) {
      console.error("Error checking order:", err.message);
      return;
    }
    if (orderResults.length === 0) {
      console.error(`Order with ID ${orderID} does not exist.`);
      return;
    }

    // Check if Vehicle exists
    const checkVehicleSql = `SELECT * FROM Vehicle WHERE VehicleID = ?`;
    conn.query(checkVehicleSql, [vehicleID], (err, vehicleResults) => {
      if (err) {
        console.error("Error checking vehicle:", err.message);
        return;
      }
      if (vehicleResults.length === 0) {
        console.error(`Vehicle with ID ${vehicleID} does not exist.`);
        return;
      }

      // Insert if both exist
      const sql = `
        INSERT INTO OrderItem (Quantity, Price, Discount, OrderID, VehicleID)
        VALUES (?, ?, ?, ?, ?)
      `;
      const values = [quantity, price, discount, orderID, vehicleID];

      conn.query(sql, values, (err, result) => {
        if (err) {
          console.error("Insert into OrderItem failed:", err.message);
        } else {
          console.log(`OrderItem created successfully for Order ${orderID} and Vehicle ${vehicleID}.`);
        }
      });
    });
  });
}

// READ
/*
function readOrderItem(field, value) {
  const allowedFields = ["OrderItemID", "Quantity", "Price", "Discount", "CreateDate", "OrderID", "VehicleID"];
  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return;
  }

  const sql = `SELECT * FROM OrderItem WHERE ${field} = ?`;
  conn.query(sql, [value], (err, results) => {
    if (err) {
      console.error("Query failed:", err.message);
      return;
    }

    if (results.length > 0) {
      console.log("OrderItem records found:");
      results.forEach(row => {
        console.log(
          `OrderItemID: ${row.OrderItemID}, Quantity: ${row.Quantity}, Price: ${row.Price}, Discount: ${row.Discount}, CreateDate: ${row.CreateDate}, OrderID: ${row.OrderID}, VehicleID: ${row.VehicleID}`
        );
      });
    } else {
      console.log("No OrderItem record found.");
    }
  });
}*/
function readOrderItem(field, value, targetField = null) {
  const allowedFields = [
    "OrderItemID",
    "Quantity",
    "Price",
    "Discount",
    "CreateDate",
    "OrderID",
    "VehicleID"
  ];

  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return Promise.resolve([]);
  }

  const sql = `SELECT * FROM OrderItem WHERE ${field} = ?`;

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
            .filter(val => val !== undefined);

          if (values.length > 0) {
            resolve(values.length === 1 ? values[0] : values); 
          } else {
            console.error("Target field not found in results.");
            resolve([]);
          }
        } else {
          
          resolve(results);
        }
      } else {
        console.log("No OrderItem record found.");
        resolve([]);
      }
    });
  });
}


// UPDATE
function updateOrderItem(orderItemID, updates) {
  const allowedFields = ["Quantity", "Price", "Discount", "OrderID", "VehicleID"];
  const keys = Object.keys(updates).filter(k => allowedFields.includes(k));

  if (keys.length === 0) {
    console.error("No valid fields to update.");
    return;
  }

  const setClause = keys.map(k => `${k} = ?`).join(", ");
  const values = keys.map(k => updates[k]);
  const sql = `UPDATE OrderItem SET ${setClause} WHERE OrderItemID = ?`;

  conn.query(sql, [...values, orderItemID], (err, result) => {
    if (err) {
      console.error("Update failed:", err.message);
    } else if (result.affectedRows === 0) {
      console.log(`No OrderItem found with ID ${orderItemID}.`);
    } else {
      console.log(`OrderItem ${orderItemID} updated successfully.`);
    }
  });
}

// DELETE
function deleteOrderItem(orderItemID) {
  const sql = `DELETE FROM OrderItem WHERE OrderItemID = ?`;
  conn.query(sql, [orderItemID], (err, result) => {
    if (err) {
      console.error("Delete failed:", err.message);
    } else if (result.affectedRows === 0) {
      console.log(`No OrderItem found with ID ${orderItemID}.`);
    } else {
      console.log(`OrderItem ${orderItemID} deleted successfully.`);
    }
  });
}

// Example usage
//createOrderItem(2, 450000000, 0.05, 1, "Wave_D");
// readOrderItem("OrderID", 1);
// updateOrderItem(3, { Quantity: 5 });
// deleteOrderItem(3);

export { createOrderItem, readOrderItem, updateOrderItem, deleteOrderItem };
