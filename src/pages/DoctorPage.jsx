import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RequisiteFormModal from "../components/requisites/RequisiteFormModal";

export default function DoctorPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('patients');
  const [patients, setPatients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newDocument, setNewDocument] = useState({
    patientId: '',
    title: '',
    type: 'Заключение',
    content: ''
  });
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    documentType: 'Заключение',
    content: '',
    isPublic: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [creatingDocument, setCreatingDocument] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);
  const [showRequisiteModal, setShowRequisiteModal] = useState(false); 

  // Проверка роли
  useEffect(() => {
    if (user?.role !== 'doctor' && user?.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, templatesRes, documentsRes] = await Promise.all([
        fetch('/api/doctor/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/doctor/templates', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/doctor/documents', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      const statsData = await statsRes.json();
      const templatesData = await templatesRes.json();
      const documentsData = await documentsRes.json();
      
      if (statsRes.ok) setStats(statsData.stats);
      if (templatesRes.ok) setTemplates(templatesData.templates);
      if (documentsRes.ok) setDocuments(documentsData.documents);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const searchPatients = async () => {
    console.log('Поиск:', searchQuery); // <- Добавь эту строку
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/doctor/patients/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('Результат:', data); // <- Добавь эту строку
      if (res.ok) {
        setPatients(data.patients);
      } else {
        setError(data.error || 'Ошибка поиска');
      }
    } catch (error) {
      console.error('Ошибка поиска:', error);
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (e) => {
    e.preventDefault();
    setError('');
    setCreatingDocument(true);
    
    const formData = new FormData();
    formData.append('patientId', selectedPatient._id);
    formData.append('title', newDocument.title);
    formData.append('type', newDocument.type);

    // Отправляем текст как объект с полем text
    formData.append('content', JSON.stringify({ text: newDocument.content }));

    if (documentFile) {
      formData.append('file', documentFile);
    }

    try {
      const res = await fetch('/api/doctor/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (res.ok) {
        setSuccess('Документ создан');
        setShowDocumentModal(false);
        setSelectedPatient(null);
        setDocumentFile(null);
        setNewDocument({ patientId: '', title: '', type: 'Заключение', content: '' });
        fetchData();
        
      } else {
        setError(data.error || 'Ошибка создания');
      }
    } catch (error) {
      setError('Ошибка соединения');
    } finally {
      setCreatingDocument(false);
    }
  };

  const createTemplate = async (e) => {
    e.preventDefault();
    setError('');
    setCreatingTemplate(true);
    
    try {
      const res = await fetch('/api/doctor/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTemplate)
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Шаблон создан');
        setShowTemplateModal(false);
        setNewTemplate({ title: '', documentType: 'Заключение', content: '', isPublic: false });
        fetchData();
      } else {
        setError(data.error || 'Ошибка создания');
      }
    } catch (error) {
      setError('Ошибка соединения');
    } finally {
      setCreatingTemplate(false);
    }
  };

  const deleteTemplate = async (id) => {
    if (!confirm('Удалить шаблон?')) return;
    
    try {
      const res = await fetch(`/api/doctor/templates/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setSuccess('Шаблон удален');
        fetchData();
      }
    } catch (error) {
      setError('Ошибка удаления');
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Навигация */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-teal-600">Medicard Врач</h1>
              <div className="ml-10 flex space-x-4">
                <button
                  onClick={() => setActiveTab('patients')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'patients'
                      ? 'bg-teal-100 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  👥 Пациенты
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'documents'
                      ? 'bg-teal-100 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  📄 Мои документы
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.name}</span>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm"
              >
                На главную
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg" role="alert">
            {error}
            <button className="float-right" onClick={() => setError('')}>✖</button>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {success}
            <button className="float-right" onClick={() => setSuccess('')}>✖</button>
          </div>
        )}

        {/* Статистика */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-3xl font-bold text-teal-600">{stats.totalPatients}</p>
              <p className="text-gray-600">Пациентов</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-3xl font-bold text-green-600">{stats.totalDocuments}</p>
              <p className="text-gray-600">Документов</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.totalTemplates}</p>
              <p className="text-gray-600">Шаблонов</p>
            </div>
          </div>
        )}

        {/* Вкладка пациентов */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Поиск пациентов</h2>
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchPatients()}
                placeholder="ИИН, ФИО или Email"
                className="flex-1 border border-gray-300 rounded-lg p-2"
              />
              <button
                onClick={searchPatients}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600"
              >
                Найти
              </button>
            </div>
            
            <div className="space-y-3">
              {patients.map(patient => (
                <div key={patient._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{patient.name}</p>
                      <p className="text-sm text-gray-500">ИИН: {patient.iin}</p>
                      <p className="text-sm text-gray-500">Email: {patient.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPatient(patient);
                        setNewDocument({ ...newDocument, patientId: patient._id, title: `Документ для ${patient.name}` });
                        setShowDocumentModal(true);
                      }}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    >
                      Создать документ
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowRequisiteModal(true);
                      }}
                      className="text-purple-500 hover:text-purple-600"
                    >
                      🪪 Добавить реквизит
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Модальное окно создания реквизита*/}
        {showRequisiteModal && (
          <RequisiteFormModal
            isOpen={showRequisiteModal}
            onClose={() => {
              setShowRequisiteModal(false);
              setSelectedPatient(null);
            }}
            patientId={selectedPatient?._id}
            onSuccess={() => {
              setSuccess('Реквизит добавлен');
              setShowRequisiteModal(false);
              setSelectedPatient(null);
            }}
          />
        )}

        {/* Вкладка документов */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Созданные документы</h2>
            
            <div className="space-y-3">
              {documents.map(doc => (
                <div key={doc._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{doc.title}</p>
                      <p className="text-sm text-gray-500">
                        Пациент: {doc.patientId?.name} | {doc.type}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(doc.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Модальное окно создания документа */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Создание документа">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Создание документа</h3>
            
            <form onSubmit={createDocument}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Пациент
                </label>
                <input
                  type="text"
                  value={selectedPatient?.name || ''}
                  disabled
                  className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название
                </label>
                <input
                  type="text"
                  value={newDocument.title}
                  onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип документа
                </label>
                <select
                  value={newDocument.type}
                  onChange={(e) => setNewDocument({...newDocument, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="Выписка">Выписка</option>
                  <option value="Рецепт">Рецепт</option>
                  <option value="Направление">Направление</option>
                  <option value="Заключение">Заключение</option>
                  <option value="Справка">Справка</option>
                  <option value="Анализ">Анализ</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Содержание
                </label>
                <textarea
                  value={newDocument.content}
                  onChange={(e) => setNewDocument({...newDocument, content: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  rows="10"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Файл (опционально)
                </label>
                <input
                  type="file"
                  onChange={(e) => setDocumentFile(e.target.files[0])}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Если файл не выбран, документ будет сохранен как текст
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDocumentModal(false);
                    setSelectedPatient(null);
                    setNewDocument({ patientId: '', title: '', type: 'Заключение', content: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={creatingDocument}
                  className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 disabled:bg-teal-300"
                >
                  {creatingDocument ? 'Создание...' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно создания шаблона */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Создание шаблона">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Создание шаблона</h3>
            
            <form onSubmit={createTemplate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название шаблона
                </label>
                <input
                  type="text"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({...newTemplate, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип
                </label>
                <select
                  value={newTemplate.documentType}
                  onChange={(e) => setNewTemplate({...newTemplate, documentType: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="Выписка">Выписка</option>
                  <option value="Рецепт">Рецепт</option>
                  <option value="Направление">Направление</option>
                  <option value="Заключение">Заключение</option>
                  <option value="Справка">Справка</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Содержание шаблона
                </label>
                <textarea
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  rows="10"
                  placeholder="Пример: Пациент: {{name}}, ИИН: {{iin}}"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Используйте переменные: {'{{name}}'}, {'{{iin}}'}, {'{{bloodType}}'} и т.д.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={creatingTemplate}
                  className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 disabled:bg-teal-300"
                >
                  {creatingTemplate ? 'Создание...' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}