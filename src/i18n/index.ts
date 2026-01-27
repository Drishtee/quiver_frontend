import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import hi from './locales/hi.json';
import as from './locales/as.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  as: { translation: as }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('quiver_language') || 'hi',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'quiver_language',
      caches: ['localStorage']
    }
  });

export default i18n;

export const changeLanguage = (lang: string) => {
  localStorage.setItem('quiver_language', lang);
  i18n.changeLanguage(lang);
};

export const getCurrentLanguage = () => i18n.language;

export type SupportedLanguage = 'en' | 'hi' | 'as';

export const languages: { code: SupportedLanguage; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' }
];
