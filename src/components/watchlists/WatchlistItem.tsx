import React from 'react';
import { Watchlist } from './WatchlistList';
import { Link } from 'react-router-dom';

interface WatchlistItemProps {
  watchlist: Watchlist;
}

export const WatchlistItem: React.FC<WatchlistItemProps> = ({ watchlist }) => {
  return (
    <Link
      to={`/watchlists/${watchlist.id}`}
      className="block border rounded p-4 flex items-center justify-between hover:bg-accent transition cursor-pointer"
      tabIndex={0}
    >
      <div>
        <div className="font-semibold">{watchlist.name}</div>
        <div className="text-xs text-gray-500">
          Creada: {watchlist.created_at}
        </div>
      </div>
      {/* Placeholder for future actions (e.g., Share, Edit, Delete) */}
    </Link>
  );
};
