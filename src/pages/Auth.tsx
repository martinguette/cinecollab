import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/use-auth';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { user, loading } = useAuth();

  // Redirect authenticated users to home
  if (!loading && user) {
    // Redirigir a la ruta guardada si existe, luego limpiar
    const redirect = localStorage.getItem('join_watchlist_redirect');
    if (redirect) {
      localStorage.removeItem('join_watchlist_redirect');
      return <Navigate to={redirect} replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-lg">Cargando...</span>
        </div>
      </div>
    );
  }

  return <AuthForm mode={mode} onModeChange={setMode} />;
}
