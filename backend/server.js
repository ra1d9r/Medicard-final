import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import medicalCardRoutes from './routes/MedicalCardRoutes.js'; // Добавляем импорт
import connectDB from './config/db.js';
import documentRoutes from './routes/documentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import requisiteRoutes from './routes/requisiteRoutes.js';

// Получаем путь к директории backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загружаем переменные окружения из файла .env в папке backend
dotenv.config({ path: path.join(__dirname, '.env') });

// Проверяем загрузку переменных
console.log('🔍 Проверка загрузки .env:');
console.log('JWT_SECRET загружен:', process.env.JWT_SECRET ? '✅ Да' : '❌ Нет');
console.log('PORT из .env:', process.env.PORT || '3000 (default)');
console.log('MONGODB_URI из .env:', process.env.MONGODB_URI ? '✅ Загружен' : '❌ Не загружен');

// Асинхронный запуск сервера с обработкой ошибок подключения
const startServer = async () => {
  try {
    // Подключаемся к базе данных
    await connectDB();

    const app = express();
    const PORT = process.env.PORT || 3000;

    // Middleware
    app.use(cors({
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    }));
    app.use(express.json({ limit: '10mb' }));

    // Подключение маршрутов API
    app.use('/api/auth', authRoutes);
    app.use('/api/medical-card', medicalCardRoutes); // Добавляем роуты медкарты
    app.use('/api/documents', documentRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/doctor', doctorRoutes);
    app.use('/api/requisites', requisiteRoutes);

    // Тестовый маршрут для проверки работы сервера
    app.get('/api/health', (req, res) => {
      res.json({ status: 'OK', message: 'Сервер работает' });
    });

    // Vite middleware для разработки
    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), '../dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('❌ Ошибка:', err.message);
      res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
          ? 'Внутренняя ошибка сервера' 
          : err.message
      });
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Сервер запущен на http://localhost:${PORT}`);
      console.log(`JWT Secret: ${process.env.JWT_SECRET ? '✓ установлен' : '✗ не установлен'}`);
      console.log(`API доступен по адресу http://localhost:${PORT}/api`);
      console.log(`Медицинские карты: http://localhost:${PORT}/api/medical-card`);
    });

  } catch (error) {
    console.error('Ошибка при запуске сервера:', error.message);
    process.exit(1);
  }
};

startServer();