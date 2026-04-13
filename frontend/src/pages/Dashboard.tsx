import { useState } from 'react';
import {
  Plus,
  LogOut,
  Terminal,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTodos } from '@/hooks/useTodos';
import { TodoList } from '@/components/TodoList';
import { CreateTodoModal } from '@/components/CreateTodoModal';
import { ThemeSelector } from '@/components/ThemeSelector';
import type { Priority, Todo, TodoFilters } from '@/types';

type FilterTab = 'all' | 'pending' | 'done';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<FilterTab>('all');
  const [priority, setPriority] = useState<Priority | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);

  const filters: TodoFilters = {
    ...(tab === 'pending' && { completed: false }),
    ...(tab === 'done' && { completed: true }),
    ...(priority !== 'all' && { priority }),
  };

  const { todos, loading, createTodo, updateTodo, toggleTodo, deleteTodo } =
    useTodos(filters);

  const stats = {
    total: todos.length,
    done: todos.filter((t: Todo) => t.completed).length,
    pending: todos.filter((t: Todo) => !t.completed).length,
    high: todos.filter((t: Todo) => t.priority === 'high' && !t.completed)
      .length,
  };

  return (
    <div className="min-h-screen cyber-grid scanline">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-base-300 bg-base-100/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded border border-primary/50 flex items-center justify-center">
              <Terminal size={14} className="text-primary" />
            </div>
            <div>
              <span className="font-mono text-xs text-primary/60 tracking-widest">
                TODO_SYS
              </span>
              <p className="font-bold text-sm leading-none">{user?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSelector className="hidden sm:flex" />
            <button
              onClick={logout}
              className="btn btn-ghost btn-sm gap-2 font-mono text-xs text-base-content/60 hover:text-error"
            >
              <LogOut size={14} />
              EXIT
            </button>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-3 sm:hidden">
          <ThemeSelector className="w-full justify-between" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 animate-fadeInUp">
          {[
            {
              label: 'TOTAL',
              value: stats.total,
              icon: <Filter size={14} />,
              color: 'text-base-content/60',
            },
            {
              label: 'PENDING',
              value: stats.pending,
              icon: <Clock size={14} />,
              color: 'text-warning',
            },
            {
              label: 'DONE',
              value: stats.done,
              icon: <CheckCircle size={14} />,
              color: 'text-secondary',
            },
            {
              label: 'URGENT',
              value: stats.high,
              icon: <AlertCircle size={14} />,
              color: 'text-error',
            },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="cyber-card rounded-lg p-3 text-center">
              <div
                className={`flex items-center justify-center gap-1 mb-1 ${color}`}
              >
                {icon}
                <span className="font-mono text-[10px] tracking-widest">
                  {label}
                </span>
              </div>
              <p className={`text-2xl font-black font-mono ${color}`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {stats.total > 0 && (
          <div className="mb-8 animate-fadeInUp delay-100">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-xs text-base-content/30 tracking-widest">
                PROGRESSION
              </span>
              <span className="font-mono text-xs text-secondary">
                {Math.round((stats.done / stats.total) * 100)}%
              </span>
            </div>
            <div className="h-1.5 bg-base-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700"
                style={{ width: `${(stats.done / stats.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 animate-fadeInUp delay-200">
          {/* Tabs */}
          <div className="flex bg-base-200 rounded-lg p-1 gap-1">
            {(['all', 'pending', 'done'] as FilterTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded font-mono text-xs tracking-widest transition-all
                  ${
                    tab === t
                      ? 'bg-primary text-primary-content font-bold'
                      : 'text-base-content/40 hover:text-base-content'
                  }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <select
            className="select select-sm bg-base-200 border-0 font-mono text-xs text-base-content/60"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority | 'all')}
          >
            <option value="all">ALL PRIORITIES</option>
            <option value="high">🔴 HIGH</option>
            <option value="medium">🟡 MEDIUM</option>
            <option value="low">🔵 LOW</option>
          </select>

          {/* Create button */}
          <button
            onClick={() => setModalOpen(true)}
            className="btn btn-primary btn-sm ml-auto gap-2 font-mono text-xs tracking-widest"
          >
            <Plus size={14} />
            NEW TASK
          </button>
        </div>

        {/* List */}
        <div className="animate-fadeInUp delay-300">
          <TodoList
            todos={todos}
            loading={loading}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onUpdate={updateTodo}
          />
        </div>
      </main>

      {/* Modal */}
      <CreateTodoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={createTodo}
      />
    </div>
  );
}
