const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = process.env.DATABASE_URL
    ? {
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
      }
    : {
          user: process.env.DB_USER,
          host: process.env.DB_HOST,
          database: process.env.DB_NAME,
          password: process.env.DB_PASSWORD,
          port: process.env.DB_PORT || 5432,
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      };

const pool = new Pool(poolConfig);

pool.on('connect', (client) => {
    client.query("SET timezone = 'Asia/Jakarta'");
    console.log('⚡ Terhubung ke Database PostgreSQL (Timezone: Asia/Jakarta):', process.env.DB_NAME || 'Cloud DB');
});

pool.on('error', (err) => {
    console.error('❌ Database connection error:', err.message);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
