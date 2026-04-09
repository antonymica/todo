import { useState, useEffect, useCallback } from 'react';
import { todoService } from '@/services/todo.service';
import type {
  Todo,
  TodoFilters,
  CreateTodoPayload,
  UpdateTodoPayload,
} from '@/types';
import toast from 'react-hot-toast';

export const useTodos = (filters?: TodoFilters) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await todoService.getAll(filters);
      setTodos(data.todos);
    } catch {
      toast.error('Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  }, [filters?.completed, filters?.priority]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const createTodo = async (payload: CreateTodoPayload): Promise<void> => {
    const { data } = await todoService.create(payload);
    setTodos((prev) => [data.todo, ...prev]);
    toast.success('Tâche créée !');
  };

  const updateTodo = async (id: number, payload: UpdateTodoPayload) => {
    const { data } = await todoService.update(id, payload);
    setTodos((prev) => prev.map((t) => (t.id === id ? data.todo : t)));
    return data.todo;
  };

  const toggleTodo = async (id: number) => {
    const { data } = await todoService.toggle(id);
    setTodos((prev) => prev.map((t) => (t.id === id ? data.todo : t)));
  };

  const deleteTodo = async (id: number) => {
    await todoService.delete(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
    toast.success('Tâche supprimée');
  };

  return {
    todos,
    loading,
    fetchTodos,
    createTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
  };
};
