import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { isDoctor } from '../middleware/roleMiddleware.js';
import {
  searchPatients,
  getPatientByIIN,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  createPatientDocument,
  getPatientDocuments,
  getMyDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  getDoctorStats,
  downloadDoctorDocument
} from '../controllers/doctorController.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Все роуты требуют авторизации и роли врача
router.use(protect);
router.use(isDoctor);

// Статистика
router.get('/stats', getDoctorStats);

// Поиск пациентов
router.get('/patients/search', searchPatients);
router.get('/patients/:iin', getPatientByIIN);

// Шаблоны
router.get('/templates', getTemplates);
router.post('/templates', createTemplate);
router.put('/templates/:id', updateTemplate);
router.delete('/templates/:id', deleteTemplate);

// Документы
router.get('/documents', getMyDocuments);
router.get('/documents/:id', getDocument);
router.put('/documents/:id', updateDocument);
router.delete('/documents/:id', deleteDocument);
router.post('/documents', upload.single('file'), createPatientDocument);
router.get('/patients/:patientId/documents', getPatientDocuments);
router.get('/documents/:id/download', downloadDoctorDocument);

export default router;