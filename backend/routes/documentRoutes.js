import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { 
  getDocuments, 
  uploadDocument, 
  downloadDocument, 
  deleteDocument, 
  getDocumentInfo,
  previewDocument,
  downloadDoctorDocument,
  previewDoctorDocument
} from '../controllers/documentController.js';

const router = express.Router();

// Все роуты требуют авторизации
router.use(protect);

// Получить все документы
router.get('/', getDocuments);

// Загрузить документ
router.post('/upload', upload.single('file'), uploadDocument);

// Предпросмотр документа (для изображений и PDF)
router.get('/:id/preview', previewDocument);

// Информация о документе
router.get('/:id', getDocumentInfo);

// Скачать документ
router.get('/:id/download', downloadDocument);

// Удалить документ
router.delete('/:id', deleteDocument);

// Скачать документ от врача
router.get('/doctor-document/:id/download', downloadDoctorDocument);

router.get('/doctor-document/:id/preview', previewDoctorDocument);
router.get('/doctor-document/:id/download', downloadDoctorDocument);


export default router;