
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
}

export const WatchlistList: React.FC<WatchlistListProps> = ({ watchlists }) => {
  const [localLists, setLocalLists] = useState(watchlists);

  const handleUpdated = (updated: Watchlist) => {
    setLocalLists((prev) => prev.map(wl => wl.id === updated.id ? { ...wl, ...updated } : wl));
  };
  const handleDeleted = (id: string) => {
    setLocalLists((prev) => prev.filter(wl => wl.id !== id));
  };

  return (
    <div className="space-y-4">
      {localLists.map((watchlist) => (
        <WatchlistItem
          key={watchlist.id}
          watchlist={watchlist}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      ))}
    </div>
  );
};
