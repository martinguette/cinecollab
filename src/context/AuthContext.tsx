import {
  createContext,
  ReactNode,
  useEffect,
  useState,
  useContext,
} from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: null | {
    id: string;
    email: string;
    avatar: string;
    name: string;
  };
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export { AuthContext };

interface IAppProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: IAppProviderProps) => {
  const [user, setUser] = useState<null | {
    id: string;
    email: string;
    avatar: string;
    name: string;
  }>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        if (session)
          setUser({
            id: session.user.user_metadata.id,
            email: session.user.user_metadata.email,
            avatar: session.user.user_metadata.avatar_url,
            name: session.user.user_metadata.name,
          });
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    console.log('loginWithGoogle called');
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error)
        throw new Error('A ocurrido un error durante la autenticación');
    } catch (error) {
      console.error(error);
    }
  };

  const loginWithFacebook = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
      });
      if (error)
        throw new Error('A ocurrido un error durante la autenticación');
    } catch (error) {
      console.error(error);
    }
  };

  // Custom hook to get navigate, only works inside a component

  function useLogoutWithRedirect() {
    return async () => {
      try {
        await supabase.auth.signOut();
        setUser(null);
        window.location.href = '/auth/login';
      } catch (error) {
        console.error(error);
      }
    };
  }

  // Fallback for context value (will be replaced in provider)
  let logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/auth/login';
  };

  // Use a wrapper component to get access to useNavigate
  function AuthProviderWithNavigate({ children }: { children: ReactNode }) {
    const logoutWithRedirect = useLogoutWithRedirect();
    return (
      <AuthContext.Provider
        value={{
          user,
          loginWithGoogle,
          loginWithFacebook,
          logout: logoutWithRedirect,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  // Export the wrapper as default
  return <AuthProviderWithNavigate>{children}</AuthProviderWithNavigate>;
};

export default AuthProvider;
