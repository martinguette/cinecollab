import { useAuth } from '@/hooks/use-auth';

/**
 * Hook para determinar si el usuario actual es un invitado (no autenticado)
 * y proporcionar utilidades para manejar acciones restringidas.
 */
export function useGuest() {
  const { user, loading } = useAuth();

  const isGuest = !loading && !user;
  const isAuthenticated = !loading && !!user;

  /**
   * Función para manejar acciones que requieren autenticación.
   * Si el usuario es invitado, puede redirigir a login o mostrar un modal.
   */
  const requireAuth = (action: () => void, redirectToLogin = true) => {
    if (isAuthenticated) {
      action();
    } else if (redirectToLogin) {
      // Redirigir a login con la URL actual como redirect
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/auth/login?redirect=${encodeURIComponent(
        currentPath
      )}`;
    }
    // Si redirectToLogin es false, no hacer nada (para mostrar modal, etc.)
  };

  return {
    isGuest,
    isAuthenticated,
    loading,
    user,
    requireAuth,
  };
}
