import axios from 'axios';

// Dynamically determine the API Base URL
let API_BASE_URL = 'http://127.0.0.1:8000/api/';

if (typeof window !== 'undefined') {
  const savedUrl = localStorage.getItem('pcos_api_url');
  if (savedUrl) {
    API_BASE_URL = savedUrl;
  } else if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Default production fallback for Render deployment
    API_BASE_URL = 'https://pcos-companion-backend.onrender.com/api/';
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Auth Token if present
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pcos_auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Token ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Unauthorized requests (logouts)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pcos_auth_token');
        // Let application components know session has expired
        window.dispatchEvent(new Event('auth_session_expired'));
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: any) => {
    const res = await api.post('auth/login/', credentials);
    if (res.data.token) {
      localStorage.setItem('pcos_auth_token', res.data.token);
      localStorage.setItem('pcos_username', res.data.username);
      if (res.data.is_superuser) {
        localStorage.setItem('pcos_is_superuser', 'true');
      } else {
        localStorage.removeItem('pcos_is_superuser');
      }
    }
    return res.data;
  },
  superuserLogin: async (credentials: any) => {
    const res = await api.post('auth/superuser/login/', credentials);
    if (res.data.token) {
      localStorage.setItem('pcos_auth_token', res.data.token);
      localStorage.setItem('pcos_username', res.data.username);
      localStorage.setItem('pcos_is_superuser', 'true');
    }
    return res.data;
  },
  logout: async () => {
    try {
      await api.post('auth/logout/');
    } finally {
      localStorage.removeItem('pcos_auth_token');
      localStorage.removeItem('pcos_username');
      localStorage.removeItem('pcos_is_superuser');
    }
  },
  getProfile: async () => {
    const res = await api.get('auth/me/');
    return res.data;
  },
  updateProfile: async (data: any) => {
    const res = await api.put('auth/me/', data);
    return res.data;
  },
  getFeatures: async () => {
    const res = await api.get('auth/features/');
    return res.data;
  },
  // Superuser CRUD - Users
  superuserGetUsers: async () => {
    const res = await api.get('auth/superuser/users/');
    return res.data;
  },
  superuserCreateUser: async (data: any) => {
    const res = await api.post('auth/superuser/users/', data);
    return res.data;
  },
  superuserUpdateUser: async (id: number, data: any) => {
    const res = await api.put(`auth/superuser/users/${id}/`, data);
    return res.data;
  },
  superuserDeleteUser: async (id: number) => {
    await api.delete(`auth/superuser/users/${id}/`);
  },
  // Superuser CRUD - Features
  superuserGetFeatures: async () => {
    const res = await api.get('auth/superuser/features/');
    return res.data;
  },
  superuserUpdateFeature: async (id: number, data: any) => {
    const res = await api.put(`auth/superuser/features/${id}/`, data);
    return res.data;
  },
  // Superuser CRUD - Meals
  superuserGetMeals: async () => {
    const res = await api.get('auth/superuser/meals/');
    return res.data;
  },
  superuserCreateMeal: async (data: any) => {
    const res = await api.post('auth/superuser/meals/', data);
    return res.data;
  },
  superuserUpdateMeal: async (id: number, data: any) => {
    const res = await api.put(`auth/superuser/meals/${id}/`, data);
    return res.data;
  },
  superuserDeleteMeal: async (id: number) => {
    await api.delete(`auth/superuser/meals/${id}/`);
  },
  // Superuser CRUD - Routines
  superuserGetRoutines: async () => {
    const res = await api.get('auth/superuser/routines/');
    return res.data;
  },
  superuserCreateRoutine: async (data: any) => {
    const res = await api.post('auth/superuser/routines/', data);
    return res.data;
  },
  superuserUpdateRoutine: async (id: number, data: any) => {
    const res = await api.put(`auth/superuser/routines/${id}/`, data);
    return res.data;
  },
  superuserDeleteRoutine: async (id: number) => {
    await api.delete(`auth/superuser/routines/${id}/`);
  },
};

export const wellnessService = {
  getDashboard: async () => {
    const res = await api.get('wellness/dashboard/');
    return res.data;
  },
  getHabitsByDate: async (dateStr: string) => {
    const res = await api.get(`wellness/habits/by_date/?date=${dateStr}`);
    return res.data;
  },
  updateHabitLog: async (id: number, data: any) => {
    const res = await api.patch(`wellness/habits/${id}/`, data);
    return res.data;
  },
  getSymptomLogs: async () => {
    const res = await api.get('wellness/symptoms/');
    return res.data;
  },
  logSymptom: async (data: any) => {
    const res = await api.post('wellness/symptoms/', data);
    return res.data;
  },
  deleteSymptom: async (id: number) => {
    await api.delete(`wellness/symptoms/${id}/`);
  },
  getCycleLogs: async () => {
    const res = await api.get('wellness/cycles/');
    return res.data;
  },
  logCycle: async (data: any) => {
    const res = await api.post('wellness/cycles/', data);
    return res.data;
  },
  deleteCycleLog: async (id: number) => {
    await api.delete(`wellness/cycles/${id}/`);
  },
  getCyclePredictions: async () => {
    const res = await api.get('wellness/cycles/predictions/');
    return res.data;
  },
};

export const contentService = {
  getMealsToday: async () => {
    const res = await api.get('content/meals/today/');
    return res.data;
  },
  getWeeklyMeals: async (weekNum?: number) => {
    const url = weekNum ? `content/meals/weekly_plan/?week=${weekNum}` : 'content/meals/weekly_plan/';
    const res = await api.get(url);
    return res.data;
  },
  getRoutines: async (category?: string) => {
    const url = category ? `content/routines/?category=${category}` : 'content/routines/';
    const res = await api.get(url);
    return res.data;
  },
  getResources: async (category?: string) => {
    const url = category ? `content/resources/?category=${category}` : 'content/resources/';
    const res = await api.get(url);
    return res.data;
  },
  getQuoteToday: async () => {
    const res = await api.get('content/quotes/today/');
    return res.data;
  },
};

export const chatService = {
  getSessions: async () => {
    const res = await api.get('chat/sessions/');
    return res.data;
  },
  createSession: async (title = 'New Chat') => {
    const res = await api.post('chat/sessions/', { title });
    return res.data;
  },
  getSessionDetail: async (id: string) => {
    const res = await api.get(`chat/sessions/${id}/`);
    return res.data;
  },
  deleteSession: async (id: string) => {
    await api.delete(`chat/sessions/${id}/`);
  },
  sendMessage: async (sessionId: string, content: string) => {
    const res = await api.post(`chat/sessions/${sessionId}/send_message/`, { content });
    return res.data;
  },
};

export { API_BASE_URL };
export default api;
