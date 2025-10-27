import conn from "./server.js";
import { readOrder } from "./ordermodel.js";
import { readVoucher } from "./vouchermodel.js";

// CREATE
function createApply(orderID, voucherCode) {
  // Check if order exists
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

    // Check if voucher exists
    const checkVoucherSql = `SELECT * FROM Voucher WHERE Code = ?`;
    conn.query(checkVoucherSql, [voucherCode], (err, voucherResults) => {
      if (err) {
        console.error("Error checking voucher:", err.message);
        return;
      }
      if (voucherResults.length === 0) {
        console.error(`Voucher with code ${voucherCode} does not exist.`);
        return;
      }

      // If both exist → insert
      const sql = `
        INSERT INTO Apply (OrderID, VoucherCode)
        VALUES (?, ?)
      `;
      conn.query(sql, [orderID, voucherCode], (err, result) => {
        if (err) {
          console.error("Insert into Apply failed:", err.message);
        } else {
          console.log(`Voucher ${voucherCode} applied successfully to Order ${orderID}.`);
        }
      });
    });
  });
}

// READ
/*
function readApply(field, value) {
  const allowedFields = ["OrderID", "VoucherCode"];
  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return;
  }

  const sql = `SELECT * FROM Apply WHERE ${field} = ?`;
  conn.query(sql, [value], (err, results) => {
    if (err) {
      console.error("Query failed:", err.message);
      return;
    }

    if (results.length > 0) {
      console.log("Apply records found:");
      results.forEach((row) => {
        console.log(`OrderID: ${row.OrderID}, VoucherCode: ${row.VoucherCode}`);
      });
    } else {
      console.log("No matching Apply record found.");
    }
  });
}*/
function readApply(field, value, targetField = null) {
  const allowedFields = ["OrderID", "VoucherCode"];
  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return Promise.resolve(null); // return empty if invalid
  }

  const sql = `SELECT * FROM Apply WHERE ${field} = ?`;

  return new Promise((resolve, reject) => {
    conn.query(sql, [value], (err, results) => {
      if (err) {
        console.error("Query failed:", err.message);
        reject(err);
        return;
      }

      if (results.length > 0) {
        const apply = results[0];

        if (targetField) {
          if (targetField in apply) {
            resolve(apply[targetField]);
          } else {
            console.error("Target field not found in result!");
            resolve(null);
          }
        } else {
  
          resolve(apply);
        }
      } else {
        console.log("No matching Apply record found.");
        resolve(null);
      }
    });
  });
}


// UPDATE
function updateApply(orderID, updates) {
  const allowedFields = ["VoucherCode"];
  const keys = Object.keys(updates).filter((k) => allowedFields.includes(k));

  if (keys.length === 0) {
    console.error("No valid fields to update.");
    return;
  }

  const setClause = keys.map((k) => `${k} = ?`).join(", ");
  const values = keys.map((k) => updates[k]);
  const sql = `UPDATE Apply SET ${setClause} WHERE OrderID = ?`;

  conn.query(sql, [...values, orderID], (err, result) => {
    if (err) {
      console.error("Update failed:", err.message);
    } else if (result.affectedRows === 0) {
      console.log(`No Apply record found for OrderID ${orderID}.`);
    } else {
      console.log(`Apply record for OrderID ${orderID} updated successfully.`);
    }
  });
}

// DELETE
function deleteApply(orderID) {
  const sql = `DELETE FROM Apply WHERE OrderID = ?`;
  conn.query(sql, [orderID], (err, result) => {
    if (err) {
      console.error("Delete failed:", err.message);
    } else if (result.affectedRows === 0) {
      console.log(`No Apply record found for OrderID ${orderID}.`);
    } else {
      console.log(`Apply record for OrderID ${orderID} deleted successfully.`);
    }
  });
}

// Example usage:
// createApply(1, "HAPPYINDEPENDENCEDAY");
// readApply("VoucherCode", "HAPPYINDEPENDENCEDAY");
// updateApply(1, { VoucherCode: "SUMMER2025" });
// deleteApply(1);

export { createApply, readApply, updateApply, deleteApply };
