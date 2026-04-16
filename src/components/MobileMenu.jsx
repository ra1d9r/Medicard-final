import { useState } from 'react';

export default function MobileMenu({ tabs, activeTab, setActiveTab, user, onLogout, onAdminClick, onDoctorClick }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Кнопка бургер */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition"
        aria-label="Меню"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Выпадающее меню */}
      {isOpen && (
        <>
          {/* Оверлей */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Меню */}
          <div className="absolute top-16 left-0 right-0 bg-white shadow-lg z-50 rounded-b-lg mx-4">
            <div className="flex flex-col p-4 space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
              
              <div className="border-t border-gray-200 my-2"></div>
              
              {/* Информация о пользователе */}
              <div className="flex items-center space-x-3 px-4 py-2">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              
              {/* Кнопки действий */}
              <div className="space-y-2 mt-2">
                {user?.role === 'admin' && (
                  <button
                    onClick={() => {
                      onAdminClick();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
                  >
                    <span className="text-xl">👑</span>
                    <span>Админ панель</span>
                  </button>
                )}
                
                {user?.role === 'doctor' && (
                  <button
                    onClick={() => {
                      onDoctorClick();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition"
                  >
                    <span className="text-xl">👨‍⚕️</span>
                    <span>Панель врача</span>
                  </button>
                )}
                
                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition"
                >
                  <span className="text-xl">🚪</span>
                  <span>Выйти</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}