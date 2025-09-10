import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { WatchlistList } from '@/components/watchlists/WatchlistList';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import type { Database } from '@/integrations/supabase/types';
import { CreateWatchlistDialog } from '@/components/watchlists/CreateWatchlistDialog';

const Watchlists = () => {
  const { user } = useAuth();
  const [watchlists, setWatchlists] = useState<
    Database['public']['Tables']['watchlists']['Row'][]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  // Eliminados estados de creación, ahora los maneja el modal reutilizable

  useEffect(() => {
    if (!user) {
      setWatchlists([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Traer todas las watchlists donde el usuario es miembro (incluye owner)
    supabase
      .from('watchlist_members')
      .select('watchlist_id, watchlists(*)')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          setWatchlists([]);
        } else {
          // Extraer las watchlists anidadas
          const lists = (data || [])
            .map((row: any) => row.watchlists)
            .filter(Boolean);
          setWatchlists(lists);
        }
        setLoading(false);
      });
  }, [user]);

  // Ahora la creación se maneja en el modal reutilizable

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My lists</h1>
          <Button onClick={() => setIsCreateOpen(true)}>Create List</Button>
        </div>
        <div className="mt-6">
          {loading ? (
            <div className="text-center text-muted-foreground">Cargando...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <WatchlistList watchlists={watchlists} />
          )}
        </div>
      </div>

      <CreateWatchlistDialog
        open={isCreateOpen}
        setOpen={setIsCreateOpen}
        onCreated={(newWatchlist) =>
          setWatchlists((prev) => [newWatchlist, ...prev])
        }
      />
    </Layout>
  );
};

export default Watchlists;
