import { QuizApp } from '@/components/QuizApp';
import { LanguageProvider } from '@/contexts/LanguageContext';

const Index = () => {
  return (
    <LanguageProvider>
      <QuizApp />
    </LanguageProvider>
  );
};

export default Index;
