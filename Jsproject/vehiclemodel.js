import conn from "./server.js";
import { readWarehouse } from "./warehousemodel.js";

// CREATE
function createVehicle(vehicleID, name, price, summary, rating, discount, slug, brand, stock, type, warehouseID) {
  // Check if VehicleID already exists
  const checkSql = `SELECT COUNT(*) AS count FROM Vehicle WHERE VehicleID = ?`;

  conn.query(checkSql, [vehicleID], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Failed to check VehicleID:", checkErr.message);
      return;
    }

    const count = checkResult[0].count;
    if (count > 0) {
      console.warn(` Vehicle with ID ${vehicleID} already exists. Insert aborted.`);
      return;
    }

    // Proceed to insert
    const insertSql = `
      INSERT INTO Vehicle (VehicleID, Name, Price, Summary, Rating, Discount, Slug, Brand, Stock, Type, WarehouseID)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [vehicleID, name, price, summary, rating, discount, slug, brand, stock, type, warehouseID];

    conn.query(insertSql, values, (err, result) => {
      if (err) {
        console.error(" Insert into Vehicle failed:", err.message);
      } else {
        console.log(` Vehicle ${vehicleID} ("${name}") added successfully to Warehouse ${warehouseID}`);
      }
    });
  });
}

// READ
/*
function readVehicle(field, value) {
  const allowedFields = [
    "VehicleID",
    "Name",
    "Price",
    "Summary",
    "Rating",
    "Discount",
    "Slug",
    "Brand",
    "Stock",
    "Type",
    "WarehouseID"
  ];

  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return;
  }

  const sql = `SELECT * FROM Vehicle WHERE ${field} = ?`;
  conn.query(sql, [value], (err, results) => {
    if (err) {
      console.error("Query failed:", err.message);
      return;
    }

    if (results.length > 0) {
      console.log(" Vehicle records found:");
      results.forEach(row => {
        console.log(
          `VehicleID: ${row.VehicleID}, Name: ${row.Name}, Price: ${row.Price}, Brand: ${row.Brand}, Stock: ${row.Stock}, WarehouseID: ${row.WarehouseID}`
        );
      });
    } else {
      console.log("No matching vehicle found.");
    }
  });
}*/

function readVehicle(field, value, targetField = null) {
  const allowedFields = [
    "VehicleID",
    "Name",
    "Price",
    "Summary",
    "Rating",
    "Discount",
    "Slug",
    "Brand",
    "Stock",
    "Type",
    "WarehouseID"
  ];

  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return Promise.resolve([]);
  }

  const sql = `SELECT * FROM Vehicle WHERE ${field} = ?`;

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
          resolve(values.length === 1 ? values[0] : values);
        } else {
          resolve(results);
        }
      } else {
        console.log("No vehicles found.");
        resolve([]);
      }
    });
  });
}



// UPDATE
function updateVehicle(vehicleID, updates) {
  const allowedFields = [
    "Name",
    "Price",
    "Summary",
    "Rating",
    "Discount",
    "Slug",
    "Brand",
    "Stock",
    "Type",
    "WarehouseID"
  ];

  const keys = Object.keys(updates).filter(k => allowedFields.includes(k));
  if (keys.length === 0) {
    console.error("No valid fields to update.");
    return;
  }

  const setClause = keys.map(k => `${k} = ?`).join(", ");
  const values = keys.map(k => updates[k]);
  const sql = `UPDATE Vehicle SET ${setClause} WHERE VehicleID = ?`;

  conn.query(sql, [...values, vehicleID], (err, result) => {
    if (err) {
      console.error("Update failed:", err.message);
    } else if (result.affectedRows === 0) {
      console.log(`No vehicle found with ID ${vehicleID}`);
    } else {
      console.log(` Vehicle ${vehicleID} updated successfully.`);
    }
  });
}

// DELETE
function deleteVehicle(vehicleID) {
  const sql = `DELETE FROM Vehicle WHERE VehicleID = ?`;
  conn.query(sql, [vehicleID], (err, result) => {
    if (err) {
      console.error("Delete failed:", err.message);
    } else if (result.affectedRows === 0) {
      console.log(`No vehicle found with ID ${vehicleID}`);
    } else {
      console.log(` Vehicle ${vehicleID} deleted successfully.`);
    }
  });
}

// Example usage:
/*
createVehicle(
  "V008",
  "Toyota Vios 2022",
  520000000,
  "Compact sedan with great fuel economy.",
  4.5,
  0.1,
  "toyota-vios-2022",
  "Toyota",
  12,
  "Sedan",
  1
);*/

/*
createVehicle(
  "V002",
  "Honda City 2022",
  490000000,
  "Stylish sedan with excellent safety features.",
  4.6,
  0.05,
  "honda-city-2022",
  "Honda",
  8,
  "Sedan",
  1
);*/
/*
const readResult = await readVehicle("Brand", "Honda","Rating");
console.log("Read Vehicle Result:", readResult);
*/
//updateVehicle("V002", { Stock: 10, Discount: 0.08 });
//deleteVehicle("V001");


export {
  createVehicle,
  readVehicle,
  updateVehicle,
  deleteVehicle
};
