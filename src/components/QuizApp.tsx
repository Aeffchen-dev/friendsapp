
import { useState, useEffect } from 'react';
import { QuizCard } from './QuizCard';
import { CategorySelector } from './CategorySelector';

interface Question {
  question: string;
  category: string;
}

const getCategoryBodyColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'fuck':
      return 'hsl(300, 100%, 50%)'; // #FF00FF
    case 'friends':
      return 'hsl(0, 100%, 50%)'; // #FF0000
    case 'self reflection':
      return 'hsl(290, 100%, 50%)'; // #D400FF
    case 'party':
      return 'hsl(15, 100%, 50%)'; // #FF4100
    case 'family':
      return 'hsl(328, 100%, 56%)'; // #FF20A2
    case 'connection':
      return 'hsl(0, 100%, 50%)'; // #FF0000
    case 'identity':
      return 'hsl(328, 100%, 56%)'; // #FF20A2
    case 'career':
      return 'hsl(290, 100%, 50%)'; // #D400FF
    case 'travel':
      return 'hsl(15, 100%, 50%)'; // #FF4100
    case 'health':
      return 'hsl(300, 100%, 50%)'; // #FF00FF
    case 'money':
      return 'hsl(290, 100%, 50%)'; // #D400FF
    case 'love':
      return 'hsl(15, 100%, 50%)'; // #FF4100
    case 'hobby':
      return 'hsl(328, 100%, 56%)'; // #FF20A2
    case 'dreams':
      return 'hsl(300, 100%, 50%)'; // #FF00FF
    case 'fear':
      return 'hsl(0, 100%, 50%)'; // #FF0000
    case 'wisdom':
      return 'hsl(290, 100%, 50%)'; // #D400FF
    case 'future':
      return 'hsl(15, 100%, 50%)'; // #FF4100
    default:
      return 'hsl(290, 100%, 50%)'; // #D400FF
  }
};

