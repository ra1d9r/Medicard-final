import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ error: 'Не авторизован. Отсутствует токен.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
    
    // Загружаем пользователя из БД
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }
    
    // Добавляем информацию о пользователе в req
    req.user = {
      userId: user._id,
      iin: user.iin,
      role: user.role
    };
    req.userData = user;
    
    next();
  } catch (error) {
    console.error('Ошибка верификации токена:', error);
    return res.status(401).json({ error: 'Не авторизован. Неверный токен.' });
  }
};