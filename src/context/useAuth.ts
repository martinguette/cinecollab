import { useContext } from 'react';
import { AuthContext } from './AuthContext';

// We need to access the AuthContext instance from AuthContext.tsx
// Since AuthContext is not exported, we must re-create the context here or refactor AuthContext.tsx to export it.
// The correct fix is to export AuthContext from AuthContext.tsx, but only from this file, not from the main export.
// To avoid Fast Refresh issues, we can export it as a named export ONLY from useAuth.ts.

// So, let's refactor AuthContext.tsx to export AuthContext (not as a component export), and import it here.
// For now, this is a placeholder to avoid build errors.

// TODO: Refactor AuthContext.tsx to export AuthContext for use in this hook.

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
