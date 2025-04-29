
import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchFilters, TMDbMediaItem } from "@/types";
import { useSearch } from "@/hooks/use-search";
import { useTMDbConfig } from "@/hooks/use-tmdb-config";
import { MediaCard } from "@/components/movies/MediaCard";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    genres: [],
  });
  const { config } = useTMDbConfig();
  const { results, loading, setFilters: setSearchFilters, hasMore, loadMore } = useSearch();
  const [trendingItems, setTrendingItems] = useState<TMDbMediaItem[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  
  // Apply search filters when they change
  useEffect(() => {
    setSearchFilters(filters);
  }, [filters, setSearchFilters]);
  
  // Mock fetching trending items
  useEffect(() => {
    // In a real app, this would fetch from the API
    const mockTrending: TMDbMediaItem[] = [
      {
        id: 1,
        title: "Dune: Part Two",
        poster_path: "/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
        backdrop_path: "/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg",
        overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.",
        release_date: "2024-02-28",
        genre_ids: [878, 12],
        vote_average: 8.2,
        media_type: "movie",
      },
      {
        id: 2,
        name: "Fallout",
        poster_path: "/6WcJ4cV2Y3gnTYp5zHu968TYmTJ.jpg",
        backdrop_path: "/hYGU1tUUMNsQMiQycoFyRS2XdiD.jpg",
        overview: "In a retro-futuristic world, where the nuclear bombs of the Great War fell in 2077, the inhabitants of luxury fallout shelters are forced to return to the irradiated hellscape their ancestors left behind.",
        first_air_date: "2024-04-10",
        genre_ids: [10765, 18, 10759],
        vote_average: 8.6,
        media_type: "tv",
      },
      {
        id: 3,
        title: "Godzilla x Kong: The New Empire",
        poster_path: "/tMAbRwqnCkGBiDx0gHIUVYIxCEH.jpg",
        backdrop_path: "/bQS43HSLZzMjZkcHJz4fGc7fNdz.jpg",
        overview: "Following their explosive showdown, Godzilla and Kong must reunite against a colossal undiscovered threat hidden within our world.",
        release_date: "2024-03-27",
        genre_ids: [28, 878],
        vote_average: 7.2,
        media_type: "movie",
      },
      {
        id: 4,
        name: "House of the Dragon",
        poster_path: "/xiB0hsxMpgvpjiOg9UW9zLfcuKq.jpg",
        backdrop_path: "/5h6dEJUSSEfXaBDLUhXPFj7m9RY.jpg",
        overview: "The reign of House Targaryen begins with this prequel to the popular HBO series Game of Thrones.",
        first_air_date: "2022-08-21",
        genre_ids: [18, 10759, 10765],
        vote_average: 8.4,
        media_type: "tv",
      },
    ];
    
    setTimeout(() => {
      setTrendingItems(mockTrending);
      setTrendingLoading(false);
    }, 1000);
  }, []);
  
  const isSearchActive = filters.query.trim().length > 0;
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center space-y-3 py-4">
          <h1 className="text-3xl md:text-4xl font-semibold">
            Find your next favorite show
          </h1>
          <p className="text-muted-foreground">
            Search for movies and TV shows, create watchlists, and collaborate with friends
          </p>
        </div>
        
        <SearchBar 
          filters={filters} 
          onFiltersChange={setFilters} 
          className="mx-auto"
        />
        
        {isSearchActive ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Search Results</h2>
            {loading && results.length === 0 ? (
              <div className="flex justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {results.map((item) => (
                    <MediaCard key={`${item.id}-${item.media_type || 'unknown'}`} item={item} config={config} />
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
                <p className="text-muted-foreground">No results found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Trending Now</h2>
              <Button asChild variant="link" size="sm">
                <Link to="/search">See all</Link>
              </Button>
            </div>
            
            {trendingLoading ? (
              <div className="flex justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {trendingItems.map((item) => (
                  <MediaCard key={`trending-${item.id}`} item={item} config={config} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
