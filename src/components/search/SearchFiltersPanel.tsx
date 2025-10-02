import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SearchFilters, TMDbGenre } from '@/types';
import { getGenres } from '@/lib/tmdb-api';
import { X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchFiltersPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClose?: () => void;
}

export function SearchFiltersPanel({
  filters,
  onFiltersChange,
  onClose,
}: SearchFiltersPanelProps) {
  const [movieGenres, setMovieGenres] = useState<TMDbGenre[]>([]);
  const [tvGenres, setTvGenres] = useState<TMDbGenre[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate year options (current year down to 1900)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) =>
    (currentYear - i).toString()
  );

  // Country/region codes for top film producing countries
  const regions = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'IN', name: 'India' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'CN', name: 'China' },
  ];

  // Load genres
  useEffect(() => {
    async function loadGenres() {
      try {
        setLoading(true);
        const [movies, tv] = await Promise.all([
          getGenres('movie'),
          getGenres('tv'),
        ]);
        setMovieGenres(movies);
        setTvGenres(tv);
      } catch (error) {
        console.error('Failed to load genres:', error);
      } finally {
        setLoading(false);
      }
    }

    loadGenres();
  }, []);

  // Combine and deduplicate genres
  const allGenres = React.useMemo(() => {
    const genreMap = new Map<number, TMDbGenre>();

    [...movieGenres, ...tvGenres].forEach((genre) => {
      if (!genreMap.has(genre.id)) {
        genreMap.set(genre.id, genre);
      }
    });

    return Array.from(genreMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [movieGenres, tvGenres]);

  const toggleGenre = (genreId: number) => {
    const newGenres = filters.genres.includes(genreId)
      ? filters.genres.filter((id) => id !== genreId)
      : [...filters.genres, genreId];

    onFiltersChange({
      ...filters,
      genres: newGenres,
    });
  };

  const handleYearChange = (year: string | undefined) => {
    onFiltersChange({
      ...filters,
      year,
    });
  };

  const handleRegionChange = (region: string | undefined) => {
    onFiltersChange({
      ...filters,
      region,
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      ...filters,
      genres: [],
      year: undefined,
      region: undefined,
    });
  };

  const hasFilters =
    filters.genres.length > 0 || !!filters.year || !!filters.region;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-8 text-xs"
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="year-filter">Release Year</Label>
          <Select
            value={filters.year || ''}
            onValueChange={(value) => handleYearChange(value || undefined)}
          >
            <SelectTrigger id="year-filter" className="w-full">
              <SelectValue placeholder="Any year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any year</SelectItem>
              {years.slice(0, 20).map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="region-filter">Country/Region</Label>
          <Select
            value={filters.region || ''}
            onValueChange={(value) => handleRegionChange(value || undefined)}
          >
            <SelectTrigger id="region-filter" className="w-full">
              <SelectValue placeholder="Any region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any region</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region.code} value={region.code}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Genres</Label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
            {loading ? (
              <div className="w-full flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            ) : (
              allGenres.map((genre) => (
                <Badge
                  key={genre.id}
                  variant={
                    filters.genres.includes(genre.id) ? 'default' : 'outline'
                  }
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => toggleGenre(genre.id)}
                >
                  {genre.name}
                </Badge>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Button onClick={onClose}>Apply Filters</Button>
      </div>
    </div>
  );
}
