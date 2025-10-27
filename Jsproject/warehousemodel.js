import conn from "./server.js";

// CREATE
function createWarehouse(warehouseID, address) {
  //  Check if WarehouseID already exists
  const checkSql = `SELECT COUNT(*) AS count FROM Warehouse WHERE WarehouseID = ?`;

  conn.query(checkSql, [warehouseID], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Failed to check WarehouseID:", checkErr.message);
      return;
    }

    const count = checkResult[0].count;
    if (count > 0) {
      console.warn(` Warehouse with ID ${warehouseID} already exists. Insert aborted.`);
      return;
    }

    //  Proceed to insert new warehouse
    const insertSql = `
      INSERT INTO Warehouse (WarehouseID, Address)
      VALUES (?, ?)
    `;
    const values = [warehouseID, address];

    conn.query(insertSql, values, (err, result) => {
      if (err) {
        console.error(" Insert into Warehouse failed:", err.message);
      } else {
        console.log(` Warehouse ${warehouseID} created successfully.`);
      }
    });
  });
}

// READ
/*
function readWarehouse(field, value) {
  const allowedFields = ["WarehouseID", "Address"];
  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return;
  }

  const sql = `SELECT * FROM Warehouse WHERE ${field} = ?`;
  conn.query(sql, [value], (err, results) => {
    if (err) {
      console.error("Query failed:", err.message);
      return;
    }

    if (results.length > 0) {
      console.log(" Warehouse records found:");
      results.forEach(row => {
        console.log(`WarehouseID: ${row.WarehouseID}, Address: ${row.Address}`);
      });
    } else {
      console.log("No matching warehouse found.");
    }
  });
}*/
function readWarehouse(field, value, targetField = null) {
  const allowedFields = ["WarehouseID", "Address"];

  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return Promise.resolve([]);
  }

  const sql = `SELECT * FROM Warehouse WHERE ${field} = ?`;

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
        console.log("No matching warehouse found.");
        resolve([]);
      }
    });
  });
}


// UPDATE
function updateWarehouse(warehouseID, updates) {
  const allowedFields = ["Address"];
  const keys = Object.keys(updates).filter(k => allowedFields.includes(k));

  if (keys.length === 0) {
    console.error("No valid fields to update");
    return;
  }

  const setClause = keys.map(k => `${k} = ?`).join(", ");
  const values = keys.map(k => updates[k]);
  const sql = `UPDATE Warehouse SET ${setClause} WHERE WarehouseID = ?`;

  conn.query(sql, [...values, warehouseID], (err, result) => {
    if (err) {
      console.error("Update failed:", err.message);
    } else if (result.affectedRows === 0) {
      console.log(`No warehouse found with ID ${warehouseID}`);
    } else {
      console.log(` Warehouse ${warehouseID} updated successfully.`);
    }
  });
}

// DELETE
function deleteWarehouse(warehouseID) {
  const sql = `DELETE FROM Warehouse WHERE WarehouseID = ?`;
  conn.query(sql, [warehouseID], (err, result) => {
    if (err) {
      console.error("Delete failed:", err.message);
    } else if (result.affectedRows === 0) {
      console.log(`No warehouse found with ID ${warehouseID}`);
    } else {
      console.log(` Warehouse ${warehouseID} deleted successfully.`);
    }
  });
}

// Example usage

//createWarehouse(1, "123 Le Loi, HCMC");
//createWarehouse(2, "456 Tran Hung Dao, Hanoi");
//readWarehouse("WarehouseID", 1);
//updateWarehouse(1, { Address: "789 Nguyen Hue, HCMC" });
//deleteWarehouse(2);


export {
  createWarehouse,
  readWarehouse,
  updateWarehouse,
  deleteWarehouse
};
