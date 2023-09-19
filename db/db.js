// db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',       // Your MySQL host
  user: 'root',   // Your MySQL username
  password: 'root123', // Your MySQL password
  database: 'testingsss', // Your MySQL database
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

module.exports = connection;