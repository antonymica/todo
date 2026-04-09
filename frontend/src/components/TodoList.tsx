import { TodoItem } from './TodoItem';
import type { Todo, Priority } from '@/types';
import { ClipboardList } from 'lucide-react';

interface Props {
  todos: Todo[];
  loading: boolean;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (
    id: number,
    payload: { title?: string; description?: string; priority?: Priority },
  ) => void;
}

export const TodoList = ({
  todos,
  loading,
  onToggle,
  onDelete,
  onUpdate,
}: Props) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="cyber-card rounded-lg p-4 animate-pulse">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded bg-base-300" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-base-300 rounded w-3/4" />
                <div className="h-3 bg-base-300 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-full border border-base-300 flex items-center justify-center">
          <ClipboardList size={28} className="text-base-content/20" />
        </div>
        <p className="text-base-content/30 font-mono text-sm tracking-widest">
          NO TASKS FOUND
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {todos.map((todo, i) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          index={i}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
};
