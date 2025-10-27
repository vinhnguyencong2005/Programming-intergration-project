import conn from "./server.js";
import { readCustomer } from "./usermodel.js"; 

// CREATE
function createReport(information, title, customerID) {
  // Check if the CustomerID exists before inserting
  const checkCustomerSql = `SELECT COUNT(*) AS count FROM Customer WHERE ID = ?`;

  conn.query(checkCustomerSql, [customerID], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Failed to check CustomerID:", checkErr.message);
      return;
    }

    const count = checkResult[0].count;
    if (count === 0) {
      console.warn(` Customer with ID ${customerID} does not exist. Report not created.`);
      return;
    }

    //  Proceed to insert the report
    const insertSql = `
      INSERT INTO Report (Information, Title, CustomerID)
      VALUES (?, ?, ?)
    `;
    const values = [information, title, customerID];

    conn.query(insertSql, values, (err, result) => {
      if (err) {
        console.error(" Insert into Report failed:", err.message);
      } else {
        console.log(` Report created successfully for Customer ${customerID}`);
        console.log(` New Report ID: ${result.insertId}`);
      }
    });
  });
}

// READ
/*
function readReport(field, value) {
  const allowedFields = ["ReportID", "Information", "Date", "Title", "CustomerID"];
  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return;
  }

  const sql = `SELECT * FROM Report WHERE ${field} = ?`;
  conn.query(sql, [value], (err, results) => {
    if (err) {
      console.error("Query failed:", err.message);
      return;
    }

    if (results.length > 0) {
      console.log(" Report records found:");
      results.forEach(row => {
        console.log(
          `ReportID: ${row.ReportID}, Title: ${row.Title}, Information: ${row.Information}, Date: ${row.Date}, CustomerID: ${row.CustomerID}`
        );
      });
    } else {
      console.log("No report found.");
    }
  });
}*/
function readReport(field, value, targetField = null) {
  const allowedFields = ["ReportID", "Information", "Date", "Title", "CustomerID"];
  
  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return Promise.resolve([]);
  }

  const sql = `SELECT * FROM Report WHERE ${field} = ?`;

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
        console.log("No report found.");
        resolve([]);
      }
    });
  });
}


// UPDATE
function updateReport(reportID, updates) {
  const allowedFields = ["Information", "Title", "Date", "CustomerID"];
  const keys = Object.keys(updates).filter(k => allowedFields.includes(k));

  if (keys.length === 0) {
    console.error("No valid fields to update.");
    return;
  }

  const setClause = keys.map(k => `${k} = ?`).join(", ");
  const values = keys.map(k => updates[k]);
  const sql = `UPDATE Report SET ${setClause} WHERE ReportID = ?`;

  conn.query(sql, [...values, reportID], (err, result) => {
    if (err) {
      console.error("Update failed:", err.message);
    } else if (result.affectedRows === 0) {
      console.log(`No report found with ID ${reportID}`);
    } else {
      console.log(` Report ${reportID} updated successfully.`);
    }
  });
}

// DELETE
function deleteReport(reportID) {
  const sql = `DELETE FROM Report WHERE ReportID = ?`;
  conn.query(sql, [reportID], (err, result) => {
    if (err) {
      console.error("Delete failed:", err.message);
    } else if (result.affectedRows === 0) {
      console.log(`No report found with ID ${reportID}`);
    } else {
      console.log(` Report ${reportID} deleted successfully.`);
    }
  });
}

// Example test
/*
createReport(
  "Customer reported an issue with payment",
  "Payment Issue",
  1 
);
createReport(
  "Customer reported an issue with payment",
  "Payment Issue",
  1 
);


 const readResult = await readReport("CustomerID", 1);
  console.log("Read Report Result:", readResult);
  */
// updateReport(1, { Information: "Updated issue details", Title: "Resolved Issue" });
// deleteReport(1);


export {
  createReport,
  readReport,
  updateReport,
  deleteReport
};
