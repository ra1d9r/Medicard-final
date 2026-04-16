import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    iin: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Добавьте после других useState
  const [deletingDoctorId, setDeletingDoctorId] = useState(null);
  const [addingDoctor, setAddingDoctor] = useState(false);
  const [changingRoleId, setChangingRoleId] = useState(null);

  // Проверка роли
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, doctorsRes, statsRes] = await Promise.all([
        fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/doctors', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      const usersData = await usersRes.json();
      const doctorsData = await doctorsRes.json();
      const statsData = await statsRes.json();
      
      if (usersRes.ok) setUsers(usersData.users);
      if (doctorsRes.ok) setDoctors(doctorsData.doctors);
      if (statsRes.ok) setStats(statsData.stats);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAddingDoctor(true);
    
    try {
      const res = await fetch('/api/admin/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newDoctor)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Врач успешно добавлен');
        setShowAddDoctorModal(false);
        setNewDoctor({ iin: '', email: '', password: '' });
        fetchData();
      } else {
        setError(data.error || 'Ошибка добавления врача');
      }
    } catch (error) {
      setError('Ошибка соединения с сервером');
    } finally {
      setAddingDoctor(false);
    }
  };

  const handleRemoveDoctor = async (doctorId, doctorName) => {
    if (!confirm(`Вы уверены, что хотите снять роль врача с ${doctorName}?`)) return;
    
    setDeletingDoctorId(doctorId);
    try {
      const res = await fetch(`/api/admin/doctors/${doctorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setSuccess('Роль врача снята');
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Ошибка');
      }
    } catch (error) {
      setError('Ошибка соединения с сервером');
    } finally {
      setDeletingDoctorId(null);
    }
  };

    const handleChangeRole = async (userId, newRole) => {
    setChangingRoleId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (res.ok) {
        setSuccess('Роль изменена');
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Ошибка');
      }
    } catch (error) {
      setError('Ошибка соединения с сервером');
    } finally {
      setChangingRoleId(null);
    }
  };

  if (loading) {
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
              <h1 className="text-2xl font-bold text-teal-600">Medicard Admin</h1>
              <div className="ml-10 flex space-x-4">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'users'
                      ? 'bg-teal-100 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  👥 Пользователи
                </button>
                <button
                  onClick={() => setActiveTab('doctors')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'doctors'
                      ? 'bg-teal-100 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  👨‍⚕️ Врачи
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'stats'
                      ? 'bg-teal-100 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  📊 Статистика
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">{user?.name}</span>
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

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Все пользователи</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Имя</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ИИН</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Роль</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(userItem => (
                    <tr key={userItem._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{userItem.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{userItem.iin}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{userItem.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          userItem.role === 'admin' ? 'bg-red-100 text-red-700' :
                          userItem.role === 'doctor' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {userItem.role === 'admin' ? 'Админ' : 
                           userItem.role === 'doctor' ? 'Врач' : 'Пользователь'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {userItem.role !== 'admin' && (
                          <select
                            onChange={(e) => handleChangeRole(userItem._id, e.target.value)}
                            value={userItem.role}
                            disabled={changingRoleId === userItem._id}
                            className="text-sm border rounded p-1 disabled:opacity-50"
                          >
                            <option value="user">Пользователь</option>
                            <option value="doctor">Врач</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Врачи</h2>
              <button
                onClick={() => setShowAddDoctorModal(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                + Добавить врача
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Имя</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ИИН</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {doctors.map(doctor => (
                    <tr key={doctor._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{doctor.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{doctor.iin}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{doctor.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleRemoveDoctor(doctor._id, doctor.name)}
                          disabled={deletingDoctorId === doctor._id}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          {deletingDoctorId === doctor._id ? '⏳' : 'Снять роль'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-3xl font-bold text-teal-600">{stats.totalUsers}</p>
              <p className="text-gray-600 mt-2">Всего пользователей</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-3xl font-bold text-green-600">{stats.totalDoctors}</p>
              <p className="text-gray-600 mt-2">Врачей</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.totalAdmins}</p>
              <p className="text-gray-600 mt-2">Администраторов</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-3xl font-bold text-orange-600">{stats.totalPatients}</p>
              <p className="text-gray-600 mt-2">Пациентов</p>
            </div>
          </div>
        )}
      </main>

      {/* Модальное окно добавления врача */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Добавление врача">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Добавление врача</h3>
            
            <form onSubmit={handleAddDoctor}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ИИН <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newDoctor.iin}
                  onChange={(e) => setNewDoctor({...newDoctor, iin: e.target.value.replace(/\D/g, '').slice(0, 12)})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="12 цифр"
                  required
                  maxLength={12}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newDoctor.email}
                  onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="email@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Если пользователь не существует, email обязателен
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль
                </label>
                <input
                  type="password"
                  value={newDoctor.password}
                  onChange={(e) => setNewDoctor({...newDoctor, password: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="Минимум 6 символов"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Если пользователь не существует, пароль обязателен
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddDoctorModal(false);
                    setNewDoctor({ iin: '', email: '', password: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"               
                  disabled={addingDoctor}
                  className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 disabled:bg-teal-300"
                >
                  {addingDoctor ? 'Добавление...' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}