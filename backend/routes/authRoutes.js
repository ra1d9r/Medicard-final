const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Маршруты для авторизации и регистрации
router.post('/check-iin', authController.checkIin);
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
