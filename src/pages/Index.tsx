import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchFilters, TMDbMediaItem } from '@/types';
import { useSearch } from '@/hooks/use-search';
import { useTMDbConfig } from '@/hooks/use-tmdb-config';
import { useAuth } from '@/hooks/use-auth';
import { useGuest } from '@/hooks/use-guest';
import { MediaCard } from '@/components/movies/MediaCard';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTrendingMedia } from '@/lib/tmdb-api';

const Index = () => {
  const { t } = useTranslation('common');
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    genres: [],
  });
  const { config } = useTMDbConfig();
  const { isGuest } = useGuest();
  const {
    results,
    loading,
    setFilters: setSearchFilters,
    hasMore,
    loadMore,
  } = useSearch();
  const [trendingItems, setTrendingItems] = useState<TMDbMediaItem[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  // Apply search filters when they change
  useEffect(() => {
    setSearchFilters(filters);
  }, [filters, setSearchFilters]);

  // Mock fetching trending items
  useEffect(() => {
    setTrendingLoading(true);
    getTrendingMedia('movie', 'day')
      .then((items) => setTrendingItems(items))
      .catch(() => setTrendingItems([]))
      .finally(() => setTrendingLoading(false));
  }, []);

  const isSearchActive = filters.query.trim().length > 0;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center space-y-3 py-4">
          <h1 className="text-3xl md:text-4xl font-semibold">
            {t('app.tagline')}
          </h1>
          <p className="text-muted-foreground">{t('app.description')}</p>

          {isGuest && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-6">
              <p className="text-sm text-primary font-medium mb-2">
                {t(
                  'guest.welcome',
                  '¡Bienvenido! Estás navegando como invitado'
                )}
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                {t(
                  'guest.description',
                  'Puedes buscar películas y ver listas públicas. Para crear tus propias listas, regístrate gratis.'
                )}
              </p>
              <div className="flex justify-center gap-2">
                <Button size="sm" asChild>
                  <Link to="/auth/register">
                    {t('auth.register', 'Registrarse Gratis')}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth/login">
                    {t('auth.login', 'Iniciar Sesión')}
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        <SearchBar
          filters={filters}
          onFiltersChange={setFilters}
          className="mx-auto"
        />

        {isSearchActive ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">{t('search.results')}</h2>
            {loading && results.length === 0 ? (
              <div className="flex justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {results.map((item) => (
                    <MediaCard
                      key={`${item.id}-${item.media_type || 'unknown'}`}
                      item={item}
                      config={config}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={loadMore}
                      variant="outline"
                      disabled={loading}
                    >
                      {loading && (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {t('common.loadMore')}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('search.noResults')}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t('trending.title')}</h2>
              <Button asChild variant="link" size="sm">
                {/*  <Link to="/search">See all</Link> */}
              </Button>
            </div>

            {trendingLoading ? (
              <div className="flex justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {trendingItems.map((item) => (
                  <MediaCard
                    key={`trending-${item.id}`}
                    item={item}
                    config={config}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
