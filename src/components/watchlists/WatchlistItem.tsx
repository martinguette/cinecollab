import React from 'react';
import { Watchlist } from './WatchlistList';

interface WatchlistItemProps {
  watchlist: Watchlist;
}

export const WatchlistItem: React.FC<WatchlistItemProps> = ({ watchlist }) => {
  return (
    <div className="border rounded p-4 flex items-center justify-between">
      <div>
        <div className="font-semibold">{watchlist.name}</div>
        <div className="text-xs text-gray-500">
          Creada: {watchlist.created_at}
        </div>
      </div>
      {/* Placeholder for future actions (e.g., Share, Edit, Delete) */}
    </div>
  );
};
