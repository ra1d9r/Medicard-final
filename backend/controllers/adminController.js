import User from '../models/User.js';
import { findInGovDB } from '../services/fakeGovDB.js';
import bcrypt from 'bcryptjs';

// Получить всех пользователей
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({ users });
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получить всех врачей
export const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('-password')
      .sort({ name: 1 });
    
    res.json({ doctors });
  } catch (error) {
    console.error('Ошибка получения врачей:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Добавить врача (по ИИН)
// Добавить врача (по ИИН)
export const addDoctor = async (req, res) => {
  const { iin, email, password } = req.body;
  
  try {
    // Проверяем ИИН в государственной базе
    const govUser = findInGovDB(iin);
    if (!govUser) {
      return res.status(400).json({ error: 'ИИН не найден в государственной базе' });
    }
    
    // Проверяем, существует ли пользователь с таким ИИН
    let user = await User.findOne({ iin });
    
    if (user) {
      // Нельзя изменять роль администратора
      if (user.role === 'admin') {
        return res.status(400).json({ error: 'Нельзя изменить роль администратора' });
      }
      
      // Если пользователь уже врач
      if (user.role === 'doctor') {
        return res.status(400).json({ error: 'Пользователь уже является врачом' });
      }
      
      user.role = 'doctor';
      await user.save();
      
      return res.json({
        message: 'Пользователь назначен врачом',
        user: {
          id: user._id,
          iin: user.iin,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
    
    // Если пользователя нет, создаем нового
    if (!email) {
      return res.status(400).json({ error: 'Для нового врача требуется email' });
    }
    
    if (!password) {
      return res.status(400).json({ error: 'Для нового врача требуется пароль' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newDoctor = await User.create({
      iin,
      name: govUser.name,
      email,
      password: hashedPassword,
      role: 'doctor'
    });
    
    res.json({
      message: 'Врач успешно добавлен',
      user: {
        id: newDoctor._id,
        iin: newDoctor.iin,
        name: newDoctor.name,
        email: newDoctor.email,
        role: newDoctor.role
      }
    });
  } catch (error) {
    console.error('Ошибка добавления врача:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Удалить врача (снять роль)
export const removeDoctor = async (req, res) => {
  const { id } = req.params;
  
  try {
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    if (user.role !== 'doctor') {
      return res.status(400).json({ error: 'Пользователь не является врачом' });
    }
    
    user.role = 'user';
    await user.save();
    
    res.json({
      message: 'Роль врача снята',
      user: {
        id: user._id,
        iin: user.iin,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Ошибка удаления врача:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Изменить роль пользователя
export const changeUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  const allowedRoles = ['user', 'doctor', 'admin'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: 'Недопустимая роль' });
  }
  
  try {
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({
      message: 'Роль пользователя изменена',
      user: {
        id: user._id,
        iin: user.iin,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Ошибка изменения роли:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получить статистику системы
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalPatients = await User.countDocuments({ role: 'user' });
    
    res.json({
      stats: {
        totalUsers,
        totalDoctors,
        totalAdmins,
        totalPatients
      }
    });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};