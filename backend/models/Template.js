import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  documentType: {  // Для медицинских документов (Выписка, Рецепт и т.д.)
    type: String,
    required: true,
    enum: ['Выписка', 'Рецепт', 'Направление', 'Заключение', 'Справка', 'Другое']
  },
  templateKind: {  // Новое поле: 'medical' или 'requisite'
    type: String,
    enum: ['medical', 'requisite'],
    default: 'medical'
  },
  content: {
    type: String,
    default: null  // Для medical шаблонов
  },
  html: {
    type: String,
    default: null  // Для requisite шаблонов
  },
  fields: [{
    name: String,
    fieldType: { type: String, enum: ['text', 'number', 'date', 'select'] },
    required: Boolean,
    options: [String]
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  }
}, { 
  timestamps: true 
});

const Template = mongoose.model('Template', templateSchema);
export default Template;