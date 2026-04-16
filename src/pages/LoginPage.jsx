import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [iin, setIin] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1); // 1 - ввод ИИН, 2 - ввод пароля
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Валидация ИИН (12 цифр)
  const validateIIN = (iin) => {
    const iinRegex = /^\d{12}$/;
    if (!iinRegex.test(iin)) {
      setError('ИИН должен состоять из 12 цифр');
      return false;
    }
    return true;
  };

  // Шаг 1: Проверка ИИН
  const handleCheckIin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Валидация ИИН
    if (!validateIIN(iin)) return;
    
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/check-iin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iin })
      });
      const data = await res.json();

      if (res.ok) {
        if (data.status === 'registered') {
          setStep(2); // Пользователь есть в БД -> показываем поле пароля
        } else if (data.status === 'found_in_gov') {
          // Пользователь найден в гос. базе -> отправляем на регистрацию
          navigate('/register', { state: { iin, name: data.name } });
        }
      } else {
        // ИИН не найден нигде
        setError(data.message || data.error || 'Ошибка проверки ИИН');
      }
    } catch (err) {
      console.error('Ошибка при проверке ИИН:', err);
      setError('Ошибка соединения с сервером. Проверьте подключение.');
    } finally {
      setLoading(false);
    }
  };

  // Шаг 2: Вход по паролю
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!password.trim()) {
      setError('Введите пароль');
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iin, password })
      });
      
      const data = await res.json();

      if (res.ok) {
        // Сохраняем токен и данные пользователя через контекст
        login(data.token, data.user);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Неверный ИИН или пароль');
      }
    } catch (err) {
      console.error('Ошибка при входе:', err);
      setError('Ошибка соединения с сервером. Проверьте подключение.');
    } finally {
      setLoading(false);
    }
    // В функции handleLogin, после успешного входа:
    if (res.ok) {
      login(data.token, data.user);
      navigate('/'); // вместо navigate('/dashboard')
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-teal-600">Вход в Medicard</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm border border-red-200" role="alert">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleCheckIin}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">
                ИИН <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={iin}
                onChange={(e) => {
                  // Ограничиваем ввод только цифрами и максимум 12 символами
                  const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                  setIin(value);
                  setError(''); // Очищаем ошибку при вводе
                }}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Введите 12 цифр"
                required
                maxLength={12}
                pattern="\d{12}"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Пример: 123456789012</p>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-teal-500 text-white p-2 rounded hover:bg-teal-600 transition disabled:bg-teal-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Проверка...' : 'Далее'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">ИИН</label>
              <input 
                type="text" 
                value={iin} 
                disabled 
                className="w-full border border-gray-300 p-2 rounded bg-gray-100 text-gray-500" 
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">
                Пароль <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(''); // Очищаем ошибку при вводе
                }}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="Введите пароль"
                required
                disabled={loading}
                autoFocus
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition disabled:bg-green-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError('');
                setPassword('');
              }}
              disabled={loading}
              className="w-full mt-3 text-blue-500 hover:underline text-sm disabled:text-gray-400"
            >
              Вернуться к вводу ИИН
            </button>
          </form>
        )}
        
        {/* Информационная панель */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Нет аккаунта? Пройдите регистрацию после проверки ИИН
          </p>
        </div>
      </div>
    </div>
  );
}