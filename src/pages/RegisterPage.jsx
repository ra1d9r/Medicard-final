import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Получаем данные из location.state (переданы из LoginPage)
  const iin = location.state?.iin || '';
  const name = location.state?.name || '';

  // Если пользователь зашел на страницу напрямую (без ИИН), возвращаем на логин
  useEffect(() => {
    if (!iin || !name) {
      navigate('/login');
    }
  }, [iin, name, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iin, email, password })
      });
      const data = await res.json();

      if (res.ok) {
        navigate('/dashboard'); // Успешная регистрация
      } else {
        setError(data.error || 'Ошибка регистрации');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    }
    // В функции handleRegister, после успешной регистрации:
    if (res.ok) {
      login(data.token, data.user);
      navigate('/'); // вместо navigate('/dashboard')
    }
  };

  if (!iin || !name) return null; // Не рендерим, пока не сработает useEffect

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Завершение регистрации</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm" role="alert">{error}</div>}

        <form onSubmit={handleRegister}>
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
            <label className="block text-gray-700 mb-2 font-medium">ФИО (из гос. базы)</label>
            <input 
              type="text" 
              value={name} 
              disabled 
              className="w-full border border-gray-300 p-2 rounded bg-gray-100 text-gray-500" 
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example@mail.com"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Придумайте пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition">
            Зарегистрироваться
          </button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full mt-3 text-gray-500 hover:underline text-sm"
          >
            Отмена
          </button>
        </form>
      </div>
    </div>
  );
}
