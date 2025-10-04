import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TMDbMediaItem, TMDbConfig } from '@/types';
import { getTitle, getReleaseDate, formatPosterPath } from '@/lib/tmdb-api';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  Check,
  Play,
  MoreVertical,
  Trash2,
  Heart,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useGuest } from '@/hooks/use-guest';
import { BackButton } from '@/components/ui/back-button';

interface WatchlistMovieCardProps {
  item: TMDbMediaItem;
  config: TMDbConfig | null;
  watchlistId: string;
  onRemove?: () => void;
}

export function WatchlistMovieCard({
  item,
  config,
  watchlistId,
  onRemove,
}: WatchlistMovieCardProps) {
  const { t } = useTranslation('watchlists');
  const { t: tCommon } = useTranslation('common');
  const [showDialog, setShowDialog] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);
  const [togglingWatched, setTogglingWatched] = useState(false);

  const { user } = useAuth();
  const { isGuest, requireAuth } = useGuest();
  const { toast } = useToast();

  const title = getTitle(item);
  const releaseDate = getReleaseDate(item);
  const formattedDate = releaseDate
    ? new Date(releaseDate).getFullYear()
    : 'Unknown';
  const posterUrl = formatPosterPath(item.poster_path, config);

  const mediaType = 'title' in item ? 'movie' : 'tv';

  // Load initial state for favorites and watched
  useEffect(() => {
    if (!user) return;

    const loadUserPreferences = async () => {
      try {
        // Check if item is in favorites
        const { data: favoriteData } = await (supabase as any)
          .from('user_favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('media_id', item.id)
          .eq('media_type', mediaType)
          .single();

        setIsFavorite(!!favoriteData);

        // Check if item is watched
        const { data: watchedData } = await (supabase as any)
          .from('user_watched')
          .select('id')
          .eq('user_id', user.id)
          .eq('media_id', item.id)
          .eq('media_type', mediaType)
          .single();

        setIsWatched(!!watchedData);
      } catch (error) {
        // Ignore errors for missing records (not in favorites/watched)
        console.log('Loading user preferences:', error);
      }
    };

    loadUserPreferences();
  }, [user, item.id, mediaType]);

  const handleCardClick = () => {
    setShowDialog(true);
    if ('title' in item && !details) {
      setLoadingDetails(true);
      // Import the functions dynamically to avoid circular imports
      import('@/lib/tmdb-api').then(({ getMovieDetails, getTVDetails }) => {
        const fetchDetails =
          mediaType === 'movie' ? getMovieDetails : getTVDetails;
        fetchDetails(item.id)
          .then(setDetails)
          .finally(() => setLoadingDetails(false));
      });
    }
  };

  const handleRemove = async () => {
    if (isGuest) {
      requireAuth(() => {}, true);
      return;
    }
    if (!user) return;

    setRemoving(true);
    try {
      const { error } = await supabase
        .from('watchlist_movies')
        .delete()
        .eq('watchlist_id', watchlistId)
        .eq('media_id', item.id)
        .eq('media_type', mediaType);

      if (error) {
        throw error;
      }

      toast({
        title: t('messages.movieRemoved'),
        description: t('messages.movieRemovedDescription', { title }),
      });

      // Call the onRemove callback to update the parent component
      if (onRemove) {
        onRemove();
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('errors.removeMovie'),
        variant: 'destructive',
      });
    } finally {
      setRemoving(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (isGuest) {
      requireAuth(() => {}, true);
      return;
    }
    if (!user) return;

    setTogglingFavorite(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await (supabase as any)
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('media_id', item.id)
          .eq('media_type', mediaType);

        if (error) throw error;

        setIsFavorite(false);
        toast({
          title: t('actions.removeFromFavorites'),
          description: t('messages.removedFromFavorites', { title }),
        });
      } else {
        // Add to favorites
        const { error } = await (supabase as any)
          .from('user_favorites')
          .insert({
            user_id: user.id,
            media_id: item.id,
            media_type: mediaType,
            added_at: new Date().toISOString(),
          });

        if (error) throw error;

        setIsFavorite(true);
        toast({
          title: t('actions.addToFavorites'),
          description: t('messages.addedToFavorites', { title }),
        });
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('errors.updateFavorites'),
        variant: 'destructive',
      });
    } finally {
      setTogglingFavorite(false);
    }
  };

  const handleToggleWatched = async () => {
    if (isGuest) {
      requireAuth(() => {}, true);
      return;
    }
    if (!user) return;

    setTogglingWatched(true);
    try {
      if (isWatched) {
        // Mark as unwatched
        const { error } = await (supabase as any)
          .from('user_watched')
          .delete()
          .eq('user_id', user.id)
          .eq('media_id', item.id)
          .eq('media_type', mediaType);

        if (error) throw error;

        setIsWatched(false);
        toast({
          title: t('actions.markAsUnwatched'),
          description: t('messages.markedAsUnwatched', { title }),
        });
      } else {
        // Mark as watched
        const { error } = await (supabase as any).from('user_watched').insert({
          user_id: user.id,
          media_id: item.id,
          media_type: mediaType,
          watched_at: new Date().toISOString(),
        });

        if (error) throw error;

        setIsWatched(true);
        toast({
          title: t('actions.markAsWatched'),
          description: t('messages.markedAsWatched', { title }),
        });
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('errors.updateWatched'),
        variant: 'destructive',
      });
    } finally {
      setTogglingWatched(false);
    }
  };

  return (
    <>
      <Card className="group cursor-pointer hover:shadow-lg transition-shadow">
        <div className="relative rounded-t-md overflow-hidden">
          <AspectRatio ratio={2 / 3} className="bg-muted">
            <img
              src={posterUrl}
              alt={`Poster for ${title}`}
              className="object-cover w-full h-full"
              loading="lazy"
              onClick={handleCardClick}
            />
          </AspectRatio>

          {/* Trailer button */}
          {details?.videos?.results?.find(
            (video: any) =>
              video.site === 'YouTube' &&
              (video.type === 'Trailer' || video.type === 'Teaser')
          ) && (
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

          {/* Watched indicator */}
          {isWatched && (
            <div className="absolute top-2 left-2 bg-primary rounded-full p-1">
              <Check className="h-3 w-3 text-primary-foreground" />
            </div>
          )}
        </div>

        <CardContent className="p-3" onClick={handleCardClick}>
          <h3 className="font-medium text-sm line-clamp-1" title={title}>
            {title}
          </h3>
          <CardDescription className="text-xs">{formattedDate}</CardDescription>
        </CardContent>

        {/* Action buttons bar */}
        <CardFooter className="p-2 pt-0">
          <div className="flex items-center justify-between w-full gap-1">
            {/* Favorite button */}
            <Button
              size="sm"
              variant="ghost"
              className={`h-8 w-8 p-0 ${
                isFavorite
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-muted-foreground hover:text-red-500'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite();
              }}
              disabled={togglingFavorite}
            >
              <Heart
                className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`}
              />
            </Button>

            {/* Watched button */}
            <Button
              size="sm"
              variant="ghost"
              className={`h-8 w-8 p-0 ${
                isWatched
                  ? 'text-green-500 hover:text-green-600'
                  : 'text-muted-foreground hover:text-green-500'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleWatched();
              }}
              disabled={togglingWatched}
            >
              {isWatched ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>

            {/* Remove button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('remove.title')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('remove.confirmation', { title })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRemove}
                    disabled={removing}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {removing ? t('remove.removing') : t('buttons.remove')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardFooter>
      </Card>

      {/* Media details dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:w-1/3">
                <AspectRatio
                  ratio={2 / 3}
                  className="bg-muted rounded-md overflow-hidden"
                >
                  <img
                    src={posterUrl}
                    alt={`Poster for ${title}`}
                    className="object-cover w-full h-full"
                  />
                </AspectRatio>
                {showTrailer && details?.videos?.results && (
                  <div className="mt-4">
                    <div className="mb-4">
                      <BackButton
                        onClick={() => setShowTrailer(false)}
                        variant="outline"
                      />
                    </div>
                    <iframe
                      width="100%"
                      height="200"
                      src={`https://www.youtube.com/embed/${
                        details.videos.results.find(
                          (video: any) =>
                            video.site === 'YouTube' &&
                            (video.type === 'Trailer' ||
                              video.type === 'Teaser')
                        )?.key
                      }`}
                      title={tCommon('media.watchTrailer')}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 mt-2 md:mt-0">
                <p className="text-xs sm:text-sm mb-2 sm:mb-4">
                  {item.overview || 'No overview available.'}
                </p>
                {details?.videos?.results && (
                  <Button
                    onClick={() => setShowTrailer(true)}
                    className="mb-2 sm:mb-4 w-full sm:w-auto"
                    variant="outline"
                  >
                    <Play className="h-4 w-4 mr-2" />{' '}
                    {tCommon('media.watchTrailer')}
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
                {/* Cast */}
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
        </DialogContent>
      </Dialog>
    </>
  );
}
