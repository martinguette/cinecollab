import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useTMDbConfig } from '@/hooks/use-tmdb-config';
import { useUser } from '@/hooks/use-user';
import { supabase } from '@/integrations/supabase/client';
import {
  getMovieDetails,
  getTVDetails,
  searchMedia,
  getTitle,
  getReleaseDate,
} from '@/lib/tmdb-api';
import { WatchlistMovieCard } from '@/components/watchlists/WatchlistMovieCard';
import { RandomizerButton } from '@/components/watchlists/RandomizerButton';
import { RandomSelectionModal } from '@/components/watchlists/RandomSelectionModal';
import { EmptyWatchlistState } from '@/components/watchlists/EmptyWatchlistState';
import { TMDbMediaItem, TMDbMediaItemWithUser } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useGuest } from '@/hooks/use-guest';
import { useAuth } from '@/hooks/use-auth';
import { BackButton } from '@/components/ui/back-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Globe,
  Lock,
  Share2,
  Users,
  X,
  Check,
  Edit,
  MoreVertical,
  Trash2,
  Plus,
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

const WatchlistDetail = () => {
  const { t } = useTranslation('watchlists');
  const { t: tCommon } = useTranslation('common');
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<TMDbMediaItemWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchlistName, setWatchlistName] = useState<string>('');
  const [watchlistDescription, setWatchlistDescription] = useState<
    string | null
  >(null);
  const [watchlistCreator, setWatchlistCreator] = useState<{
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  } | null>(null);
  const { config, loading: configLoading } = useTMDbConfig();
  const { isGuest, requireAuth } = useGuest();
  const { user } = useAuth();
  // Obtener el nombre de la watchlist y información del creador
  useEffect(() => {
    if (!id) return;

    // Obtener información básica de la watchlist
    supabase
      .from('watchlists')
      .select('name, description, owner_id')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setWatchlistName(data.name);
          setWatchlistDescription(data.description ?? null);

          // Obtener información del usuario creador
          if (data.owner_id) {
            supabase
              .rpc('get_user_info', { user_id: data.owner_id })
              .single()
              .then(({ data: userData, error: userError }) => {
                if (!userError && userData) {
                  setWatchlistCreator({
                    id: userData.id,
                    name: userData.name || 'Usuario',
                    email: userData.email || 'Usuario',
                    avatar_url: userData.avatar_url,
                  });
                } else {
                  // Si no se encuentra el usuario, usar datos básicos
                  setWatchlistCreator({
                    id: data.owner_id,
                    name: 'Usuario',
                    email: 'Usuario',
                    avatar_url: undefined,
                  });
                }
              })
              .catch(() => {
                // Si falla la consulta, usar datos básicos
                setWatchlistCreator({
                  id: data.owner_id,
                  name: 'Usuario',
                  email: 'Usuario',
                  avatar_url: undefined,
                });
              });
          }
        }
      });
  }, [id]);

  useEffect(() => {
    // ...existing code...
    if (!id) return;
    setLoading(true);
    setError(null);
    // 1. Obtener los items de la watchlist desde Supabase con información del usuario
    supabase
      .from('watchlist_movies')
      .select('media_id, media_type, watchlist_id, added_by, added_at')
      .eq('watchlist_id', id)
      .then(async ({ data, error }) => {
        if (error) {
          setError('Error al cargar la watchlist.');
          setLoading(false);
          return;
        }
        if (!data || data.length === 0) {
          setItems([]);
          setLoading(false);
          return;
        }
        // 2. Obtener detalles de cada media y información del usuario
        const details = await Promise.all(
          data.map(
            async (
              item: Pick<
                Database['public']['Tables']['watchlist_movies']['Row'],
                | 'media_id'
                | 'media_type'
                | 'watchlist_id'
                | 'added_by'
                | 'added_at'
              >
            ) => {
              try {
                const mediaIdNum = Number(item.media_id);
                let mediaDetails;
                if (item.media_type === 'movie') {
                  mediaDetails = await getMovieDetails(mediaIdNum);
                } else {
                  mediaDetails = await getTVDetails(mediaIdNum);
                }

                // Obtener información del usuario que agregó la película
                const { data: userData } = await supabase
                  .rpc('get_user_info', { user_id: item.added_by })
                  .single();

                return {
                  ...mediaDetails,
                  addedBy: userData
                    ? {
                        id: userData.id,
                        name: userData.name || 'Usuario',
                        email: userData.email || 'Usuario',
                        avatar_url: userData.avatar_url,
                      }
                    : {
                        id: item.added_by,
                        name: 'Usuario',
                        email: 'Usuario',
                        avatar_url: undefined,
                      },
                  addedAt: item.added_at,
                };
              } catch (e: unknown) {
                console.error('Error fetching details for', item, e);
                return null;
              }
            }
          )
        );
        setItems(details.filter(Boolean));
        setLoading(false);
      });
  }, [id]);

  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [randomModalOpen, setRandomModalOpen] = useState(false);
  const [selectedRandomItem, setSelectedRandomItem] =
    useState<TMDbMediaItemWithUser | null>(null);
  const shareUrl = `${window.location.origin}/watchlist/join/${id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: t('detail.copied'),
        description: t('detail.linkCopied'),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      toast({
        title: t('common.error'),
        description: t('detail.copyError'),
        variant: 'destructive',
      });
    }
  };

  const handleRandomSelect = (item: TMDbMediaItemWithUser) => {
    setSelectedRandomItem(item);
    setRandomModalOpen(true);
  };

  const handleEditClick = () => {
    setEditName(watchlistName);
    setEditDescription(watchlistDescription || '');
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!id) return;
    if (!editName.trim()) {
      toast({
        title: t('errors.nameRequired'),
        description: t('errors.nameRequiredDescription'),
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('watchlists')
      .update({
        name: editName.trim(),
        description: editDescription.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    setSaving(false);

    if (error) {
      toast({
        title: t('errors.updateFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setWatchlistName(editName.trim());
      setWatchlistDescription(editDescription.trim() || null);
      setEditModalOpen(false);
      toast({
        title: t('messages.watchlistUpdated'),
        description: t('messages.watchlistUpdatedDescription'),
      });
    }
  };

  const handleDeleteWatchlist = async () => {
    if (!id) return;

    setDeleting(true);
    const { error } = await supabase.from('watchlists').delete().eq('id', id);

    setDeleting(false);

    if (error) {
      toast({
        title: t('errors.deleteFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('messages.watchlistDeleted'),
        description: t('messages.watchlistDeletedDescription'),
      });
      // Redirect to watchlists page
      window.location.href = '/watchlists';
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await searchMedia(query);

      const combinedResults = results.results.map((item: any) => ({
        ...item,
        media_type: item.media_type || (item.title ? 'movie' : 'tv'),
      }));

      setSearchResults(combinedResults.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddToWatchlist = async (item: any) => {
    if (!id || !user) return;

    try {
      const { error } = await supabase.from('watchlist_movies').insert({
        watchlist_id: id,
        media_id: item.id,
        media_type: item.media_type,
        added_by: user.id,
        added_at: new Date().toISOString(),
      });

      if (error) {
        toast({
          title: 'Error',
          description: 'No se pudo agregar la película a la lista',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Película agregada',
          description: `${getTitle(item)} ha sido agregada a la lista`,
        });
        setSearchModalOpen(false);
        setSearchQuery('');
        setSearchResults([]);

        // Refresh the watchlist by refetching data
        if (id) {
          const fetchWatchlistDetails = async () => {
            const { data, error } = await supabase
              .from('watchlist_movies')
              .select('media_id, media_type, watchlist_id, added_by, added_at')
              .eq('watchlist_id', id);

            if (!error && data) {
              const mediaItems = await Promise.all(
                data.map(
                  async (
                    item: Pick<
                      Database['public']['Tables']['watchlist_movies']['Row'],
                      | 'media_id'
                      | 'media_type'
                      | 'watchlist_id'
                      | 'added_by'
                      | 'added_at'
                    >
                  ) => {
                    const mediaIdNum = Number(item.media_id);
                    try {
                      let mediaDetails;
                      if (item.media_type === 'movie') {
                        mediaDetails = await getMovieDetails(mediaIdNum);
                      } else {
                        mediaDetails = await getTVDetails(mediaIdNum);
                      }

                      // Obtener información del usuario que agregó la película
                      const { data: userData } = await supabase
                        .rpc('get_user_info', { user_id: item.added_by })
                        .single();

                      return {
                        ...mediaDetails,
                        addedBy: userData
                          ? {
                              id: userData.id,
                              name: userData.name || 'Usuario',
                              email: userData.email || 'Usuario',
                              avatar_url: userData.avatar_url,
                            }
                          : {
                              id: item.added_by,
                              name: 'Usuario',
                              email: 'Usuario',
                              avatar_url: undefined,
                            },
                        addedAt: item.added_at,
                      };
                    } catch (e: unknown) {
                      console.error('Error fetching details for', item, e);
                      return null;
                    }
                  }
                )
              );
              setItems(mediaItems.filter(Boolean) as TMDbMediaItemWithUser[]);
            }
          };
          fetchWatchlistDetails();
        }
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  return (
    <Layout>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <BackButton onClick={() => window.history.back()} variant="outline" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">{t('detail.options')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditClick}>
                <Edit className="mr-2 h-4 w-4" />
                {tCommon('buttons.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteModalOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {tCommon('buttons.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mb-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-2">
              {watchlistName || t('detail.defaultTitle')}
            </h1>
            {watchlistDescription && (
              <p className="text-muted-foreground text-base leading-relaxed whitespace-pre-line">
                {watchlistDescription}
              </p>
            )}
            {watchlistCreator && (
              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                <Avatar
                  src={watchlistCreator.avatar_url || undefined}
                  fallback={
                    watchlistCreator.name
                      ? watchlistCreator.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                      : watchlistCreator.email[0].toUpperCase()
                  }
                  size="sm"
                />
                <span>
                  {t('detail.createdBy')}{' '}
                  {watchlistCreator.name || watchlistCreator.email}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-row items-center justify-end gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSearchModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            {items.length > 0 && (
              <RandomizerButton
                items={items}
                onRandomSelect={handleRandomSelect}
                disabled={loading || configLoading}
              />
            )}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  className="gap-1 bg-black text-white hover:bg-neutral-800 flex-1 sm:flex-none sm:min-w-[120px]"
                  type="button"
                  onClick={(e) => {
                    if (isGuest) {
                      e.preventDefault();
                      requireAuth(() => {}, true);
                    }
                  }}
                >
                  <Share2 className="inline-block" />
                  {t('detail.share')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('detail.shareTitle')}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                  <label htmlFor="share-link" className="text-sm font-medium">
                    {t('detail.shareLink')}:
                  </label>
                  <input
                    id="share-link"
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="w-full px-2 py-1 border rounded bg-gray-100 text-gray-800 text-sm"
                    onFocus={(e) => e.target.select()}
                  />
                  <Button
                    variant="default"
                    className="mt-2 bg-black text-white hover:bg-neutral-800"
                    type="button"
                    onClick={handleCopy}
                    disabled={copied}
                  >
                    {copied ? t('detail.copied') : t('detail.copyLink')}
                  </Button>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setModalOpen(false)}
                    type="button"
                  >
                    {t('buttons.close')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {(loading || configLoading) && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !configLoading && config && items.length === 0 && (
          <EmptyWatchlistState watchlistName={watchlistName} />
        )}
        {!loading && !configLoading && config && items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {items.map((item, idx) => (
              <WatchlistMovieCard
                key={item.id + '-' + idx}
                item={item}
                config={config}
                watchlistId={id!}
                onRemove={() => {
                  // Remove the item from the local state
                  setItems((prev) => prev.filter((_, index) => index !== idx));
                }}
              />
            ))}
          </div>
        )}

        {/* Random Selection Modal */}
        <RandomSelectionModal
          isOpen={randomModalOpen}
          onClose={() => setRandomModalOpen(false)}
          selectedItem={selectedRandomItem}
          config={config}
        />

        {/* Edit Watchlist Dialog */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Lista</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nombre</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ingresa el nombre de la lista"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Ingresa descripción (opcional)"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={saving || !editName.trim()}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Watchlist Dialog */}
        <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Lista</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que quieres eliminar "{watchlistName}"? Esta
                acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteWatchlist}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Search Modal */}
        <Dialog open={searchModalOpen} onOpenChange={setSearchModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Buscar Películas y Series</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Buscar películas o series..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="w-full"
              />

              {searchLoading && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {searchResults.map((item) => (
                    <div
                      key={`${item.media_type}-${item.id}`}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => handleAddToWatchlist(item)}
                    >
                      <img
                        src={
                          item.poster_path
                            ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                            : '/placeholder.svg'
                        }
                        alt={getTitle(item)}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">
                          {getTitle(item)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.media_type === 'movie' ? 'Película' : 'Serie'} •{' '}
                          {new Date(getReleaseDate(item)).getFullYear()}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Agregar
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery && !searchLoading && searchResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron resultados para "{searchQuery}"
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchModalOpen(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default WatchlistDetail;
