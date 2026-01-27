import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'button';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'default',
  className = ''
}) => {
  const { currentLanguage, setLanguage, languages, t } = useLanguage();

  const currentLang = languages.find(l => l.code === currentLanguage);

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={`flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors ${className}`}>
            <Globe className="w-4 h-4" />
            <span>{currentLang?.nativeName}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{lang.nativeName}</span>
              {currentLanguage === lang.code && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'button') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 hover:border-primary hover:bg-gray-50 transition-all ${className}`}>
            <Globe className="w-4 h-4" />
            <span className="font-medium">{currentLang?.nativeName}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
            {t('languages.selectLanguage')}
          </div>
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className="flex items-center justify-between cursor-pointer py-2"
            >
              <div className="flex flex-col">
                <span className="font-medium">{lang.nativeName}</span>
                <span className="text-xs text-gray-500">{lang.name}</span>
              </div>
              {currentLanguage === lang.code && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default variant - inline buttons
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            currentLanguage === lang.code
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {lang.nativeName}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
