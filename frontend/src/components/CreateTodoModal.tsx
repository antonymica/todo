import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { CreateTodoPayload, Priority } from '@/types';
import { CyberInput } from './ui/CyberInput';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CreateTodoPayload) => Promise<unknown>;
}

export const CreateTodoModal = ({ open, onClose, onCreate }: Props) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setTitle('');
    setDesc('');
    setPriority('medium');
    setDueDate('');
    setError('');
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Le titre est requis');
      return;
    }
    setLoading(true);
    try {
      await onCreate({
        title: title.trim(),
        description: desc || undefined,
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      reset();
      onClose();
    } catch {
      setError('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-base-100/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative cyber-card glow-primary rounded-lg w-full max-w-md p-6 animate-fadeInUp">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-mono tracking-widest text-primary/60 mb-1">
              // NEW TASK
            </p>
            <h2 className="text-lg font-bold">Créer une tâche</h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle text-base-content/40 hover:text-base-content"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <CyberInput
            label="Titre *"
            placeholder="Description courte de la tâche..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
            error={error}
            autoFocus
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono tracking-widest text-base-content/50 uppercase">
              Description
            </label>
            <textarea
              className="textarea w-full bg-base-300 border-base-300 focus:border-primary font-mono text-sm resize-none"
              rows={3}
              placeholder="Détails optionnels..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono tracking-widest text-base-content/50 uppercase">
                Priorité
              </label>
              <select
                className="select w-full bg-base-300 border-base-300 font-mono text-sm"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="low">🔵 LOW</option>
                <option value="medium">🟡 MEDIUM</option>
                <option value="high">🔴 HIGH</option>
              </select>
            </div>

            <CyberInput
              label="Échéance"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="btn btn-ghost flex-1 font-mono text-sm border-base-300"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn btn-primary flex-1 font-mono text-sm gap-2"
          >
            {loading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Plus size={16} />
            )}
            Créer
          </button>
        </div>
      </div>
    </div>
  );
};
