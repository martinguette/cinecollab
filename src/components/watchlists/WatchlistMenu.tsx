
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Check, List, Share2, Globe, Lock, Users } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface WatchlistMenuProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
}

// This component is a simplified version since we don't have actual backend integration
export function WatchlistMenu({ mediaId, mediaType }: WatchlistMenuProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [privacy, setPrivacy] = useState("private");
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [permission, setPermission] = useState("view");
  const { toast } = useToast();
  
  // Mock watchlists - in a real app, these would come from an API
  const mockWatchlists = [
    { id: "1", name: "Must watch", privacy: "private" },
    { id: "2", name: "Favorites", privacy: "public" },
    { id: "3", name: "Movie Night with Friends", privacy: "shared" }
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
    setNewListDescription("");
  };
  
  const handleShareWatchlist = () => {
    if (!collaboratorEmail.trim()) return;
    
    // This would call an API in a real implementation
    toast({
      title: "Invitation sent",
      description: `Invited ${collaboratorEmail} to collaborate with ${permission} permission`,
    });
    
    setIsShareOpen(false);
    setCollaboratorEmail("");
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
                {list.privacy === "private" && <Lock className="h-3 w-3 ml-auto" />}
                {list.privacy === "public" && <Globe className="h-3 w-3 ml-auto" />}
                {list.privacy === "shared" && <Users className="h-3 w-3 ml-auto" />}
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
              <RadioGroup value={privacy} onValueChange={setPrivacy} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private" className="cursor-pointer">Private</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public" className="cursor-pointer">Public</Label>
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
              <RadioGroup value={permission} onValueChange={setPermission} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="view" id="view" />
                  <Label htmlFor="view" className="cursor-pointer">View only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="edit" id="edit" />
                  <Label htmlFor="edit" className="cursor-pointer">Can edit</Label>
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
