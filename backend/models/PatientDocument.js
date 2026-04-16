import mongoose from 'mongoose';

const patientDocumentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    default: null
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Выписка', 'Рецепт', 'Направление', 'Заключение', 'Справка', 'Анализ', 'Другое']
  },
  content: {
    type: Object, // Хранит заполненные данные
    default: {}
  },
  
  filePath: { type: String, default: null },
  fileName: { type: String, default: null },
  fileType: { type: String, default: null },
  fileSize: { type: Number, default: null },

  status: {
    type: String,
    enum: ['draft', 'completed', 'signed', 'archived'],
    default: 'completed'
  },
  signedAt: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true 
});

const PatientDocument = mongoose.model('PatientDocument', patientDocumentSchema);
export default PatientDocument;