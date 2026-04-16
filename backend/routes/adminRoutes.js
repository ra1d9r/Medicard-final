import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js';
import {
  getAllUsers,
  getDoctors,
  addDoctor,
  removeDoctor,
  changeUserRole,
  getStats
} from '../controllers/adminController.js';

const router = express.Router();

// Все роуты требуют авторизации и прав администратора
router.use(protect);
router.use(isAdmin);

// Статистика
router.get('/stats', getStats);

// Пользователи
router.get('/users', getAllUsers);

// Врачи
router.get('/doctors', getDoctors);
router.post('/doctors', addDoctor);
router.delete('/doctors/:id', removeDoctor);

// Изменение роли
router.put('/users/:id/role', changeUserRole);

export default router;