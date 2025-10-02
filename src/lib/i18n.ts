import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    // Remove explicit lng to allow automatic detection

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      requestOptions: {
        cache: 'no-cache', // Prevent caching issues
      },
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
      // Convert browser language codes to our supported languages
      convertDetectedLanguage: (lng) => {
        // Handle language codes like 'es-ES', 'es-MX' -> 'es'
        // Handle language codes like 'en-US', 'en-GB' -> 'en'
        const supportedLanguages = ['en', 'es'];
        const detectedLang = lng.split('-')[0].toLowerCase();
        return supportedLanguages.includes(detectedLang) ? detectedLang : 'en';
      },
    },

    supportedLngs: ['en', 'es'],
    cleanCode: true,

    ns: ['common', 'auth', 'watchlists'],
    defaultNS: 'common',

    react: {
      useSuspense: false, // Prevent suspense issues
    },
  });

export default i18n;
