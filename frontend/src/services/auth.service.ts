import api from './api';
import type { AuthResponse, User } from '@/types';

export const authService = {
  register: (username: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { username, email, password }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  me: () => api.get<{ user: User }>('/auth/me'),
};
