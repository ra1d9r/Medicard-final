import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medicard';
    
    // Убираем устаревшие опции useNewUrlParser и useUnifiedTopology
    // Они больше не нужны в Mongoose 7+
    const options = {
      serverSelectionTimeoutMS: 5000, // Таймаут выбора сервера
      socketTimeoutMS: 45000, // Таймаут сокета
    };
    
    await mongoose.connect(uri, options);
    console.log('✅ Успешное подключение к MongoDB');
    
    // Обработка ошибок после подключения
    mongoose.connection.on('error', (err) => {
      console.error('❌ Ошибка MongoDB после подключения:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB отключена');
    });
    
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error.message);
    throw new Error(`Не удалось подключиться к MongoDB: ${error.message}`);
  }
};

export default connectDB;