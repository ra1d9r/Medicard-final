import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  iin: {
    type: String,
    required: true,
    unique: true, // Это создает индекс автоматически
    validate: {
      validator: function(v) {
        return /^\d{12}$/.test(v);
      },
      message: 'ИИН должен состоять из 12 цифр'
    }
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true, // Это создает индекс автоматически
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(v);
      },
      message: 'Некорректный формат email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'doctor', 'admin'],
    default: 'user'
  }
}, { 
  timestamps: true 
});


// Оставляем только индекс для поиска (оптимизация)
// userSchema.index({ name: 1 });
// userSchema.index({ role: 1 });

// Метод для исключения пароля при преобразовании в JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

// Индексы для оптимизации поиска
// userSchema.index({ iin: 1 });
userSchema.index({ name: 1 });
// userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
// Составной индекс для поиска пациентов
userSchema.index({ role: 1, name: 1 });
userSchema.index({ role: 1, iin: 1 });

export default User;