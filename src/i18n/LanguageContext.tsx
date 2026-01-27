import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, languages, type SupportedLanguage } from './index';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  languages: typeof languages;
  t: (key: string, options?: object) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(
    (localStorage.getItem('quiver_language') as SupportedLanguage) || 'hi'
  );

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
    changeLanguage(lang);
  }, []);

  useEffect(() => {
    const savedLang = localStorage.getItem('quiver_language') as SupportedLanguage;
    if (savedLang && savedLang !== currentLanguage) {
      setCurrentLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    if (i18n.language !== currentLanguage) {
      i18n.changeLanguage(currentLanguage);
    }
  }, [currentLanguage, i18n]);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        languages,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
