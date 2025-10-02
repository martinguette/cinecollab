import { useAuth } from '@/hooks/use-auth';
import { Navigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { user, loading } = useAuth();
  const { t } = useTranslation('common');

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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Language Switcher in top right */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      {/* Auth Form */}
      <AuthForm mode="login" onModeChange={() => {}} />
    </div>
  );
}
