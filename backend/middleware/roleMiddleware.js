// Проверка что пользователь авторизован (существует в req.user)
export const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Не авторизован' });
  }
  next();
};

// Проверка что пользователь имеет роль doctor или admin
export const isDoctor = async (req, res, next) => {
  try {
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }
    
    if (user.role !== 'doctor' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуется роль врача.' });
    }
    
    next();
  } catch (error) {
    console.error('Ошибка проверки роли врача:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Проверка что пользователь имеет роль admin
export const isAdmin = async (req, res, next) => {
  try {
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуется роль администратора.' });
    }
    
    next();
  } catch (error) {
    console.error('Ошибка проверки роли админа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

