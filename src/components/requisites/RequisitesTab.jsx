import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import RequisiteCard from './RequisiteCard';  // ← ИМПОРТ

const RequisitesTab = () => {
  const { token } = useAuth();
  const [requisites, setRequisites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequisite, setSelectedRequisite] = useState(null);

  useEffect(() => {
    fetchRequisites();
  }, []);

  const fetchRequisites = async () => {
    try {
      const res = await fetch('/api/requisites/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('📦 Реквизиты с сервера:', data.requisites);
      if (res.ok) {
        setRequisites(data.requisites || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки реквизитов:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Мои реквизиты</h2>
      
      {requisites.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-6xl mb-4">🪪</p>
          <p className="text-lg">У вас пока нет реквизитов</p>
          <p className="text-sm mt-2">Врач добавит их при необходимости</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requisites.map(requisite => (
            <div 
              key={requisite._id} 
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition"
              onClick={() => setSelectedRequisite(requisite)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">{requisite.templateName || 'Паспорт кардиомонитора'}</p>
                  <p className="text-sm text-gray-500">
                    Добавлен: {new Date(requisite.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <span className="text-gray-400 text-2xl">→</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно просмотра реквизита */}
      {selectedRequisite && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">{selectedRequisite.templateName || 'Паспорт кардиомонитора'}</h3>
              <button
                onClick={() => setSelectedRequisite(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6 flex justify-center">
              <RequisiteCard requisite={selectedRequisite} />  {/* ← ИСПРАВЛЕНО */}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end">
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequisitesTab;