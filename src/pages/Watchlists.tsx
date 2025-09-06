import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { WatchlistList } from '@/components/watchlists/WatchlistList';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import type { Database } from '@/integrations/supabase/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const Watchlists = () => {
  const { user } = useAuth();
  const [watchlists, setWatchlists] = useState<
    Database['public']['Tables']['watchlists']['Row'][]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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

  const handleCreateWatchlist = async () => {
    setCreateError(null);
    if (!newListName.trim() || !user) return;
    setCreating(true);
    const invite_code = Math.random().toString(36).substring(2, 10);
    const { data, error } = await supabase
      .from('watchlists')
      .insert({
        name: newListName,
        owner_id: user.id,
        invite_code,
      })
      .select();
    setCreating(false);
    if (error) {
      setCreateError(error.message);
      return;
    }
    setIsCreateOpen(false);
    setNewListName('');
    if (data && data.length > 0) {
      setWatchlists((prev) => [data[0], ...prev]);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Mis Watchlists</h1>
          <Button onClick={() => setIsCreateOpen(true)}>Crear Watchlist</Button>
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

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nueva watchlist</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateWatchlist();
            }}
            className="space-y-4"
          >
            <Input
              placeholder="Nombre de la watchlist"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              disabled={creating}
              required
            />
            {createError && (
              <div className="text-red-500 text-sm">{createError}</div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={creating}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={creating || !newListName.trim()}>
                {creating ? 'Creando...' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Watchlists;
