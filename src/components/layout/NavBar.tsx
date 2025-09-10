import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Film, List, Search, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
/* import { NotificationPopover } from '../notifications/NotificationPopover'; */
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function NavBar() {
  const isMobile = useIsMobile();
  const { user, logout } = useContext(AuthContext);

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <nav className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-md border-b border-border py-3 px-4">
      <div className="container max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <img
            src="/logo.svg"
            alt="CineCollab Logo"
            className="h-7 w-7 object-contain"
          />
          <span className="hidden sm:inline">Cinecollab</span>
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
              {!isMobile ? (
                <>
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Lists</span>
                </>
              ) : (
                <span>Watchlists</span>
              )}
            </Link>
          </Button>

          {/*   <NotificationPopover /> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full p-2">
                <User className="h-5 w-5" />
                <span className="sr-only">Menú de usuario</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>{user?.name}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
