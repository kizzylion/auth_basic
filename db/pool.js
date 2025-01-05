const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "kizzito",
  password: "grow",
  database: "auth_basics",
});

module.exports = pool;
