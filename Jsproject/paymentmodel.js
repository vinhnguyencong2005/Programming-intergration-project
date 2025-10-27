import conn from "./server.js";

// CREATE
function createPayment(content, type, amount, orderID, customerID) {
  // Check if Order exists
  const checkOrderSql = `SELECT * FROM Orders WHERE OrderID = ?`;
  conn.query(checkOrderSql, [orderID], (err, orderResults) => {
    if (err) {
      console.error("Error checking Order:", err.message);
      return;
    }
    if (orderResults.length === 0) {
      console.error(`Order with ID ${orderID} does not exist.`);
      return;
    }

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

      // If both exist, insert Payment
      const insertSql = `
        INSERT INTO Payment (Content, Type, Amount, OrderID, CustomerID)
        VALUES (?, ?, ?, ?, ?)
      `;
      const values = [content, type, amount, orderID, customerID];

      conn.query(insertSql, values, (err, result) => {
        if (err) {
          console.error("Insert into Payment failed:", err.message);
        } else {
          console.log(`Payment created successfully with ID: ${result.insertId}`);
        }
      });
    });
  });
}

// READ
/*
function readPayment(field, value) {
  const allowedFields = [
    "PaymentID",
    "Content",
    "Type",
    "Date",
    "Amount",
    "OrderID",
    "CustomerID"
  ];

  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return;
  }

  const sql = `SELECT * FROM Payment WHERE ${field} = ?`;
  conn.query(sql, [value], (err, results) => {
    if (err) {
      console.error("Query failed:", err.message);
      return;
    }

    if (results.length > 0) {
      console.log("Payment records found:");
      results.forEach(row => {
        console.log(
          `PaymentID: ${row.PaymentID}, Content: ${row.Content}, Type: ${row.Type}, Date: ${row.Date}, Amount: ${row.Amount}, OrderID: ${row.OrderID}, CustomerID: ${row.CustomerID}`
        );
      });
    } else {
      console.log("No payments found.");
    }
  });
}*/
function readPayment(field, value, targetField = null) {
  const allowedFields = [
    "PaymentID",
    "Content",
    "Type",
    "Date",
    "Amount",
    "OrderID",
    "CustomerID"
  ];

  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return Promise.resolve([]);
  }

  const sql = `SELECT * FROM Payment WHERE ${field} = ?`;

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
        console.log("No payments found.");
        resolve([]);
      }
    });
  });
}


// UPDATE
function updatePayment(paymentID, updates) {
  const allowedFields = ["Content", "Type", "Amount", "OrderID", "CustomerID"];
  const keys = Object.keys(updates).filter(k => allowedFields.includes(k));

  if (keys.length === 0) {
    console.error("No valid fields to update.");
    return;
  }

  const setClause = keys.map(k => `${k} = ?`).join(", ");
  const values = keys.map(k => updates[k]);
  const sql = `UPDATE Payment SET ${setClause} WHERE PaymentID = ?`;

  conn.query(sql, [...values, paymentID], (err, result) => {
    if (err) {
      console.error("Update failed:", err.message);
    } else if (result.affectedRows === 0) {
      console.log(`No Payment found with ID ${paymentID}`);
    } else {
      console.log(`Payment ${paymentID} updated successfully.`);
    }
  });
}

// DELETE
function deletePayment(paymentID) {
  const sql = `DELETE FROM Payment WHERE PaymentID = ?`;
  conn.query(sql, [paymentID], (err, result) => {
    if (err) {
      console.error("Delete failed:", err.message);
    } else if (result.affectedRows === 0) {
      console.log(`No Payment found with ID ${paymentID}`);
    } else {
      console.log(`Payment ${paymentID} deleted successfully.`);
    }
  });
}

// Example usage:

//createPayment("Deposit for Order #1", 1, 500000, 1, 2);
//readPayment("CustomerID", 2);
//updatePayment(1, { Amount: 600000 });
//deletePayment(1);


export {
  createPayment,
  readPayment,
  updatePayment,
  deletePayment
};
