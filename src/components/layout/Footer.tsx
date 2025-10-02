import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function Footer() {
  const { t } = useTranslation('common');

  return (
    <footer className="border-t py-6 bg-background">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-lg font-semibold">{t('app.name')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('app.description')}
            </p>
          </div>
          <nav className="flex gap-6">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('footer.home')}
            </Link>
            <Link
              to="/search"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('navigation.search')}
            </Link>
            <Link
              to="/watchlists"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('navigation.watchlists')}
            </Link>
            <Link
              to="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('links.terms')}
            </Link>
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('links.privacy')}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
