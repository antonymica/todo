import api from './api';
import type {
  Todo,
  TodoFilters,
  CreateTodoPayload,
  UpdateTodoPayload,
} from '@/types';

export const todoService = {
  getAll: (filters?: TodoFilters) =>
    api.get<{ todos: Todo[] }>('/todos/', { params: filters }),

  create: (payload: CreateTodoPayload) =>
    api.post<{ todo: Todo }>('/todos/', payload),

  update: (id: number, payload: UpdateTodoPayload) =>
    api.patch<{ todo: Todo }>(`/todos/${id}`, payload),

  toggle: (id: number) => api.patch<{ todo: Todo }>(`/todos/${id}/toggle`),

  delete: (id: number) => api.delete(`/todos/${id}`),
};
