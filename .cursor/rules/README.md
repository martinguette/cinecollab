# 📋 **REGLAS DE PRODUCCIÓN - CINECOLLAB**

## **⚠️ ESTADO CRÍTICO: APLICACIÓN EN PRODUCCIÓN**

Esta aplicación está en **PRODUCCIÓN** con usuarios reales y datos críticos. Todas las reglas están diseñadas para proteger la integridad de los datos y la funcionalidad existente.

---

## **📁 ESTRUCTURA DE REGLAS**

### **🔒 Reglas de Seguridad General**

- **`production_safety.mdc`** - Reglas generales de seguridad para aplicaciones en producción
- **`supabase_production.mdc`** - Reglas específicas para manejo seguro de Supabase
- **`react_production.mdc`** - Reglas para desarrollo seguro de componentes React
- **`taskmaster_production.mdc`** - Reglas para manejo seguro de tareas en producción

### **🎬 Reglas de Funcionalidad**

- **`collaborative_watchlists.mdc`** - Reglas para funcionalidad colaborativa de watchlists

### **🛠️ Reglas de Desarrollo**

- **`cursor_rules.mdc`** - Reglas generales de Cursor
- **`self_improve.mdc`** - Reglas de auto-mejora
- **`taskmaster/`** - Reglas específicas de Taskmaster

---

## **🚨 PRINCIPIOS CRÍTICOS**

### **✅ SIEMPRE HACER:**

- **Agregar funcionalidad** sin modificar existente
- **Crear nuevos componentes** en lugar de modificar existentes
- **Usar `CREATE TABLE IF NOT EXISTS`** para nuevas tablas
- **Usar `DROP POLICY IF EXISTS`** antes de crear políticas RLS
- **Verificar impacto** antes de cualquier cambio
- **Mantener retrocompatibilidad** con funcionalidad existente

### **❌ NUNCA HACER:**

- **Eliminar datos** de usuarios reales
- **Modificar tablas existentes** sin backup
- **Cambiar props** de componentes en uso
- **Eliminar funcionalidad** existente
- **Romper interfaces** de usuarios existentes
- **Ejecutar scripts SQL** sin revisar impacto

---

## **🔍 VALIDACIÓN OBLIGATORIA**

### **Antes de cualquier cambio:**

1. **¿Se eliminarán datos existentes?** → Si es SÍ, NO proceder
2. **¿Se modificarán datos existentes?** → Si es SÍ, confirmar con usuario
3. **¿Se afectará el acceso de usuarios actuales?** → Si es SÍ, revisar políticas
4. **¿Se creará nueva funcionalidad sin afectar existente?** → Si es SÍ, proceder

### **Checklist de seguridad:**

- [ ] **Verificado que NO se eliminen datos**
- [ ] **Confirmado que solo se agreguen funcionalidades**
- [ ] **Revisado que usuarios actuales mantengan acceso**
- [ ] **Validado que no se corrompan datos existentes**
- [ ] **Asegurado que la aplicación siga funcionando**

---

## **📋 COMPONENTES CRÍTICOS**

### **Base de Datos (NO TOCAR):**

- `public.watchlists` → Watchlists de usuarios reales
- `public.watchlist_movies` → Películas de usuarios reales
- `public.watchlist_members` → Miembros de watchlists reales
- `auth.users` → Usuarios reales

### **Componentes React (VERIFICAR IMPACTO):**

- `MediaCard.tsx` → Muestra películas de usuarios
- `WatchlistList.tsx` → Lista watchlists de usuarios
- `WatchlistItem.tsx` → Items de watchlists de usuarios
- `WatchlistDetail.tsx` → Detalle de watchlist de usuarios
- `AuthForm.tsx` → Autenticación de usuarios

---

## **🛡️ PATRONES SEGUROS**

### **Para nuevas funcionalidades:**

```sql
-- ✅ SEGURO: Crear nuevas tablas
CREATE TABLE IF NOT EXISTS public.new_table (...);

-- ✅ SEGURO: Agregar columnas
ALTER TABLE public.existing_table ADD COLUMN new_column type;

-- ✅ SEGURO: Crear políticas RLS
DROP POLICY IF EXISTS "policy_name" ON public.table_name;
CREATE POLICY "policy_name" ON public.table_name ...;
```

```tsx
// ✅ SEGURO: Crear nuevos componentes
export const NewComponent = ({ newProp }) => {
  return <div>Nueva funcionalidad</div>;
};

// ✅ SEGURO: Agregar props opcionales
export const ExistingComponent = ({
  existingProp,
  newProp = false, // Nueva prop opcional
}) => {
  return <div>Funcionalidad existente + nueva opcional</div>;
};
```

---

## **🚨 ALERTAS CRÍTICAS**

### **Si detectas cualquiera de estos patrones, DETENER inmediatamente:**

- `DROP TABLE` sin confirmación explícita
- `DELETE FROM` en tablas de usuarios
- `TRUNCATE` en cualquier tabla
- Cambiar nombres de props existentes
- Eliminar funcionalidad existente
- Modificar comportamiento crítico

### **Comandos de emergencia:**

- **Detener ejecución** si hay riesgo de pérdida de datos
- **Informar al usuario** sobre cualquier riesgo potencial
- **Sugerir backup** antes de cambios importantes
- **Validar impacto** antes de proceder

---

## **💡 MEJORES PRÁCTICAS**

### **Para desarrollo:**

1. **Crear nuevas funcionalidades** en lugar de modificar existentes
2. **Mantener retrocompatibilidad** con datos existentes
3. **Probar en entorno de desarrollo** antes de producción
4. **Documentar cambios** para otros desarrolladores

### **Para base de datos:**

1. **Solo agregar, nunca eliminar** datos existentes
2. **Usar `IF NOT EXISTS`** para evitar errores
3. **Mantener referencias** a tablas existentes
4. **Crear políticas RLS** apropiadas

### **Para componentes:**

1. **Crear nuevos componentes** para nuevas funcionalidades
2. **Usar props opcionales** para nueva funcionalidad
3. **Mantener interfaces existentes** intactas
4. **Probar componentes existentes** después de cambios

---

**🎯 OBJETIVO PRINCIPAL: Preservar la integridad de los datos de usuarios reales mientras se agregan nuevas funcionalidades de manera segura y sin interrupciones.**

---

## **📞 CONTACTO**

Si tienes dudas sobre la implementación de cualquier cambio, siempre es mejor preguntar antes de proceder. La seguridad de los datos de usuarios reales es la prioridad número uno.
