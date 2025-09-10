import React from 'react';
import { Watchlist } from './WatchlistList';
import { Link } from 'react-router-dom';

interface WatchlistItemProps {
  watchlist: Watchlist;
}


export const WatchlistItem: React.FC<WatchlistItemProps> = ({ watchlist }) => {
  // Formatear la fecha: día, mes, año y hora (ej: 10 septiembre 2025, 14:30)
  const date = new Date(watchlist.created_at);
  const formattedDate = date.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  return (
    <Link
      to={`/watchlists/${watchlist.id}`}
      className="block border rounded p-4 flex items-center justify-between hover:bg-accent transition cursor-pointer"
      tabIndex={0}
    >
      <div>
        <div className="font-semibold">{watchlist.name}</div>
        <div className="text-xs text-gray-500">
          Creada: {formattedDate}
        </div>
      </div>
      {/* Placeholder for future actions (e.g., Share, Edit, Delete) */}
    </Link>
  );
};
