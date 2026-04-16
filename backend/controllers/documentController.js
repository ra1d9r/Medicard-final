import Document from '../models/Document.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { deleteUploadedFile } from '../middleware/uploadMiddleware.js';
import mongoose from 'mongoose';
import PatientDocument from '../models/PatientDocument.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MAX_DOCUMENTS_PER_USER = 50;

// Вспомогательная функция для обработки ошибок ObjectId
const handleCastError = (error, res) => {
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: 'Неверный формат идентификатора' });
  }
  return null;
};

// Получить все документы пользователя (с пагинацией)
export const getDocuments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // 1. Документы, загруженные самим пользователем
    const userDocs = await Document.find({ 
      userId: req.user.userId,
      status: 'active'
    })
    .select('-filePath')
    .lean();
    
    // 2. Документы, созданные врачами для этого пациента
    const doctorDocs = await PatientDocument.find({ 
      patientId: req.user.userId,
      status: { $ne: 'archived' }
    })
    .populate('doctorId', 'name')
    .lean();
    
    // ВАЖНО: Определяем formattedUserDocs
    const formattedUserDocs = userDocs.map(doc => ({
      _id: doc._id,
      title: doc.title,
      type: doc.type,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      description: doc.description,
      createdAt: doc.createdAt,
      source: 'self',
      doctorName: null,
      canDownload: true,
      canPreview: doc.fileType?.includes('pdf') || doc.fileType?.includes('image'),
      hasFile: true,
      hasText: false,
      textContent: null
    }));
    
    const formattedDoctorDocs = doctorDocs.map(doc => {
      let cleanText = null;
        
      if (doc.content) {
        // Получаем текст в любом виде
        let rawText = null;
        
        if (typeof doc.content === 'string') {
          rawText = doc.content;
        } else if (doc.content.text) {
          rawText = doc.content.text;
        } else if (doc.content.textContent) {
          rawText = doc.content.textContent;
        }
        
        // 👇 РАСПАРСИВАЕМ JSON если нужно
        if (rawText && typeof rawText === 'string') {
          // Если это JSON вида {"text":"..."}
          if (rawText.startsWith('{"text":')) {
            try {
              const parsed = JSON.parse(rawText);
              cleanText = parsed.text || rawText;
            } catch (e) {
              cleanText = rawText;
            }
          } else {
            cleanText = rawText;
          }
        } else if (rawText) {
          cleanText = rawText;
        }
      }
      
      console.log(`📄 Документ ${doc._id}:`, {
        hasContent: !!doc.content,
        contentType: typeof doc.content,
        contentValue: doc.content,
        extractedText: cleanText?.substring(0, 50)
      });

      return {
        _id: doc._id,
        title: doc.title,
        type: doc.type,
        fileName: doc.fileName || `${doc.title}.pdf`,
        fileType: doc.fileType || 'application/pdf',
        fileSize: doc.fileSize || 0,
        filePath: doc.filePath,
        createdAt: doc.createdAt,
        source: 'doctor',
        doctorName: doc.doctorId?.name || 'Врач',
        canDownload: !!doc.filePath,
        canPreview: true,
        textContent: cleanText,           
        hasText: !!cleanText && cleanText !== 'null',             
        hasFile: !!doc.filePath,          
        fileDescription: doc.filePath ? `📎 Прикреплено: ${doc.fileName}` : null
      };
    });
    
    // Объединяем и сортируем по дате
    const allDocs = [...formattedUserDocs, ...formattedDoctorDocs];
    allDocs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Пагинация
    const total = allDocs.length;
    const paginatedDocs = allDocs.slice(skip, skip + limit);
    
    res.json({ 
      documents: paginatedDocs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Ошибка получения документов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Загрузить документ
export const uploadDocument = async (req, res) => {
  let uploadedFilePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }
    
    uploadedFilePath = req.file.path;
    
    const { title, type, description } = req.body;
    
    const documentCount = await Document.countDocuments({ 
      userId: req.user.userId,
      status: 'active'
    });
    
    if (documentCount >= MAX_DOCUMENTS_PER_USER) {
      deleteUploadedFile(uploadedFilePath);
      return res.status(400).json({ 
        error: `Превышен лимит документов. Максимум ${MAX_DOCUMENTS_PER_USER} документов.` 
      });
    }
    
    const document = await Document.create({
      userId: req.user.userId,
      title: (title && title.trim()) || req.file.originalname,
      type: type || 'Другое',
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      description: description || '',
      doctorId: null
    });
    
    res.json({
      message: 'Документ успешно загружен',
      document: {
        _id: document._id,
        title: document.title,
        type: document.type,
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        description: document.description,
        createdAt: document.createdAt
      }
    });
  } catch (error) {
    const castError = handleCastError(error, res);
    if (castError) return castError;
    
    console.error('Ошибка загрузки документа:', error);
    
    if (uploadedFilePath) {
      deleteUploadedFile(uploadedFilePath);
    }
    
    res.status(500).json({ error: 'Ошибка загрузки документа' });
  }
};

