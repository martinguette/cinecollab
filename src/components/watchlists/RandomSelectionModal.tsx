import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TMDbMediaItem } from '@/types';
import { TMDbConfig } from '@/lib/tmdb-api';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Calendar, Star } from 'lucide-react';

interface RandomSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: TMDbMediaItem | null;
  config: TMDbConfig | null;
}

export function RandomSelectionModal({
  isOpen,
  onClose,
  selectedItem,
  config,
}: RandomSelectionModalProps) {
  const { t } = useTranslation('watchlists');

  if (!selectedItem || !config) return null;

  const posterUrl = selectedItem.poster_path
    ? `${config.images.base_url}w500${selectedItem.poster_path}`
    : '/placeholder-movie.jpg';

  const title = selectedItem.title || selectedItem.name || 'Unknown';
  const releaseDate = selectedItem.release_date || selectedItem.first_air_date;
  const formattedDate = releaseDate
    ? new Date(releaseDate).getFullYear().toString()
    : 'N/A';
  const rating = selectedItem.vote_average
    ? selectedItem.vote_average.toFixed(1)
    : 'N/A';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {t('randomizer.selected')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4">
          {/* Poster */}
          <div className="w-48 h-72 rounded-lg overflow-hidden shadow-lg">
            <AspectRatio ratio={2 / 3} className="bg-muted">
              <img
                src={posterUrl}
                alt={`Poster for ${title}`}
                className="object-cover w-full h-full"
              />
            </AspectRatio>
          </div>

          {/* Movie/Show Info */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold line-clamp-2" title={title}>
              {title}
            </h3>

            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4" />
                <span>{rating}</span>
              </div>
            </div>

            {selectedItem.overview && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {selectedItem.overview}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center w-full">
            <Button variant="outline" onClick={onClose} className="px-8">
              {t('buttons.close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
