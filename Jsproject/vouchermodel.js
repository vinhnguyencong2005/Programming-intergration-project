import conn from "./server.js";

// CREATE
function createVoucher(code, reduction, startDate, endDate, quantity, conditions) {
  const sql = `
    INSERT INTO Voucher (Code, Reduction, StartDate, EndDate, Quantity, Conditions)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [code, reduction, startDate, endDate, quantity, conditions];

  conn.query(sql, values, (err, result) => {
    if (err) {
      console.error("Insert into Voucher failed:", err.message);
    } else {
      console.log(`Voucher '${code}' created successfully.`);
    }
  });
}

// READ
/*
function readVoucher(field, value) {
  const allowedFields = ["Code", "Reduction", "StartDate", "EndDate", "Quantity", "Conditions"];
  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return;
  }

  const sql = `SELECT * FROM Voucher WHERE ${field} = ?`;
  conn.query(sql, [value], (err, results) => {
    if (err) {
      console.error("Query failed:", err.message);
      return;
    }

    if (results.length > 0) {
      console.log("Voucher records found:");
      results.forEach(row => {
        console.log(
          `Code: ${row.Code}, Reduction: ${row.Reduction}, StartDate: ${row.StartDate}, EndDate: ${row.EndDate}, Quantity: ${row.Quantity}, Conditions: ${row.Conditions}`
        );
      });
    } else {
      console.log("No voucher found.");
    }
  });
}*/
function readVoucher(field, value, targetField = null) {
  const allowedFields = ["Code", "Reduction", "StartDate", "EndDate", "Quantity", "Conditions"];

  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return Promise.resolve([]);
  }

  const sql = `SELECT * FROM Voucher WHERE ${field} = ?`;

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
        console.log("No vouchers found.");
        resolve([]);
      }
    });
  });
}



// UPDATE
function updateVoucher(code, updates) {
  const allowedFields = ["Reduction", "StartDate", "EndDate", "Quantity", "Conditions"];
  const keys = Object.keys(updates).filter(k => allowedFields.includes(k));

  if (keys.length === 0) {
    console.error("No valid fields to update.");
    return;
  }

  const setClause = keys.map(k => `${k} = ?`).join(", ");
  const values = keys.map(k => updates[k]);
  const sql = `UPDATE Voucher SET ${setClause} WHERE Code = ?`;

  conn.query(sql, [...values, code], (err, result) => {
    if (err) {
      console.error("Update failed:", err.message);
    } else if (result.affectedRows === 0) {
      console.log(`No voucher found with Code '${code}'.`);
    } else {
      console.log(`Voucher '${code}' updated successfully.`);
    }
  });
}

// DELETE
function deleteVoucher(code) {
  const sql = `DELETE FROM Voucher WHERE Code = ?`;
  conn.query(sql, [code], (err, result) => {
    if (err) {
      console.error("Delete failed:", err.message);
    } else if (result.affectedRows === 0) {
      console.log(`No voucher found with Code '${code}'.`);
    } else {
      console.log(`Voucher '${code}' deleted successfully.`);
    }
  });
}

// Example usage:
// createVoucher("HAPPYINDEPENDENCEDAY", 10, "2025-09-01", "2025-09-10", 100, 500000);
// readVoucher("Code", "HAPPYINDEPENDENCEDAY");
// updateVoucher("HAPPYINDEPENDENCEDAY", { Quantity: 80 });
// deleteVoucher("HAPPYINDEPENDENCEDAY");

export {
  createVoucher,
  readVoucher,
  updateVoucher,
  deleteVoucher
};
