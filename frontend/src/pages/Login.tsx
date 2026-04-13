import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Terminal, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CyberInput } from '@/components/ui/CyberInput';
import { ThemeSelector } from '@/components/ThemeSelector';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen cyber-grid scanline flex items-center justify-center p-4">
      <ThemeSelector className="fixed right-3 top-3 z-20 shadow-sm" />

      <div className="w-full max-w-md animate-fadeInUp">
        {/* Logo */}
        <div className="text-center mb-8 animate-fadeInUp delay-100">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded border border-primary/50 flex items-center justify-center glow-primary">
              <Terminal size={16} className="text-primary" />
            </div>
            <span className="font-mono text-sm text-primary tracking-widest text-glow">
              TODO_SYS
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Connexion</h1>
          <p className="text-base-content/40 font-mono text-xs mt-2 tracking-widest">
            // AUTHENTICATE TO CONTINUE
          </p>
        </div>

        {/* Card */}
        <div className="cyber-card rounded-lg p-8 animate-fadeInUp delay-200">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <CyberInput
              label="Email"
              type="email"
              placeholder="user@domain.com"
              icon={<Mail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <CyberInput
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={16} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            {error && (
              <div className="flex items-center gap-2 p-3 rounded bg-error/10 border border-error/30">
                <span className="text-error font-mono text-xs">
                  [ERR] {error}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full font-mono tracking-widest gap-2 mt-2"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  ACCÉDER <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-base-content/30 font-mono text-xs mt-6 animate-fadeInUp delay-300">
          Pas de compte ?{' '}
          <Link
            to="/register"
            className="text-primary hover:text-glow transition-all"
          >
            REGISTER
          </Link>
        </p>
      </div>
    </div>
  );
}
