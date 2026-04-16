import React, { useState } from 'react';

const RequisiteFormModal = ({ isOpen, onClose, patientId, onSuccess }) => {
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    birthDate: '',
    serialNumber: '',
    issueDate: '',
    implantDate: '',
    givenDate: '',
    modelNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState('cardiomonitor');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.lastName.trim()) newErrors.lastName = 'Введите фамилию';
    if (!formData.firstName.trim()) newErrors.firstName = 'Введите имя';
    
    if (selectedTemplate === 'cardiomonitor') {
      if (!formData.birthDate) newErrors.birthDate = 'Укажите дату рождения';
      if (!formData.issueDate) newErrors.issueDate = 'Укажите дату выдачи';
      if (!formData.serialNumber) {
        newErrors.serialNumber = 'Введите серийный номер';
      } else if (!/^\d+$/.test(formData.serialNumber)) {
        newErrors.serialNumber = 'Только цифры';
      }
    }
    
    if (selectedTemplate === 'neurostimulator') {
      if (!formData.implantDate) newErrors.implantDate = 'Укажите дату имплантации';
      if (!formData.givenDate) newErrors.givenDate = 'Укажите дату выдачи';
      if (!formData.serialNumber) {
        newErrors.serialNumber = 'Введите серийный номер';
      } else if (!/^\d+$/.test(formData.serialNumber)) {
        newErrors.serialNumber = 'Только цифры';
      }
      if (!formData.modelNumber) newErrors.modelNumber = 'Введите Model Number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const getTemplateId = () => {
        if (selectedTemplate === 'cardiomonitor') {
          return '69ce61713077213ef24b62ac';
        }
        if (selectedTemplate === 'neurostimulator') {
          return '69cea6da3c270e52e02da115';
        }
        throw new Error(`Неизвестный тип шаблона: ${selectedTemplate}`);
      };
      
      const templateId = getTemplateId();
      
      // Подготовка данных в зависимости от типа
      let dataToSend = {};
      if (selectedTemplate === 'cardiomonitor') {
        dataToSend = {
          lastName: formData.lastName,
          firstName: formData.firstName,
          birthDate: formData.birthDate,
          serialNumber: formData.serialNumber,
          issueDate: formData.issueDate
        };
      } else {
        dataToSend = {
          lastName: formData.lastName,
          firstName: formData.firstName,
          implantDate: formData.implantDate,
          givenDate: formData.givenDate,
          serialNumber: formData.serialNumber,
          modelNumber: formData.modelNumber
        };
      }
      
      const response = await fetch('/api/requisites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId,
          templateId: templateId,
          templateType: selectedTemplate, 
          data: dataToSend
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onSuccess?.(data.requisite);
        onClose();
        setFormData({
          lastName: '',
          firstName: '',
          birthDate: '',
          serialNumber: '',
          issueDate: '',
          implantDate: '',
          givenDate: '',
          modelNumber: ''
        });
      } else {
        alert(data.error || 'Ошибка создания реквизита');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const renderFields = () => {
    if (selectedTemplate === 'cardiomonitor') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия <span className="text-red-500">*</span></label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Имя <span className="text-red-500">*</span></label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата рождения <span className="text-red-500">*</span></label>
            <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" />
            {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Серийный номер <span className="text-red-500">*</span></label>
            <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" placeholder="только цифры" />
            {errors.serialNumber && <p className="text-red-500 text-xs mt-1">{errors.serialNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата выдачи <span className="text-red-500">*</span></label>
            <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" />
            {errors.issueDate && <p className="text-red-500 text-xs mt-1">{errors.issueDate}</p>}
          </div>
        </>
      );
    }
    
    if (selectedTemplate === 'neurostimulator') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия <span className="text-red-500">*</span></label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Имя <span className="text-red-500">*</span></label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата имплантации <span className="text-red-500">*</span></label>
            <input type="date" name="implantDate" value={formData.implantDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" />
            {errors.implantDate && <p className="text-red-500 text-xs mt-1">{errors.implantDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата выдачи <span className="text-red-500">*</span></label>
            <input type="date" name="givenDate" value={formData.givenDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" />
            {errors.givenDate && <p className="text-red-500 text-xs mt-1">{errors.givenDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Серийный номер <span className="text-red-500">*</span></label>
            <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" placeholder="только цифры" />
            {errors.serialNumber && <p className="text-red-500 text-xs mt-1">{errors.serialNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model Number <span className="text-red-500">*</span></label>
            <input type="text" name="modelNumber" value={formData.modelNumber} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" />
            {errors.modelNumber && <p className="text-red-500 text-xs mt-1">{errors.modelNumber}</p>}
          </div>
        </>
      );
    }
    
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Добавить реквизит</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип реквизита <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="cardiomonitor">📟 Паспорт кардиомонитора CONFIRM Rx</option>
              <option value="neurostimulator">🧠 Паспорт нейростимулятора Medtronic</option>
            </select>
          </div>
          
          {renderFields()}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50" disabled={loading}>Отмена</button>
            <button type="submit" disabled={loading} className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 disabled:bg-teal-300">{loading ? 'Сохранение...' : 'Сохранить'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequisiteFormModal;