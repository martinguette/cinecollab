import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Film, List, Search, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
/* import { NotificationPopover } from '../notifications/NotificationPopover'; */
import { useContext } from 'react';
import { useAuth } from '@/context/useAuth';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function NavBar() {
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();
  const { t } = useTranslation('common');

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <nav className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-md border-b border-border py-3 px-2 sm:px-4">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-0 sm:px-2">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-lg pl-2 sm:pl-0"
        >
          <img
            src="/logo.svg"
            alt="CineCollab Logo"
            className="h-7 w-7 object-contain"
          />
          <span className="hidden sm:inline">Cinecollab</span>
        </Link>

        <div className="flex items-center gap-2 pr-2 sm:pr-0">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/search" className="flex items-center gap-1">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">{t('navigation.search')}</span>
              <span className="sm:hidden">{t('navigation.search')}</span>
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link to="/watchlists" className="flex items-center gap-1">
              {!isMobile ? (
                <>
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {t('navigation.watchlists')}
                  </span>
                </>
              ) : (
                <span>{t('navigation.watchlists')}</span>
              )}
            </Link>
          </Button>

          <LanguageSwitcher />

          {/*   <NotificationPopover /> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full p-2 ml-1 sm:ml-0"
              >
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
                <span>{t('navigation.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
