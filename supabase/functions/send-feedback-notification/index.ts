import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();

    // Obtener información del usuario
    const userEmail = record.user_email || 'Usuario no identificado';
    const userName = record.user_name || 'Usuario';

    // Configurar el tipo de feedback y emoji
    const feedbackTypes = {
      bug: { emoji: '🐛', name: 'Bug Report', color: '#ef4444' },
      suggestion: { emoji: '💡', name: 'Suggestion', color: '#f59e0b' },
      feature: { emoji: '⭐', name: 'Feature Request', color: '#3b82f6' },
      compliment: { emoji: '❤️', name: 'Compliment', color: '#10b981' },
      other: { emoji: '💬', name: 'Other', color: '#6b7280' },
    };

    const feedbackType =
      feedbackTypes[record.type as keyof typeof feedbackTypes] ||
      feedbackTypes.other;

    // Crear el HTML del email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nuevo Feedback - CineCollab</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">
              ${feedbackType.emoji} Nuevo Feedback - CineCollab
            </h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${
              feedbackType.color
            };">
              <h2 style="margin: 0 0 10px 0; color: ${feedbackType.color};">
                ${feedbackType.emoji} ${feedbackType.name}
              </h2>
              <p style="margin: 0; font-size: 14px; color: #666;">
                Idioma: ${record.language === 'es' ? 'Español' : 'English'}
              </p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #333;">📝 Asunto</h3>
              <p style="margin: 0; font-size: 16px; font-weight: 500;">${
                record.subject
              }</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #333;">💬 Mensaje</h3>
              <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${
                record.message
              }</p>
            </div>
            
            <div style="background: #f1f3f4; padding: 15px; border-radius: 8px; font-size: 14px;">
              <p style="margin: 0 0 5px 0;"><strong>👤 Usuario:</strong> ${userName} (${userEmail})</p>
              <p style="margin: 0 0 5px 0;"><strong>📅 Fecha:</strong> ${new Date(
                record.created_at
              ).toLocaleString('es-ES')}</p>
              <p style="margin: 0;"><strong>🆔 ID:</strong> ${record.id}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              📧 Este email fue enviado automáticamente desde CineCollab
            </p>
          </div>
        </body>
      </html>
    `;

    // Enviar email usando Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CineCollab <noreply@cinecollab.com>',
        to: [Deno.env.get('ADMIN_EMAIL') || 'marguepardo@gmail.com'],
        subject: `${feedbackType.emoji} Nuevo ${feedbackType.name}: ${record.subject}`,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const result = await resendResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        emailId: result.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending feedback notification:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
