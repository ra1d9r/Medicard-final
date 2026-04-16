import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загружаем переменные окружения
dotenv.config({ path: path.join(__dirname, '../.env') });

// Генерируем рандомный ИИН для администратора
const generateRandomIIN = () => {
  // Формат: 12 цифр, первые 6 - дата рождения (010101 - 311299)
  const year = Math.floor(Math.random() * (99 - 60 + 1) + 60).toString().padStart(2, '0'); // 60-99
  const month = Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0');
  const day = Math.floor(Math.random() * 28 + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `${day}${month}${year}${random}`;
};

const createAdmin = async () => {
  try {
    // Подключаемся к MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medicard');
    console.log('✅ Подключение к MongoDB');

    // Импортируем модель User
    const User = (await import('../models/User.js')).default;
    
    // Проверяем, существует ли уже администратор
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️ Администратор уже существует:');
      console.log('   Имя:', existingAdmin.name);
      console.log('   Email:', existingAdmin.email);
      console.log('   ИИН:', existingAdmin.iin);
      console.log('   Роль:', existingAdmin.role);
      console.log('\n✅ Войдите с этими данными');
      process.exit(0);
    }
    
    // Генерируем уникальный ИИН для администратора
    let adminIIN;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      adminIIN = generateRandomIIN();
      const existingUser = await User.findOne({ iin: adminIIN });
      if (!existingUser) {
        isUnique = true;
      }
      attempts++;
    }
    
    if (!isUnique) {
      console.error('❌ Не удалось сгенерировать уникальный ИИН');
      process.exit(1);
    }
    
    // Данные администратора
    const adminEmail = 'admin@medicard.kz';
    const adminPassword = 'Admin123!';
    const adminName = 'Администратор Системы';
    
    // Создаем нового администратора
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    const admin = await User.create({
      iin: adminIIN,
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });
    
    console.log('✅ Администратор успешно создан!');
    console.log('\n📋 Данные для входа в админ панель:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   ИИН: ${adminIIN}`);
    console.log(`   Пароль: ${adminPassword}`);
    console.log(`   Email: ${adminEmail}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️ Обязательно сохраните эти данные!');
    console.log('⚠️ После первого входа рекомендуется сменить пароль в профиле.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка создания администратора:', error);
    process.exit(1);
  }
};

createAdmin();