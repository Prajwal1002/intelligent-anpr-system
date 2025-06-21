// backend/db.js
const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',     // 👈 replace with your MySQL username
  password: 'Prajwal@123', // 👈 replace with your MySQL password
  database: 'car_database'
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err);
    return;
  }
  console.log('✅ Connected to MySQL database');
});

module.exports = db;
