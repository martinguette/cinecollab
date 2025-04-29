
import React, { useState, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchFilters } from "@/types";
import { SearchFiltersPanel } from "./SearchFiltersPanel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SearchBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

export function SearchBar({ filters, onFiltersChange, className = "" }: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, query: e.target.value });
  };

  const handleClearSearch = () => {
    onFiltersChange({ ...filters, query: "" });
    inputRef.current?.focus();
  };

  const hasActiveFilters = filters.genres.length > 0 || !!filters.year || !!filters.region;

  return (
    <div className={`w-full ${className}`}>
      <div className="relative flex items-center w-full">
        <div className="absolute left-3 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for movies, TV shows..."
          className="pl-10 pr-20 py-6 rounded-lg search-input"
          value={filters.query}
          onChange={handleQueryChange}
          aria-label="Search for movies or TV shows"
        />
        
        <div className="absolute right-3 flex items-center gap-2">
          {filters.query && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearSearch}
              className="h-8 w-8"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button
                variant={hasActiveFilters ? "default" : "outline"}
                size="sm"
                className="px-3"
                aria-label="Search filters"
              >
                Filters {hasActiveFilters && <span className="ml-1 w-4 h-4 bg-background text-primary rounded-full text-xs flex items-center justify-center">{filters.genres.length + (filters.year ? 1 : 0) + (filters.region ? 1 : 0)}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <SearchFiltersPanel 
                filters={filters} 
                onFiltersChange={onFiltersChange} 
                onClose={() => setShowFilters(false)} 
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
