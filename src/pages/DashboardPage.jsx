import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-md w-full border border-gray-100">
        <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Вы вошли!</h1>
        <p className="text-gray-500 mb-4">
          Добро пожаловать в систему электронных медицинских карт Medicard.
        </p>
        
        {/* Отображаем информацию о пользователе */}
        {user && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">ИИН:</span> {user.iin}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">ФИО:</span> {user.name}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Email:</span> {user.email}
            </p>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition w-full font-medium"
        >
          Выйти из системы
        </button>
      </div>
    </div>
  );
}