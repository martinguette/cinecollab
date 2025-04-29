
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchFilters } from "@/types";
import { useSearch } from "@/hooks/use-search";
import { useTMDbConfig } from "@/hooks/use-tmdb-config";
import { MediaCard } from "@/components/movies/MediaCard";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

const Search = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    genres: [],
  });
  
  const { results, loading, setFilters: setSearchFilters, hasMore, loadMore } = useSearch();
  const { config } = useTMDbConfig();
  
  // Apply search filters when they change
  useEffect(() => {
    setSearchFilters(filters);
  }, [filters, setSearchFilters]);
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-semibold">Search</h1>
        
        <SearchBar 
          filters={filters} 
          onFiltersChange={setFilters} 
        />
        
        {loading && results.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map((item) => (
                <MediaCard 
                  key={`${item.id}-${item.media_type || 'unknown'}`} 
                  item={item} 
                  config={config} 
                />
              ))}
            </div>
            
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={loadMore} 
                  variant="outline" 
                  disabled={loading}
                >
                  {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  Load More
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            {filters.query ? (
              <p className="text-muted-foreground">No results found. Try adjusting your search or filters.</p>
            ) : (
              <p className="text-muted-foreground">Enter a search term to find movies and TV shows.</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Search;
