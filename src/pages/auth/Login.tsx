import { useAuth } from '@/hooks/use-auth';
import { Navigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';

export default function Login() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    const redirect = localStorage.getItem('join_watchlist_redirect');
    if (redirect) {
      localStorage.removeItem('join_watchlist_redirect');
      return <Navigate to={redirect} replace />;
    }
    return <Navigate to="/" replace />;
  }

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

  return <AuthForm mode="login" onModeChange={() => {}} />;
}
