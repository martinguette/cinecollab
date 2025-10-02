import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Watchlist } from './WatchlistList';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

interface WatchlistItemProps {
  watchlist: Watchlist & { description?: string };
  onUpdated?: (watchlist: any) => void;
  onDeleted?: (id: string) => void;
}

export const WatchlistItem: React.FC<WatchlistItemProps> = ({
  watchlist,
  onUpdated,
  onDeleted,
}) => {
  const { t } = useTranslation('watchlists');
  const date = new Date(watchlist.created_at);
  const formattedDate = date.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(watchlist.name);
  const [description, setDescription] = useState(watchlist.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editar watchlist
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from('watchlists')
      .update({ name, description })
      .eq('id', watchlist.id);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      toast({
        title: t('messages.updated'),
        description: t('messages.updatedDescription'),
      });
      setEditOpen(false);
      if (onUpdated) onUpdated({ ...watchlist, name, description });
    }
  };

  // Eliminar watchlist
  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from('watchlists')
      .delete()
      .eq('id', watchlist.id);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      toast({
        title: t('messages.deleted'),
        description: t('messages.deletedDescription'),
      });
      setDeleteOpen(false);
      if (onDeleted) onDeleted(watchlist.id);
    }
  };

  return (
    <div className="border rounded p-4 flex items-center justify-between hover:bg-accent transition cursor-pointer">
      <Link to={`/watchlists/${watchlist.id}`} className="flex-1 min-w-0">
        <div className="font-semibold truncate">{name}</div>
        <div className="text-xs text-gray-500">Creada: {formattedDate}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-1 truncate">
            {description}
          </div>
        )}
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="ml-2">
            <MoreVertical className="w-5 h-5" />
            <span className="sr-only">Opciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogo editar */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar watchlist</DialogTitle>
            <DialogDescription>
              Edita el nombre o la descripción de la lista.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre"
                required
                disabled={loading}
              />
            </div>
            <div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción (opcional)"
                disabled={loading}
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !name.trim()}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogo eliminar */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar watchlist</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta lista? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
