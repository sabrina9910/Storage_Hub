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
  
  getCurrentUser: () => fetchApi('/users/me/'),
  
  updateProfile: (data: any) => fetchApi('/users/update_profile/', {
    method: 'PATCH',
    body: data instanceof FormData ? data : JSON.stringify(data),
  }),

  changePassword: (data: any) => fetchApi('/users/change_password/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getUserStats: () => fetchApi('/users/stats/'),
  
  getUsers: () => fetchApi('/users/'),

  updateUser: (id: string | number, data: any) => fetchApi(`/users/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  deleteUser: (id: string | number) => fetchApi(`/users/${id}/`, {
    method: 'DELETE',
  }),
  
  getProducts: (params?: any) => {
    let url = '/products/';
    if (typeof params === 'string') {
      url += params ? `?search=${encodeURIComponent(params)}` : '';
    } else if (params) {
      const q = new URLSearchParams();
      if (params.search) q.append('search', params.search);
      if (params.category && params.category !== 'ALL') q.append('category', params.category);
      if (params.status && params.status !== 'ALL') q.append('status', params.status);
      const str = q.toString();
      if (str) url += `?${str}`;
    }
    return fetchApi(url);
  },
  
  getProductById: (id: string | number) => fetchApi(`/products/${id}/`),
  
  getProductMovements: (id: string | number) => fetchApi(`/movements/?product=${id}`),
  
  quarantineProduct: (data: any) => {
    const id = typeof data === 'object' ? (data.product_id || data.id) : data;
    return fetchApi(`/products/${id}/quarantine/`, {
      method: 'POST',
      body: typeof data === 'object' ? JSON.stringify(data) : undefined,
    });
  },
  
  getCategories: () => fetchApi('/categories/'),
  
  createCategory: (data: any) => fetchApi('/categories/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  updateCategory: (id: number | string, data: any) => fetchApi(`/categories/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  deleteCategory: (id: number | string) => fetchApi(`/categories/${id}/`, {
    method: 'DELETE',
  }),

  createProduct: (data: any) => fetchApi('/products/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getAlerts: () => fetchApi('/products/alerts/'),
  
  getLots: () => fetchApi('/lots/'),
  
  createLot: (data: any) => fetchApi('/lots/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  updateLotQuantity: (lotId: number, quantity: number) => fetchApi(`/lots/${lotId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ current_quantity: quantity }),
  }),

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
  
  createMovement: (data: any) => fetchApi('/movements/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getSuppliers: (search?: string) => fetchApi(search ? `/suppliers/?search=${encodeURIComponent(search)}` : '/suppliers/'),
  
  createSupplier: (data: any) => fetchApi('/suppliers/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  updateProductStatus: (productId: number, isActive: boolean) => fetchApi(`/products/${productId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  }),
  
  // Newly added missing methods:
  getRecentAuditLogs: (limit?: number) => fetchApi(`/audit-log/${limit ? `?limit=${limit}` : ''}`),
  askChatbot: (data: any) => fetchApi('/chatbot/ask/', { method: 'POST', body: JSON.stringify(data) }),
  getAuditLogs: (paramsString?: string) => fetchApi(`/audit-log/${paramsString ? `?${paramsString}` : ''}`),
  getBlacklistedProducts: () => fetchApi('/products/blacklisted/'),
  restoreProduct: (id: number | string) => fetchApi(`/products/${id}/restore/`, { method: 'PATCH' }),
  blacklistProduct: (id: number | string, data: any) => fetchApi(`/products/${id}/blacklist/`, { method: 'PATCH', body: JSON.stringify(data) }),
  addStock: (data: any) => fetchApi('/movements/add/', { method: 'POST', body: JSON.stringify(data) }),
  removeStock: (data: any) => fetchApi('/movements/remove/', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => fetchApi('/users/me/'),
  getSupplier: (id: number | string) => fetchApi(`/suppliers/${id}/`),
  updateSupplier: (id: number | string, data: any) => fetchApi(`/suppliers/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  getLoginLogs: () => fetchApi('/users/login_logs/'),
  createUser: (data: any) => fetchApi('/users/', { method: 'POST', body: JSON.stringify(data) }),
};
