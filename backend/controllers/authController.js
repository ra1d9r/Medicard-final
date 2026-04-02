const db = require('../config/db');
const { findInGovDB } = require('../services/fakeGovDB');

// 1. Проверка ИИН
exports.checkIin = async (req, res) => {
  const { iin } = req.body;

  try {
    // Шаг 1: Ищем пользователя в локальной базе PostgreSQL
    const dbResult = await db.query('SELECT * FROM users WHERE iin = $1', [iin]);
    if (dbResult.rows.length > 0) {
      return res.json({ status: 'registered', message: 'Пользователь уже зарегистрирован' });
    }

    // Шаг 2: Если в локальной БД нет, ищем в государственной базе (fakeGovDB)
    const govUser = findInGovDB(iin);
    if (govUser) {
      return res.json({ status: 'found_in_gov', name: govUser.name });
    }

    // Шаг 3: Если нигде не найден
    return res.status(404).json({ status: 'error', message: 'ИИН не найден' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// 2. Регистрация нового пользователя
exports.register = async (req, res) => {
  const { iin, email, password } = req.body;

  try {
    // Шаг 1: Получаем ФИО строго из гос. базы (пользователь не вводит имя сам)
    const govUser = findInGovDB(iin);
    if (!govUser) {
      return res.status(400).json({ error: 'ИИН не найден в государственной базе' });
    }

    // Шаг 2: Проверяем, не зарегистрирован ли он уже в PostgreSQL
    const existingUser = await db.query('SELECT * FROM users WHERE iin = $1', [iin]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким ИИН уже существует' });
    }

    // Шаг 3: Сохраняем пользователя в PostgreSQL (без хэширования пароля для простоты)
    const newUser = await db.query(
      'INSERT INTO users (iin, name, email, password) VALUES ($1, $2, $3, $4) RETURNING id, iin, name, email',
      [iin, govUser.name, email, password]
    );

    res.json({ message: 'Регистрация успешна', user: newUser.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// 3. Вход в систему
exports.login = async (req, res) => {
  const { iin, password } = req.body;

  try {
    // Шаг 1: Ищем пользователя по ИИН
    const result = await db.query('SELECT * FROM users WHERE iin = $1', [iin]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный ИИН или пароль' });
    }

    const user = result.rows[0];

    // Шаг 2: Сверяем пароль (простое сравнение строк)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Неверный ИИН или пароль' });
    }

    // Шаг 3: Успешный вход (возвращаем данные без JWT)
    res.json({
      message: 'Успешный вход',
      user: { id: user.id, iin: user.iin, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
