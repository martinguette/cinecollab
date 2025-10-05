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

    // Usar la función RPC que creamos
    supabase
      .rpc('get_user_by_id', { user_id: userId })
      .then(({ data, error: rpcError }) => {
        if (rpcError) {
          setError(rpcError.message);
          setUser({
            id: userId,
            name: 'Usuario',
            email: 'Usuario',
            avatar_url: undefined,
          });
        } else if (data && data.length > 0) {
          const userData = data[0];
          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            avatar_url: userData.avatar_url,
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
