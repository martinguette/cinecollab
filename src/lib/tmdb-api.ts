// Obtener trending del momento (películas o todo)
export async function getTrendingMedia(
  type: 'all' | 'movie' | 'tv' = 'movie',
  timeWindow: 'day' | 'week' = 'day'
): Promise<TMDbMediaItem[]> {
  // type: 'all', 'movie', 'tv' | timeWindow: 'day', 'week'
  const data = await callApi<{ results: TMDbMediaItem[] }>(
    `/trending/${type}/${timeWindow}`
  );
  return data.results;
}
import {
  TMDbConfig,
  TMDbGenre,
  TMDbMediaItem,
  TMDbMovie,
  TMDbSearchResults,
  TMDbTV,
} from '@/types';
import { toast } from '@/components/ui/use-toast';

// API key desde variables de entorno
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Cache for storing API responses
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Generic API caller with caching
async function callApi<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const queryParams = new URLSearchParams({
    api_key: API_KEY,
    ...params,
  }).toString();

  const url = `${BASE_URL}${endpoint}?${queryParams}`;
  const cacheKey = url;

  // Check cache
  const cached = apiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`TMDb API error: ${response.status}`);
    }

    const data = await response.json();

    // Store in cache
    apiCache.set(cacheKey, { data, timestamp: Date.now() });

    return data as T;
  } catch (error) {
    console.error('API request failed:', error);
    toast({
      title: 'API Error',
      description: 'Failed to fetch data from TMDb',
      variant: 'destructive',
    });
    throw error;
  }
}

// Get API configuration
export async function getConfiguration(): Promise<TMDbConfig> {
  return callApi<TMDbConfig>('/configuration');
}

// Search movies and TV shows
export async function searchMedia(
  query: string,
  page = 1,
  options: { genres?: number[]; year?: string; region?: string } = {}
): Promise<TMDbSearchResults> {
  if (!query.trim()) {
    return { page: 0, results: [], total_pages: 0, total_results: 0 };
  }

  const params: Record<string, string> = {
    query: query.trim(),
    page: page.toString(),
    include_adult: 'false',
    language: 'en-US',
  };

  if (options.year) params.year = options.year;
  if (options.region) params.region = options.region;

  const results = await callApi<TMDbSearchResults>('/search/multi', params);

  // Filter by genre if specified
  if (options.genres && options.genres.length > 0) {
    results.results = results.results.filter((item) => {
      const genreIds = (item as TMDbMovie | TMDbTV).genre_ids || [];
      return options.genres!.some((g) => genreIds.includes(g));
    });
  }

  return results;
}

// Get details for a movie with videos
export async function getMovieDetails(id: number): Promise<TMDbMovie> {
  return callApi<TMDbMovie>(`/movie/${id}`, {
    append_to_response: 'videos,credits',
  });
}

// Get details for a TV show with videos
export async function getTVDetails(id: number): Promise<TMDbTV> {
  return callApi<TMDbTV>(`/tv/${id}`, {
    append_to_response: 'videos,credits',
  });
}

// Get a list of genres
export async function getGenres(type: 'movie' | 'tv'): Promise<TMDbGenre[]> {
  const response = await callApi<{ genres: TMDbGenre[] }>(
    `/genre/${type}/list`
  );
  return response.genres;
}

// Get a YouTube embed URL from a video key
export function getYoutubeEmbedUrl(key: string): string {
  return `https://www.youtube.com/embed/${key}?autoplay=0`;
}

// Get the appropriate title field based on media type
export function getTitle(item: TMDbMediaItem): string {
  return 'title' in item ? item.title : item.name;
}

// Get the appropriate release date field based on media type
export function getReleaseDate(item: TMDbMediaItem): string {
  return 'release_date' in item ? item.release_date : item.first_air_date;
}

// Format a TMDb poster path to a complete URL with appropriate size
export function formatPosterPath(
  path: string | null,
  config: TMDbConfig | null,
  size = 'w342'
): string {
  if (!path) return '/placeholder.svg'; // Use placeholder if no path
  if (
    !config ||
    !config.images ||
    !config.images.secure_base_url ||
    !config.images.poster_sizes
  ) {
    // Fallback: return path or placeholder
    return path || '/placeholder.svg';
  }

  const baseUrl = config.images.secure_base_url;
  const availableSizes = config.images.poster_sizes;

  // Use requested size if available, otherwise use the smallest size
  let useSize = availableSizes.includes(size) ? size : availableSizes[0];

  return `${baseUrl}${useSize}${path}`;
}
