export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface TodoFilters {
  completed?: boolean;
  priority?: Priority;
}

export interface CreateTodoPayload {
  title: string;
  description?: string;
  priority?: Priority;
  due_date?: string | null;
}

export interface UpdateTodoPayload {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  due_date?: string | null;
}
