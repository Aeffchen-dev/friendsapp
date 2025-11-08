
import { useState, useEffect } from 'react';
import { QuizCard } from './QuizCard';
import { CategorySelector } from './CategorySelector';

interface Question {
  question: string;
  category: string;
}

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
  const [logoSqueezeLeft, setLogoSqueezeLeft] = useState(false);
  const [logoSqueezeRight, setLogoSqueezeRight] = useState(false);

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
      setLogoSqueezeLeft(true);
      setAnimationClass('animate-slide-out-left');
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setAnimationClass('animate-slide-in-right');
        setTimeout(() => {
          setAnimationClass('');
          setLogoSqueezeLeft(false);
        }, 500);
      }, 300);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setLogoSqueezeRight(true);
      setAnimationClass('animate-slide-out-right');
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
        setAnimationClass('animate-slide-in-left');
        setTimeout(() => {
          setAnimationClass('');
          setLogoSqueezeRight(false);
        }, 500);
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

  // Update body background color based on current question's category
  useEffect(() => {
    if (questions.length > 0 && questions[currentIndex]) {
      const category = questions[currentIndex].category.toLowerCase().replace(/\s+/g, '-');
      const categoryColorMap: Record<string, string> = {
        'fuck': '150 100% 50%',
        'connection': '270 100% 65%',
        'identity': '20 100% 55%',
        'party': '190 100% 20%',
        'friends': '320 100% 60%',
        'self-reflection': '340 100% 25%',
        'family': '150 100% 50%',
        'career': '270 100% 65%',
        'travel': '20 100% 55%',
        'health': '190 100% 20%',
        'money': '320 100% 60%',
        'love': '340 100% 25%',
        'hobby': '150 100% 50%',
        'dreams': '270 100% 65%',
        'fear': '20 100% 55%',
        'wisdom': '190 100% 20%',
        'future': '320 100% 60%',
        'wer-aus-der-runde': '340 100% 25%',
      };
      
      const color = categoryColorMap[category] || '0 0% 0%';
      document.body.style.backgroundColor = `hsl(${color})`;
      document.body.style.transition = 'background-color 0.3s ease';
    }
    
    // Cleanup function to reset background on unmount
    return () => {
      document.body.style.backgroundColor = '#000000';
    };
  }, [currentIndex, questions]);

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

  return (
    <div className="h-[100svh] bg-background overflow-hidden flex flex-col">
      {/* App Header - Always visible */}
      <div className="app-header bg-black flex-shrink-0" style={{position: 'sticky', top: 0, zIndex: 50, backgroundColor: '#000000'}}>
        <div className="flex justify-between items-baseline px-4 py-4">
          <img 
            src="/assets/logo.png" 
            alt="Logo" 
            className={`h-8 w-auto logo-clickable align-baseline ${logoStretch ? 'logo-stretch' : ''} ${logoSqueezeLeft ? 'logo-squeeze-left' : ''} ${logoSqueezeRight ? 'logo-squeeze-right' : ''}`}
            onClick={handleLogoClick}
          />
          <button 
            onClick={() => setCategorySelectorOpen(true)}
            className="text-white font-normal text-xs align-baseline"
            style={{fontSize: '14px'}}
          >
            Kategorien wählen
          </button>
        </div>
      </div>

      {/* Main Quiz Container */}
      <div className="flex-1 flex justify-center items-center mx-4 overflow-hidden" style={{ padding: '16px 0', paddingTop: '48px' }}>
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
            />
          ) : (
            <div className="h-full flex items-center justify-center min-h-[calc(100svh-120px)]">
              <div className="text-white text-sm">Keine Fragen verfügbar</div>
            </div>
          )}
        </div>
      </div>
        
      {/* Bottom Link - Always visible */}
      <div className="app-footer bg-background/80 backdrop-blur-sm flex-shrink-0 h-5">
        <div className="flex justify-center items-center px-4 h-full">
          <a 
            href="mailto:hello@relationshipbydesign.de?subject=Friends%20App%20Frage" 
            className="text-white font-normal text-xs"
            style={{fontSize: '14px', lineHeight: '20px'}}
          >
            Frage einreichen
          </a>
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
