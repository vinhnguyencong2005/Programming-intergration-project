import conn from "./server.js";
import { readVehicle } from "./vehiclemodel.js";

// CREATE
function createImage(vehicleID, imagePriority, imageLink) {

  const checkVehicleSql = `SELECT COUNT(*) AS count FROM Vehicle WHERE VehicleID = ?`;
  conn.query(checkVehicleSql, [vehicleID], (checkErr, checkRes) => {
    if (checkErr) {
      console.error("Failed to check Vehicle existence:", checkErr.message);
      return;
    }

    if (checkRes[0].count === 0) {
      console.warn(` Vehicle ${vehicleID} does not exist. Insert aborted.`);
      return;
    }

    //  Check for duplicate Image
    const checkImageSql = `SELECT COUNT(*) AS count FROM Images WHERE VehicleID = ? AND ImageLink = ?`;
    conn.query(checkImageSql, [vehicleID, imageLink], (dupErr, dupRes) => {
      if (dupErr) {
        console.error("Failed to check duplicate image:", dupErr.message);
        return;
      }

      if (dupRes[0].count > 0) {
        console.warn(` Image for vehicle ${vehicleID} already exists with this link.`);
        return;
      }

      //  Insert new image
      const insertSql = `
        INSERT INTO Images (VehicleID, ImagePriority, ImageLink)
        VALUES (?, ?, ?)
      `;
      conn.query(insertSql, [vehicleID, imagePriority, imageLink], (err, result) => {
        if (err) {
          console.error(" Insert into Images failed:", err.message);
        } else {
          console.log(` Image added for Vehicle ${vehicleID} (Priority ${imagePriority})`);
        }
      });
    });
  });
}

// READ
/*
function readImages(field, value) {
  const allowedFields = ["VehicleID", "ImagePriority", "ImageLink"];
  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return;
  }

  const sql = `SELECT * FROM Images WHERE ${field} = ? ORDER BY ImagePriority ASC`;
  conn.query(sql, [value], (err, results) => {
    if (err) {
      console.error("Query failed:", err.message);
      return;
    }

    if (results.length > 0) {
      console.log(` Images found (${results.length}):`);
      results.forEach(row => {
        console.log(
          `VehicleID: ${row.VehicleID}, Priority: ${row.ImagePriority}, Link: ${row.ImageLink}`
        );
      });
    } else {
      console.log("No images found.");
    }
  });
}*/
function readImages(field, value, targetField = null) {
  const allowedFields = ["VehicleID", "ImagePriority", "ImageLink"];
  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return Promise.resolve([]);
  }

  const sql = `SELECT * FROM Images WHERE ${field} = ? ORDER BY ImagePriority ASC`;

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
            resolve(values.length === 1 ? values[0] : values); // single or list
          } else {
            console.error("Target field not found in results.");
            resolve([]);
          }
        } else {
          
          resolve(results);
        }
      } else {
        console.log("No images found.");
        resolve([]);
      }
    });
  });
}


// UPDATE
function updateImage(vehicleID, imageLink, updates) {
  const allowedFields = ["ImagePriority", "ImageLink"];
  const keys = Object.keys(updates).filter(k => allowedFields.includes(k));

  if (keys.length === 0) {
    console.error("No valid fields to update.");
    return;
  }

  const setClause = keys.map(k => `${k} = ?`).join(", ");
  const values = keys.map(k => updates[k]);
  const sql = `UPDATE Images SET ${setClause} WHERE VehicleID = ? AND ImageLink = ?`;

  conn.query(sql, [...values, vehicleID, imageLink], (err, result) => {
    if (err) {
      console.error("Update failed:", err.message);
    } else if (result.affectedRows === 0) {
      console.log(`No image found for Vehicle ${vehicleID} with the given link.`);
    } else {
      console.log(` Image for Vehicle ${vehicleID} updated successfully.`);
    }
  });
}

// DELETE
function deleteImage(vehicleID, imageLink) {
  const sql = `DELETE FROM Images WHERE VehicleID = ? AND ImageLink = ?`;
  conn.query(sql, [vehicleID, imageLink], (err, result) => {
    if (err) {
      console.error("Delete failed:", err.message);
    } else if (result.affectedRows === 0) {
      console.log(`No image found for Vehicle ${vehicleID} with that link.`);
    } else {
      console.log(` Image deleted for Vehicle ${vehicleID}.`);
    }
  });
}

// Example Usage:

//createImage("V001", 1, "https://example.com/images/v001-front.jpg");
//createImage("V001", 2, "https://example.com/images/v001-side.jpg");

//readImages("VehicleID", "V001");

//updateImage("V001", "https://example.com/images/v001-side.jpg", { ImagePriority: 3});

//deleteImage("V001", "https://example.com/images/v001-front.jpg");


export {
  createImage,
  readImages,
  updateImage,
  deleteImage
};
