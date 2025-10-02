import { useAuth } from '@/hooks/use-auth';

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * GuestRoute permite acceso tanto a usuarios autenticados como no autenticados.
 * A diferencia de ProtectedRoute, no redirige a login si no hay usuario.
 * Los componentes dentro pueden usar useAuth() para adaptar su comportamiento.
 */
export function GuestRoute({ children }: GuestRouteProps) {
  const { loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Render children regardless of auth state
  // Components can use useAuth() to adapt their behavior
  return <>{children}</>;
}
