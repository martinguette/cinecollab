
// TMDb API Types
export interface TMDbConfig {
  images: {
    base_url: string;
    secure_base_url: string;
    backdrop_sizes: string[];
    logo_sizes: string[];
    poster_sizes: string[];
    profile_sizes: string[];
    still_sizes: string[];
  };
}

export interface TMDbMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
  media_type?: 'movie';
  videos?: {
    results: TMDbVideo[];
  };
}

export interface TMDbTV {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  first_air_date: string;
  genre_ids: number[];
  vote_average: number;
  media_type?: 'tv';
  videos?: {
    results: TMDbVideo[];
  };
}

export interface TMDbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface TMDbGenre {
  id: number;
  name: string;
}

export type TMDbMediaItem = TMDbMovie | TMDbTV;

export interface TMDbSearchResults {
  page: number;
  results: TMDbMediaItem[];
  total_results: number;
  total_pages: number;
}

// App Types
export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface WatchlistItem {
  id: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  addedBy: string;
  addedAt: Date;
  watched: boolean;
  watchedBy?: string[];
}

export interface Watchlist {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: WatchlistMember[];
  items: WatchlistItem[];
  createdAt: Date;
}

export interface WatchlistMember {
  userId: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface Comment {
  id: string;
  watchlistId: string;
  itemId: string;
  userId: string;
  text: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  type: 'invite' | 'comment' | 'release';
  userId: string;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: Date;
}

export interface SearchFilters {
  query: string;
  genres: number[];
  year?: string;
  region?: string;
}
