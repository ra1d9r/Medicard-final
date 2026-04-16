import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MobileMenu from '../components/MobileMenu';
import RequisitesTab from "../components/requisites/RequisitesTab";

// Компонент навигации

const Navigation = ({ activeTab, setActiveTab, user, onLogout }) => {
  const navigate = useNavigate();
  
  const tabs = [
    { id: 'profile', name: 'Профиль', icon: '👤' },
    { id: 'medical', name: 'Медицинская карта', icon: '📋' },
    { id: 'documents', name: 'Документы', icon: '📄' },
    { id: 'requisites', name: 'Реквизиты', icon: '🪪' }
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Главная навигация">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Логотип */}
          <div className="flex items-center ml-4">
            <h1 className="text-2xl font-bold text-teal-600">Medicard</h1>
            
            {/* Десктопное меню */}
            <div className="hidden md:flex ml-10 space-x-4">
              {tabs.map(tab => (
                <button
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === tab.id
                      ? 'bg-teal-100 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Десктопные кнопки */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white" aria-label="Аватар пользователя">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="text-gray-700 text-sm">{user?.name}</span>
            </div>
            
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
              >
                Админ
              </button>
            )}
            
            {user?.role === 'doctor' && (
              <button
                onClick={() => navigate('/doctor')}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm"
              >
                👨‍⚕️ Панель врача
              </button>
            )}
            
            <button
              onClick={onLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
            >
              Выйти
            </button>
          </div>
          
          {/* Мобильное меню */}
          <div className="flex md:hidden items-center">
            <MobileMenu
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              user={user}
              onLogout={onLogout}
              onAdminClick={() => navigate('/admin')}
              onDoctorClick={() => navigate('/doctor')}
            />
          </div>
        </div>
      </div>
    </nav>
  </header>
  );
};

// Компонент профиля
const ProfileTab = ({ user }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <article>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Личная информация</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-b pb-3">
          <p className="text-sm text-gray-500">ФИО</p>
          <p className="text-lg font-medium text-gray-900">{user?.name || 'Не указано'}</p>
        </div>
        <div className="border-b pb-3">
          <p className="text-sm text-gray-500">ИИН</p>
          <p className="text-lg font-medium text-gray-900">{user?.iin || 'Не указано'}</p>
        </div>
        <div className="border-b pb-3">
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-lg font-medium text-gray-900">{user?.email || 'Не указано'}</p>
        </div>
        <div className="border-b pb-3">
          <p className="text-sm text-gray-500">Дата регистрации</p>
          <p className="text-lg font-medium text-gray-900">
            {new Date().toLocaleDateString('ru-RU')}
          </p>
        </div>
      </div>
      </article>
    </div>
  );
};

// Компонент медицинской карты (основной)
const MedicalCardTab = () => {
  const { token } = useAuth();
  
  const bloodTypes = ['A (II)', 'B (III)', 'AB (IV)', 'O (I)'];
  const rhFactors = ['Rh+', 'Rh-'];
  
  const [medicalCard, setMedicalCard] = useState({
    bloodType: '',
    rhFactor: '',
    height: '',
    weight: '',
    insuranceNumber: '',
    emergencyContact: '',
    allergies: [],
    chronicDiseases: [],
    medications: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');

  // Загрузка данных с сервера
  useEffect(() => {
    fetchMedicalCard();
  }, []);

  const fetchMedicalCard = async () => {
    try {
      const res = await fetch('/api/medical-card', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setMedicalCard(data.medicalCard);
      } else {
        setError(data.error || 'Ошибка загрузки медкарты');
      }
    } catch (error) {
      console.error('Ошибка загрузки медкарты:', error);
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/medical-card', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(medicalCard)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMedicalCard(data.medicalCard);
        setIsEditing(false);
        alert('Медицинская карта успешно сохранена');
      } else {
        setError(data.error || 'Ошибка сохранения');
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      setError('Ошибка соединения с сервером');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
        <p className="mt-3 text-gray-600">Загрузка медкарты...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Основная информация */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <article>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-teal-800">
            📋 Электронная медицинская карта
          </h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-teal-500 hover:text-green-600 flex items-center space-x-1"
          >
            <span>{isEditing ? '✖ Отмена' : '✏️ Редактировать'}</span>
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg" role="alert">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Группа крови
            </label>
            {isEditing ? (
              <select
                value={medicalCard.bloodType}
                onChange={(e) => setMedicalCard({...medicalCard, bloodType: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Выберите группу крови</option>
                {bloodTypes.map(bt => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900 p-2 bg-gray-50 rounded">
                {medicalCard.bloodType || 'Не указано'}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Резус-фактор
            </label>
            {isEditing ? (
              <select
                value={medicalCard.rhFactor}
                onChange={(e) => setMedicalCard({...medicalCard, rhFactor: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Выберите резус-фактор</option>
                {rhFactors.map(rh => (
                  <option key={rh} value={rh}>{rh}</option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900 p-2 bg-gray-50 rounded">
                {medicalCard.rhFactor || 'Не указано'}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Рост (см)
            </label>
            {isEditing ? (
              <input
                type="number"
                value={medicalCard.height || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setMedicalCard({...medicalCard, height: val === '' ? '' : Number(val)})
                }}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="Например: 175"
              />
            ) : (
              <p className="text-gray-900 p-2 bg-gray-50 rounded">
                {medicalCard.height ? `${medicalCard.height} см` : 'Не указано'}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Вес (кг)
            </label>
            {isEditing ? (
              <input
                type="number"
                value={medicalCard.weight || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setMedicalCard({...medicalCard, weight: val === '' ? '' : Number(val)})
                }}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="Например: 70"
              />
            ) : (
              <p className="text-gray-900 p-2 bg-gray-50 rounded">
                {medicalCard.weight ? `${medicalCard.weight} кг` : 'Не указано'}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Номер полиса ОМС
            </label>
            {isEditing ? (
              <input
                type="text"
                value={medicalCard.insuranceNumber}
                onChange={(e) => setMedicalCard({...medicalCard, insuranceNumber: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="Введите номер полиса"
              />
            ) : (
              <p className="text-gray-900 p-2 bg-gray-50 rounded">
                {medicalCard.insuranceNumber || 'Не указано'}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Контакт для экстренных случаев
            </label>
            {isEditing ? (
              <input
                type="text"
                value={medicalCard.emergencyContact}
                onChange={(e) => setMedicalCard({...medicalCard, emergencyContact: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="Телефон для связи"
              />
            ) : (
              <p className="text-gray-900 p-2 bg-gray-50 rounded">
                {medicalCard.emergencyContact || 'Не указано'}
              </p>
            )}
          </div>
        </div>
        
        {/* Аллергии */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Аллергические реакции
          </label>
          {isEditing ? (
            <textarea
              value={medicalCard.allergies.join(', ')}
              onChange={(e) => setMedicalCard({...medicalCard, allergies: e.target.value.split(',').map(a => a.trim()).filter(a => a)})}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Введите аллергии через запятую (например: пенициллин, пыльца, шерсть)"
              rows="3"
            />
          ) : (
            <p className="text-gray-900 p-2 bg-gray-50 rounded">
              {medicalCard.allergies.length > 0 ? medicalCard.allergies.join(', ') : 'Нет известных аллергий'}
            </p>
          )}
        </div>
        
        {/* Хронические заболевания */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Хронические заболевания
          </label>
          {isEditing ? (
            <textarea
              value={medicalCard.chronicDiseases.join(', ')}
              onChange={(e) => setMedicalCard({...medicalCard, chronicDiseases: e.target.value.split(',').map(d => d.trim()).filter(d => d)})}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Введите заболевания через запятую"
              rows="3"
            />
          ) : (
            <p className="text-gray-900 p-2 bg-gray-50 rounded">
              {medicalCard.chronicDiseases.length > 0 ? medicalCard.chronicDiseases.join(', ') : 'Нет хронических заболеваний'}
            </p>
          )}
        </div>
        
        {/* Лекарства */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Постоянно принимаемые лекарства
          </label>
          {isEditing ? (
            <textarea
              value={medicalCard.medications.join(', ')}
              onChange={(e) => setMedicalCard({...medicalCard, medications: e.target.value.split(',').map(m => m.trim()).filter(m => m)})}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Введите лекарства через запятую"
              rows="3"
            />
          ) : (
            <p className="text-gray-900 p-2 bg-gray-50 rounded">
              {medicalCard.medications.length > 0 ? medicalCard.medications.join(', ') : 'Не принимает лекарства на постоянной основе'}
            </p>
          )}
        </div>
        
        {isEditing && (
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              disabled={saveLoading}
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={saveLoading}
              className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition disabled:bg-teal-300"
            >
              {saveLoading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        )}
        </article>
      </div>
      
      {/* Информационная панель */}
      <div className="bg-gradient-to-r from-indigo-50 to-teal-50 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">ℹ️ Информация</h3>
        <p className="text-sm text-gray-600">
          Ваша электронная медицинская карта хранится в защищенной системе MongoDB. 
          Все данные доступны только вам и вашим лечащим врачам.
        </p>
      </div>
    </div>
  );
};

// Компонент документов
const DocumentsTab = () => {
  const { token } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'Другое',
    description: ''
  });
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const documentTypes = ['Анализ', 'Выписка', 'Рецепт', 'Направление', 'Заключение', 'Другое'];
  
  // Кеш для документов
  const cacheRef = useRef(new Map());

  const fetchDocuments = async (page = 1, forceRefresh = false) => {
    const cacheKey = `documents_page_${page}`;
    
    if (!forceRefresh && cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey);
      if (page === 1) {
        setDocuments(cached.documents);
      } else {
        setDocuments(prev => [...prev, ...cached.documents]);
      }
      setPagination(cached.pagination);
      return;
    }
    
    try {
      const res = await fetch(`/api/documents?page=${page}&limit=${pagination.limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        const result = {
          documents: data.documents,
          pagination: data.pagination
        };
        cacheRef.current.set(cacheKey, result);
        
        if (page === 1) {
          setDocuments(data.documents);
        } else {
          setDocuments(prev => [...prev, ...data.documents]);
        }
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Ошибка загрузки документов');
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const loadMore = () => {
    if (pagination.page < pagination.pages && !loadingMore) {
      setLoadingMore(true);
      fetchDocuments(pagination.page + 1);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Выберите файл для загрузки');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', uploadForm.title);
    formData.append('type', uploadForm.type);
    formData.append('description', uploadForm.description);

    try {
      const xhr = new XMLHttpRequest();
    
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      });
    
      const promise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(xhr.statusText));
          }
        };
        xhr.onerror = () => reject(new Error('Ошибка загрузки'));
      
        xhr.open('POST', '/api/documents/upload');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });
    
      const data = await promise;
    
      if (data.document) {
        cacheRef.current.clear(); // Очищаем кеш
        setShowUploadModal(false);
        setSelectedFile(null);
        setUploadForm({ title: '', type: 'Другое', description: '' });
        await fetchDocuments(1, true); // Принудительно обновляем с первой страницы
        alert('Документ успешно загружен');
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      setError('Ошибка загрузки документа');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  
  // Просмотр файла (PDF/изображение)
  const handlePreviewFile = async (doc) => {
    try {
      let url;
      if (doc.source === 'doctor') {
        url = `/api/documents/doctor-document/${doc._id}/preview`;
      } else {
        url = `/api/documents/${doc._id}/preview`;
      }

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const blob = await res.blob();
        const previewUrl = window.URL.createObjectURL(blob);
        setPreviewDoc({ 
          ...doc, 
          previewUrl, 
          isTextPreview: false,
          modalTitle: doc.title || doc.fileName
        });
        setShowPreviewModal(true);
      } else {
        handleDownload(doc._id, doc.fileName, doc.source);
      }
    } catch (error) {
      console.error('Ошибка просмотра файла:', error);
      alert('Не удалось загрузить файл');
    }
  };

  // Просмотр текстового содержания
  const handlePreviewText = (doc) => {
    setPreviewDoc({ 
      ...doc, 
      previewUrl: null,
      isTextPreview: true,
      textContent: doc.textContent,
      modalTitle: `${doc.title} - содержание`
    });
    setShowPreviewModal(true);
  };

  const handleDownload = async (docId, fileName, source) => {
    setDownloadingId(docId);
    try {
      let url;
      if (source === 'doctor') {
        url = `/api/documents/doctor-document/${docId}/download`;
      } else {
        url = `/api/documents/${docId}/download`;
      }
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      } else {
        const data = await res.json();
        alert(data.error || 'Ошибка скачивания');
      }
    } catch (error) {
      console.error('Ошибка скачивания:', error);
      alert('Ошибка скачивания документа');
    } finally {
      setDownloadingId(null);
    }
  };

  // ИСПРАВЛЕНО: Полная обработка всех типов документов
  const handlePreview = async (doc) => {
    // Случай 1: Есть текстовое содержание, но нет файла
    if (doc.hasText && !doc.hasFile) {
      setPreviewDoc({ 
        ...doc, 
        previewUrl: null,
        isTextPreview: true,
        textContent: doc.textContent,
        modalTitle: `${doc.title} - содержание`
      });
      setShowPreviewModal(true);
      return;
    }
    
    // Случай 2: Есть файл (и для обычных документов, и для врачебных)
    if (doc.hasFile) {
      try {
        let url;
        if (doc.source === 'doctor') {
          url = `/api/documents/doctor-document/${doc._id}/preview`;
        } else {
          url = `/api/documents/${doc._id}/preview`;
        }
        
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const blob = await res.blob();
          const previewUrl = window.URL.createObjectURL(blob);
          setPreviewDoc({ 
            ...doc, 
            previewUrl, 
            isTextPreview: false,
            hasFileAndText: doc.hasText,
            textContent: doc.textContent,
            modalTitle: doc.title || doc.fileName
          });
          setShowPreviewModal(true);
        } else {
          // Если предпросмотр не удался, пробуем скачать
          handleDownload(doc._id, doc.fileName, doc.source);
        }
      } catch (error) {
        console.error('Ошибка просмотра файла:', error);
        handleDownload(doc._id, doc.fileName, doc.source);
      }
      return;
    }
    
    // Случай 3: Нет ни файла, ни текста
    alert('Нет содержимого для просмотра');
  };

  const handleDelete = async (docId) => {
    const confirmed = window.confirm('Вы уверены, что хотите удалить этот документ? Это действие нельзя отменить.');
    if (!confirmed) return;
    
    setDeletingId(docId);
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        cacheRef.current.clear(); // Очищаем кеш
        await fetchDocuments(1, true); // Принудительно обновляем
        alert('Документ удален');
      } else {
        const data = await res.json();
        alert(data.error || 'Ошибка удаления');
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Ошибка удаления документа');
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📑';
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('word')) return '📝';
    return '📄';
  };

  const canPreview = (fileType) => {
    return fileType?.includes('pdf') || fileType?.includes('image');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
        <p className="mt-3 text-gray-600">Загрузка документов...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Модальное окно предпросмотра */}
      {showPreviewModal && previewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Предпросмотр документа">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">{previewDoc.modalTitle || previewDoc.title || previewDoc.fileName}</h3>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  if (previewDoc.previewUrl) {
                    URL.revokeObjectURL(previewDoc.previewUrl);
                  }
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {/* Текстовый предпросмотр (без файла) */}
              {previewDoc.isTextPreview ? (
                <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded">
                  {previewDoc.textContent}
                </div>
              ) : previewDoc.fileType?.includes('image') ? (
                <>
                  <img 
                    src={previewDoc.previewUrl} 
                    alt={previewDoc.fileName}
                    className="max-w-full h-auto mx-auto"
                    loading="lazy"
                  />
                  {previewDoc.hasFileAndText && previewDoc.textContent && (
                    <div className="mt-4 p-4 bg-gray-50 rounded">
                      <p className="text-sm font-medium text-gray-700 mb-2">📝 Содержание:</p>
                      <div className="whitespace-pre-wrap text-sm text-gray-600">
                        {previewDoc.textContent}
                      </div>
                    </div>
                  )}
                  {previewDoc.fileDescription && !previewDoc.hasFileAndText && (
                    <div className="mt-4 p-3 bg-gray-100 rounded text-sm text-gray-600">
                      {previewDoc.fileDescription}
                    </div>
                  )}
                </>
              ) : previewDoc.fileType?.includes('pdf') ? (
                <>
                  <iframe
                    src={previewDoc.previewUrl}
                    className="w-full h-[70vh]"
                    title={previewDoc.fileName}
                    loading="lazy"
                  />
                  {previewDoc.hasFileAndText && previewDoc.textContent && (
                    <div className="mt-4 p-4 bg-gray-50 rounded">
                      <p className="text-sm font-medium text-gray-700 mb-2">📝 Содержание:</p>
                      <div className="whitespace-pre-wrap text-sm text-gray-600">
                        {previewDoc.textContent}
                      </div>
                    </div>
                  )}
                  {previewDoc.fileDescription && !previewDoc.hasFileAndText && (
                    <div className="mt-4 p-3 bg-gray-100 rounded text-sm text-gray-600">
                      {previewDoc.fileDescription}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Предпросмотр недоступен</p>
                  <button
                    onClick={() => handleDownload(previewDoc._id, previewDoc.fileName, previewDoc.source)}
                    className="mt-4 text-teal-500 hover:underline"
                  >
                    Скачать файл
                  </button>
                  {previewDoc.hasFileAndText && previewDoc.textContent && (
                    <div className="mt-4 p-4 bg-gray-50 rounded text-left">
                      <p className="text-sm font-medium text-gray-700 mb-2">📝 Содержание:</p>
                      <div className="whitespace-pre-wrap text-sm text-gray-600">
                        {previewDoc.textContent}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно загрузки */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Загрузка документа</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm" role="alert">
                {error}
              </div>
            )}
            
            {uploading && uploadProgress > 0 && (
              <div className="mb-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-500 rounded-full h-2 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Загрузка: {uploadProgress}%</p>
              </div>
            )}
            
            <form onSubmit={handleFileUpload}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Файл <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Поддерживаемые форматы: PDF, JPEG, PNG, DOC, DOCX. Максимум 5MB
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название документа
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="Введите название"
                  disabled={uploading}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип документа
                </label>
                <select
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm({...uploadForm, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  disabled={uploading}
                >
                  {documentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  rows="3"
                  placeholder="Дополнительная информация"
                  disabled={uploading}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setError('');
                    setSelectedFile(null);
                    setUploadForm({ title: '', type: 'Другое', description: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={uploading}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 disabled:bg-teal-300"
                >
                  {uploading ? 'Загрузка...' : 'Загрузить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Основной контент */}
      <article className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Медицинские документы</h2>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition flex items-center space-x-2"
          >
            <span>+</span>
            <span>Загрузить документ</span>
          </button>
        </div>
        
        {documents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-6xl mb-4">📄</p>
            <p className="text-lg">У вас пока нет загруженных документов</p>
            <p className="text-sm mt-2">Нажмите кнопку "Загрузить документ", чтобы добавить</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {documents.map(doc => (
                <article key={doc._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3 flex-1">
                      <span className="text-3xl">{getFileIcon(doc.fileType)}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{doc.title || doc.fileName}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">
                            {doc.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(doc.createdAt).toLocaleDateString('ru-RU')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatFileSize(doc.fileSize)}
                          </span>
                          {doc.source === 'doctor' && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              👨‍⚕️ От врача: {doc.doctorName}
                            </span>
                          )}
                        </div>
                        {/* Описание документа */}
                        {doc.description && doc.source !== 'doctor' && (
                          <p className="text-sm text-gray-600 mt-2">{doc.description}</p>
                        )}
                        {doc.source === 'doctor' && !doc.canPreview && doc.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-3">{doc.description}</p>
                        )}
                        {doc.source === 'doctor' && doc.canPreview && doc.fileName && (
                          <p className="text-sm text-gray-500 mt-2">📎 {doc.fileName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {/* Кнопка предпросмотра (работает и для файла, и для текста) */}
                      <button
                        onClick={() => handlePreview(doc)}
                        className="text-green-500 hover:text-green-600 p-1 disabled:opacity-50"
                        title="Предпросмотр"
                        disabled={downloadingId === doc._id || deletingId === doc._id}
                      >
                        👁️
                      </button>
                                          
                      {/* Кнопка скачивания (только если есть файл) */}
                      {doc.hasFile && (
                        <button
                          onClick={() => handleDownload(doc._id, doc.fileName, doc.source)}
                          disabled={downloadingId === doc._id || deletingId === doc._id}
                          className="text-teal-500 hover:text-teal-600 p-1 disabled:opacity-50"
                          title="Скачать"
                        >
                          {downloadingId === doc._id ? '⏳' : '📥'}
                        </button>
                      )}
                      
                      {/* Кнопка удаления (только для своих документов) */}
                      {doc.source !== 'doctor' && (
                        <button
                          onClick={() => handleDelete(doc._id)}
                          disabled={deletingId === doc._id}
                          className="text-red-500 hover:text-red-600 p-1 disabled:opacity-50"
                          title="Удалить"
                        >
                          {deletingId === doc._id ? '⏳' : '🗑️'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            
            {/* Кнопка загрузки еще */}
            {pagination.pages > 1 && pagination.page < pagination.pages && (
              <div className="text-center mt-6">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition disabled:bg-teal-300"
                  aria-label="Загрузить еще документы"
                >
                  {loadingMore ? 'Загрузка...' : `Загрузить еще (${pagination.total - documents.length} осталось)`}
                </button>
              </div>
            )}
          </>
        )}
      </article>
      
      {/* Информационная панель */}
      <div className="bg-gradient-to-r from-indigo-50 to-teal-50 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">ℹ️ О документах</h3>
        <p className="text-sm text-gray-600">
          Здесь хранятся все ваши медицинские документы: результаты анализов, выписки, рецепты и т.д.
          Максимальное количество документов - 50. Максимальный размер файла - 5MB.
          Для изображений и PDF доступен предпросмотр.
        </p>
      </div>
    </div>
  );
};

// Главная страница
export default function MainPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab user={user} />;
      case 'medical':
        return <MedicalCardTab />;
      case 'documents':
        return <DocumentsTab />;
      case 'requisites':  // ← ДОБАВИТЬ ЭТО
        return <RequisitesTab />;  // ← ИМПОРТНУТЬ КОМПОНЕНТ
      default:
        return <ProfileTab user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="space-y-6">
          {renderTab()}
        </section>
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            © 2026 Medicard - Система электронных медицинских карт
          </p>
        </div>
      </footer>
    </div>
  );
}