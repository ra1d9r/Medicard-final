const { Pool } = require('pg');

// Настройка подключения к PostgreSQL
// В реальном проекте данные берутся из .env
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'medicard',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Автоматическое создание таблицы users при запуске (для упрощения)
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    iin VARCHAR(12) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
  )
`).catch(err => console.error('Ошибка создания таблицы:', err));

module.exports = pool;
