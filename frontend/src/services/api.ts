import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor para manejar errores y refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Limpiar tokens y redirigir al login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== AUTH ====================

export const authService = {
  async login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  async register(name: string, email: string, password: string) {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  },

  async refresh(refreshToken: string) {
    const { data } = await api.post('/auth/refresh', { refreshToken });
    return data;
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};

// ==================== GROUPS ====================

export const groupService = {
  async getMyGroups() {
    const { data } = await api.get('/groups');
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get(`/groups/${id}`);
    return data;
  },

  async create(name: string) {
    const { data } = await api.post('/groups', { name });
    return data;
  },

  async join(inviteCode: string) {
    const { data } = await api.post('/groups/join', { inviteCode });
    return data;
  },

  async getByInviteCode(code: string) {
    const { data } = await api.get(`/groups/invite/${code}`);
    return data;
  },

  async leave(id: string) {
    const { data } = await api.delete(`/groups/${id}/leave`);
    return data;
  },

  async delete(id: string) {
    const { data } = await api.delete(`/groups/${id}`);
    return data;
  },
};

// ==================== GUEST MEMBERS (Participantes manuales) ====================

export const guestService = {
  async getByGroupId(groupId: string) {
    const { data } = await api.get(`/groups/${groupId}/guests`);
    return data;
  },

  async create(groupId: string, name: string) {
    const { data } = await api.post(`/groups/${groupId}/guests`, { name });
    return data;
  },

  async delete(groupId: string, guestId: string) {
    const { data } = await api.delete(`/groups/${groupId}/guests/${guestId}`);
    return data;
  },
};

// ==================== EVENTS ====================

export const eventService = {
  async getByGroupId(groupId: string) {
    const { data } = await api.get(`/events/group/${groupId}`);
    return data;
  },

  async getById(eventId: string) {
    const { data } = await api.get(`/events/${eventId}`);
    return data;
  },

  async create(groupId: string, event: { name: string; type: 'GIFT' | 'GATHERING'; date: string; giftRecipientId?: string; giftRecipientGuestId?: string }) {
    const { data } = await api.post(`/events/group/${groupId}`, event);
    return data;
  },

  async settle(eventId: string) {
    const { data } = await api.post(`/events/${eventId}/settle`);
    return data;
  },

  async delete(eventId: string) {
    const { data } = await api.delete(`/events/${eventId}`);
    return data;
  },
};

// ==================== EXPENSES ====================

export const expenseService = {
  async getByEventId(eventId: string) {
    const { data } = await api.get(`/expenses/event/${eventId}`);
    return data;
  },

  async create(eventId: string, expense: { 
    amount: number; 
    description: string; 
    paidById?: string;
    paidByGuestId?: string;
    participantIds?: string[];
    guestParticipantIds?: string[];
  }) {
    const { data } = await api.post(`/expenses/event/${eventId}`, expense);
    return data;
  },

  async update(expenseId: string, expense: { amount?: number; description?: string; participantIds?: string[] }) {
    const { data } = await api.put(`/expenses/${expenseId}`, expense);
    return data;
  },

  async delete(expenseId: string) {
    const { data } = await api.delete(`/expenses/${expenseId}`);
    return data;
  },

  async getEventDebts(eventId: string) {
    const { data } = await api.get(`/expenses/event/${eventId}/debts`);
    return data;
  },

  async getOptimalSettlement(eventId: string) {
    const { data } = await api.get(`/expenses/event/${eventId}/settlement`);
    return data;
  },

  async markDebtAsPaid(debtId: string, eventId?: string) {
    const { data } = await api.post(`/expenses/debt/${debtId}/pay`, { eventId });
    return data;
  },

  async getUserBalance() {
    const { data } = await api.get('/expenses/balance/me');
    return data;
  },
};

// ==================== BANK ALIASES ====================

export const bankAliasService = {
  async getMyAliases() {
    const { data } = await api.get('/bank-aliases');
    return data;
  },

  async getUserAliases(userId: string) {
    const { data } = await api.get(`/bank-aliases/user/${userId}`);
    return data;
  },

  async create(alias: string, bankName?: string, priority: number = 1) {
    const { data } = await api.post('/bank-aliases', { alias, bankName, priority });
    return data;
  },

  async update(aliasId: string, updates: { alias?: string; bankName?: string; priority?: number }) {
    const { data } = await api.put(`/bank-aliases/${aliasId}`, updates);
    return data;
  },

  async delete(aliasId: string) {
    const { data } = await api.delete(`/bank-aliases/${aliasId}`);
    return data;
  },
};

