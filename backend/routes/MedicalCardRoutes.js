import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMedicalCard, updateMedicalCard } from '../controllers/MedicalCardController.js';

const router = express.Router();

// Все роуты требуют авторизации
router.use(protect);

// Получить медкарту
router.get('/', getMedicalCard);

// Обновить медкарту
router.put('/', updateMedicalCard);

export default router;