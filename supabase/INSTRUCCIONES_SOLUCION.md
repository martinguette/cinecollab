# 🚨 SOLUCIÓN PARA NUEVOS USUARIOS QUE NO PUEDEN CREAR WATCHLISTS

## 📋 PROBLEMA IDENTIFICADO

Los nuevos usuarios (tanto por email como por OAuth) no pueden crear watchlists debido a políticas RLS (Row Level Security) mal configuradas. El error que aparece es:

```
new row violates row-level security policy for table "watchlists"
```

## 🔧 SOLUCIÓN

He creado varios scripts para solucionar este problema:

### 1. **Script Principal (RECOMENDADO)**

```bash
# Ejecutar este script en Supabase SQL Editor
supabase/complete_fix_new_users.sql
```

### 2. **Scripts Alternativos**

- `supabase/emergency_fix_new_users.sql` - Solución rápida solo para watchlists
- `supabase/fix_watchlist_members_rls.sql` - Solo para watchlist_members
- `supabase/fix_new_users_rls.sql` - Solución completa alternativa

### 3. **Script de Debug**

```bash
# Para diagnosticar problemas
supabase/debug_new_users_issue.sql
```

## 📝 INSTRUCCIONES DE APLICACIÓN

### Opción A: Usando Supabase Dashboard

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor**
3. Copia y pega el contenido de `supabase/complete_fix_new_users.sql`
4. Ejecuta el script
5. Verifica que no haya errores

### Opción B: Usando CLI de Supabase

```bash
# Si tienes Supabase CLI configurado
npx supabase db reset --linked
# Luego ejecuta el script
```

## ✅ VERIFICACIÓN

Después de ejecutar el script:

1. **Crea un nuevo usuario** en tu aplicación
2. **Intenta crear una watchlist**
3. **Verifica que funcione** sin errores

## 🔍 DEBUGGING

Si el problema persiste:

1. Ejecuta `supabase/debug_new_users_issue.sql` para diagnosticar
2. Revisa los logs de Supabase en el dashboard
3. Verifica que las políticas RLS estén activas

## 📊 QUÉ HACE LA SOLUCIÓN

La solución:

1. **Elimina todas las políticas RLS problemáticas** que causan recursión
2. **Crea políticas simples y directas** que permiten a los usuarios autenticados:

   - Crear watchlists propias
   - Ver sus propias watchlists
   - Actualizar sus propias watchlists
   - Eliminar sus propias watchlists
   - Gestionar miembros de sus watchlists
   - Agregar/eliminar películas de sus watchlists

3. **Mantiene la seguridad** asegurando que los usuarios solo puedan acceder a sus propios datos

## ⚠️ IMPORTANTE

- **Esta solución es segura** y no afecta a usuarios existentes
- **Solo permite acceso a datos propios** de cada usuario
- **Mantiene la funcionalidad colaborativa** para futuras implementaciones
- **Es compatible** con el código existente de la aplicación

## 🚀 PRÓXIMOS PASOS

Después de aplicar la solución:

1. **Prueba con varios usuarios nuevos** (email y OAuth)
2. **Verifica que la funcionalidad existente siga funcionando**
3. **Monitorea los logs** por unos días para asegurar estabilidad
4. **Considera implementar funcionalidad colaborativa** en el futuro usando las políticas base

## 📞 SOPORTE

Si tienes problemas con la solución:

1. Revisa los logs de Supabase
2. Ejecuta el script de debug
3. Verifica que las políticas estén activas
4. Contacta al equipo de desarrollo con los logs específicos
