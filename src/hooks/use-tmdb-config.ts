
import { useEffect, useState } from "react";
import { TMDbConfig } from "@/types";
import { getConfiguration } from "@/lib/tmdb-api";
import { useToast } from "@/components/ui/use-toast";

export function useTMDbConfig() {
  const [config, setConfig] = useState<TMDbConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchConfig() {
      try {
        const data = await getConfiguration();
        setConfig(data);
      } catch (error) {
        console.error("Failed to load TMDb configuration:", error);
        toast({
          title: "Configuration Error",
          description: "Failed to load TMDb configuration. Some images may not display correctly.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, [toast]);

  return { config, loading };
}
