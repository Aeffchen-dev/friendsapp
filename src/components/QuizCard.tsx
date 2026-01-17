import { useState, useRef, useEffect, useCallback } from 'react';
import { applyGermanHyphenation } from '@/lib/hyphenation';
import { ShareDialog } from './ShareDialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateToEnglish, getCachedTranslation } from '@/lib/translationService';
import { translateCategory } from '@/lib/questionTranslations';
interface Question {
  question: string;
  questionEn: string;
  category: string;
}

interface QuizCardProps {
  currentQuestion: Question;
  nextQuestion: Question | null;
  prevQuestion: Question | null;
  adjacentQuestions?: Question[];
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onDragStateChange?: (isDragging: boolean, progress: number, targetCategory: string, direction: number) => void;
  questionIndex: number;
}

export function QuizCard({ currentQuestion, nextQuestion, prevQuestion, adjacentQuestions = [], onSwipeLeft, onSwipeRight, onDragStateChange, questionIndex }: QuizCardProps) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isSnapping, setIsSnapping] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
  const { language } = useLanguage();

  // Synchronously populate from cache on every render to prevent flicker
  const getTranslation = useCallback((question: string): string | undefined => {
    // Check local state first, then global cache
    return translatedTexts[question] || getCachedTranslation(question);
  }, [translatedTexts]);

  // Pre-translate questions when language is English - run in parallel for speed
  const translateQuestions = useCallback(async () => {
    if (language !== 'en') {
      setTranslatedTexts({});
      return;
    }
    
    // Include current, next, prev, and adjacent questions for pre-fetching
    const allQuestionsToProcess = [currentQuestion, nextQuestion, prevQuestion, ...adjacentQuestions]
      .filter((q): q is Question => q !== null);
    
    // Immediately sync all cached translations to state
    const cachedTranslations: Record<string, string> = {};
    allQuestionsToProcess.forEach(q => {
      const cached = getCachedTranslation(q.question);
      if (cached) cachedTranslations[q.question] = cached;
    });
    
    // Always update state with cached values immediately
    if (Object.keys(cachedTranslations).length > 0) {
      setTranslatedTexts(prev => ({ ...prev, ...cachedTranslations }));
    }
    
    const questionsToTranslate = allQuestionsToProcess
      .map(q => q.question)
      .filter(q => !getCachedTranslation(q)); // Only translate uncached
    
    if (questionsToTranslate.length === 0) return;
    
    // Translate all uncached questions in parallel
    const translationPromises = questionsToTranslate.map(async (question) => {
      const translated = await translateToEnglish(question);
      return { question, translated };
    });
    
    const results = await Promise.all(translationPromises);
    const newTranslations: Record<string, string> = {};
    results.forEach(({ question, translated }) => {
      newTranslations[question] = translated;
    });
    
    setTranslatedTexts(prev => ({ ...prev, ...newTranslations }));
  }, [currentQuestion, nextQuestion, prevQuestion, adjacentQuestions, language]);

  useEffect(() => {
    translateQuestions();
  }, [translateQuestions]);

  // Check if a question is currently being translated
  const isTranslating = useCallback((question: string): boolean => {
    if (language === 'de') return false;
    return !getTranslation(question);
  }, [language, getTranslation]);

  // Get translated or original question text
  const getQuestionText = (question: string): string => {
    if (language === 'de') return question;
    return getTranslation(question) || question;
  };
  
  const containerRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLHeadingElement>(null);
  const minSwipeDistance = 50;

  // Reset drag when question changes
  useEffect(() => {
    setDragOffset(0);
    setIsSnapping(false);
  }, [currentQuestion]);

  // Measure container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (questionRef.current) {
        setContainerWidth(questionRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Apply hyphenation to question text
  const hyphenateQuestion = (question: string) => {
    if (!containerWidth || !questionRef.current) return question;

    const computedStyle = window.getComputedStyle(questionRef.current);
    const fontSize = parseFloat(computedStyle.fontSize);
    const fontFamily = computedStyle.fontFamily || "'Factor A', sans-serif";
    const fontWeight = computedStyle.fontWeight || 'bold';

    return applyGermanHyphenation(question, {
      containerWidth,
      fontSize,
      fontFamily,
      fontWeight,
      bufferPx: 16,
    });
  };

  // Get category-specific neon color - using the 5 color palette
  const getCategoryColors = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fuck':
        return { 
          stripBg: 'hsl(15, 100%, 50%)', 
          bodyBg: 'hsl(15, 100%, 50%)', 
          cardFill: 'rgba(180, 40, 100, 0.25)',
          gradient: `
            radial-gradient(ellipse 60% 80% at -15% 50%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 200, 255, 0.6) 20%, rgba(180, 100, 180, 0.3) 45%, transparent 70%),
            radial-gradient(ellipse 100% 100% at 100% 100%, rgba(0, 0, 0, 0.25) 0%, transparent 50%)
          `
        };
      case 'friends':
      case 'wer aus der runde':
        return { 
          stripBg: 'hsl(278, 100%, 57%)', 
          bodyBg: 'hsl(278, 100%, 57%)', 
          cardFill: 'rgba(60, 180, 160, 0.18)',
          gradient: `
            radial-gradient(ellipse 55% 75% at -12% 45%, rgba(255, 255, 255, 0.95) 0%, rgba(200, 255, 240, 0.6) 20%, rgba(100, 200, 180, 0.3) 45%, transparent 70%),
            radial-gradient(ellipse 90% 90% at 105% 95%, rgba(0, 0, 0, 0.22) 0%, transparent 50%)
          `
        };
      case 'self reflection':
        return { 
          stripBg: 'hsl(290, 100%, 50%)', 
          bodyBg: 'hsl(290, 100%, 50%)', 
          cardFill: 'hsla(340, 100%, 35%, 0.12)',
          gradient: `
            radial-gradient(ellipse 65% 85% at -18% 55%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 220, 200, 0.6) 20%, rgba(200, 150, 130, 0.3) 45%, transparent 70%),
            radial-gradient(ellipse 85% 85% at 108% 90%, rgba(0, 0, 0, 0.24) 0%, transparent 50%)
          `
        };
      case 'party':
        return { 
          stripBg: 'hsl(300, 100%, 50%)', 
          bodyBg: 'hsl(300, 100%, 50%)', 
          cardFill: 'rgba(120, 40, 70, 0.22)',
          gradient: `
            radial-gradient(ellipse 58% 78% at -14% 48%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 180, 180, 0.6) 20%, rgba(200, 100, 100, 0.3) 45%, transparent 70%),
            radial-gradient(ellipse 95% 88% at 102% 88%, rgba(0, 0, 0, 0.26) 0%, transparent 50%)
          `
        };
      case 'family':
        return { 
          stripBg: 'hsl(328, 100%, 56%)', 
          bodyBg: 'hsl(328, 100%, 56%)', 
          cardFill: 'hsla(300, 100%, 60%, 0.10)',
          gradient: `
            radial-gradient(ellipse 62% 82% at -16% 52%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 210, 230, 0.6) 20%, rgba(200, 140, 170, 0.3) 45%, transparent 70%),
            radial-gradient(ellipse 88% 92% at 106% 92%, rgba(0, 0, 0, 0.22) 0%, transparent 50%)
          `
        };
      case 'connection':
        return { 
          stripBg: 'hsl(0, 100%, 50%)', 
          bodyBg: 'hsl(0, 100%, 50%)', 
          cardFill: 'rgba(220, 60, 140, 0.20)',
          gradient: `
            radial-gradient(ellipse 56% 76% at -13% 50%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 200, 160, 0.6) 20%, rgba(220, 140, 100, 0.3) 45%, transparent 70%),
            radial-gradient(ellipse 92% 85% at 104% 86%, rgba(0, 0, 0, 0.28) 0%, transparent 50%)
          `
        };
      case 'identity':
        return { 
          stripBg: 'hsl(328, 100%, 56%)', 
          bodyBg: 'hsl(328, 100%, 56%)', 
          cardFill: 'rgba(200, 30, 50, 0.22)',
          gradient: `
            radial-gradient(ellipse 64% 84% at -17% 46%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 190, 150, 0.6) 20%, rgba(220, 130, 90, 0.3) 45%, transparent 70%),
            radial-gradient(ellipse 86% 90% at 105% 94%, rgba(0, 0, 0, 0.25) 0%, transparent 50%)
          `
        };
      case 'career':
        return { 
          stripBg: 'hsl(290, 100%, 50%)', 
          bodyBg: 'hsl(290, 100%, 50%)', 
          cardFill: 'hsla(340, 100%, 35%, 0.12)',
          gradient: `
            radial-gradient(ellipse 60% 80% at -15% 54%, rgba(255, 255, 255, 0.95) 0%, rgba(200, 230, 255, 0.6) 20%, rgba(120, 170, 200, 0.3) 45%, transparent 70%),
            radial-gradient(ellipse 90% 88% at 103% 90%, rgba(0, 0, 0, 0.24) 0%, transparent 50%)
          `
        };
      case 'travel':
        return { 
          stripBg: 'hsl(15, 100%, 50%)', 
          bodyBg: 'hsl(15, 100%, 50%)', 
          cardFill: 'hsla(175, 70%, 40%, 0.08)',
          gradient: `
            radial-gradient(ellipse 58% 78% at -14% 48%, rgba(255, 255, 255, 0.95) 0%, rgba(180, 255, 240, 0.6) 20%, rgba(100, 200, 180, 0.3) 45%, transparent 70%),
            radial-gradient(ellipse 94% 86% at 106% 88%, rgba(0, 0, 0, 0.22) 0%, transparent 50%)
          `
        };
      case 'health':
        return { 
          stripBg: 'hsl(300, 100%, 50%)', 
          bodyBg: 'hsl(300, 100%, 50%)', 
          cardFill: 'hsla(0, 100%, 40%, 0.10)',
          gradient: `
            radial-gradient(ellipse 62% 82% at -16% 52%, rgba(255, 255, 255, 0.95) 0%, rgba(200, 255, 200, 0.6) 20%, rgba(120, 200, 140, 0.3) 45%, transparent 70%),
            radial-gradient(ellipse 88% 90% at 104% 92%, rgba(0, 0, 0, 0.26) 0%, transparent 50%)
          `
        };
      case 'money':
        return { 
          stripBg: 'hsl(290, 100%, 50%)', 
          bodyBg: 'hsl(290, 100%, 50%)', 
          cardFill: 'hsla(340, 100%, 35%, 0.12)',
          gradient: `
            radial-gradient(ellipse 56% 76% at -13% 50%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 240, 180, 0.6) 20%, rgba(220, 190, 100, 0.3) 45%, transparent 70%),
            radial-gradient(ellipse 92% 88% at 105% 86%, rgba(0, 0, 0, 0.24) 0%, transparent 50%)
          `
        };
      case 'love':
        return { 
          stripBg: 'hsl(15, 100%, 50%)', 
          bodyBg: 'hsl(15, 100%, 50%)', 
          cardFill: 'hsla(300, 100%, 60%, 0.10)',
          gradient: `
            radial-gradient(ellipse 64% 84% at -17% 46%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 200, 210, 0.6) 20%, rgba(220, 140, 160, 0.3) 45%, transparent 70%),
            radial-gradient(ellipse 86% 92% at 103% 94%, rgba(0, 0, 0, 0.22) 0%, transparent 50%)
          `
        };
      case 'hobby':
        return { 
          stripBg: 'hsl(328, 100%, 56%)', 
          bodyBg: 'hsl(328, 100%, 56%)', 
          cardFill: 'hsla(175, 70%, 40%, 0.08)',
          gradient: `
            radial-gradient(ellipse 60% 80% at -15% 54%, rgba(255, 255, 255, 0.95) 0%, rgba(180, 230, 255, 0.6) 20%, rgba(100, 170, 220, 0.3) 45%, transparent 70%),
            radial-gradient(ellipse 90% 86% at 106% 90%, rgba(0, 0, 0, 0.24) 0%, transparent 50%)
          `
        };
      case 'dreams':
        return { 
          stripBg: 'hsl(300, 100%, 50%)', 
          bodyBg: 'hsl(300, 100%, 50%)', 
          cardFill: 'hsla(0, 100%, 40%, 0.10)',
          gradient: `
            radial-gradient(ellipse 58% 78% at -14% 48%, rgba(255, 255, 255, 0.95) 0%, rgba(220, 200, 255, 0.6) 20%, rgba(160, 140, 200, 0.3) 45%, transparent 70%),
            radial-gradient(ellipse 94% 90% at 104% 88%, rgba(0, 0, 0, 0.26) 0%, transparent 50%)
          `
        };
      case 'fear':
        return { 
          stripBg: 'hsl(0, 100%, 50%)', 
          bodyBg: 'hsl(0, 100%, 50%)', 
          cardFill: 'hsla(340, 100%, 35%, 0.12)',
          gradient: `
            radial-gradient(ellipse 62% 82% at -16% 52%, rgba(255, 255, 255, 0.95) 0%, rgba(180, 200, 220, 0.6) 20%, rgba(100, 130, 160, 0.3) 45%, transparent 70%),
            radial-gradient(ellipse 88% 88% at 105% 92%, rgba(0, 0, 0, 0.30) 0%, transparent 50%)
          `
        };
      case 'wisdom':
        return { 
          stripBg: 'hsl(290, 100%, 50%)', 
          bodyBg: 'hsl(290, 100%, 50%)', 
          cardFill: 'hsla(300, 100%, 60%, 0.10)',
          gradient: `
            radial-gradient(ellipse 56% 76% at -13% 50%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 240, 220, 0.6) 20%, rgba(220, 190, 160, 0.3) 45%, transparent 70%),
            radial-gradient(ellipse 92% 90% at 103% 86%, rgba(0, 0, 0, 0.22) 0%, transparent 50%)
          `
        };
      case 'future':
        return { 
          stripBg: 'hsl(15, 100%, 50%)', 
          bodyBg: 'hsl(15, 100%, 50%)', 
          cardFill: 'hsla(175, 70%, 40%, 0.08)',
          gradient: `
            radial-gradient(ellipse 64% 84% at -17% 46%, rgba(255, 255, 255, 0.95) 0%, rgba(180, 255, 220, 0.6) 20%, rgba(100, 200, 160, 0.3) 45%, transparent 70%),
            radial-gradient(ellipse 86% 88% at 106% 94%, rgba(0, 0, 0, 0.24) 0%, transparent 50%)
          `
        };
      default:
        return { 
          stripBg: 'hsl(290, 100%, 50%)', 
          bodyBg: 'hsl(290, 100%, 50%)', 
          cardFill: 'hsla(300, 100%, 60%, 0.10)',
          gradient: `
            radial-gradient(ellipse 60% 80% at -15% 50%, rgba(255, 255, 255, 0.95) 0%, rgba(220, 240, 255, 0.6) 20%, rgba(160, 190, 210, 0.3) 45%, transparent 70%),
            radial-gradient(ellipse 90% 90% at 105% 90%, rgba(0, 0, 0, 0.24) 0%, transparent 50%)
          `
        };
    }
  };

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setDragOffset(0);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    const offset = clientX - startX;
    setDragOffset(offset);
    
    // Notify parent of drag state for color interpolation and logo squeeze
    if (onDragStateChange && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const progress = Math.min(Math.abs(offset) / containerWidth, 1);
      const targetCategory = offset < 0 && nextQuestion ? nextQuestion.category : 
                            offset > 0 && prevQuestion ? prevQuestion.category : 
                            currentQuestion.category;
      const direction = offset < 0 ? -1 : offset > 0 ? 1 : 0;
      onDragStateChange(true, progress, targetCategory, direction);
    }
  };

  const handleEnd = () => {
    if (!isDragging || !containerRef.current) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    
    if (Math.abs(dragOffset) > minSwipeDistance) {
      if (dragOffset < 0 && nextQuestion) {
        // Swipe left - animate to completion
        setIsSnapping(true);
        setIsDragging(false);
        setDragOffset(-containerWidth);
        
        if (onDragStateChange) {
          onDragStateChange(false, 1, nextQuestion.category, -1);
        }
        
        setTimeout(() => {
          onSwipeLeft();
        }, 250);
        return;
      } else if (dragOffset > 0 && prevQuestion) {
        // Swipe right - animate to completion
        setIsSnapping(true);
        setIsDragging(false);
        setDragOffset(containerWidth);
        
        if (onDragStateChange) {
          onDragStateChange(false, 1, prevQuestion.category, 1);
        }
        
        setTimeout(() => {
          onSwipeRight();
        }, 250);
        return;
      }
    }
    
    // Snap back to center if cancelled
    setIsSnapping(true);
    if (onDragStateChange) {
      onDragStateChange(false, 0, currentQuestion.category, 0);
    }
    
    setIsDragging(false);
    
    setTimeout(() => {
      setDragOffset(0);
      setTimeout(() => setIsSnapping(false), 250);
    }, 0);
  };

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    handleEnd();
  };

  // Mouse handlers
  const onMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const onMouseUp = () => {
    handleEnd();
  };

  const onMouseLeave = () => {
    if (isDragging) {
      handleEnd();
    }
  };

  // Calculate transformations based on drag
  const getDragProgress = () => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.offsetWidth;
    return Math.min(Math.abs(dragOffset) / containerWidth, 1);
  };

  const progress = getDragProgress();
  const totalOffset = dragOffset;
  const direction = totalOffset < 0 ? -1 : 1;
  const containerWidthPx = containerRef.current?.offsetWidth || 1;
  const normalizedOffset = totalOffset / containerWidthPx; // -1 .. 1

  // Current card: 100% -> 95% scale, 0deg -> 3deg rotation (away from direction)
  const currentScale = 1 - (progress * 0.05);
  const currentRotation = progress * 3 * direction;

  // Incoming card: 95% -> 100% scale, 3deg -> 0deg rotation (towards center)
  const incomingScale = 0.95 + (progress * 0.05);
  const incomingRotation = -3 * direction * (1 - progress);

  // Determine which category color to show based on drag
  const getActiveCategory = () => {
    if (totalOffset < 0 && nextQuestion && progress > 0) {
      // Swiping left - transition to next question
      return nextQuestion.category;
    } else if (totalOffset > 0 && prevQuestion && progress > 0) {
      // Swiping right - transition to prev question
      return prevQuestion.category;
    }
    return currentQuestion.category;
  };

  const activeCategoryForColor = getActiveCategory();
  const activeCategoryColors = getCategoryColors(activeCategoryForColor);

  const renderCard = (question: Question, style: React.CSSProperties, cardQuestionIndex: number) => {
    const categoryColors = getCategoryColors(question.category);
    const questionText = getQuestionText(question.question);
    const hyphenatedText = hyphenateQuestion(questionText);
    const showShimmer = isTranslating(question.question);
    const isCurrent = cardQuestionIndex === questionIndex;
    
    return (
      <div 
        className="flex-shrink-0 w-full max-w-[500px] rounded-2xl overflow-hidden mx-4 md:mx-0"
        style={{
          ...style,
          height: '80vh',
          maxHeight: '80vh',
          background: `
            ${categoryColors.gradient},
            ${categoryColors.cardFill}
          `,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '-2px 0 24px 4px rgba(0, 0, 0, 0.24)',
          width: 'calc(100% - 32px)',
        }}
      >
        {/* Category Strip */}
        <div className="absolute left-0 top-0 h-full w-8 flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: categoryColors.stripBg }}>
          <div className="transform -rotate-90 whitespace-nowrap">
            {Array(20).fill(question.category).map((cat, index) => (
              <span 
                key={`${cat}-${index}`} 
                className="text-white font-bold text-sm tracking-wide uppercase" 
                style={{ 
                  marginRight: index < 19 ? '8px' : '0',
                  fontFamily: "'Factor A', sans-serif"
                }}
              >
                {translateCategory(cat, language)}
              </span>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-8 lg:ml-10 h-full flex flex-col justify-center px-8 lg:pr-10 overflow-visible">
          <div className="flex-1 flex items-start justify-start text-left w-full pt-8 overflow-visible">
            <h1 
              ref={isCurrent ? questionRef : undefined}
              lang={language === 'en' ? 'en' : 'de'} 
              className="question-text text-[32px] md:text-4xl lg:text-4xl font-bold text-white w-full max-w-full"
              style={{ 
                lineHeight: '1.15',
                hyphens: 'manual',
                WebkitHyphens: 'manual',
                overflowWrap: 'normal',
                wordBreak: 'normal',
                whiteSpace: 'normal',
                filter: showShimmer ? 'blur(6px)' : 'blur(0px)',
                transition: 'filter 500ms cubic-bezier(0.0, 0.0, 0.2, 1)',
                margin: '-12px',
                padding: '12px',
              }}
            >
              {showShimmer ? question.question : hyphenatedText}
            </h1>
          </div>
        </div>
        
        {/* Share Button - On every card */}
        <ShareDialog 
          questionIndex={cardQuestionIndex} 
          questionText={language === 'en' ? question.questionEn : question.question} 
        />
      </div>
    );
  };

  const shouldShowPrev = true;
  const shouldShowNext = true;

  return (
    <>
      <div
        ref={containerRef}
        className="relative h-full w-full overflow-hidden select-none z-10"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        style={{
          height: '100vh',
          maxHeight: '100vh',
        }}
      >
      <div 
        className="flex items-center h-full"
        style={{
          transform: `translateX(${(-33.333 + normalizedOffset * 33.333).toFixed(3)}%)`,
          transition: isSnapping ? 'transform 0.25s ease-out' : 'none',
          width: '300%',
          position: 'relative',
        }}
      >
        {/* Previous card (left) */}
        <div 
          className="flex justify-center items-center" 
          style={{ 
            width: '33.333%',
            height: '100%',
            position: 'relative',
          }}
        >
          {shouldShowPrev && prevQuestion && renderCard(prevQuestion, {
            transform: `scale(${totalOffset > 0 ? incomingScale : 0.95}) rotate(${totalOffset > 0 ? incomingRotation : 3}deg)`,
            transition: isSnapping ? 'all 0.25s ease-out' : 'none',
            opacity: 1,
            position: 'relative',
          }, questionIndex - 1)}
        </div>

        {/* Current card (center) */}
        <div 
          className="flex justify-center items-center" 
          style={{ 
            width: '33.333%',
            height: '100%',
            position: 'relative',
          }}
        >
          {renderCard(currentQuestion, {
            transform: `scale(${currentScale}) rotate(${currentRotation}deg)`,
            transition: isSnapping ? 'all 0.25s ease-out' : 'none',
            position: 'relative',
          }, questionIndex)}
        </div>

        {/* Next card (right) */}
        <div 
          className="flex justify-center items-center" 
          style={{ 
            width: '33.333%',
            height: '100%',
            position: 'relative',
          }}
        >
          {shouldShowNext && nextQuestion && renderCard(nextQuestion, {
            transform: `scale(${totalOffset < 0 ? incomingScale : 0.95}) rotate(${totalOffset < 0 ? incomingRotation : -3}deg)`,
            transition: isSnapping ? 'all 0.25s ease-out' : 'none',
            opacity: 1,
            position: 'relative',
          }, questionIndex + 1)}
        </div>
      </div>
      
      {/* Edge Click Zones */}
      {/* Left edge click zone */}
      {prevQuestion && (
        <div
          className="absolute left-0 top-0 h-full cursor-pointer z-20"
          style={{ width: '16px' }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isSnapping) {
              setIsSnapping(true);
              if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                setDragOffset(containerWidth);
                if (onDragStateChange) {
                  onDragStateChange(false, 1, prevQuestion.category, 1);
                }
              }
              setTimeout(() => {
                onSwipeRight();
              }, 250);
            }
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isSnapping) {
              setIsSnapping(true);
              if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                setDragOffset(containerWidth);
                if (onDragStateChange) {
                  onDragStateChange(false, 1, prevQuestion.category, 1);
                }
              }
              setTimeout(() => {
                onSwipeRight();
              }, 250);
            }
          }}
        />
      )}
      
      {/* Right edge click zone */}
      {nextQuestion && (
        <div
          className="absolute right-0 top-0 h-full cursor-pointer z-20"
          style={{ width: '16px' }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isSnapping) {
              setIsSnapping(true);
              if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                setDragOffset(-containerWidth);
                if (onDragStateChange) {
                  onDragStateChange(false, 1, nextQuestion.category, -1);
                }
              }
              setTimeout(() => {
                onSwipeLeft();
              }, 250);
            }
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isSnapping) {
              setIsSnapping(true);
              if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                setDragOffset(-containerWidth);
                if (onDragStateChange) {
                  onDragStateChange(false, 1, nextQuestion.category, -1);
                }
              }
              setTimeout(() => {
                onSwipeLeft();
              }, 250);
            }
          }}
        />
      )}
      </div>
    </>
  );
}
