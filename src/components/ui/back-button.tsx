import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BackButtonProps {
  onClick?: () => void;
  className?: string;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

export function BackButton({
  onClick,
  className = '',
  variant = 'ghost',
  size = 'default',
  showText = true,
}: BackButtonProps) {
  const { t } = useTranslation('common');

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={`gap-2 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {showText && <span>{t('buttons.back')}</span>}
    </Button>
  );
}
