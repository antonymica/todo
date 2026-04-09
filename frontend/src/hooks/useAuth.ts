import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const { setAuth, clearAuth, user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    const { data } = await authService.login(email, password);
    setAuth(data.user, data.access_token, data.refresh_token);
    toast.success(`Bienvenue, ${data.user.username} !`);
    navigate('/dashboard');
  };

  const register = async (
    username: string,
    email: string,
    password: string,
  ) => {
    const { data } = await authService.register(username, email, password);
    setAuth(data.user, data.access_token, data.refresh_token);
    toast.success('Compte créé avec succès !');
    navigate('/dashboard');
  };

  const logout = () => {
    clearAuth();
    toast('Déconnecté', { icon: '👋' });
    navigate('/login');
  };

  return { login, register, logout, user, isAuthenticated: isAuthenticated() };
};
