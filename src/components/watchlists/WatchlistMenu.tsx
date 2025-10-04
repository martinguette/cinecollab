import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Check,
  List,
  Share2,
  Globe,
  Lock,
  Users,
  Loader2,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useGuest } from '@/hooks/use-guest';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CreateWatchlistDialog } from './CreateWatchlistDialog';

interface WatchlistMenuProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
}

// This component is a simplified version since we don't have actual backend integration
export function WatchlistMenu({ mediaId, mediaType }: WatchlistMenuProps) {
  const { t } = useTranslation('watchlists');
  const { t: tCommon } = useTranslation('common');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [newListDialogOpen, setNewListDialogOpen] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Real watchlists from Supabase
  const { user } = useAuth();
  const { isGuest, requireAuth } = useGuest();
  const [watchlists, setWatchlists] = useState<
    Array<{ id: string; name: string; privacy?: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setWatchlists([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('watchlist_members')
      .select('watchlist_id, watchlists(id, name)')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
          setWatchlists([]);
        } else {
          // Extraer las watchlists anidadas
          setWatchlists(
            (data || []).map(
              (row: { watchlists: { id: string; name: string } }) =>
                row.watchlists
            )
          );
        }
        setLoading(false);
      });
  }, [user, toast]);

  // Asegurar que el scroll funcione cuando se abre el popover
  useEffect(() => {
    if (isPopoverOpen && !loading) {
      // Pequeño delay para asegurar que el DOM esté renderizado
      setTimeout(() => {
        if (scrollContainerRef.current) {
          // Asegurar que el contenedor sea focusable
          scrollContainerRef.current.setAttribute('tabindex', '0');
          scrollContainerRef.current.focus();

          // Agregar listener para eventos de scroll
          const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            scrollContainerRef.current!.scrollTop += e.deltaY;
          };

          const handleTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = scrollContainerRef.current!.getBoundingClientRect();
            const scrollTop = scrollContainerRef.current!.scrollTop;
            const scrollHeight = scrollContainerRef.current!.scrollHeight;
            const clientHeight = scrollContainerRef.current!.clientHeight;

            if (touch.clientY < rect.top + 20) {
              scrollContainerRef.current!.scrollTop = Math.max(
                0,
                scrollTop - 10
              );
            } else if (touch.clientY > rect.bottom - 20) {
              scrollContainerRef.current!.scrollTop = Math.min(
                scrollHeight - clientHeight,
                scrollTop + 10
              );
            }
          };

          scrollContainerRef.current.addEventListener('wheel', handleWheel, {
            passive: false,
          });
          scrollContainerRef.current.addEventListener(
            'touchmove',
            handleTouchMove,
            { passive: false }
          );

          // Cleanup
          return () => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.removeEventListener(
                'wheel',
                handleWheel
              );
              scrollContainerRef.current.removeEventListener(
                'touchmove',
                handleTouchMove
              );
            }
          };
        }
      }, 100);
    }
  }, [isPopoverOpen, loading]);

  // Add movie to watchlist (Supabase: watchlist_movies table)
  const handleAddToWatchlist = async (listId: string, listName: string) => {
    if (!user) return;
    setAddLoading(listId);

    // 1. Verificar si la película ya está en la lista (validación previa)
    const { data: existingMovies } = await supabase
      .from('watchlist_movies')
      .select('id')
      .eq('watchlist_id', listId)
      .eq('media_id', mediaId)
      .eq('media_type', mediaType);

    if (existingMovies && existingMovies.length > 0) {
      setAddLoading(null);
      toast({
        title: t('errors.alreadyExists'),
        description: t('errors.alreadyExistsDescription'),
        variant: 'default',
      });
      return;
    }

    // 2. Intentar agregar la película
    const { error } = await supabase.from('watchlist_movies').insert({
      watchlist_id: listId,
      media_id: mediaId,
      media_type: mediaType,
      added_by: user.id,
      added_at: new Date().toISOString(),
    });

    setAddLoading(null);

    if (error) {
      // 3. Manejar error de constraint único (código 23505) como fallback
      if (error.code === '23505') {
        toast({
          title: t('errors.alreadyExists'),
          description: t('errors.alreadyExistsDescription'),
          variant: 'default',
        });
      } else {
        toast({
          title: tCommon('common.error'),
          description: error.message,
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: t('messages.movieAdded'),
        description: t('messages.movieAddedDescription', { name: listName }),
      });
      setIsPopoverOpen(false);
    }
  };

  //

  const handleShareWatchlist = () => {
    if (!collaboratorEmail.trim()) return;

    // This would call an API in a real implementation
    toast({
      title: t('messages.inviteSent'),
      description: `Invited ${collaboratorEmail} to collaborate with ${permission} permission`,
    });

    setIsShareOpen(false);
    setCollaboratorEmail('');
  };

  // Si es invitado, mostrar CTA de registro
  if (isGuest) {
    return (
      <Button onClick={() => requireAuth(() => {}, true)}>
        <Plus className="h-4 w-4 mr-2" />
        {t('actions.addToWatchlist')}
      </Button>
    );
  }

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button onClick={() => setIsPopoverOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('actions.addToWatchlist')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="end" side="right">
          <div
            ref={scrollContainerRef}
            className="space-y-1 max-h-64 overflow-y-auto focus:outline-none"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#d1d5db transparent',
            }}
            tabIndex={0}
            onMouseEnter={() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.focus();
              }
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {watchlists.map((list) => (
                  <Button
                    key={list.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleAddToWatchlist(list.id, list.name)}
                    disabled={!!addLoading}
                  >
                    <List className="h-4 w-4 mr-2" />
                    <span
                      className="truncate max-w-[140px] inline-block align-middle"
                      title={list.name}
                    >
                      {list.name}
                    </span>
                    {addLoading === list.id && (
                      <Loader2 className="ml-2 h-3 w-3 animate-spin" />
                    )}
                  </Button>
                ))}
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-foreground hover:text-primary"
              onClick={() => setNewListDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('create.create')}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <CreateWatchlistDialog
        open={newListDialogOpen}
        setOpen={setNewListDialogOpen}
        onCreated={(newWatchlist) =>
          setWatchlists((prev) => [newWatchlist, ...prev])
        }
        mediaId={mediaId}
        mediaType={mediaType}
      />
    </>
  );
}
