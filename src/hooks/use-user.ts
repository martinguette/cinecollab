import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

export function useUser(userId: string | null) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Usar consulta SQL directa con el cliente de Supabase
    supabase
      .from('users')
      .select('id, name, email, avatar_url')
      .eq('id', userId)
      .single()
      .then(({ data, error: queryError }) => {
        if (queryError) {
          setError(queryError.message);
          setUser({
            id: userId,
            name: 'Usuario',
            email: 'Usuario',
            avatar_url: undefined,
          });
        } else if (data) {
          setUser({
            id: data.id,
            name: data.name,
            email: data.email,
            avatar_url: data.avatar_url,
          });
        } else {
          setUser({
            id: userId,
            name: 'Usuario',
            email: 'Usuario',
            avatar_url: undefined,
          });
        }
      })
      .catch((err) => {
        setError(err.message);
        setUser({
          id: userId,
          name: 'Usuario',
          email: 'Usuario',
          avatar_url: undefined,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  return { user, loading, error };
}
