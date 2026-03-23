// Simple Fetch wrapper for API calls with JWT handling
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token');
  if (!token) return { 'Content-Type': 'application/json' };
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string> || {}),
  };

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Basic unauth handling. Realistically you'd want to attempt a refresh token flow here.
    localStorage.removeItem('access_token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || errorData?.quantity || 'API request failed');
  }

  // Handle 204 No Content
  if (response.status === 204) return null;

  const data = await response.json();
  
  // Unwrap DRF pagination if present
  if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
    return data.results;
  }
  
  return data;
}

// Service Hooks helpers (React Query will use these)
export const apiServices = {
  login: async (credentials: any) => {
    const res = await fetch(`${API_URL}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) throw new Error('Invalid credentials');
    return res.json();
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  
  // User Management
  getCurrentUser: () => fetchApi('/users/me/'),
  getUsers: () => fetchApi('/users/'),
  createUser: (data: any) => fetchApi('/users/', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string | number, data: any) => fetchApi(`/users/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteUser: (id: string | number) => fetchApi(`/users/${id}/`, { method: 'DELETE' }),
  getLoginLogs: () => fetchApi('/users/login_logs/'),
  getUserStats: () => fetchApi('/users/stats/'),
  updateProfile: (data: any) => fetchApi('/users/profile/', {
    method: 'PATCH',
    body: data instanceof FormData ? data : JSON.stringify(data),
  }),
  changePassword: (data: any) => fetchApi('/users/change_password/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Categories
  getCategories: () => fetchApi('/categories/'),
  createCategory: (data: any) => fetchApi('/categories/', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: number | string, data: any) => fetchApi(`/categories/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCategory: (id: number | string) => fetchApi(`/categories/${id}/`, { method: 'DELETE' }),

  // Products & Inventory
  getProducts: (params?: any) => {
    let url = '/products/';
    if (typeof params === 'string') {
      url += params ? `?search=${encodeURIComponent(params)}` : '';
    } else if (params) {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== 'ALL') {
          q.append(key, String(value));
        }
      });
      const str = q.toString();
      if (str) url += `?${str}`;
    }
    return fetchApi(url);
  },
  
  exportCatalogXlsx: async (params?: any) => {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== 'ALL' && value !== '') {
          q.append(key, String(value));
        }
      });
    }
    const qStr = q.toString();
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/products/export-catalog/xlsx/${qStr ? `?${qStr}` : ''}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Download fallito');
    return response.blob();
  },

  exportCatalogPdf: async (params?: any) => {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== 'ALL' && value !== '') {
          q.append(key, String(value));
        }
      });
    }
    const qStr = q.toString();
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/products/export-catalog/pdf/${qStr ? `?${qStr}` : ''}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Download fallito');
    return response.blob();
  },


  importCatalogXlsx: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchApi('/products/import-catalog/xlsx/', {
      method: 'POST',
      body: formData
    });
  },

  getProductById: (id: string | number) => fetchApi(`/products/${id}/`),
  createProduct: (data: any) => fetchApi('/products/', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number | string, data: any) => fetchApi(`/products/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateProductStatus: (productId: number, isActive: boolean) => fetchApi(`/products/${productId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  }),
  getAlerts: () => fetchApi('/products/alerts/'),
  getBlacklistedProducts: () => fetchApi('/products/blacklisted/'),
  blacklistProduct: (id: number | string, data: any) => fetchApi(`/products/${id}/blacklist/`, { method: 'PATCH', body: JSON.stringify(data) }),
  restoreProduct: (id: number | string) => fetchApi(`/products/${id}/restore/`, { method: 'PATCH' }),
  
  // Quarantine (Special Handlers)
  quarantineProduct: (data: any) => {
    const product_id = typeof data === 'object' ? (data.product_id || data.id) : data;
    const reason = typeof data === 'object' ? (data.reason || '') : '';
    return fetchApi('/movements/quarantine/', {
      method: 'POST',
      body: JSON.stringify({ product_id, reason }),
    });
  },
  restoreQuarantineProduct: (productId: string | number) => {
    return fetchApi(`/products/${productId}/restore-quarantine/`, {
      method: 'PATCH',
    });
  },

  // Lots
  getLots: () => fetchApi('/lots/'),
  createLot: (data: any) => fetchApi('/lots/', { method: 'POST', body: JSON.stringify(data) }),
  updateLotQuantity: (lotId: number, quantity: number) => fetchApi(`/lots/${lotId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ current_quantity: quantity }),
  }),

  // Movements
  getMovements: (params?: any) => {
    let url = '/movements/';
    if (typeof params === 'string') {
      url += params ? `?search=${encodeURIComponent(params)}` : '';
    } else if (params) {
      const q = new URLSearchParams();
      if (params.search) q.append('search', params.search);
      if (params.type && params.type !== 'ALL') q.append('movement_type', params.type);
      if (params.date && params.date !== 'all') q.append('date_filter', params.date);
      if (params.user && params.user !== 'ALL') q.append('user', params.user);
      const str = q.toString();
      if (str) url += `?${str}`;
    }
    return fetchApi(url);
  },
  createMovement: (data: any) => fetchApi('/movements/', { method: 'POST', body: JSON.stringify(data) }),
  getProductMovements: (id: string | number) => fetchApi(`/movements/?product=${id}`),
  addStock: (data: any) => fetchApi('/movements/add/', { method: 'POST', body: JSON.stringify(data) }),
  removeStock: (data: any) => fetchApi('/movements/remove/', { method: 'POST', body: JSON.stringify(data) }),

  // Suppliers
  getSuppliers: (search?: string) => fetchApi(search ? `/suppliers/?search=${encodeURIComponent(search)}` : '/suppliers/'),
  getSupplier: (id: number | string) => fetchApi(`/suppliers/${id}/`),
  createSupplier: (data: any) => fetchApi('/suppliers/', { method: 'POST', body: JSON.stringify(data) }),
  updateSupplier: (id: number | string, data: any) => fetchApi(`/suppliers/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),

  exportSupplierCatalogXlsx: async (id: string | number) => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/suppliers/${id}/export-catalog/xlsx/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Download fallito');
    return response.blob();
  },

  exportSupplierCatalogPdf: async (id: string | number) => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/suppliers/${id}/export-catalog/pdf/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Download fallito');
    return response.blob();
  },

  // Logs & Tools

  getAuditLogs: (paramsString?: string) => fetchApi(`/audit-log/${paramsString ? `?${paramsString}` : ''}`),
  askChatbot: (data: any) => fetchApi('/chatbot/ask/', { method: 'POST', body: JSON.stringify(data) }),
};

