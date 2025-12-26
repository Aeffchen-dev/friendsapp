import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'de' | 'en';

interface Translations {
  chooseCategories: string;
  submitQuestion: string;
  noQuestionsAvailable: string;
  sendQuestion: string;
  shareExcerpt: string;
  linkCopied: string;
  linkCopiedDescription: string;
  selectCategoriesDescription: string;
}

const translations: Record<Language, Translations> = {
  de: {
    chooseCategories: 'Kategorien wählen',
    submitQuestion: 'Frage einreichen',
    noQuestionsAvailable: 'Keine Fragen verfügbar',
    sendQuestion: 'Frage verschicken',
    shareExcerpt: 'Ich spiele gerade die Friends App und wollte dir diese Frage schicken:',
    linkCopied: 'Link kopiert!',
    linkCopiedDescription: 'Der Share-Link wurde in die Zwischenablage kopiert',
    selectCategoriesDescription: 'Wählen Sie die Kategorien aus, die Sie sehen möchten',
  },
  en: {
    chooseCategories: 'Choose categories',
    submitQuestion: 'Submit question',
    noQuestionsAvailable: 'No questions available',
    sendQuestion: 'Send question',
    shareExcerpt: "I'm playing the Friends App and wanted to send you this question:",
    linkCopied: 'Link copied!',
    linkCopiedDescription: 'Share link has been copied to clipboard',
    selectCategoriesDescription: 'Select the categories you want to see',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('de');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'de' ? 'en' : 'de');
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t: translations[language],
      toggleLanguage 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
