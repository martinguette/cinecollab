
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useTMDbConfig } from "@/hooks/use-tmdb-config";
import { MediaCard } from "@/components/movies/MediaCard";
import { TMDbMediaItem } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Globe, Lock, MessageCircle, Share2, Users, X, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

// Extend the TMDbMediaItem type for our watchlist items
interface WatchlistMediaItem extends TMDbMediaItem {
  watched?: boolean;
}

const WatchlistDetail = () => {
  const { id } = useParams();
  const { config } = useTMDbConfig();
  const { toast } = useToast();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [permission, setPermission] = useState("view");
  const [comment, setComment] = useState("");

  // Mock data for a watchlist - in a real app, this would come from an API
  const mockWatchlist = {
    id: id,
    name: id === "1" ? "Must Watch" : id === "2" ? "Favorites" : "Movie Night",
    description: "A collection of movies and shows we want to watch together",
    privacy: "shared",
    itemCount: id === "1" ? 12 : id === "2" ? 24 : 8,
    memberCount: id === "1" ? 2 : id === "2" ? 1 : 5,
    isOwner: true,
    collaborators: [
      {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
        image: "",
        role: "admin"
      },
      {
        id: "user-2",
        name: "Jane Smith",
        email: "jane@example.com",
        image: "",
        role: "editor"
      },
      {
        id: "user-3",
        name: "Alex Johnson",
        email: "alex@example.com",
        image: "",
        role: "viewer"
      }
    ],
    comments: [
      {
        id: "comment-1",
        user: {
          id: "user-2",
          name: "Jane Smith",
          image: ""
        },
        text: "Let's watch this one on Friday!",
        createdAt: "2023-05-18T14:23:00Z",
        mediaId: 1
      },
      {
        id: "comment-2",
        user: {
          id: "user-3",
          name: "Alex Johnson",
          image: ""
        },
        text: "I've already seen this one, it's great!",
        createdAt: "2023-05-18T15:45:00Z",
        mediaId: 2
      }
    ]
  };

  // Mock items in the watchlist - in a real app, these would come from an API
  const [items, setItems] = useState<WatchlistMediaItem[]>([]);

  // Load mock data
  useEffect(() => {
    // Simulating API fetch
    setTimeout(() => {
      setItems([
        {
          id: 1,
          title: "Dune: Part Two",
          poster_path: "/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
          backdrop_path: "/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg",
          overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.",
          release_date: "2024-02-28",
          genre_ids: [878, 12],
          vote_average: 8.2,
          media_type: "movie",
          watched: true,
        },
        {
          id: 2,
          name: "Fallout",
          poster_path: "/6WcJ4cV2Y3gnTYp5zHu968TYmTJ.jpg",
          backdrop_path: "/hYGU1tUUMNsQMiQycoFyRS2XdiD.jpg",
          overview: "In a retro-futuristic world, where the nuclear bombs of the Great War fell in 2077, the inhabitants of luxury fallout shelters are forced to return to the irradiated hellscape their ancestors left behind.",
          first_air_date: "2024-04-10",
          genre_ids: [10765, 18, 10759],
          vote_average: 8.6,
          media_type: "tv",
          watched: false,
        },
      ]);
    }, 500);
  }, [id]);

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

  const handleToggleWatched = (itemId: number) => {
    setItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, watched: !item.watched } : item
      )
    );
    
    toast({
      title: "Status updated",
      description: "Item marked as watched",
    });
  };

  const handleRemoveItem = (itemId: number) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
    
    toast({
      title: "Item removed",
      description: "Item removed from watchlist",
    });
  };

  const handleAddComment = (itemId: number) => {
    if (!comment.trim()) return;
    
    toast({
      title: "Comment added",
      description: "Your comment has been added",
    });
    
    setComment("");
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/watchlists">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{mockWatchlist.name}</h1>
              {mockWatchlist.privacy === "private" && <Lock className="h-4 w-4 text-muted-foreground" />}
              {mockWatchlist.privacy === "public" && <Globe className="h-4 w-4 text-muted-foreground" />}
              {mockWatchlist.privacy === "shared" && <Users className="h-4 w-4 text-muted-foreground" />}
            </div>
            <p className="text-muted-foreground">{mockWatchlist.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-muted-foreground">{mockWatchlist.itemCount} items</span>
              <div className="flex -space-x-2">
                {mockWatchlist.collaborators.slice(0, 3).map((user) => (
                  <Avatar key={user.id} className="border-2 border-background h-6 w-6">
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                ))}
                {mockWatchlist.collaborators.length > 3 && (
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs">
                    +{mockWatchlist.collaborators.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {mockWatchlist.isOwner && (
            <Button onClick={() => setIsShareOpen(true)}>
              <Share2 className="h-4 w-4 mr-2" /> Share
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="items" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="items" className="mt-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">This watchlist is empty</p>
                <Button asChild>
                  <Link to="/search">Search for movies & shows</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {items.map((item) => (
                  <div key={item.id} className="relative group">
                    <MediaCard key={`${item.id}-${item.media_type || 'unknown'}`} item={item} config={config} />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="icon" className="h-7 w-7">
                            <span className="sr-only">Open menu</span>
                            <X className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleWatched(item.id)}>
                            Mark as {item.watched ? 'unwatched' : 'watched'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRemoveItem(item.id)} className="text-destructive focus:text-destructive">
                            Remove from watchlist
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {item.watched && (
                      <div className="absolute top-2 left-2 bg-primary rounded-full p-1">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="comments" className="mt-6">
            {mockWatchlist.comments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No comments yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockWatchlist.comments.map((comment) => {
                  const item = items.find(i => i.id === comment.mediaId);
                  
                  return (
                    <div key={comment.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{comment.user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm">{comment.text}</p>
                          {item && (
                            <div className="text-xs text-muted-foreground mt-1">
                              On: {item.title || item.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                <div className="mt-6 border-t pt-4">
                  <h3 className="font-medium mb-2">Add a comment</h3>
                  <div className="flex gap-2">
                    <Textarea 
                      placeholder="Write your comment..." 
                      className="min-h-[80px]"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button 
                      onClick={() => handleAddComment(items[0]?.id)} 
                      disabled={!comment.trim() || items.length === 0}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" /> Comment
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
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
                  <RadioGroupItem value="view" id="collab-view" />
                  <Label htmlFor="collab-view" className="cursor-pointer">View only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="edit" id="collab-edit" />
                  <Label htmlFor="collab-edit" className="cursor-pointer">Can edit</Label>
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
    </Layout>
  );
};

export default WatchlistDetail;
