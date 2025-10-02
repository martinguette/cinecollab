import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/useAuth';
import { getAvatarUrl, getUserInitials, getDisplayName } from '@/lib/avatar';
import { Mail, User, Calendar, Camera } from 'lucide-react';

export function Profile() {
  const { t } = useTranslation('common');
  const { user } = useAuth();

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">{t('auth.loginRequired')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">
              {t('profile.title', 'Profile')}
            </h1>
            <p className="text-muted-foreground">
              {t('profile.subtitle', 'Manage your account information')}
            </p>
          </div>

          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                {t('profile.avatar', 'Profile Picture')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar
                  src={getAvatarUrl(user)}
                  alt={getDisplayName(user)}
                  fallback={getUserInitials(user)}
                  size="xl"
                />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {getAvatarUrl(user)
                      ? t(
                          'profile.avatarFromGoogle',
                          'Using your Google profile picture'
                        )
                      : t('profile.avatarInitials', 'Showing your initials')}
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    {t('profile.changeAvatar', 'Change Avatar')}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({t('profile.comingSoon', 'Coming Soon')})
                    </span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('profile.information', 'Account Information')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {t('profile.name', 'Name')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getDisplayName(user)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {t('profile.email', 'Email')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {t('profile.userId', 'User ID')}
                    </p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {user.id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button variant="outline" disabled>
                  {t('profile.editProfile', 'Edit Profile')}
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({t('profile.comingSoon', 'Coming Soon')})
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t('profile.accountActions', 'Account Actions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t(
                    'profile.accountActionsDesc',
                    'More account management options will be available soon.'
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
