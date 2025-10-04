import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';

interface EmptyWatchlistStateProps {
  watchlistName?: string;
}

export function EmptyWatchlistState({
  watchlistName,
}: EmptyWatchlistStateProps) {
  const { t } = useTranslation('watchlists');
  const navigate = useNavigate();

  const handleSearchClick = () => {
    navigate('/search');
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <Plus className="w-12 h-12 text-muted-foreground" />
      </div>

      <h3 className="text-xl font-semibold mb-2">{t('detail.emptyTitle')}</h3>

      <p className="text-muted-foreground mb-6 max-w-md">
        {t('detail.emptyDescription')}
      </p>

      <Button
        onClick={handleSearchClick}
        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        size="lg"
      >
        <Search className="w-5 h-5" />
        {t('detail.searchMovies')}
      </Button>
    </div>
  );
}
