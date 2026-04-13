import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Terminal, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CyberInput } from '@/components/ui/CyberInput';
import { ThemeSelector } from '@/components/ThemeSelector';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(username, email, password);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? "Erreur lors de l'inscription");
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
            <div className="w-8 h-8 rounded border border-secondary/50 flex items-center justify-center glow-secondary">
              <Terminal size={16} className="text-secondary" />
            </div>
            <span className="font-mono text-sm text-secondary tracking-widest text-glow">
              TODO_SYS
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Inscription</h1>
          <p className="text-base-content/40 font-mono text-xs mt-2 tracking-widest">
            // CREATE NEW ACCOUNT
          </p>
        </div>

        <div className="cyber-card rounded-lg p-8 animate-fadeInUp delay-200">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <CyberInput
              label="Nom d'utilisateur"
              placeholder="johndoe"
              icon={<User size={16} />}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
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
              placeholder="Min. 8 chars, 1 maj, 1 chiffre"
              icon={<Lock size={16} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />

            {/* Password hint */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: '8+ chars', ok: password.length >= 8 },
                { label: '1 MAJ', ok: /[A-Z]/.test(password) },
                { label: '1 chiffre', ok: /\d/.test(password) },
              ].map(({ label, ok }) => (
                <div
                  key={label}
                  className={`h-1 rounded-full transition-all duration-500
                  ${ok ? 'bg-secondary' : 'bg-base-300'}`}
                />
              ))}
            </div>

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
              className="btn btn-secondary w-full font-mono tracking-widest gap-2 mt-2"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  CRÉER LE COMPTE <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-base-content/30 font-mono text-xs mt-6 animate-fadeInUp delay-300">
          Déjà un compte ?{' '}
          <Link
            to="/login"
            className="text-secondary hover:text-glow transition-all"
          >
            LOGIN
          </Link>
        </p>
      </div>
    </div>
  );
}
