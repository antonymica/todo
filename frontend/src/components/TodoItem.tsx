import { useState } from 'react';
import {
  Check,
  Trash2,
  Pencil,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  Calendar,
} from 'lucide-react';
import type { Todo, Priority } from '@/types';

interface Props {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (
    id: number,
    payload: { title?: string; description?: string; priority?: Priority },
  ) => void;
  index: number;
}

const priorityConfig = {
  high: { label: 'HIGH', className: 'priority-high' },
  medium: { label: 'MED', className: 'priority-medium' },
  low: { label: 'LOW', className: 'priority-low' },
};

export const TodoItem = ({
  todo,
  onToggle,
  onDelete,
  onUpdate,
  index,
}: Props) => {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDesc, setEditDesc] = useState(todo.description ?? '');
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority);

  const handleSave = () => {
    if (!editTitle.trim()) return;
    onUpdate(todo.id, {
      title: editTitle,
      description: editDesc,
      priority: editPriority,
    });
    setEditing(false);
  };

  const pCfg = priorityConfig[todo.priority as Priority];
  const delay = `delay-${Math.min(index * 100, 300)}`;

  return (
    <div
      className={`cyber-card rounded-lg p-4 animate-fadeInUp ${delay} ${todo.completed ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(todo.id)}
          className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all duration-300
            ${
              todo.completed
                ? 'bg-secondary border-secondary text-secondary-content'
                : 'border-base-content/20 hover:border-primary'
            }`}
        >
          {todo.completed && <Check size={12} strokeWidth={3} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex flex-col gap-2">
              <input
                className="input input-sm w-full bg-base-300 border-primary/50 font-mono text-sm"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                autoFocus
              />
              <textarea
                className="textarea textarea-sm w-full bg-base-300 border-base-300 font-mono text-sm resize-none"
                rows={2}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Description..."
              />
              <select
                className="select select-sm bg-base-300 border-base-300 font-mono text-sm w-32"
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as Priority)}
              >
                <option value="low">LOW</option>
                <option value="medium">MEDIUM</option>
                <option value="high">HIGH</option>
              </select>
            </div>
          ) : (
            <>
              <p
                className={`font-semibold text-sm leading-snug break-words
                ${todo.completed ? 'line-through text-base-content/40' : 'text-base-content'}`}
              >
                {todo.title}
              </p>
              {todo.description && expanded && (
                <p className="text-xs text-base-content/50 font-mono mt-1 leading-relaxed">
                  {todo.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold tracking-widest ${pCfg.className}`}
                >
                  {pCfg.label}
                </span>
                {todo.due_date && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-base-content/40">
                    <Calendar size={10} />
                    {new Date(todo.due_date).toLocaleDateString('fr-FR')}
                  </span>
                )}
                <span className="text-[10px] font-mono text-base-content/25">
                  #{todo.id.toString().padStart(4, '0')}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {todo.description && !editing && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="btn btn-ghost btn-xs text-base-content/30 hover:text-primary"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
          {editing ? (
            <>
              <button
                onClick={handleSave}
                className="btn btn-ghost btn-xs text-secondary hover:text-secondary"
              >
                <Save size={14} />
              </button>
              <button
                onClick={() => setEditing(false)}
                className="btn btn-ghost btn-xs text-base-content/30"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="btn btn-ghost btn-xs text-base-content/30 hover:text-primary"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onDelete(todo.id)}
                className="btn btn-ghost btn-xs text-base-content/30 hover:text-error"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
