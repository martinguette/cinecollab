
import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Users,
  MoreVertical,
  Share2,
  Pencil,
  Trash2,
  Globe,
  Lock,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Watchlists = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [privacy, setPrivacy] = useState("private");
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(null);
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [permission, setPermission] = useState("view");
  const { toast } = useToast();

  // Mock watchlists - in a real app, these would come from an API
  const mockWatchlists = [
    {
      id: "1",
      name: "Must Watch",
      description: "Movies and shows I want to see soon",
      itemCount: 12,
      memberCount: 2,
      privacy: "private",
      isOwner: true,
    },
    {
      id: "2",
      name: "Favorites",
      description: "My all-time favorites",
      itemCount: 24,
      memberCount: 1,
      privacy: "public",
      isOwner: true,
    },
    {
      id: "3",
      name: "Movie Night",
      description: "Plans for movie nights with friends",
      itemCount: 8,
      memberCount: 5,
      privacy: "shared",
      isOwner: true,
    },
    {
      id: "4",
      name: "Sarah's Recommendations",
      description: "Movies recommended by Sarah",
      itemCount: 15,
      memberCount: 2,
      privacy: "shared",
      isOwner: false,
    },
  ];

  const handleCreateWatchlist = () => {
    if (!newListName.trim()) return;

    // This would call an API in a real implementation
    toast({
      title: "Watchlist created",
      description: `Created "${newListName}" watchlist`,
    });

    setIsCreateOpen(false);
    setNewListName("");
    setNewListDescription("");
  };

  const handleShareWatchlist = () => {
    if (!collaboratorEmail.trim() || !selectedWatchlistId) return;

    const watchlist = mockWatchlists.find((list) => list.id === selectedWatchlistId);
    
    if (!watchlist) return;

    // This would call an API in a real implementation
    toast({
      title: "Invitation sent",
      description: `Invited ${collaboratorEmail} to collaborate on "${watchlist.name}" with ${permission} permission`,
    });

    setIsShareOpen(false);
    setCollaboratorEmail("");
    setSelectedWatchlistId(null);
  };

  const handleDeleteWatchlist = () => {
    if (!selectedWatchlistId) return;

    const watchlist = mockWatchlists.find((list) => list.id === selectedWatchlistId);
    
    if (!watchlist) return;

    // This would call an API in a real implementation
    toast({
      title: "Watchlist deleted",
      description: `Deleted "${watchlist.name}" watchlist`,
    });

    setIsDeleteOpen(false);
    setSelectedWatchlistId(null);
  };

  const openShareDialog = (id: string) => {
    setSelectedWatchlistId(id);
    setIsShareOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setSelectedWatchlistId(id);
    setIsDeleteOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My Watchlists</h1>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Watchlist
          </Button>
        </div>

        <Tabs defaultValue="my-watchlists" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="my-watchlists">My Watchlists</TabsTrigger>
            <TabsTrigger value="shared-with-me">Shared With Me</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-watchlists" className="mt-6">
            {mockWatchlists.filter(list => list.isOwner).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You don't have any watchlists yet</p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first watchlist
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockWatchlists.filter(list => list.isOwner).map((list) => (
                  <Card key={list.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <Link to={`/watchlists/${list.id}`} className="block space-y-3">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{list.name}</h3>
                            {list.privacy === "private" && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                            {list.privacy === "public" && <Globe className="h-3.5 w-3.5 text-muted-foreground" />}
                            {list.privacy === "shared" && <Users className="h-3.5 w-3.5 text-muted-foreground" />}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {list.description}
                          </p>
                          <div className="flex justify-between text-sm">
                            <span>{list.itemCount} items</span>
                            <span className="flex items-center">
                              <Users className="h-3.5 w-3.5 mr-1" />
                              {list.memberCount}
                            </span>
                          </div>
                        </Link>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openShareDialog(list.id)}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive" 
                              onClick={() => openDeleteDialog(list.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="shared-with-me" className="mt-6">
            {mockWatchlists.filter(list => !list.isOwner).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No watchlists have been shared with you yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockWatchlists.filter(list => !list.isOwner).map((list) => (
                  <Card key={list.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <Link to={`/watchlists/${list.id}`} className="block space-y-3">
                        <h3 className="font-semibold text-lg">{list.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {list.description}
                        </p>
                        <div className="flex justify-between text-sm">
                          <span>{list.itemCount} items</span>
                          <span className="flex items-center">
                            <Users className="h-3.5 w-3.5 mr-1" />
                            {list.memberCount}
                          </span>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

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

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this watchlist and remove all collaborator access. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWatchlist} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Watchlists;
