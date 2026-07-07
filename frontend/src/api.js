const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Return custom error object
      const errorMsg = data.message || (data.errors && data.errors.map(e => e.msg).join(', ')) || 'Something went wrong';
      const error = new Error(errorMsg);
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    // Pass errors along
    if (!error.status) {
      // Network error
      console.error('Network Error:', error);
      throw new Error('Unable to connect to the server. Please ensure the backend is running.');
    }
    throw error;
  }
}

export const api = {
  auth: {
    login: (email, password) => 
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),
    signup: (email, password) => 
      request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
  },
  applications: {
    getAll: (status, search, sort) => {
      const queryParams = [];
      if (status && status !== 'All') {
        queryParams.push(`status=${encodeURIComponent(status)}`);
      }
      if (search) {
        queryParams.push(`search=${encodeURIComponent(search)}`);
      }
      if (sort) {
        queryParams.push(`sort=${encodeURIComponent(sort)}`);
      }
      
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      return request(`/applications${queryString}`, { method: 'GET' });
    },
    getStats: () => 
      request('/applications/stats/summary', { method: 'GET' }),
    create: (data) => 
      request('/applications', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (id, data) => 
      request(`/applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    delete: (id) => 
      request(`/applications/${id}`, { method: 'DELETE' })
  }
};
