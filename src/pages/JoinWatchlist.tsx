import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';

const JoinWatchlist = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<
    Database['public']['Tables']['watchlists']['Row'] | null
  >(null);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    // Obtener info de la watchlist
    supabase
      .from('watchlists')
      .select('id, name, owner_id')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setError(
            `No se encontró la watchlist.\nID recibido: ${id}\nError: ${
              error ? error.message : 'No data'
            }`
          );
        } else {
          setWatchlist(data);
        }
      });
  }, [id]);

  useEffect(() => {
    if (!user && !loading) {
      // Redirigir a login, guardar la ruta para redirect post-login
      localStorage.setItem('join_watchlist_redirect', window.location.pathname);
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && id) {
      // Verificar si ya es miembro
      supabase
        .from('watchlist_members')
        .select('id')
        .eq('watchlist_id', id)
        .eq('user_id', user.id)
        .then(({ data, error }) => {
          if (data && data.length > 0) setJoined(true);
        });
    }
  }, [user, id]);

  const handleJoin = async () => {
    if (!user || !watchlist) return;
    setJoining(true);
    const { error: insertError } = await supabase
      .from('watchlist_members')
      .insert({ watchlist_id: watchlist.id, user_id: user.id });
    setJoining(false);
    if (insertError) {
      toast({
        title: 'Error',
        description: 'No se pudo unir a la lista.',
        variant: 'destructive',
      });
    } else {
      setJoined(true);
      toast({
        title: '¡Listo!',
        description: 'La watchlist se agregó a tus listas.',
      });
      setTimeout(() => navigate(`/watchlists/${watchlist.id}`), 1200);
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="p-4 text-red-500">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">Unirse a una Watchlist</h1>
        {watchlist && (
          <>
            <div className="mb-4">
              ¿Quieres unirte a la lista{' '}
              <span className="font-semibold">{watchlist.name}</span>?
            </div>
            <Button
              onClick={handleJoin}
              disabled={joining || joined}
              className="w-full"
            >
              {joined
                ? '¡Ya eres miembro!'
                : joining
                ? 'Uniendo...'
                : 'Unirme a esta lista'}
            </Button>
          </>
        )}
      </div>
    </Layout>
  );
};

export default JoinWatchlist;
