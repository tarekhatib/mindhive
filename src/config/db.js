const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.getConnection().then((conn) => {
  conn.query("SET time_zone = '+02:00'");
  conn.release();
}).catch(err => {
  console.error("Timezone setup failed:", err);
});

module.exports = db;