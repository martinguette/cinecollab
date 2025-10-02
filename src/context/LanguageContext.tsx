import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => Promise<void>;
  isChanging: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<string>(
    i18n.language || 'en'
  );
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    // Sincronizar con i18next cuando cambie
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
      setIsChanging(false);
    };

    i18n.on('languageChanged', handleLanguageChange);

    // Cleanup
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const changeLanguage = async (language: string) => {
    if (language === currentLanguage) return;

    setIsChanging(true);
    try {
      // Cambiar idioma en i18next
      await i18n.changeLanguage(language);

      // Guardar en localStorage para persistencia
      localStorage.setItem('i18nextLng', language);

      // Recargar recursos para asegurar traducciones frescas
      await i18n.reloadResources();

      // El estado se actualiza automáticamente via el event listener
    } catch (error) {
      console.error('Error changing language:', error);
      setIsChanging(false);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        isChanging,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export { LanguageContext };
