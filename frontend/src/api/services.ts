import api from './client';

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'employee';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Flower {
  id: number;
  name: string;
  purchase_price: string;
  markup_percent: string;
  stock_quantity: number;
}

export interface Paginated<T> {
  total: number;
  offset: number;
  limit: number;
  items: T[];
}

export interface BouquetItem {
  id: number;
  flower_id: number;
  quantity: number;
  cost_per_unit: string;
  sale_price_per_unit: string;
  total_cost: string;
  total_price: string;
  total_profit: string;
}

export interface Bouquet {
  id: number;
  total_cost: string;
  total_price: string;
  total_profit: string;
  created_at: string;
  items: BouquetItem[];
}

export interface ReportsResponse {
  period_start: string;
  period_end: string;
  total_bouquets: number;
  total_income: string;
  total_cost: string;
  total_profit: string;
}

export const authApi = {
  login: async (credentials: any): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },
};

export const flowersApi = {
  list: async (): Promise<Paginated<Flower>> => {
    const { data } = await api.get('/flowers?limit=1000');
    return data;
  },
  create: async (payload: any): Promise<Flower> => {
    const { data } = await api.post('/flowers', payload);
    return data;
  },
  update: async (id: number, payload: any): Promise<Flower> => {
    const { data } = await api.put(`/flowers/${id}`, payload);
    return data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/flowers/${id}`);
  },
};

export const bouquetsApi = {
  list: async (): Promise<Paginated<Bouquet>> => {
    const { data } = await api.get('/bouquets?limit=1000');
    return data;
  },
  create: async (payload: any): Promise<Bouquet> => {
    const { data } = await api.post('/bouquets', payload);
    return data;
  },
};

export const reportsApi = {
  get: async (period: string = 'today'): Promise<ReportsResponse> => {
    const { data } = await api.get(`/reports?period=${period}`);
    return data;
  },
};
