import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dice6 } from 'lucide-react';
import { TMDbMediaItem, TMDbMediaItemWithUser } from '@/types';

interface RandomizerButtonProps {
  items: TMDbMediaItemWithUser[];
  onRandomSelect: (item: TMDbMediaItemWithUser) => void;
  disabled?: boolean;
}

export function RandomizerButton({
  items,
  onRandomSelect,
  disabled = false,
}: RandomizerButtonProps) {
  const { t } = useTranslation('watchlists');

  const handleRandomSelect = () => {
    if (items.length === 0) return;

    // Seleccionar un elemento aleatorio del array
    const randomIndex = Math.floor(Math.random() * items.length);
    const randomItem = items[randomIndex];

    onRandomSelect(randomItem);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRandomSelect}
      disabled={disabled || items.length === 0}
      className="gap-2 flex-1 sm:flex-none sm:min-w-[120px]"
    >
      <Dice6 className="h-4 w-4" />
      {t('randomizer.random')}
    </Button>
  );
}
