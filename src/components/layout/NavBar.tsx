import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Film,
  List,
  Search,
  User,
  LogOut,
  Globe,
  Loader2,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { getAvatarUrl, getUserInitials, getDisplayName } from '@/lib/avatar';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
/* import { NotificationPopover } from '../notifications/NotificationPopover'; */
import { useContext } from 'react';
import { useAuth } from '@/context/useAuth';
import { useLanguage } from '@/hooks/use-language';
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
  const {
    currentLanguage: langCode,
    changeLanguage,
    isChanging,
  } = useLanguage();
  const handleSignOut = async () => {
    await logout();
  };

  const handleLanguageChange = async (languageCode: string) => {
    await changeLanguage(languageCode);
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

          {/*   <NotificationPopover /> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full p-1 ml-1 sm:ml-0"
              >
                <Avatar
                  src={getAvatarUrl(user)}
                  alt={getDisplayName(user)}
                  fallback={getUserInitials(user)}
                  size="md"
                />
                <span className="sr-only">Menú de usuario</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="cursor-pointer">
                <Avatar
                  src={getAvatarUrl(user)}
                  alt={getDisplayName(user)}
                  fallback={getUserInitials(user)}
                  size="sm"
                  className="mr-2"
                />
                <span>{getDisplayName(user)}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {/* Language Switch Toggle */}
              <div className="px-2 py-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">Idioma</span>
                  </div>
                  <button
                    onClick={() =>
                      handleLanguageChange(langCode === 'en' ? 'es' : 'en')
                    }
                    disabled={isChanging}
                    className={`
                      relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50
                      ${langCode === 'en' ? 'bg-blue-500' : 'bg-green-500'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
                        ${langCode === 'en' ? 'translate-x-1' : 'translate-x-7'}
                      `}
                    />
                    <span className="absolute left-1 text-xs font-medium text-white">
                      EN
                    </span>
                    <span className="absolute right-1 text-xs font-medium text-white">
                      ES
                    </span>
                    {isChanging && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-3 w-3 animate-spin text-white" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

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
