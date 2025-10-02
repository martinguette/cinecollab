import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { WatchlistList } from '@/components/watchlists/WatchlistList';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import type { Database } from '@/integrations/supabase/types';
import { CreateWatchlistDialog } from '@/components/watchlists/CreateWatchlistDialog';

const Watchlists = () => {
  const { t } = useTranslation('watchlists');
  const { user } = useAuth();
  const [watchlists, setWatchlists] = useState<
    Database['public']['Tables']['watchlists']['Row'][]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  // Eliminados estados de creación, ahora los maneja el modal reutilizable

  const fetchWatchlists = async () => {
    if (!user) {
      setWatchlists([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('watchlist_members')
      .select('watchlist_id, watchlists(*, users!owner_id(name))')
      .eq('user_id', user.id);
    if (error) {
      setError(error.message);
      setWatchlists([]);
    } else {
      const lists = (data || [])
        .map((row: any) => {
          const wl = row.watchlists;
          const creator_name = wl?.users?.name || '';
          return wl ? { ...wl, creator_name } : null;
        })
        .filter(Boolean);
      setWatchlists(lists);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWatchlists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Ahora la creación se maneja en el modal reutilizable

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{t('list.myWatchlists')}</h1>
          <Button onClick={() => setIsCreateOpen(true)}>
            {t('create.create')}
          </Button>
        </div>
        <div className="mt-6">
          {loading ? (
            <div className="text-center text-muted-foreground">
              {t('common.loading')}
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <WatchlistList
              watchlists={watchlists}
              onRefresh={fetchWatchlists}
            />
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
