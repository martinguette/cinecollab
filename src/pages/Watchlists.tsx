
import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

const Watchlists = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const { toast } = useToast();
  
  // Mock watchlists - in a real app, these would come from an API
  const mockWatchlists = [
    {
      id: "1",
      name: "Must Watch",
      description: "Movies and shows I want to see soon",
      itemCount: 12,
      memberCount: 2,
    },
    {
      id: "2",
      name: "Favorites",
      description: "My all-time favorites",
      itemCount: 24,
      memberCount: 1,
    },
    {
      id: "3",
      name: "Movie Night",
      description: "Plans for movie nights with friends",
      itemCount: 8,
      memberCount: 5,
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
        
        {mockWatchlists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">You don't have any watchlists yet</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first watchlist
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockWatchlists.map((list) => (
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWatchlist}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Watchlists;
