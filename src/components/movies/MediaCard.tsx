
import React, { useState } from "react";
import { formatPosterPath, getTitle, getReleaseDate, getYoutubeEmbedUrl } from "@/lib/tmdb-api";
import { TMDbMediaItem, TMDbConfig } from "@/types";
import { Card, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Plus, Play } from "lucide-react";
import { WatchlistMenu } from "../watchlists/WatchlistMenu";

interface MediaCardProps {
  item: TMDbMediaItem;
  config: TMDbConfig | null;
}

export function MediaCard({ item, config }: MediaCardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  
  const title = getTitle(item);
  const releaseDate = getReleaseDate(item);
  const formattedDate = releaseDate ? new Date(releaseDate).getFullYear() : "Unknown";
  const posterUrl = formatPosterPath(item.poster_path, config);
  
  // Find YouTube trailer
  const trailer = item.videos?.results.find(
    (video) => video.site === "YouTube" && 
    (video.type === "Trailer" || video.type === "Teaser")
  );
  
  const handleCardClick = () => {
    setShowDialog(true);
  };
  
  const mediaType = 'title' in item ? 'movie' : 'tv';
  
  return (
    <>
      <Card 
        className="h-full overflow-hidden transition-shadow hover:movie-card-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="relative rounded-t-md overflow-hidden">
          <AspectRatio ratio={2/3} className="bg-muted">
            <img 
              src={posterUrl} 
              alt={`Poster for ${title}`}
              className="object-cover w-full h-full"
              loading="lazy"
            />
          </AspectRatio>
          {trailer && (
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
        </div>
        
        <CardContent className="p-3">
          <h3 className="font-medium text-sm line-clamp-1" title={title}>
            {title}
          </h3>
          <CardDescription className="text-xs">{formattedDate}</CardDescription>
        </CardContent>
      </Card>
      
      {/* Media details dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex justify-between items-center gap-2">
              <span>{title} <span className="text-muted-foreground">({formattedDate})</span></span>
            </DialogTitle>
          </DialogHeader>
          
          {showTrailer && trailer ? (
            <div className="mt-2">
              <AspectRatio ratio={16/9} className="overflow-hidden rounded-md bg-muted">
                <iframe
                  src={getYoutubeEmbedUrl(trailer.key)}
                  title={`${title} trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  className="w-full h-full"
                  allowFullScreen
                ></iframe>
              </AspectRatio>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-4 mt-2">
              <div className="w-full md:w-1/3">
                <AspectRatio ratio={2/3} className="overflow-hidden rounded-md bg-muted">
                  <img 
                    src={posterUrl} 
                    alt={`Poster for ${title}`}
                    className="object-cover w-full h-full"
                  />
                </AspectRatio>
              </div>
              <div className="flex-1">
                <p className="text-sm mb-4">{item.overview || "No overview available."}</p>
                {trailer && (
                  <Button 
                    onClick={() => setShowTrailer(true)}
                    className="mb-4"
                    variant="outline"
                  >
                    <Play className="h-4 w-4 mr-2" /> Watch Trailer
                  </Button>
                )}
              </div>
            </div>
          )}
          
          <CardFooter className="px-0 pt-4 flex justify-between">
            <WatchlistMenu mediaId={item.id} mediaType={mediaType} />
          </CardFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
