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
}

export function BackButton({
  onClick,
  className = '',
  variant = 'ghost',
  size = 'icon',
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
    </Button>
  );
}
