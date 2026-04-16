import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-9xl font-bold text-gray-300 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Страница не найдена</h1>
        <p className="text-gray-600 mb-6">
          Извините, страница, которую вы ищете, не существует или была перемещена.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition"
          aria-label="Вернуться на главную"
        >
          Вернуться на главную
        </button>
      </div>
    </div>
  );
}