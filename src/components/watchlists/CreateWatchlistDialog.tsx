import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface CreateWatchlistDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCreated?: (watchlist: any) => void;
}

export function CreateWatchlistDialog({
  open,
  setOpen,
  onCreated,
}: CreateWatchlistDialogProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !user) return;
    setLoading(true);
    const invite_code = Math.random().toString(36).substring(2, 10);
    const { data, error } = await supabase
      .from('watchlists')
      .insert({
        name,
        description,
        owner_id: user.id,
        invite_code,
      })
      .select();
    if (error || !data || data.length === 0) {
      setLoading(false);
      setError(error ? error.message : 'Error creando la lista');
      return;
    }
    const newWatchlist = data[0];
    const { error: memberError } = await supabase
      .from('watchlist_members')
      .insert({
        watchlist_id: newWatchlist.id,
        user_id: user.id,
        role: 'owner',
      });
    setLoading(false);
    setOpen(false);
    setName('');
    setDescription('');
    if (memberError) {
      setError('La lista fue creada pero no se pudo agregar como miembro.');
    } else if (onCreated) {
      onCreated(newWatchlist);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear nueva watchlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              placeholder="Nombre de la watchlist"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="¿De qué trata esta watchlist?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? 'Creando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
