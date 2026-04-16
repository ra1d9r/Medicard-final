const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Ошибка запроса');
  }
  
  return data;
};

// Реквизиты
export const getMyRequisites = async (token) => {
  const res = await fetch('/api/requisites/my', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};

export const getPatientRequisites = async (patientId, token) => {
  const res = await fetch(`/api/requisites/patient/${patientId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};

export const createRequisite = async (patientId, data, token) => {
  const res = await fetch('/api/requisites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ patientId, data, templateId: 'cardiomonitor_template' })
  });
  return res.json();
};