// Скачать документ
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверка валидности ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Неверный формат идентификатора документа' });
    }
    
    const document = await Document.findOne({
      _id: id,
      userId: req.user.userId,
      status: 'active'
    });
    
    if (!document) {
      return res.status(404).json({ error: 'Документ не найден' });
    }
    
    if (!fs.existsSync(document.filePath)) {
      document.status = 'archived';
      await document.save();
      return res.status(404).json({ error: 'Файл не найден на сервере' });
    }
    
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(document.fileName)}`);
    res.setHeader('Content-Type', document.fileType);
    
    res.download(document.filePath, document.fileName, (err) => {
      if (err) {
        console.error('Ошибка скачивания:', err);
      }
    });
  } catch (error) {
    const castError = handleCastError(error, res);
    if (castError) return castError;
    
    console.error('Ошибка скачивания документа:', error);
    res.status(500).json({ error: 'Ошибка скачивания документа' });
  }
};

// Скачать документ, созданный врачом
export const downloadDoctorDocument = async (req, res) => {
  try {
    const document = await PatientDocument.findOne({
      _id: req.params.id,
      patientId: req.user.userId
    });
    
    if (!document || !document.filePath) {
      return res.status(404).json({ error: 'Файл не найден' });
    }
    
    res.download(document.filePath, document.fileName);
  } catch (error) {
    console.error('Ошибка скачивания документа врача:', error);
    res.status(500).json({ error: 'Ошибка скачивания' });
  }
};

// Удалить документ
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Неверный формат идентификатора документа' });
    }
    
    const document = await Document.findOne({
      _id: id,
      userId: req.user.userId,
      status: 'active'
    });
    
    if (!document) {
      return res.status(404).json({ error: 'Документ не найден или уже удален' });
    }
    
    if (fs.existsSync(document.filePath)) {
      try {
        fs.unlinkSync(document.filePath);
        console.log(`🗑️ Удален файл: ${document.filePath}`);
      } catch (err) {
        console.error('Ошибка удаления файла:', err);
      }
    }
    
    document.status = 'archived';
    document.filePath = '';
    await document.save();
    
    res.json({ message: 'Документ успешно удален' });
  } catch (error) {
    const castError = handleCastError(error, res);
    if (castError) return castError;
    
    console.error('Ошибка удаления документа:', error);
    res.status(500).json({ error: 'Ошибка удаления документа' });
  }
};

// Получить информацию о документе
export const getDocumentInfo = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Неверный формат идентификатора документа' });
    }
    
    const document = await Document.findOne({
      _id: id,
      userId: req.user.userId,
      status: 'active'
    }).select('-filePath');
    
    if (!document) {
      return res.status(404).json({ error: 'Документ не найден' });
    }
    
    const fileExists = document.filePath ? fs.existsSync(document.filePath) : false;
    
    res.json({ 
      document: document.toObject(),
      fileExists,
      ...(!fileExists && document.filePath ? { warning: 'Файл отсутствует на сервере' } : {})
    });
  } catch (error) {
    const castError = handleCastError(error, res);
    if (castError) return castError;
    
    console.error('Ошибка получения информации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Предпросмотр документа
export const previewDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Неверный формат идентификатора документа' });
    }
    
    const document = await Document.findOne({
      _id: id,
      userId: req.user.userId,
      status: 'active'
    });
    
    if (!document) {
      return res.status(404).json({ error: 'Документ не найден' });
    }
    
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ error: 'Файл не найден' });
    }
    
    const previewTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!previewTypes.includes(document.fileType)) {
      return res.status(400).json({ error: 'Предпросмотр недоступен для этого типа файла' });
    }
    
    res.setHeader('Content-Type', document.fileType);
    res.sendFile(document.filePath);
  } catch (error) {
    const castError = handleCastError(error, res);
    if (castError) return castError;
    
    console.error('Ошибка предпросмотра:', error);
    res.status(500).json({ error: 'Ошибка предпросмотра документа' });
  }
};

// Предпросмотр документа врача
export const previewDoctorDocument = async (req, res) => {
  try {
    const document = await PatientDocument.findOne({
      _id: req.params.id,
      patientId: req.user.userId
    });
    
    if (!document || !document.filePath) {
      return res.status(404).json({ error: 'Файл не найден' });
    }
    
    const previewTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!previewTypes.includes(document.fileType)) {
      return res.status(400).json({ error: 'Предпросмотр недоступен' });
    }
    
    res.setHeader('Content-Type', document.fileType);
    res.sendFile(document.filePath);
  } catch (error) {
    console.error('Ошибка предпросмотра документа врача:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};