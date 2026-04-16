import User from '../models/User.js';
import Template from '../models/Template.js';
import PatientDocument from '../models/PatientDocument.js';
import { findInGovDB } from '../services/fakeGovDB.js';


// ============ ПОИСК ПАЦИЕНТОВ ============
// Поиск пациентов (оптимизированный)
export const searchPatients = async (req, res) => {
  const { query } = req.query;
  
  if (!query || query.trim() === '') {
    return res.json({ patients: [] });
  }
  
  try {
    const searchRegex = new RegExp(query, 'i');
    
    // Строим условия поиска
    const conditions = [];
    
    // Для ИИН - точное совпадение (если 12 цифр)
    if (/^\d{12}$/.test(query)) {
      conditions.push({ iin: query });
    }
    
    // Поиск по имени и email
    conditions.push({ name: { $regex: searchRegex } });
    conditions.push({ email: { $regex: searchRegex } });
    
    const patients = await User.find({
      role: 'user',
      $or: conditions
    })
    .select('-password')
    .limit(20)
    .lean();
    
    res.json({ patients });
  } catch (error) {
    console.error('Ошибка поиска пациентов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получить информацию о пациенте по ИИН
export const getPatientByIIN = async (req, res) => {
  const { iin } = req.params;
  
  try {
    const patient = await User.findOne({ iin, role: 'user' }).select('-password');
    
    // 2.6: Не 404, а понятная ошибка для врача
    if (!patient) {
      return res.status(404).json({ 
        error: 'Пациент с таким ИИН не найден',
        message: 'Проверьте правильность введенного ИИН'
      });
    }
    
    // Получаем медицинскую карту пациента
    const MedicalCard = (await import('../models/MedicalCard.js')).default;
    const medicalCard = await MedicalCard.findOne({ userId: patient._id });
    
    res.json({ 
      patient,
      medicalCard: medicalCard || null
    });
  } catch (error) {
    console.error('Ошибка получения пациента:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// ============ ШАБЛОНЫ ============
// Получить все шаблоны врача
export const getTemplates = async (req, res) => {
  try {
    const templates = await Template.find({
      doctorId: req.user.userId,
      status: 'active'
    }).sort({ createdAt: -1 });
    
    res.json({ templates });
  } catch (error) {
    console.error('Ошибка получения шаблонов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Создать шаблон
export const createTemplate = async (req, res) => {
  const { title, documentType, content, fields, isPublic } = req.body;
  
  // 2.8: Валидация полей шаблона
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Название шаблона обязательно' });
  }
  
  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Содержание шаблона обязательно' });
  }
  
  // 2.8: Валидация структуры fields
  if (fields && Array.isArray(fields)) {
    for (const field of fields) {
      if (!field.name || field.name.trim() === '') {
        return res.status(400).json({ error: 'У всех полей должно быть имя' });
      }
      const validTypes = ['text', 'number', 'date', 'select'];
      if (field.type && !validTypes.includes(field.type)) {
        return res.status(400).json({ error: `Недопустимый тип поля: ${field.type}` });
      }
      if (field.type === 'select' && (!field.options || !Array.isArray(field.options) || field.options.length === 0)) {
        return res.status(400).json({ error: `Для поля "${field.name}" типа select нужны варианты выбора` });
      }
    }
  }
  
  try {
    const template = await Template.create({
      doctorId: req.user.userId,
      title: title.trim(),
      documentType: documentType || 'Другое',
      content: content,
      fields: fields || [],
      isPublic: isPublic || false
    });
    
    res.json({ message: 'Шаблон создан', template });
  } catch (error) {
    console.error('Ошибка создания шаблона:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Обновить шаблон
export const updateTemplate = async (req, res) => {
  const { id } = req.params;
  const { title, documentType, content, fields, isPublic } = req.body;
  
  try {
    const template = await Template.findOneAndUpdate(
      { _id: id, doctorId: req.user.userId, status: 'active' },
      { title, documentType, content, fields, isPublic },
      { new: true, runValidators: true }
    );
    
    if (!template) {
      return res.status(404).json({ error: 'Шаблон не найден' });
    }
    
    res.json({ message: 'Шаблон обновлен', template });
  } catch (error) {
    console.error('Ошибка обновления шаблона:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Удалить шаблон
export const deleteTemplate = async (req, res) => {
  const { id } = req.params;
  
  try {
    const template = await Template.findOneAndUpdate(
      { _id: id, doctorId: req.user.userId, status: 'active' },
      { status: 'archived' },
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({ error: 'Шаблон не найден' });
    }
    
    res.json({ message: 'Шаблон удален' });
  } catch (error) {
    console.error('Ошибка удаления шаблона:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// ============ ДОКУМЕНТЫ ============

// ИСПРАВЛЕНО: Создать документ для пациента (с поддержкой файлов и текста)
// ИСПРАВЛЕНО: Создать документ для пациента (с поддержкой файлов и текста)
export const createPatientDocument = async (req, res) => {
  try {
    const { patientId, templateId, title, type, content } = req.body;
    
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'user') {
      return res.status(404).json({ error: 'Пациент не найден' });
    }
    
    let documentData = {
      patientId,
      doctorId: req.user.userId,
      templateId: templateId || null,
      title: title || 'Документ',
      type: type || 'Другое',
      status: 'completed'
    };
    
    // ИСПРАВЛЕНО: Явное извлечение текста из разных источников
    let textContent = null;
    
    // 1. Если content пришел как строка
    if (content && typeof content === 'string') {
      textContent = content;
    }
    // 2. Если content пришел как объект с полем text
    else if (content && content.text) {
      textContent = content.text;
    }
    // 3. Если есть отдельное поле textContent в body
    else if (req.body.textContent) {
      textContent = req.body.textContent;
    }
    
    // Если есть файл
    if (req.file) {
      documentData.filePath = req.file.path;
      documentData.fileName = req.file.originalname;
      documentData.fileType = req.file.mimetype;
      documentData.fileSize = req.file.size;
      
      // ИСПРАВЛЕНО: Сохраняем текст в content.text (гарантированно)
      documentData.content = { 
        file: true, 
        name: req.file.originalname,
        text: textContent || ''  // Всегда сохраняем поле text, даже пустое
      };
    } else {
      // Только текст
      documentData.content = { text: textContent || 'Нет содержимого' };
    }
    
    const document = await PatientDocument.create(documentData);
    
    res.json({ message: 'Документ создан', document });
  } catch (error) {
    console.error('Ошибка создания документа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Скачать документ врача (для пациента)
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
    console.error('Ошибка скачивания:', error);
    res.status(500).json({ error: 'Ошибка скачивания документа' });
  }
};

// Получить все документы пациента (для врача)
export const getPatientDocuments = async (req, res) => {
  const { patientId } = req.params;
  
  try {
    const documents = await PatientDocument.find({ patientId })
      .populate('doctorId', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ documents });
  } catch (error) {
    console.error('Ошибка получения документов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получить все свои созданные документы (для врача)
export const getMyDocuments = async (req, res) => {
  try {
    const documents = await PatientDocument.find({ doctorId: req.user.userId })
      .populate('patientId', 'name iin email')
      .sort({ createdAt: -1 });
    
    // 2.3: Фильтрация документов, где пациент удален или его роль изменилась
    const validDocuments = documents.filter(doc => doc.patientId !== null);
    
    res.json({ documents: validDocuments });
  } catch (error) {
    console.error('Ошибка получения документов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получить конкретный документ
export const getDocument = async (req, res) => {
  const { id } = req.params;
  
  try {
    const document = await PatientDocument.findById(id)
      .populate('patientId', 'name iin email')
      .populate('doctorId', 'name');
    
    if (!document) {
      return res.status(404).json({ error: 'Документ не найден' });
    }
    
    // Проверяем, что врач имеет доступ к документу
    if (document.doctorId._id.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }
    
    res.json({ document });
  } catch (error) {
    console.error('Ошибка получения документа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Обновить документ
export const updateDocument = async (req, res) => {
  const { id } = req.params;
  const { title, type, content } = req.body;
  
  try {
    const document = await PatientDocument.findOneAndUpdate(
      { _id: id, doctorId: req.user.userId, status: { $ne: 'archived' } },
      { title, type, content },
      { new: true, runValidators: true }
    );
    
    if (!document) {
      return res.status(404).json({ error: 'Документ не найден' });
    }
    
    res.json({ message: 'Документ обновлен', document });
  } catch (error) {
    console.error('Ошибка обновления документа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Удалить документ (архивировать)
export const deleteDocument = async (req, res) => {
  const { id } = req.params;
  
  try {
    // 2.4: Архивация документа с проверкой существования
    const document = await PatientDocument.findOneAndUpdate(
      { _id: id, doctorId: req.user.userId, status: { $ne: 'archived' } },
      { status: 'archived' },
      { new: true }
    );
    
    if (!document) {
      return res.status(404).json({ error: 'Документ не найден или уже удален' });
    }
    
    res.json({ message: 'Документ успешно удален (архивирован)' });
  } catch (error) {
    console.error('Ошибка удаления документа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получить статистику врача
export const getDoctorStats = async (req, res) => {
  try {
    const totalDocuments = await PatientDocument.countDocuments({ 
      doctorId: req.user.userId,
      status: { $ne: 'archived' }
    });
    const totalPatients = await PatientDocument.distinct('patientId', { 
      doctorId: req.user.userId,
      status: { $ne: 'archived' }
    });
    const totalTemplates = await Template.countDocuments({ 
      doctorId: req.user.userId, 
      status: 'active' 
    });
    
    res.json({
      stats: {
        totalDocuments,
        totalPatients: totalPatients.length,
        totalTemplates
      }
    });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};