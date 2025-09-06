import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { WatchlistList } from '@/components/watchlists/WatchlistList';

const Watchlists = () => {
  // Mock watchlists simplificados para el nuevo componente
  const mockWatchlists = [
    { id: '1', name: 'Favoritas', created_at: '2025-09-06' },
    { id: '2', name: 'Para ver', created_at: '2025-09-06' },
    { id: '3', name: 'Comedia', created_at: '2025-09-06' },
  ];

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Mis Watchlists</h1>
          <Button>Crear Watchlist</Button>
        </div>
        <div className="mt-6">
          <WatchlistList watchlists={mockWatchlists} />
        </div>
      </div>
    </Layout>
  );
};

export default Watchlists;
