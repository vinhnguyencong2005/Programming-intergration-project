// db.js
import mysql from "mysql2";

// Database configuration
const db_server = "localhost";
const db_username = "root";
const db_password = "Tin201005"
const db_name = "dath_db";

// Create MySQL connection
const conn = mysql.createConnection({
  host: db_server,
  user: db_username,
  password: db_password,
  database: db_name
});

// Connect to MySQL
conn.connect(err => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } 
});

export default conn;
