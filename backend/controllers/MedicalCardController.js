import MedicalCard from '../models/MedicalCard.js';

// Получить медицинскую карту пользователя
export const getMedicalCard = async (req, res) => {
  try {
    let card = await MedicalCard.findOne({ userId: req.user.userId });
    
    if (!card) {
      // Если карты нет, создаем пустую
      card = await MedicalCard.create({ 
        userId: req.user.userId,
        bloodType: '',
        rhFactor: '',
        height: null,
        weight: null,
        insuranceNumber: '',
        emergencyContact: '',
        allergies: [],
        chronicDiseases: [],
        medications: []
      });
    }
    
    res.json({ medicalCard: card });
  } catch (error) {
    console.error('Ошибка получения медкарты:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении медкарты' });
  }
};

// Обновить медицинскую карту
export const updateMedicalCard = async (req, res) => {
  try {
    const { 
      bloodType, 
      rhFactor, 
      height, 
      weight, 
      insuranceNumber, 
      emergencyContact, 
      allergies, 
      chronicDiseases, 
      medications 
    } = req.body;
    
    const updatedCard = await MedicalCard.findOneAndUpdate(
      { userId: req.user.userId },
      {
        bloodType: bloodType || '',
        rhFactor: rhFactor || '',
        height: height || null,
        weight: weight || null,
        insuranceNumber: insuranceNumber || '',
        emergencyContact: emergencyContact || '',
        allergies: allergies || [],
        chronicDiseases: chronicDiseases || [],
        medications: medications || []
      },
      { new: true, upsert: true } // upsert: true - создает если нет
    );
    
    res.json({ 
      message: 'Медицинская карта успешно обновлена',
      medicalCard: updatedCard 
    });
  } catch (error) {
    console.error('Ошибка обновления медкарты:', error);
    res.status(500).json({ error: 'Ошибка сервера при обновлении медкарты' });
  }
};