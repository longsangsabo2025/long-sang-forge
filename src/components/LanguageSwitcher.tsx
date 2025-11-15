import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const changeLanguage = (lng: string) => {
    if (lng === i18n.language) return;
    
    setIsTransitioning(true);
    
    // Fade out
    setTimeout(() => {
      i18n.changeLanguage(lng);
      localStorage.setItem('longsang-language', lng);
      
      // Fade in
      setTimeout(() => {
        setIsTransitioning(false);
      }, 200);
    }, 200);
  };

  return (
    <div 
      className={`flex items-center gap-2 text-sm font-medium transition-opacity duration-200 ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <button
        onClick={() => changeLanguage('vi')}
        className={`transition-all duration-200 ${
          i18n.language === 'vi'
            ? 'text-primary font-semibold'
            : 'text-muted-foreground opacity-70 hover:opacity-100'
        }`}
      >
        🇻🇳 VI
      </button>
      <span className="text-muted-foreground">|</span>
      <button
        onClick={() => changeLanguage('en')}
        className={`transition-all duration-200 ${
          i18n.language === 'en'
            ? 'text-primary font-semibold'
            : 'text-muted-foreground opacity-70 hover:opacity-100'
        }`}
      >
        🇺🇸 EN
      </button>
    </div>
  );
};
