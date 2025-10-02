// Tipo de usuario que usamos en nuestro AuthContext
type AppUser = {
  id: string;
  email: string;
  avatar: string;
  name: string;
} | null;

/**
 * Obtiene la URL del avatar del usuario con prioridad:
 * 1. Avatar field (puede contener foto de Google)
 * 2. Fallback a null para mostrar iniciales
 */
export function getAvatarUrl(user: AppUser): string | null {
  if (!user) return null;

  // El campo avatar puede contener la foto de Google
  if (user.avatar && user.avatar !== '') {
    return user.avatar;
  }

  // Si no hay avatar, retornamos null para mostrar fallback
  return null;
}

/**
 * Obtiene las iniciales del nombre del usuario para el fallback
 */
export function getUserInitials(user: AppUser): string {
  if (!user) return '';

  const fullName = user.name || user.email?.split('@')[0] || '';

  if (!fullName) return '';

  // Obtener iniciales (máximo 2 caracteres)
  const names = fullName.trim().split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }

  return fullName.substring(0, 2).toUpperCase();
}

/**
 * Obtiene el nombre para mostrar del usuario
 */
export function getDisplayName(user: AppUser): string {
  if (!user) return '';

  return user.name || user.email?.split('@')[0] || 'Usuario';
}
