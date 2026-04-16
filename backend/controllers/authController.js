import User from '../models/User.js';
import { findInGovDB } from '../services/fakeGovDB.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// 1. Проверка ИИН
export const checkIin = async (req, res) => {
  const { iin } = req.body;

  try {
    const existingUser = await User.findOne({ iin });
    if (existingUser) {
      return res.json({ status: 'registered', message: 'Пользователь уже зарегистрирован' });
    }

    const govUser = findInGovDB(iin);
    if (govUser) {
      return res.json({ status: 'found_in_gov', name: govUser.name });
    }

    return res.status(404).json({ status: 'error', message: 'ИИН не найден' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// 2. Регистрация нового пользователя
export const register = async (req, res) => {
  const { iin, email, password } = req.body;

  try {
    const govUser = findInGovDB(iin);
    if (!govUser) {
      return res.status(400).json({ error: 'ИИН не найден в государственной базе' });
    }

    const existingUser = await User.findOne({ iin });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким ИИН уже существует' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      iin,
      name: govUser.name,
      email,
      password: hashedPassword,
      role: 'user'
    });

    const token = jwt.sign(
      { userId: newUser._id, iin: newUser.iin },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Регистрация успешна',
      token,
      user: {
        id: newUser._id,
        iin: newUser.iin,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// 3. Вход в систему
export const login = async (req, res) => {
  const { iin, password } = req.body;

  try {
    const user = await User.findOne({ iin }).select('+password');
    
    if (!user) {
      return res.status(401).json({ error: 'Неверный ИИН или пароль' });
    }

    if (!user.password) {
      return res.status(401).json({ error: 'Ошибка авторизации' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный ИИН или пароль' });
    }

    const token = jwt.sign(
      { userId: user._id, iin: user.iin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Успешный вход',
      token,
      user: {
        id: user._id,
        iin: user.iin,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// 4. Получение текущего пользователя
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json({ user });
  } catch (error) {
    // Обработка CastError (неверный формат ID)
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ error: 'Неверный формат идентификатора пользователя' });
    }
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};