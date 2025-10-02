import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TMDbConfig } from '@/types';
import { getConfiguration } from '@/lib/tmdb-api';
import { useToast } from '@/components/ui/use-toast';

export function useTMDbConfig() {
  const [config, setConfig] = useState<TMDbConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation('common');

  useEffect(() => {
    async function fetchConfig() {
      try {
        const data = await getConfiguration();
        setConfig(data);
      } catch (error) {
        console.error('Failed to load TMDb configuration:', error);
        toast({
          title: t('common.configurationError'),
          description: t('common.configurationErrorDescription'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, [toast]);

  return { config, loading };
}
