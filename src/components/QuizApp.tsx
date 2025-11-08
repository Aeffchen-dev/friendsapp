
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
      return 'hsl(290, 100%, 50%)'; // Default matches strip palette
  }
};

export function QuizApp() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadStartTime] = useState(Date.now());
  const [categorySelectorOpen, setCategorySelectorOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [logoStretch, setLogoStretch] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [targetCategory, setTargetCategory] = useState<string>('');
  const [logoSqueezeDirection, setLogoSqueezeDirection] = useState(0);

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
        // Smart shuffle: avoid consecutive same categories
        const shuffledQuestions = smartShuffleByCategory([...parsedQuestions]);
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

  // Smart shuffle to avoid consecutive same categories
  const smartShuffleByCategory = (questions: Question[]): Question[] => {
    if (questions.length <= 1) return questions;
    
    // First, do a basic shuffle
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    
    // Then, try to swap questions to avoid consecutive same categories
    for (let i = 0; i < shuffled.length - 1; i++) {
      if (shuffled[i].category === shuffled[i + 1].category) {
        // Find a different category question to swap with
        let swapIndex = -1;
        for (let j = i + 2; j < shuffled.length; j++) {
          if (shuffled[j].category !== shuffled[i].category && 
              shuffled[j].category !== shuffled[i - 1]?.category) {
            swapIndex = j;
            break;
          }
        }
        
        // If found, swap
        if (swapIndex !== -1) {
          const temp = shuffled[i + 1];
          shuffled[i + 1] = shuffled[swapIndex];
          shuffled[swapIndex] = temp;
        }
      }
    }
    
    return shuffled;
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setLogoSqueezeDirection(-1);
      setCurrentIndex(prev => prev + 1);
      setDragProgress(0);
      setTargetCategory('');
      setLogoSqueezeDirection(0);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setLogoSqueezeDirection(1);
      setCurrentIndex(prev => prev - 1);
      setDragProgress(0);
      setTargetCategory('');
      setLogoSqueezeDirection(0);
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

  // Interpolate between colors during drag - using shortest hue path
  const interpolateColor = (color1: string, color2: string, progress: number) => {
    const hslRegex = /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/;
    const match1 = color1.match(hslRegex);
    const match2 = color2.match(hslRegex);
    
    if (!match1 || !match2) return color1;
    
    let h1 = parseInt(match1[1]);
    const s1 = parseInt(match1[2]);
    const l1 = parseInt(match1[3]);
    
    let h2 = parseInt(match2[1]);
    const s2 = parseInt(match2[2]);
    const l2 = parseInt(match2[3]);
    
    // Calculate shortest hue distance
    let hueDiff = h2 - h1;
    if (hueDiff > 180) {
      hueDiff -= 360;
    } else if (hueDiff < -180) {
      hueDiff += 360;
    }
    
    // Interpolate using shortest path
    let h = h1 + hueDiff * progress;
    if (h < 0) h += 360;
    if (h >= 360) h -= 360;
    
    const s = Math.round(s1 + (s2 - s1) * progress);
    const l = Math.round(l1 + (l2 - l1) * progress);
    
    return `hsl(${Math.round(h)}, ${s}%, ${l}%)`;
  };

  const getCurrentBackgroundColor = () => {
    if (loading) return 'hsl(0, 100%, 65%)';
    if (questions.length === 0) return 'hsl(0, 100%, 65%)';
    
    const currentColor = getCategoryBodyColor(questions[currentIndex].category);
    
    if (dragProgress > 0 && targetCategory) {
      const targetColor = getCategoryBodyColor(targetCategory);
      return interpolateColor(currentColor, targetColor, dragProgress);
    }
    
    return currentColor;
  };

  const currentBodyColor = getCurrentBackgroundColor();

  const handleDragStateChange = (isDragging: boolean, progress: number, category: string, direction: number) => {
    setDragProgress(progress);
    setTargetCategory(category);
    setLogoSqueezeDirection(progress > 0 ? direction : 0);
  };

  // Update body background color and theme-color meta tag for iOS
  useEffect(() => {
    // Update CSS variable to drive page background everywhere
    document.documentElement.style.setProperty('--page-bg', currentBodyColor);

    // Keep body transition smooth
    document.body.style.backgroundColor = currentBodyColor;
    document.body.style.transition = 'background-color 0.8s ease-out';
    
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', currentBodyColor);
    }
  }, [currentBodyColor]);

  return (
    <div 
      className="h-[100svh] overflow-visible flex flex-col relative"
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
      {/* App Header - Always visible */}
      <div className="app-header flex-shrink-0" style={{position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'transparent'}}>
        <div className="flex justify-between items-center px-4 py-4">
          <img 
            src="/assets/logo.png" 
            alt="Logo" 
            className={`h-8 w-auto logo-clickable ${logoStretch ? 'logo-stretch' : ''} ${logoSqueezeDirection < 0 ? 'logo-squeeze-left' : logoSqueezeDirection > 0 ? 'logo-squeeze-right' : ''}`}
            onClick={handleLogoClick}
            style={{ filter: 'brightness(0)' }}
          />
          {!loading && (
            <button 
              onClick={() => setCategorySelectorOpen(true)}
              className="text-black font-normal text-xs"
              style={{fontSize: '14px'}}
            >
              Kategorien wählen
            </button>
          )}
        </div>
      </div>

      {/* Main Quiz Container */}
      <div className="flex-1 flex justify-center items-center overflow-visible absolute z-10" style={{ top: '32px', bottom: 0, left: 0, right: 0 }}>
        <div className="w-full h-full flex justify-center items-center">
          {loading ? (
            <div className="h-full flex items-center justify-center min-h-[calc(100svh-120px)]">
              {/* Loading state - no text shown */}
            </div>
          ) : questions.length > 0 ? (
            <QuizCard
              currentQuestion={questions[currentIndex]}
              nextQuestion={currentIndex < questions.length - 1 ? questions[currentIndex + 1] : null}
              prevQuestion={currentIndex > 0 ? questions[currentIndex - 1] : null}
              onSwipeLeft={nextQuestion}
              onSwipeRight={prevQuestion}
              onDragStateChange={handleDragStateChange}
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
