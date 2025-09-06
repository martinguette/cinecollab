import React, { useState, useEffect } from 'react';
import {
  formatPosterPath,
  getTitle,
  getReleaseDate,
  getYoutubeEmbedUrl,
  getMovieDetails,
} from '@/lib/tmdb-api';
import { TMDbMediaItem, TMDbConfig } from '@/types';

interface MediaCardProps {
  item: TMDbMediaItem;
  config: TMDbConfig | null;
}
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Check, Plus, Play } from 'lucide-react';
import { WatchlistMenu } from '../watchlists/WatchlistMenu';

function MediaCard({ item, config }: MediaCardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const title = getTitle(item);
  const releaseDate = getReleaseDate(item);
  const formattedDate = releaseDate
    ? new Date(releaseDate).getFullYear()
    : 'Unknown';
  const posterUrl = formatPosterPath(item.poster_path, config);

  // Find YouTube trailer (prefer details, fallback to item)
  const trailer =
    details?.videos?.results?.find(
      (video: any) =>
        video.site === 'YouTube' &&
        (video.type === 'Trailer' || video.type === 'Teaser')
    ) ||
    item.videos?.results?.find(
      (video) =>
        video.site === 'YouTube' &&
        (video.type === 'Trailer' || video.type === 'Teaser')
    );

  const handleCardClick = () => {
    setShowDialog(true);
    if ('title' in item && !details) {
      setLoadingDetails(true);
      getMovieDetails(item.id)
        .then(setDetails)
        .finally(() => setLoadingDetails(false));
    }
  };

  const mediaType = 'title' in item ? 'movie' : 'tv';
  // Check if the item has been watched (from props)
  const isWatched = 'watched' in item && item.watched;

  return (
    <>
      <Card
        className="h-full overflow-hidden transition-shadow hover:movie-card-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="relative rounded-t-md overflow-hidden">
          <AspectRatio ratio={2 / 3} className="bg-muted">
            <img
              src={posterUrl}
              alt={`Poster for ${title}`}
              className="object-cover w-full h-full"
              loading="lazy"
            />
          </AspectRatio>
          {trailer && (
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-2 right-2 rounded-full opacity-90 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                setShowDialog(true);
                setShowTrailer(true);
              }}
            >
              <Play className="h-4 w-4" />
              <span className="sr-only">Play trailer</span>
            </Button>
          )}
          {isWatched && (
            <div className="absolute top-2 left-2 bg-primary rounded-full p-1">
              <Check className="h-3 w-3 text-primary-foreground" />
            </div>
          )}
        </div>

        <CardContent className="p-3">
          <h3 className="font-medium text-sm line-clamp-1" title={title}>
            {title}
          </h3>
          <CardDescription className="text-xs">{formattedDate}</CardDescription>
        </CardContent>
      </Card>

      {/* Media details dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent
          className="max-w-2xl p-2 sm:p-6"
          style={{ maxHeight: '90vh', overflowY: 'auto' }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl flex justify-between items-center gap-2">
              <span>
                {title}{' '}
                <span className="text-muted-foreground">({formattedDate})</span>
              </span>
            </DialogTitle>
          </DialogHeader>
          {showTrailer && trailer ? (
            <div className="mt-2">
              <AspectRatio
                ratio={16 / 9}
                className="overflow-hidden rounded-md bg-muted"
              >
                <iframe
                  src={getYoutubeEmbedUrl(trailer.key)}
                  title={`${title} trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  className="w-full h-full"
                  allowFullScreen
                ></iframe>
              </AspectRatio>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-2">
              <div className="w-32 mx-auto md:w-1/3 md:mx-0">
                <AspectRatio
                  ratio={2 / 3}
                  className="overflow-hidden rounded-md bg-muted"
                >
                  <img
                    src={posterUrl}
                    alt={`Poster for ${title}`}
                    className="object-cover w-full h-full"
                  />
                </AspectRatio>
                {/* Géneros */}
                {((details && details.genres) || item.genres) && (
                  <div className="mt-2 flex flex-wrap gap-1 md:gap-2 justify-center md:justify-start">
                    {((details && details.genres) || item.genres)?.map(
                      (genre: any) => (
                        <span
                          key={genre.id}
                          className="text-xs bg-muted px-2 py-1 rounded-full"
                        >
                          {genre.name}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 mt-2 md:mt-0">
                <p className="text-xs sm:text-sm mb-2 sm:mb-4">
                  {item.overview || 'No overview available.'}
                </p>
                {trailer && (
                  <Button
                    onClick={() => setShowTrailer(true)}
                    className="mb-2 sm:mb-4 w-full sm:w-auto"
                    variant="outline"
                  >
                    <Play className="h-4 w-4 mr-2" /> Watch Trailer
                  </Button>
                )}
                {/* Director */}
                {details?.credits?.crew && (
                  <div className="mb-1 sm:mb-2 text-xs">
                    <strong>Director:</strong>{' '}
                    {details.credits.crew
                      .filter((c: any) => c.job === 'Director')
                      .map((d: any) => d.name)
                      .join(', ') || 'N/A'}
                  </div>
                )}
                {/* Reparto */}
                {details?.credits?.cast && (
                  <div className="mb-1 sm:mb-2 text-xs">
                    <strong>Cast:</strong>{' '}
                    {details.credits.cast
                      .slice(0, 5)
                      .map((a: any) => a.name)
                      .join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}
          <CardFooter
            className="px-0 pt-4 flex justify-between"
            style={{
              position: 'sticky',
              bottom: 0,
              background: 'white',
              zIndex: 10,
              paddingBottom: 'env(safe-area-inset-bottom, 0.5rem)',
            }}
          >
            <WatchlistMenu mediaId={item.id} mediaType={mediaType} />
          </CardFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { MediaCard };
export default MediaCard;
