import React, { useState } from 'react';
import { WatchlistItem } from './WatchlistItem';

export type Watchlist = {
  id: string;
  name: string;
  created_at: string;
  description?: string;
};

interface WatchlistListProps {
  watchlists: Watchlist[];
  onRefresh?: () => void;
}

export const WatchlistList: React.FC<WatchlistListProps> = ({
  watchlists,
  onRefresh,
}) => {
  return (
    <div className="space-y-4">
      {watchlists.map((watchlist) => (
        <WatchlistItem
          key={watchlist.id}
          watchlist={watchlist}
          onUpdated={typeof onRefresh === 'function' ? onRefresh : undefined}
          onDeleted={typeof onRefresh === 'function' ? onRefresh : undefined}
        />
      ))}
    </div>
  );
};
