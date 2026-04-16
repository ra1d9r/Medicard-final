import express from 'express';
import { checkIin, register, login } from '../controllers/authController.js';

const router = express.Router();

// Маршруты для авторизации и регистрации
router.post('/check-iin', checkIin);
router.post('/register', register);
router.post('/login', login);

export default router;
