import PatientRequisite from '../models/PatientRequisite.js';
import Template from '../models/Template.js';
import User from '../models/User.js';

// Получить все реквизиты пациента (для пациента)
export const getMyRequisites = async (req, res) => {
  try {
    const requisites = await PatientRequisite.find({
      patientId: req.user.userId,
      status: 'active'
    })
    .populate('doctorId', 'name')
    .sort({ createdAt: -1 });
    
    res.json({ requisites });
  } catch (error) {
    console.error('Ошибка получения реквизитов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получить все реквизиты пациента (для врача)
export const getPatientRequisites = async (req, res) => {
  const { patientId } = req.params;
  
  try {
    const requisites = await PatientRequisite.find({
      patientId,
      status: 'active'
    })
    .populate('doctorId', 'name')
    .sort({ createdAt: -1 });
    
    res.json({ requisites });
  } catch (error) {
    console.error('Ошибка получения реквизитов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Создать реквизит для пациента
export const createRequisite = async (req, res) => {
  try {
    const { patientId, templateId, templateType, data } = req.body;
    
    console.log('🔴🔴🔴 createRequisite вызван с templateId:', templateId);
    console.log('📥 Создание реквизита:', { patientId, templateId, templateType, data });
    
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'user') {
      return res.status(404).json({ error: 'Пациент не найден' });
    }
    
    console.log('🔍 Поиск шаблона:', { _id: templateId, templateKind: 'requisite', status: 'active' });
    
    const template = await Template.findOne({
      _id: templateId,
      templateKind: 'requisite',
      status: 'active'
    });
    
    console.log('🔍 Результат поиска шаблона:', template ? 'НАЙДЕН' : 'НЕ НАЙДЕН');
    
    if (!template) {
      return res.status(404).json({ error: 'Шаблон не найден' });
    }
    
    const requisite = await PatientRequisite.create({
      patientId,
      doctorId: req.user.userId,
      templateId,
      templateType: templateType || 'cardiomonitor',
      templateName: template.title,
      data
    });
    
    console.log('✅ Реквизит создан:', requisite._id);
    
    res.json({ 
      message: 'Реквизит успешно создан', 
      requisite 
    });
  } catch (error) {
    console.error('❌ Ошибка создания реквизита:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Обновить реквизит
export const updateRequisite = async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  
  try {
    const requisite = await PatientRequisite.findOneAndUpdate(
      { _id: id, doctorId: req.user.userId, status: 'active' },
      { data },
      { new: true }
    );
    
    if (!requisite) {
      return res.status(404).json({ error: 'Реквизит не найден' });
    }
    
    res.json({ message: 'Реквизит обновлен', requisite });
  } catch (error) {
    console.error('Ошибка обновления реквизита:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Удалить реквизит (архивировать)
export const deleteRequisite = async (req, res) => {
  const { id } = req.params;
  
  try {
    const requisite = await PatientRequisite.findOneAndUpdate(
      { _id: id, doctorId: req.user.userId, status: 'active' },
      { status: 'archived' },
      { new: true }
    );
    
    if (!requisite) {
      return res.status(404).json({ error: 'Реквизит не найден' });
    }
    
    res.json({ message: 'Реквизит удален' });
  } catch (error) {
    console.error('Ошибка удаления реквизита:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};