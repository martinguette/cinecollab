import React from 'react';
import { WatchlistItem } from './WatchlistItem';

export type Watchlist = {
  id: string;
  name: string;
  created_at: string;
};

interface WatchlistListProps {
  watchlists: Watchlist[];
}

export const WatchlistList: React.FC<WatchlistListProps> = ({ watchlists }) => {
  return (
    <div className="space-y-4">
      {watchlists.map((watchlist) => (
        <WatchlistItem key={watchlist.id} watchlist={watchlist} />
      ))}
    </div>
  );
};
