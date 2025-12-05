const conn = require("../config/db");

// User Model
const userModel = {
  // CREATE
  createUser: (username, password, name, phone, email, address, tableName) => {
    return new Promise((resolve, reject) => {
      //  Check if username already exists first
      const checkSql = `SELECT COUNT(*) AS count FROM ${tableName} WHERE Username = ?`;

      conn.query(checkSql, [username], (checkErr, checkResult) => {
        if (checkErr) {
          console.error(`Failed to check username in ${tableName}:`, checkErr.message);
          reject(checkErr);
          return;
        }

        const count = checkResult[0].count;
        if (count > 0) {
          const error = new Error(`Username '${username}' already exists in ${tableName}`);
          console.error(error.message);
          reject(error);
          return;
        }

        //  Username is available → proceed with insert
        const insertSql = `
          INSERT INTO ${tableName} (Username, Password, Name, Phone, Email, Address)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [username, password, name, phone, email, address];

        conn.query(insertSql, values, (err, result) => {
          if (err) {
            console.error(` Insert into ${tableName} failed:`, err.message);
            reject(err);
          } else {
            console.log(` Insert into ${tableName} successful!`);
            console.log(` Inserted ID: ${result.insertId}`);
            resolve(result);
          }
        });
      });
    });
  },

  // READ
  readUser: (tableName, field = null, value = null, targetField = null) => {
    const allowedFields = ["ID", "Username", "Password", "Name", "Phone", "Email", "Address", "CreateDate"];

    return new Promise((resolve, reject) => {
      let sql;
      let params = [];

      if (field && value) {
        if (!allowedFields.includes(field)) {
          console.error("Invalid field name!");
          resolve([]);
          return;
        }
        sql = `SELECT * FROM ${tableName} WHERE ${field} = ?`;
        params = [value];
      } else {
        sql = `SELECT * FROM ${tableName}`;
      }

      conn.query(sql, params, (err, results) => {
        if (err) {
          console.error("Query failed:", err.message);
          reject(err);
          return;
        }

        if (results.length > 0) {
          if (targetField) {
            const values = results.map(r => r[targetField]).filter(v => v !== undefined);
            resolve(values.length === 1 ? values[0] : values);
          } else {
            resolve(results);
          }
        } else {
          console.log(`No user found in ${tableName}`);
          resolve([]);
        }
      });
    });
  },

  // UPDATE
  updateUser: (tableName, id, updates) => {
    const allowedFields = ["Username", "Password", "Name", "Phone", "Email", "Address"];
    const keys = Object.keys(updates).filter(k => allowedFields.includes(k));

    if (keys.length === 0) {
      console.error("No valid fields to update");
      return;
    }

    const setClause = keys.map(k => `${k} = ?`).join(", ");
    const values = keys.map(k => updates[k]);
    const sql = `UPDATE ${tableName} SET ${setClause} WHERE ID = ?`;

    conn.query(sql, [...values, id], (err, result) => {
      if (err) {
        console.error(`Update failed in ${tableName}:`, err.message);
      } else if (result.affectedRows === 0) {
        console.log(`No user found with ID ${id} in ${tableName}`);
      } else {
        console.log(`User ${id} updated successfully in ${tableName}`);
      }
    });
  },

  // DELETE
  deleteUser: (tableName, id) => {
    const sql = `DELETE FROM ${tableName} WHERE ID = ?`;
    conn.query(sql, [id], (err, result) => {
      if (err) {
        console.error(`Delete failed in ${tableName}:`, err.message);
      } else if (result.affectedRows === 0) {
        console.log(`No user found with ID ${id} in ${tableName}`);
      } else {
        console.log(`User with ID ${id} deleted from ${tableName}`);
      }
    });
  },

  // Specialized CRUD for Customer
  createCustomer: (username, password, name, phone, email, address) => {
    return userModel.createUser(username, password, name, phone, email, address, "Customer");
  },

  readCustomer: (field, value, targetField = null) => {
    return userModel.readUser("Customer", field, value, targetField);
  },

  updateCustomer: (id, updates) => {
    userModel.updateUser("Customer", id, updates);
  },

  deleteCustomer: (id) => {
    userModel.deleteUser("Customer", id);
  },

  // Specialized CRUD for Administrator
  createAdministrator: (username, password, name, phone, email, address) => {
    return userModel.createUser(username, password, name, phone, email, address, "Administrator");
  },

  readAdministrator: (field, value, targetField = null) => {
    return userModel.readUser("Administrator", field, value, targetField);
  },

  updateAdministrator: (id, updates) => {
    userModel.updateUser("Administrator", id, updates);
  },

  deleteAdministrator: (id) => {
    userModel.deleteUser("Administrator", id);
  }
};

module.exports = userModel;
