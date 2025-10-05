-- Función para obtener información del usuario por ID
-- Esta función permite obtener información básica del usuario de manera segura
CREATE OR REPLACE FUNCTION get_user_info(user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  avatar_url TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'name', au.raw_user_meta_data->>'full_name', au.email) as name,
    au.email,
    au.raw_user_meta_data->>'avatar_url' as avatar_url
  FROM auth.users au
  WHERE au.id = user_id;
END;
$$;

-- Dar permisos para que los usuarios autenticados puedan usar esta función
GRANT EXECUTE ON FUNCTION get_user_info(UUID) TO authenticated;
