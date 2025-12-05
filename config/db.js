const mysql = require('mysql2');
require('dotenv').config();

// Tạo kết nối MySQL
const conn = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'DATH_DB',
  port: process.env.DB_PORT || 3306
});

// Kết nối database
conn.connect((err) => {
  if (err) {
    console.error('❌ Lỗi kết nối database:', err.message);
    return;
  }
  console.log('✅ Kết nối database thành công!');
});

module.exports = conn;
