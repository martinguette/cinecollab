import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { useGuest } from '@/hooks/use-guest';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Loader2,
  Send,
  MessageSquare,
  Bug,
  Lightbulb,
  Star,
  HelpCircle,
} from 'lucide-react';

interface FeedbackFormProps {
  onSuccess?: () => void;
}

export function FeedbackForm({ onSuccess }: FeedbackFormProps) {
  const { t } = useTranslation('feedback');
  const { t: tCommon } = useTranslation('common');
  const { user } = useAuth();
  const { isGuest, requireAuth } = useGuest();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    type: '',
    subject: '',
    message: '',
    language: 'en',
  });
  const [submitting, setSubmitting] = useState(false);

  const feedbackTypes = [
    {
      value: 'bug',
      label: t('form.types.bug'),
      icon: Bug,
      color: 'text-red-500',
    },
    {
      value: 'suggestion',
      label: t('form.types.suggestion'),
      icon: Lightbulb,
      color: 'text-yellow-500',
    },
    {
      value: 'feature',
      label: t('form.types.feature'),
      icon: Star,
      color: 'text-blue-500',
    },
    {
      value: 'compliment',
      label: t('form.types.compliment'),
      icon: MessageSquare,
      color: 'text-green-500',
    },
    {
      value: 'other',
      label: t('form.types.other'),
      icon: HelpCircle,
      color: 'text-gray-500',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isGuest) {
      requireAuth(() => {}, true);
      return;
    }

    if (!user) {
      toast({
        title: tCommon('errors.authRequired'),
        description: t('form.errors.loginRequired'),
        variant: 'destructive',
      });
      return;
    }

    if (
      !formData.type ||
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      toast({
        title: tCommon('errors.validationError'),
        description: t('form.errors.fillAllFields'),
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await (supabase as any).from('feedback').insert({
        user_id: user.id,
        type: formData.type,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        language: formData.language,
      });

      // Si el feedback se insertó correctamente, llamar a la Edge Function para enviar email
      if (!error) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          const user = userData?.user;

          if (user) {
            // Llamar a la Edge Function para enviar notificación por email
            await fetch(
              'https://fnsklauaxovbvatfquil.supabase.co/functions/v1/send-feedback-notification',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${
                    import.meta.env.VITE_SUPABASE_ANON_KEY
                  }`,
                },
                body: JSON.stringify({
                  id: 'temp-id', // Se generará automáticamente
                  type: formData.type,
                  subject: formData.subject.trim(),
                  message: formData.message.trim(),
                  language: formData.language,
                  status: 'pending',
                  priority: 'medium',
                  created_at: new Date().toISOString(),
                  user_email: user.email || 'Usuario no identificado',
                  user_name:
                    user.user_metadata?.name || user.email || 'Usuario',
                }),
              }
            );
          }
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
          // No fallar el proceso si el email falla
        }
      }

      if (error) {
        throw error;
      }

      toast({
        title: t('form.success.title'),
        description: t('form.success.description'),
      });

      // Reset form
      setFormData({
        type: '',
        subject: '',
        message: '',
        language: 'en',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: tCommon('errors.submissionFailed'),
        description: error.message || t('form.errors.submissionFailed'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {t('form.title')}
        </CardTitle>
        <CardDescription>{t('form.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Language Selection */}
          <div className="space-y-2">
            <Label htmlFor="language">{t('form.language')}</Label>
            <Select
              value={formData.language}
              onValueChange={(value) => handleInputChange('language', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('form.selectLanguage')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Feedback Type */}
          <div className="space-y-2">
            <Label>{t('form.feedbackType')}</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {feedbackTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.value}
                    type="button"
                    variant={
                      formData.type === type.value ? 'default' : 'outline'
                    }
                    className={`h-auto p-4 flex flex-col items-center gap-2 ${
                      formData.type === type.value
                        ? 'bg-primary text-primary-foreground'
                        : ''
                    }`}
                    onClick={() => handleInputChange('type', type.value)}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        formData.type === type.value
                          ? 'text-primary-foreground'
                          : type.color
                      }`}
                    />
                    <span className="text-sm font-medium">{type.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">{t('form.subject')}</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder={t('form.subjectPlaceholder')}
              maxLength={200}
              required
            />
            <p className="text-xs text-muted-foreground">
              {formData.subject.length}/200 {t('form.characters')}
            </p>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">{t('form.message')}</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder={t('form.messagePlaceholder')}
              rows={6}
              maxLength={2000}
              required
            />
            <p className="text-xs text-muted-foreground">
              {formData.message.length}/2000 {t('form.characters')}
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={
              submitting ||
              !formData.type ||
              !formData.subject.trim() ||
              !formData.message.trim()
            }
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('form.submitting')}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {t('form.submit')}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
