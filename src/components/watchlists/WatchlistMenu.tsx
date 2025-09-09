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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface WatchlistMenuProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
}

// This component is a simplified version since we don't have actual backend integration
export function WatchlistMenu({ mediaId, mediaType }: WatchlistMenuProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [privacy, setPrivacy] = useState('private');
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
          const lists = (data || [])
            .map((row: any) => row.watchlists)
            .filter(Boolean);
          setWatchlists(lists);
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

  const handleCreateWatchlist = () => {
    if (!newListName.trim()) return;

    // This would call an API in a real implementation
    toast({
      title: 'Watchlist created',
      description: `Created "${newListName}" and added item`,
    });

    setIsCreateOpen(false);
    setNewListName('');
    setNewListDescription('');
  };

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
            Add to List
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
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create new list
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new watchlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Watchlist name</Label>
              <Input
                id="name"
                placeholder="My awesome watchlist"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="What's this watchlist about?"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Privacy</Label>
              <RadioGroup
                value={privacy}
                onValueChange={setPrivacy}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private" className="cursor-pointer">
                    Private
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public" className="cursor-pointer">
                    Public
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWatchlist}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite collaborators</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={collaboratorEmail}
                onChange={(e) => setCollaboratorEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Permission level</Label>
              <RadioGroup
                value={permission}
                onValueChange={setPermission}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="view" id="view" />
                  <Label htmlFor="view" className="cursor-pointer">
                    View only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="edit" id="edit" />
                  <Label htmlFor="edit" className="cursor-pointer">
                    Can edit
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleShareWatchlist}>Send invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
