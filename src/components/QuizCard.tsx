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
          cardFill: 'rgba(180, 40, 100, 0.50)', // dark pink
          gradient: `
            radial-gradient(ellipse 70% 50% at 5% 8%, rgba(0, 0, 0, 0.5) 0%, transparent 50%),
            radial-gradient(ellipse 60% 45% at 95% 20%, rgba(0, 0, 0, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse 90% 60% at 70% 92%, rgba(255, 230, 0, 0.35) 0%, transparent 50%)
          `
        };
      case 'friends':
      case 'wer aus der runde':
        return { 
          stripBg: 'hsl(278, 100%, 57%)', 
          bodyBg: 'hsl(278, 100%, 57%)', 
          cardFill: 'rgba(60, 200, 180, 0.30)', // lighter turquoise green
          gradient: `
            radial-gradient(ellipse 90% 70% at 15% 5%, rgba(0, 0, 0, 0.45) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 85% 25%, rgba(0, 0, 0, 0.35) 0%, transparent 50%),
            radial-gradient(ellipse 80% 70% at 20% 85%, rgba(0, 255, 100, 0.35) 0%, transparent 55%)
          `
        };
      case 'self reflection':
        return { 
          stripBg: 'hsl(290, 100%, 50%)', 
          bodyBg: 'hsl(290, 100%, 50%)', 
          cardFill: 'hsla(340, 100%, 35%, 0.25)',
          gradient: `
            radial-gradient(ellipse 85% 55% at 8% 12%, rgba(0, 0, 0, 0.48) 0%, transparent 50%),
            radial-gradient(ellipse 55% 50% at 92% 8%, rgba(0, 0, 0, 0.42) 0%, transparent 50%),
            radial-gradient(ellipse 100% 65% at 50% 95%, rgba(255, 255, 255, 0.18) 0%, transparent 50%)
          `
        };
      case 'party':
        return { 
          stripBg: 'hsl(300, 100%, 50%)', 
          bodyBg: 'hsl(300, 100%, 50%)', 
          cardFill: 'rgba(120, 40, 70, 0.50)', // darker berry
          gradient: `
            radial-gradient(ellipse 75% 60% at 10% 15%, rgba(0, 0, 0, 0.52) 0%, transparent 50%),
            radial-gradient(ellipse 65% 55% at 88% 10%, rgba(0, 0, 0, 0.45) 0%, transparent 50%),
            radial-gradient(ellipse 85% 55% at 80% 88%, rgba(255, 50, 50, 0.40) 0%, transparent 55%)
          `
        };
      case 'family':
        return { 
          stripBg: 'hsl(328, 100%, 56%)', 
          bodyBg: 'hsl(328, 100%, 56%)', 
          cardFill: 'hsla(300, 100%, 60%, 0.20)',
          gradient: `
            radial-gradient(ellipse 60% 45% at 12% 6%, rgba(0, 0, 0, 0.44) 0%, transparent 50%),
            radial-gradient(ellipse 80% 65% at 90% 18%, rgba(0, 0, 0, 0.38) 0%, transparent 55%),
            radial-gradient(ellipse 70% 80% at 35% 90%, rgba(255, 255, 255, 0.20) 0%, transparent 50%)
          `
        };
      case 'connection':
        return { 
          stripBg: 'hsl(0, 100%, 50%)', 
          bodyBg: 'hsl(0, 100%, 50%)', 
          cardFill: 'rgba(220, 60, 140, 0.45)', // more pink
          gradient: `
            radial-gradient(ellipse 95% 70% at 5% 10%, rgba(0, 0, 0, 0.55) 0%, transparent 55%),
            radial-gradient(ellipse 45% 35% at 80% 5%, rgba(0, 0, 0, 0.40) 0%, transparent 50%),
            radial-gradient(ellipse 75% 65% at 60% 95%, rgba(255, 255, 255, 0.18) 0%, transparent 50%)
          `
        };
      case 'identity':
        return { 
          stripBg: 'hsl(328, 100%, 56%)', 
          bodyBg: 'hsl(328, 100%, 56%)', 
          cardFill: 'rgba(200, 30, 50, 0.45)', // more red
          gradient: `
            radial-gradient(ellipse 65% 50% at 8% 18%, rgba(0, 0, 0, 0.50) 0%, transparent 50%),
            radial-gradient(ellipse 85% 60% at 95% 12%, rgba(0, 0, 0, 0.42) 0%, transparent 55%),
            radial-gradient(ellipse 95% 75% at 45% 92%, rgba(255, 120, 0, 0.45) 0%, transparent 55%)
          `
        };
      case 'career':
        return { 
          stripBg: 'hsl(290, 100%, 50%)', 
          bodyBg: 'hsl(290, 100%, 50%)', 
          cardFill: 'hsla(340, 100%, 35%, 0.25)',
          gradient: `
            radial-gradient(ellipse 80% 55% at 15% 8%, rgba(0, 0, 0, 0.46) 0%, transparent 50%),
            radial-gradient(ellipse 70% 60% at 85% 22%, rgba(0, 0, 0, 0.40) 0%, transparent 50%),
            radial-gradient(ellipse 65% 50% at 25% 88%, rgba(255, 255, 255, 0.20) 0%, transparent 50%)
          `
        };
      case 'travel':
        return { 
          stripBg: 'hsl(15, 100%, 50%)', 
          bodyBg: 'hsl(15, 100%, 50%)', 
          cardFill: 'hsla(175, 70%, 40%, 0.15)',
          gradient: `
            radial-gradient(ellipse 55% 40% at 5% 5%, rgba(0, 0, 0, 0.42) 0%, transparent 50%),
            radial-gradient(ellipse 90% 70% at 92% 15%, rgba(0, 0, 0, 0.38) 0%, transparent 55%),
            radial-gradient(ellipse 110% 80% at 85% 90%, rgba(255, 255, 255, 0.19) 0%, transparent 55%)
          `
        };
      case 'health':
        return { 
          stripBg: 'hsl(300, 100%, 50%)', 
          bodyBg: 'hsl(300, 100%, 50%)', 
          cardFill: 'hsla(0, 100%, 40%, 0.20)',
          gradient: `
            radial-gradient(ellipse 75% 65% at 12% 12%, rgba(0, 0, 0, 0.48) 0%, transparent 55%),
            radial-gradient(ellipse 60% 45% at 88% 8%, rgba(0, 0, 0, 0.43) 0%, transparent 50%),
            radial-gradient(ellipse 80% 60% at 15% 92%, rgba(255, 255, 255, 0.21) 0%, transparent 50%)
          `
        };
      case 'money':
        return { 
          stripBg: 'hsl(290, 100%, 50%)', 
          bodyBg: 'hsl(290, 100%, 50%)', 
          cardFill: 'hsla(340, 100%, 35%, 0.25)',
          gradient: `
            radial-gradient(ellipse 85% 60% at 8% 20%, rgba(0, 0, 0, 0.50) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 90% 5%, rgba(0, 0, 0, 0.38) 0%, transparent 50%),
            radial-gradient(ellipse 90% 70% at 75% 95%, rgba(255, 255, 255, 0.17) 0%, transparent 55%)
          `
        };
      case 'love':
        return { 
          stripBg: 'hsl(15, 100%, 50%)', 
          bodyBg: 'hsl(15, 100%, 50%)', 
          cardFill: 'hsla(300, 100%, 60%, 0.20)',
          gradient: `
            radial-gradient(ellipse 70% 55% at 10% 6%, rgba(0, 0, 0, 0.44) 0%, transparent 50%),
            radial-gradient(ellipse 75% 50% at 95% 18%, rgba(0, 0, 0, 0.36) 0%, transparent 50%),
            radial-gradient(ellipse 100% 85% at 50% 88%, rgba(255, 255, 255, 0.23) 0%, transparent 55%)
          `
        };
      case 'hobby':
        return { 
          stripBg: 'hsl(328, 100%, 56%)', 
          bodyBg: 'hsl(328, 100%, 56%)', 
          cardFill: 'hsla(175, 70%, 40%, 0.15)',
          gradient: `
            radial-gradient(ellipse 90% 65% at 5% 15%, rgba(0, 0, 0, 0.46) 0%, transparent 55%),
            radial-gradient(ellipse 55% 45% at 85% 10%, rgba(0, 0, 0, 0.40) 0%, transparent 50%),
            radial-gradient(ellipse 70% 55% at 40% 92%, rgba(255, 255, 255, 0.19) 0%, transparent 50%)
          `
        };
      case 'dreams':
        return { 
          stripBg: 'hsl(300, 100%, 50%)', 
          bodyBg: 'hsl(300, 100%, 50%)', 
          cardFill: 'hsla(0, 100%, 40%, 0.20)',
          gradient: `
            radial-gradient(ellipse 60% 50% at 15% 8%, rgba(0, 0, 0, 0.47) 0%, transparent 50%),
            radial-gradient(ellipse 80% 65% at 90% 20%, rgba(0, 0, 0, 0.42) 0%, transparent 55%),
            radial-gradient(ellipse 85% 60% at 30% 95%, rgba(255, 255, 255, 0.22) 0%, transparent 55%)
          `
        };
      case 'fear':
        return { 
          stripBg: 'hsl(0, 100%, 50%)', 
          bodyBg: 'hsl(0, 100%, 50%)', 
          cardFill: 'hsla(340, 100%, 35%, 0.25)',
          gradient: `
            radial-gradient(ellipse 95% 75% at 8% 10%, rgba(0, 0, 0, 0.55) 0%, transparent 55%),
            radial-gradient(ellipse 55% 40% at 92% 15%, rgba(0, 0, 0, 0.48) 0%, transparent 50%),
            radial-gradient(ellipse 75% 55% at 65% 90%, rgba(255, 255, 255, 0.16) 0%, transparent 50%)
          `
        };
      case 'wisdom':
        return { 
          stripBg: 'hsl(290, 100%, 50%)', 
          bodyBg: 'hsl(290, 100%, 50%)', 
          cardFill: 'hsla(300, 100%, 60%, 0.20)',
          gradient: `
            radial-gradient(ellipse 65% 45% at 12% 12%, rgba(0, 0, 0, 0.43) 0%, transparent 50%),
            radial-gradient(ellipse 85% 70% at 88% 8%, rgba(0, 0, 0, 0.38) 0%, transparent 55%),
            radial-gradient(ellipse 95% 70% at 55% 92%, rgba(255, 255, 255, 0.21) 0%, transparent 55%)
          `
        };
      case 'future':
        return { 
          stripBg: 'hsl(15, 100%, 50%)', 
          bodyBg: 'hsl(15, 100%, 50%)', 
          cardFill: 'hsla(175, 70%, 40%, 0.15)',
          gradient: `
            radial-gradient(ellipse 75% 55% at 10% 18%, rgba(0, 0, 0, 0.44) 0%, transparent 50%),
            radial-gradient(ellipse 65% 50% at 92% 6%, rgba(0, 0, 0, 0.40) 0%, transparent 50%),
            radial-gradient(ellipse 80% 65% at 80% 88%, rgba(255, 255, 255, 0.20) 0%, transparent 55%)
          `
        };
      default:
        return { 
          stripBg: 'hsl(290, 100%, 50%)', 
          bodyBg: 'hsl(290, 100%, 50%)', 
          cardFill: 'hsla(300, 100%, 60%, 0.20)',
          gradient: `
            radial-gradient(ellipse 80% 60% at 10% 10%, rgba(0, 0, 0, 0.45) 0%, transparent 50%),
            radial-gradient(ellipse 70% 55% at 90% 15%, rgba(0, 0, 0, 0.38) 0%, transparent 50%),
            radial-gradient(ellipse 90% 70% at 50% 90%, rgba(255, 255, 255, 0.20) 0%, transparent 55%)
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
