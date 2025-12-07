const conn = require("../config/db");

// User Model
const userModel = {
  // CREATE (always hash password with bcrypt)
  createUser: (username, password, name, phone, email, address, tableName) => {
    return new Promise(async (resolve, reject) => {
      try {
        //  Check if username already exists first
        const checkSql = `SELECT COUNT(*) AS count FROM ${tableName} WHERE Username = ?`;

        conn.query(checkSql, [username], async (checkErr, checkResult) => {
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

          // Always hash password with bcrypt (cost = 10)
          const bcrypt = require('bcrypt');
          const hashedPassword = await bcrypt.hash(password, 10);

          //  Username is available → proceed with insert
          const insertSql = `
            INSERT INTO ${tableName} (Username, Password, Name, Phone, Email, Address)
            VALUES (?, ?, ?, ?, ?, ?)
          `;
          const values = [username, hashedPassword, name, phone, email, address];

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
      } catch (error) {
        reject(error);
      }
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
      return Promise.resolve({ affectedRows: 0 });
    }

    const setClause = keys.map(k => `${k} = ?`).join(", ");
    const values = keys.map(k => updates[k]);
    const sql = `UPDATE ${tableName} SET ${setClause} WHERE ID = ?`;

    return new Promise((resolve, reject) => {
      conn.query(sql, [...values, id], (err, result) => {
        if (err) {
          console.error(`Update failed in ${tableName}:`, err.message);
          reject(err);
        } else if (result.affectedRows === 0) {
          console.log(`No user found with ID ${id} in ${tableName}`);
          resolve(result);
        } else {
          console.log(`User ${id} updated successfully in ${tableName}`);
          resolve(result);
        }
      });
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
    return userModel.updateUser("Customer", id, updates);
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
  },

  // Register new customer with bcrypt (cost = 10)
  registerCustomer: async (username, password, name, phone, email, address) => {
    return userModel.createUser(username, password, name, phone, email, address, "Customer");
  },

  // Login customer with bcrypt
  loginCustomer: async (username, password) => {
    const bcrypt = require('bcrypt');
    return new Promise((resolve, reject) => {
      const sql = `SELECT ID, Username, Password, Name, Phone, Email, Address FROM Customer WHERE Username = ?`;
      
      conn.query(sql, [username], async (err, results) => {
        if (err) {
          console.error('Login query failed:', err.message);
          reject(err);
          return;
        }

        if (results.length === 0) {
          reject(new Error('Invalid username or password'));
          return;
        }

        const customer = results[0];
        
        // Compare password with hashed password
        try {
          const isMatch = await bcrypt.compare(password, customer.Password);
          
          if (!isMatch) {
            reject(new Error('Invalid username or password'));
            return;
          }

          // Remove password from response
          delete customer.Password;
          
          console.log(`Customer ${username} logged in successfully`);
          resolve(customer);
        } catch (bcryptErr) {
          console.error('Password comparison failed:', bcryptErr.message);
          reject(bcryptErr);
        }
      });
    });
  },

  // Login administrator with bcrypt
  loginAdmin: async (username, password) => {
    const bcrypt = require('bcrypt');
    return new Promise((resolve, reject) => {
      const sql = `SELECT ID, Username, Password, Name, Phone, Email, Address FROM Administrator WHERE Username = ?`;
      
      conn.query(sql, [username], async (err, results) => {
        if (err) {
          console.error('Admin login query failed:', err.message);
          reject(err);
          return;
        }

        if (results.length === 0) {
          reject(new Error('Invalid username or password'));
          return;
        }

        const admin = results[0];
        
        // Compare password with hashed password
        try {
          const isMatch = await bcrypt.compare(password, admin.Password);
          
          if (!isMatch) {
            reject(new Error('Invalid username or password'));
            return;
          }

          // Remove password from response
          delete admin.Password;
          
          console.log(`Admin ${username} logged in successfully`);
          resolve(admin);
        } catch (bcryptErr) {
          console.error('Password comparison failed:', bcryptErr.message);
          reject(bcryptErr);
        }
      });
    });
  },

  // Get all customers with their statistics
  getAllCustomers: () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          c.ID,
          c.Username,
          c.Name,
          c.Phone,
          c.Email,
          c.Address,
          c.CreateDate,
          COUNT(DISTINCT o.OrderID) as totalOrders,
          COALESCE(SUM(CASE WHEN o.Status = 'Accepted' THEN o.GrandTotal ELSE 0 END), 0) as totalPaid
        FROM Customer c
        LEFT JOIN Orders o ON c.ID = o.CustomerID
        GROUP BY c.ID, c.Username, c.Name, c.Phone, c.Email, c.Address, c.CreateDate
        ORDER BY totalPaid DESC
      `;
      
      conn.query(sql, (err, results) => {
        if (err) {
          console.error('Error getting customers:', err.message);
          reject(err);
        } else {
          console.log(`Retrieved ${results.length} customers`);
          resolve(results);
        }
      });
    });
  },

  // Get customer by ID with detailed info
  getCustomerById: (customerId) => {
    return new Promise((resolve, reject) => {
      // Get customer info
      const customerSql = 'SELECT ID, Username, Name, Phone, Email, Address, CreateDate FROM Customer WHERE ID = ?';
      
      conn.query(customerSql, [customerId], (err, customer) => {
        if (err) {
          console.error('Error getting customer:', err.message);
          reject(err);
          return;
        }
        
        if (customer.length === 0) {
          console.log(`Customer with ID ${customerId} not found`);
          resolve(null);
          return;
        }
        
        // Get customer orders
        const ordersSql = `
          SELECT 
            OrderID,
            Status,
            CreateDate,
            Total,
            GrandTotal
          FROM Orders 
          WHERE CustomerID = ?
          ORDER BY CreateDate DESC
        `;
        
        conn.query(ordersSql, [customerId], (err, orders) => {
          if (err) {
            console.error('Error getting customer orders:', err.message);
            reject(err);
          } else {
            console.log(`Retrieved customer ${customerId} with ${orders.length} orders`);
            resolve({
              ...customer[0],
              orders
            });
          }
        });
      });
    });
  }
};

module.exports = userModel;