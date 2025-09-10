import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Check, List, Share2, Globe, Lock, Users } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [newListDialogOpen, setNewListDialogOpen] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const { toast } = useToast();

  // Real watchlists from Supabase
  const { user } = useAuth();
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
          setWatchlists((data || []).map((row: any) => row.watchlists));
        }
        setLoading(false);
      });
  }, [user, toast]);

  // Add movie to watchlist (Supabase: watchlist_movies table)
  const handleAddToWatchlist = async (listId: string, listName: string) => {
    if (!user) return;
    setAddLoading(listId);
    // @ts-expect-error: watchlist_movies is not in the generated Supabase types yet. Add it for full type safety.
    const { error } = await supabase.from('watchlist_movies').insert({
      watchlist_id: listId,
      media_id: mediaId,
      media_type: mediaType,
      added_by: user.id,
      added_at: new Date().toISOString(),
    });
    setAddLoading(null);
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Added to watchlist',
        description: `Added to "${listName}"`,
      });
    }
  };

  //

  const handleShareWatchlist = () => {
    if (!collaboratorEmail.trim()) return;

    // This would call an API in a real implementation
    toast({
      title: 'Invitation sent',
      description: `Invited ${collaboratorEmail} to collaborate with ${permission} permission`,
    });

    setIsShareOpen(false);
    setCollaboratorEmail('');
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add to Watchlist
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="end" side="right">
          <div className="space-y-1">
            {loading ? (
              <div className="text-center text-xs text-muted-foreground py-2">
                Loading...
              </div>
            ) : watchlists.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-2">
                No watchlists found
              </div>
            ) : (
              watchlists.map((list) => (
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
                    <span className="ml-2 text-xs">Adding...</span>
                  )}
                </Button>
              ))
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-pastel"
              onClick={() => setNewListDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create new list
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
