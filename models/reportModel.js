const conn = require("../config/db");

const reportModel = {
  // Create report
  createReport: (title, information, customerID) => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO Report (Title, Information, CustomerID)
        VALUES (?, ?, ?)
      `;
      const values = [title, information, customerID];

      conn.query(sql, values, (err, result) => {
        if (err) {
          console.error("Create report failed:", err.message);
          reject(err);
        } else {
          console.log(`Report created successfully by Customer ${customerID}`);
          resolve(result);
        }
      });
    });
  },

  // Get all reports with customer info
  getAllReports: () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          r.ReportID,
          r.Title,
          r.Information,
          r.Date,
          r.CustomerID,
          c.Name as customerName,
          c.Email as customerEmail,
          c.Phone as customerPhone
        FROM Report r
        JOIN Customer c ON r.CustomerID = c.ID
        ORDER BY r.Date DESC
      `;

      conn.query(sql, (err, results) => {
        if (err) {
          console.error("Get all reports failed:", err.message);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  // Get report by ID
  getReportById: (reportID) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          r.ReportID,
          r.Title,
          r.Information,
          r.Date,
          r.CustomerID,
          c.Name as customerName,
          c.Email as customerEmail,
          c.Phone as customerPhone,
          c.Address as customerAddress
        FROM Report r
        JOIN Customer c ON r.CustomerID = c.ID
        WHERE r.ReportID = ?
      `;

      conn.query(sql, [reportID], (err, results) => {
        if (err) {
          console.error("Get report by ID failed:", err.message);
          reject(err);
        } else {
          resolve(results.length > 0 ? results[0] : null);
        }
      });
    });
  },

  // Delete report
  deleteReport: (reportID) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM Report WHERE ReportID = ?`;

      conn.query(sql, [reportID], (err, result) => {
        if (err) {
          console.error("Delete report failed:", err.message);
          reject(err);
        } else {
          console.log(`Report ${reportID} deleted successfully`);
          resolve(result.affectedRows > 0);
        }
      });
    });
  }
};

module.exports = reportModel;
