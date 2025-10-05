# Send Feedback Notification Edge Function

Esta Edge Function se encarga de enviar notificaciones por email cuando se recibe un nuevo feedback.

## Configuración

### Variables de Entorno Requeridas

Configura estas variables en el dashboard de Supabase (Settings > Edge Functions > Environment Variables):

```
RESEND_API_KEY=re_xxxxxxxxxx
ADMIN_EMAIL=marguepardo@gmail.com
```

### Pasos para configurar:

1. **Obtener API Key de Resend:**

   - Ve a https://resend.com
   - Crea una cuenta gratuita
   - Obtén tu API Key

2. **Configurar en Supabase:**

   - Ve a tu proyecto en Supabase
   - Settings > Edge Functions
   - Agrega las variables de entorno:
     - `RESEND_API_KEY`: Tu API key de Resend
     - `ADMIN_EMAIL`: Tu email donde quieres recibir las notificaciones

3. **Verificar dominio (opcional):**
   - En Resend, puedes verificar tu dominio para usar emails personalizados
   - Por defecto usa `noreply@cinecollab.com`

## Funcionamiento

1. Cuando un usuario envía feedback, se inserta en la tabla `feedback`
2. El trigger `feedback_notification_trigger` se activa automáticamente
3. Se llama a esta Edge Function con los datos del feedback
4. Se envía un email HTML con toda la información al administrador

## Tipos de Feedback Soportados

- 🐛 Bug Report
- 💡 Suggestion
- ⭐ Feature Request
- ❤️ Compliment
- 💬 Other

## Formato del Email

El email incluye:

- Tipo de feedback con emoji y color
- Asunto y mensaje del usuario
- Información del usuario (email, nombre)
- Fecha y hora
- ID único del feedback
- Diseño responsive y profesional
