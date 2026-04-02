const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Разрешаем кросс-доменные запросы
app.use(express.json()); // Парсинг JSON из тела запроса

// Подключение маршрутов
app.use('/api/auth', authRoutes);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Backend сервер запущен на порту ${PORT}`);
});
