import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata || {},
        },
      });

      if (error) {
        toast({
          title: 'Error al registrarse',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      if (data.user && !data.session) {
        toast({
          title: '¡Revisa tu email!',
          description: 'Te hemos enviado un enlace de confirmación.',
        });
      }

      return { data, error: null };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return { error: { message } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Error al iniciar sesión',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      toast({
        title: '¡Bienvenido!',
        description: 'Has iniciado sesión correctamente.',
      });

      return { data, error: null };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return { error: { message } };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          title: 'Error al iniciar sesión con Google',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return { error: { message } };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast({
          title: 'Error al cerrar sesión',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente.',
      });

      return { error: null };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return { error: { message } };
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };
}
