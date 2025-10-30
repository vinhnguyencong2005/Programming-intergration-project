import conn from "./server.js";


// Base User CRUD Functions



// CREATE
function createUser(username, password, name, phone, email, address, tableName) {
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
        return; //  stop before attempting insert
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
}

// READ
/*
function readUser(tableName, field, value) {
  const allowedFields = ["ID", "Username", "Password", "Name", "Phone", "Email", "Address", "CreateDate"];
  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return;
  }

  const sql = `SELECT * FROM ${tableName} WHERE ${field} = ?`;
  conn.query(sql, [value], (err, results) => {
    if (err) {
      console.error("Query failed:", err.message);
      return;
    }

    if (results.length > 0) {
      console.log(`Users found in ${tableName}:`);
      results.forEach(row => {
        console.log(`${row.ID} ${row.Username} ${row.Password} ${row.Name} ${row.Phone} ${row.Email} ${row.Address} ${row.CreateDate}`);
      });
    } else {
      console.log(`No user found in ${tableName}`);
    }
  });
}*/
function readUser(tableName, field, value, targetField = null) {
  const allowedFields = ["ID", "Username", "Password", "Name", "Phone", "Email", "Address", "CreateDate"];
  if (!allowedFields.includes(field)) {
    console.error("Invalid field name!");
    return Promise.resolve([]);
  }

  const sql = `SELECT * FROM ${tableName} WHERE ${field} = ?`;

  return new Promise((resolve, reject) => {
    conn.query(sql, [value], (err, results) => {
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
}

// UPDATE
function updateUser(tableName, id, updates) {
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
}

// DELETE
function deleteUser(tableName, id) {
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
}


// Specialized CRUD for Customer

function createCustomer(username, password, name, phone, email, address) {
  return createUser(username, password, name, phone, email, address, "Customer");
}

function readCustomer(field, value, targetField = null) {
  return readUser("Customer", field, value, targetField);
}

function updateCustomer(id, updates) {
  updateUser("Customer", id, updates);
}

function deleteCustomer(id) {
  deleteUser("Customer", id);
}


// Specialized CRUD for Administrator

function createAdministrator(username, password, name, phone, email, address) {
  createUser(username, password, name, phone, email, address, "Administrator");
}

function readAdministrator(field, value, targetField = null) {
  return readUser("Administrator", field, value, targetField);
}

function updateAdministrator(id, updates) {
  updateUser("Administrator", id, updates);
}

function deleteAdministrator(id) {
  deleteUser("Administrator", id);
}


// Example usage

/*
createCustomer(
  'thanhthao01',        // Username
  'mySecurePass',       // Password
  'Nguyen Thanh Thao',  // Name
  '0901234567',         // Phone
  'thao@gmail.com',     // Email
  '123 Le Loi, HCMC'    // Address
);


createCustomer(
  'thanhthao0',        // Username
  'mySecurePass',       // Password
  'Nguyen Thanh Thao',  // Name
  '0901234567',         // Phone
  'thao@gmail.com',     // Email
  '123 Le Loi, HCMC'    // Address
);
*/
//readCustomer("Name", "Nguyen Thanh Thao");
// updateCustomer(1, { Phone: "0999888777" });
// deleteCustomer(1);
/*
createAdministrator(
  'admin02',            // Username
  'superSecret',        // Password
  'Admin Account',      // Name
  '0907654321',         // Phone
  'admin@hotel.com',    // Email
  'Head Office'         // Address
);
*/

// updateAdministrator(1, { Name: "Super Admin" });
// deleteAdministrator(1);



export {
  createCustomer,
  readCustomer,
  updateCustomer,
  deleteCustomer,
  createAdministrator,
  readAdministrator,
  updateAdministrator,
  deleteAdministrator
};
