import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { AuthState } from '@/store/authStore';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((s: AuthState) => s.isAuthenticated());
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};
