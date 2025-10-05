import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MessageSquare, Heart, Lightbulb, Bug, Star } from 'lucide-react';

const Feedback = () => {
  const { t } = useTranslation('feedback');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <MessageSquare className="h-8 w-8" />
            {t('page.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('page.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Bug Reports */}
          <Card>
            <CardHeader className="text-center">
              <Bug className="h-8 w-8 mx-auto text-red-500 mb-2" />
              <CardTitle className="text-lg">
                {t('page.cards.bug.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                {t('page.cards.bug.description')}
              </CardDescription>
            </CardContent>
          </Card>

          {/* Suggestions */}
          <Card>
            <CardHeader className="text-center">
              <Lightbulb className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
              <CardTitle className="text-lg">
                {t('page.cards.suggestion.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                {t('page.cards.suggestion.description')}
              </CardDescription>
            </CardContent>
          </Card>

          {/* Compliments */}
          <Card>
            <CardHeader className="text-center">
              <Heart className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <CardTitle className="text-lg">
                {t('page.cards.compliment.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                {t('page.cards.compliment.description')}
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Form */}
        <FeedbackForm />
      </div>
    </Layout>
  );
};

export default Feedback;
