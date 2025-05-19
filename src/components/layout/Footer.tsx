
import React from "react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t py-6 bg-background">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-lg font-semibold">CineCollab</h2>
            <p className="text-sm text-muted-foreground">
              Discover and plan what to watch together
            </p>
          </div>
          <nav className="flex gap-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/search" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Search
            </Link>
            <Link to="/watchlists" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Watchlists
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
