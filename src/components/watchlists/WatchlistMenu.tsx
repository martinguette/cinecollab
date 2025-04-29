
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Check, List } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WatchlistMenuProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
}

// This component is a simplified version since we don't have actual backend integration
export function WatchlistMenu({ mediaId, mediaType }: WatchlistMenuProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const { toast } = useToast();
  
  // Mock watchlists - in a real app, these would come from an API
  const mockWatchlists = [
    { id: "1", name: "Must watch" },
    { id: "2", name: "Favorites" }
  ];
  
  const handleAddToWatchlist = (listId: string, listName: string) => {
    // This would call an API in a real implementation
    toast({
      title: "Added to watchlist",
      description: `Added to "${listName}"`,
    });
  };
  
  const handleCreateWatchlist = () => {
    if (!newListName.trim()) return;
    
    // This would call an API in a real implementation
    toast({
      title: "Watchlist created",
      description: `Created "${newListName}" and added item`,
    });
    
    setIsCreateOpen(false);
    setNewListName("");
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
        <PopoverContent className="w-56 p-2" align="start">
          <div className="space-y-1">
            {mockWatchlists.map((list) => (
              <Button
                key={list.id}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleAddToWatchlist(list.id, list.name)}
              >
                <List className="h-4 w-4 mr-2" />
                {list.name}
              </Button>
            ))}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWatchlist}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
