import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { searchMedia } from '@/lib/tmdb-api';
import { SearchFilters, TMDbMediaItem } from '@/types';
import { useDebounce } from './use-debounce';

export function useSearch() {
  const { t } = useTranslation('common');
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    genres: [],
    year: undefined,
    region: undefined,
  });

  const [results, setResults] = useState<TMDbMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Debounce search query to avoid too many API requests
  const debouncedQuery = useDebounce(filters.query, 500);

  const fetchResults = useCallback(
    async (resetResults = false) => {
      if (!debouncedQuery) {
        if (resetResults) setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const currentPage = resetResults ? 1 : page;

        const data = await searchMedia(debouncedQuery, currentPage, {
          genres: filters.genres.length ? filters.genres : undefined,
          year: filters.year,
          region: filters.region,
        });

        setResults((prev) =>
          resetResults ? data.results : [...prev, ...data.results]
        );
        setHasMore(currentPage < data.total_pages);
        if (resetResults) setPage(1);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error(t('common.unknownError'))
        );
      } finally {
        setLoading(false);
      }
    },
    [debouncedQuery, filters.genres, filters.region, filters.year, page, t]
  );

  // Fetch results when debounced query changes
  useEffect(() => {
    fetchResults(true);
  }, [debouncedQuery, filters.genres, filters.year, filters.region]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [loading, hasMore]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchResults();
    }
  }, [page, fetchResults]);

  return {
    results,
    loading,
    error,
    filters,
    setFilters,
    hasMore,
    loadMore,
  };
}
