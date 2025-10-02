import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useGuest } from '@/hooks/use-guest';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';

const JoinWatchlist = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const { isGuest, requireAuth } = useGuest();
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

    console.log('Buscando watchlist con ID:', id);

    // Primero, vamos a listar todas las watchlists para debug
    supabase
      .from('watchlists')
      .select('id, name, owner_id')
      .limit(5)
      .then(({ data: allLists, error: listError }) => {
        if (listError) {
          console.error('Error listing watchlists:', listError);
        } else {
          console.log('Watchlists disponibles:', allLists);
        }
      });

    // Obtener info de la watchlist específica
    supabase
      .from('watchlists')
      .select('id, name, owner_id, created_at, invite_code, description')
      .eq('id', id)
      .maybeSingle() // Usar maybeSingle() en lugar de single() para evitar errores si no hay resultados
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching watchlist:', error);

          // Si es un error de permisos RLS, mostrar mensaje específico
          if (
            error.code === 'PGRST116' ||
            error.message.includes('Cannot coerce')
          ) {
            setError(
              `⚠️ Acceso restringido\n\nEsta watchlist requiere permisos especiales para ser vista como invitado.\n\nPor favor:\n1. Regístrate o inicia sesión\n2. O contacta al propietario de la lista\n\nID: ${id}`
            );
          } else {
            setError(
              `Error al buscar la watchlist.\nID: ${id}\nError: ${error.message}\nCódigo: ${error.code}`
            );
          }
        } else if (!data) {
          setError(
            `No se encontró la watchlist con ID: ${id}\n\nPosibles causas:\n- El enlace es incorrecto\n- La lista fue eliminada\n- No tienes permisos para verla como invitado`
          );
        } else {
          console.log('Watchlist encontrada:', data);
          setWatchlist(data);

          // Si es invitado, redirigir automáticamente a la watchlist
          if (isGuest) {
            console.log('Invitado detectado, redirigiendo a watchlist...');
            navigate(`/watchlists/${data.id}`, { replace: true });
          }
        }
      });
  }, [id, isGuest, navigate]);

  // Eliminamos la redirección automática para permitir acceso de invitados

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
    if (!watchlist) return;

    // Si es invitado, redirigir a login
    if (isGuest) {
      localStorage.setItem('join_watchlist_redirect', window.location.pathname);
      requireAuth(() => {}, true);
      return;
    }

    if (!user) return;

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
              {isGuest ? (
                <>
                  <p className="mb-2">
                    Te han invitado a la lista{' '}
                    <span className="font-semibold">{watchlist.name}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Para unirte a esta lista y crear tus propias watchlists,
                    necesitas registrarte.
                  </p>
                </>
              ) : (
                <p>
                  ¿Quieres unirte a la lista{' '}
                  <span className="font-semibold">{watchlist.name}</span>?
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleJoin}
                disabled={joining || joined}
                className="w-full"
              >
                {joined
                  ? '¡Ya eres miembro!'
                  : joining
                  ? 'Uniendo...'
                  : isGuest
                  ? 'Registrarse y Unirse'
                  : 'Unirme a esta lista'}
              </Button>

              {isGuest && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/watchlists/${watchlist.id}`)}
                  className="w-full"
                >
                  Ver lista como invitado
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default JoinWatchlist;
