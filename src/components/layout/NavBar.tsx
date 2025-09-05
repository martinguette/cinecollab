
import React from "react";
import { Link } from "react-router-dom";
import { Bell, Film, List, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationPopover } from "../notifications/NotificationPopover";

export function NavBar() {
  const isMobile = useIsMobile();
  
  return (
    <nav className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-md border-b border-border py-3 px-4">
      <div className="container max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <Film className="h-5 w-5 text-pastel" />
          <span className="hidden sm:inline">Cinematic</span>
        </Link>
        
        <div className="flex items-center gap-2">
          {!isMobile && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/search" className="flex items-center gap-1">
                <Search className="h-4 w-4" />
                <span>Search</span>
              </Link>
            </Button>
          )}
          
          <Button variant="ghost" size="sm" asChild>
            <Link to="/watchlists" className="flex items-center gap-1">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Watchlists</span>
            </Link>
          </Button>
          
          <NotificationPopover />
          
          <Button variant="ghost" size="sm" className="rounded-full p-2" asChild>
            <Link to="/profile">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