export function QuizApp() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadStartTime] = useState(Date.now());
  const [categorySelectorOpen, setCategorySelectorOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [logoStretch, setLogoStretch] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Start logo animation and data loading together
    setLogoStretch(true);
    fetchQuestions();

    // Reset logo animation after it completes
    const logoTimer = setTimeout(() => {
      setLogoStretch(false);
    }, 2500);

    return () => clearTimeout(logoTimer);
  }, []);

  const fetchQuestions = async () => {
    try {
      let csvText = '';
      
      // Try Google Sheets first
      try {
        const sheetId = '1-5NpzNwUiAsl_BPruHygyUbpO3LHkWr8E08fqkypOcU';
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
        
        const response = await fetch(csvUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch data from Google Sheets');
        }
        csvText = await response.text();
      } catch (googleError) {
        console.error('Error fetching from Google Sheets, trying local CSV:', googleError);
        // Fallback to local CSV file
        const localResponse = await fetch('/quiz_questions.csv');
        if (!localResponse.ok) {
          throw new Error('Failed to fetch local CSV file');
        }
        csvText = await localResponse.text();
      }
      
      // Parse CSV data
      const lines = csvText.split('\n');
      const parsedQuestions: Question[] = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines
        
        // Simple CSV parsing - handles quotes and commas
        const columns = parseCSVLine(line);
        
        if (columns.length >= 2 && columns[0] && columns[1]) {
          parsedQuestions.push({
            question: columns[0].trim(),
            category: columns[1].trim()
          });
        }
      }
      
      if (parsedQuestions.length > 0) {
        // Shuffle questions randomly
        const shuffledQuestions = [...parsedQuestions].sort(() => Math.random() - 0.5);
        setAllQuestions(shuffledQuestions);
        setQuestions(shuffledQuestions);
        
        // Extract unique categories
        const categories = Array.from(new Set(parsedQuestions.map(q => q.category)));
        setAvailableCategories(categories);
        setSelectedCategories(categories); // Start with all categories selected
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      // Ensure animation plays for minimum 2.5s from start
      const elapsed = Date.now() - loadStartTime;
      const remainingTime = Math.max(0, 2500 - elapsed);
      
      setTimeout(() => {
        setLoading(false);
        setLogoStretch(false);
      }, remainingTime);
    }
  };

  // Helper function to parse CSV line with proper quote handling
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        // Handle escaped quotes
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }, 300);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }, 300);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevQuestion();
    } else if (e.key === 'ArrowRight') {
      nextQuestion();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex]);

  // Filter questions based on selected categories
  useEffect(() => {
    if (selectedCategories.length === 0) {
      setQuestions([]);
    } else {
      const filteredQuestions = allQuestions.filter(q => 
        selectedCategories.includes(q.category)
      );
      setQuestions(filteredQuestions);
      setCurrentIndex(0); // Reset to first question when filtering
    }
  }, [selectedCategories, allQuestions]);

  const triggerLogoStretch = () => {
    setLogoStretch(true);
    setTimeout(() => setLogoStretch(false), 2500);
  };

  const handleLogoClick = () => {
    triggerLogoStretch();
  };

  const handleCategoriesChange = (categories: string[]) => {
    setSelectedCategories(categories);
  };

  const handleModalClose = () => {
    setCategorySelectorOpen(false);
  };

  const currentBodyColor = loading 
    ? 'hsl(0, 100%, 50%)' 
    : (questions.length > 0 && activeCategory && !isTransitioning
      ? getCategoryBodyColor(activeCategory) 
      : questions.length > 0 
        ? getCategoryBodyColor(questions[currentIndex].category) 
        : 'hsl(0, 100%, 50%)');

  return (
    <div 
      className="h-[100svh] overflow-hidden flex flex-col relative"
      style={{ 
        backgroundColor: currentBodyColor,
        transition: (isDragging || isTransitioning) ? 'none' : 'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Large "Friends" text at bottom */}
      <div 
        className="fixed left-1/2 pointer-events-none z-0"
        style={{
          bottom: '0',
          transform: 'translateX(-50%) translateY(20%)',
          width: '150vw',
        }}
      >
        {/* Desktop: Friends */}
        <div 
          className="hidden md:block font-bold whitespace-nowrap text-center"
          style={{
            fontSize: '30vw',
            lineHeight: '1',
            fontFamily: "'Factor A', sans-serif",
            color: '#000000',
            fontFeatureSettings: "'salt' 1, 'ss01' 1, 'ss02' 1",
          }}
        >
          Friends
        </div>
        {/* Mobile: Ask */}
        <div 
          className="block md:hidden font-bold whitespace-nowrap text-center"
          style={{
            fontSize: '60vw',
            lineHeight: '1',
            fontFamily: "'Factor A', sans-serif",
            color: '#000000',
            fontFeatureSettings: "'salt' 1, 'ss01' 1, 'ss02' 1",
          }}
        >
          Ask
        </div>
      </div>
      {/* App Header - Hidden during loading */}
      {!loading && (
        <div className="app-header flex-shrink-0" style={{position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'transparent'}}>
          <div className="flex justify-between items-center px-4 py-4">
            <img 
              src="/assets/logo.png" 
              alt="Logo" 
              className={`h-8 w-auto logo-clickable ${logoStretch ? 'logo-stretch' : ''}`}
              onClick={handleLogoClick}
              style={{ filter: 'brightness(0)' }}
            />
            <button 
              onClick={() => setCategorySelectorOpen(true)}
              className="text-black font-normal text-xs"
              style={{fontSize: '14px'}}
            >
              Kategorien wählen
            </button>
          </div>
        </div>
      )}

      {/* Main Quiz Container */}
      <div className="flex-1 flex justify-center items-center overflow-hidden absolute inset-0 z-10" style={{ height: '100vh', width: '100vw' }}>
        <div className="w-full h-full flex justify-center items-center">
          {loading ? (
            <div className="h-full flex items-center justify-center min-h-[calc(100svh-120px)]">
              {/* Loading text removed - handled by static HTML */}
            </div>
          ) : questions.length > 0 ? (
            <QuizCard
              currentQuestion={questions[currentIndex]}
              nextQuestion={currentIndex < questions.length - 1 ? questions[currentIndex + 1] : null}
              prevQuestion={currentIndex > 0 ? questions[currentIndex - 1] : null}
              onSwipeLeft={nextQuestion}
              onSwipeRight={prevQuestion}
              onDragStateChange={setIsDragging}
              onActiveCategoryChange={setActiveCategory}
            />
          ) : (
            <div className="h-full flex items-center justify-center min-h-[calc(100svh-120px)]">
              <div className="text-white text-sm">Keine Fragen verfügbar</div>
            </div>
          )}
        </div>
      </div>
      
      <CategorySelector
        open={categorySelectorOpen}
        onOpenChange={handleModalClose}
        categories={availableCategories}
        selectedCategories={selectedCategories}
        onCategoriesChange={handleCategoriesChange}
      />
    </div>
  );
}
