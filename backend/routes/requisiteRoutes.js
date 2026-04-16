import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getMyRequisites,
  getPatientRequisites,
  createRequisite,
  updateRequisite,
  deleteRequisite
} from '../controllers/requisiteController.js';

const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Роут работает!' });
});

router.post('/test-create', (req, res) => {
  console.log('📥 Тестовый POST запрос получен:', req.body);
  res.json({ message: 'POST работает!', body: req.body });
});

router.get('/my', protect, getMyRequisites);
router.get('/patient/:patientId', protect, getPatientRequisites);
router.post('/', protect, createRequisite);
router.put('/:id', protect, updateRequisite);
router.delete('/:id', protect, deleteRequisite);

export default router;  