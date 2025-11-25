import conn from "./server.js";
import { readCustomer } from "./usermodel.js";

// CREATE
function createOrder(status, total, grandTotal, customerID) {
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
          resolve({ orderID: result.insertId, ...result });
        }
      });
    });
  });
}

// READ
/*
function readOrder(field, value) {
  const allowedFields = ["OrderID", "Status", "CreateDate", "Total", "GrandTotal", "CustomerID"];
  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return;
  }

  const sql = `SELECT * FROM Orders WHERE ${field} = ?`;
  conn.query(sql, [value], (err, results) => {
    if (err) {
      console.error("Query failed:", err.message);
      return;
    }

    if (results.length > 0) {
      console.log("Order records found:");
      results.forEach((row) => {
        console.log(
          `OrderID: ${row.OrderID}, Status: ${row.Status}, CreateDate: ${row.CreateDate}, Total: ${row.Total}, GrandTotal: ${row.GrandTotal}, CustomerID: ${row.CustomerID}`
        );
      });
    } else {
      console.log("No matching order found.");
    }
  });
}*/
function readOrder(field, value, targetField = null) {
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
        // If targetField is specified, return just that field from first result
        if (targetField) {
          const order = results[0];
          if (targetField in order) {
            resolve(order[targetField]);
          } else {
            console.error("Target field not found in result!");
            resolve(null);
          }
        } else {
          // Return all matching orders (array)
          resolve(results);
        }
      } else {
        resolve([]);
      }
    });
  });
}

// UPDATE
function updateOrder(orderID, updates) {
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
}

// DELETE
function deleteOrder(orderID) {
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

// Example usage:
//createOrder("Pending", 1200000, 1150000, 1);
//createOrder("Pending", 1200000, 1150000, 2);
//createOrder("Pending", 1200000, 1150000, 2);
//readOrder("CustomerID", 1);
//updateOrder(1, { Status: "Accepted" });
//deleteOrder(1);


 
  //const orders1 = await readOrder("OrderID", 1, "Total");
  //const orders2 = await readOrder("OrderID", 2, "Total");


  //console.log("Orders for OrderID 1:", orders1);
  //console.log("Orders for OrderID 2:", orders2);
  //const totalSum = orders1  + orders2 ;
  //console.log("Total Sum of Orders 1 and 2:", totalSum);



export { createOrder, readOrder, updateOrder, deleteOrder };
