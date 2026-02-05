import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { applyGermanHyphenation } from '@/lib/hyphenation';
import { ShareDialog } from './ShareDialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateToEnglish, getCachedTranslation } from '@/lib/translationService';
import { translateCategory } from '@/lib/questionTranslations';
import { useIsMobile } from '@/hooks/use-mobile';
interface Question {
  question: string;
  questionEn: string;
  category: string;
}

interface QuizCardProps {
  currentQuestion: Question;
  nextQuestion: Question | null;
  prevQuestion: Question | null;
  nextQuestion2: Question | null;
  prevQuestion2: Question | null;
  adjacentQuestions?: Question[];
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onDragStateChange?: (isDragging: boolean, progress: number, targetCategory: string, direction: number) => void;
  questionIndex: number;
  totalQuestions: number;
}

export function QuizCard({ currentQuestion, nextQuestion, prevQuestion, nextQuestion2, prevQuestion2, adjacentQuestions = [], onSwipeLeft, onSwipeRight, onDragStateChange, questionIndex, totalQuestions }: QuizCardProps) {
  // Core drag state following described architecture
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right' | null>(null);
  
  // Additional state
  const [startX, setStartX] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLHeadingElement>(null);
  const activeCardRef = useRef<HTMLDivElement>(null);
  const dragThreshold = 100; // Threshold for triggering transition
  
  // Get the actual card width for accurate slide positioning
  const getCardWidth = () => {
    if (activeCardRef.current) {
      return activeCardRef.current.offsetWidth;
    }
    // Fallback: estimate based on container
    if (containerRef.current) {
      const containerW = containerRef.current.offsetWidth;
      // Card width is calc(100% - 32px) with max-width constraints
      return Math.min(containerW - 32, 700 - 32); // matches max-w-[700px]
    }
    return 500; // reasonable default
  };

  // Swipe hint animation - triggers on first slide after 3s of inactivity
  useEffect(() => {
    const startHintTimer = () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
      
      // Only show hint on first slide when not interacting
      if (questionIndex === 0 && !isDragging && !isTransitioning) {
        hintTimeoutRef.current = setTimeout(() => {
          setShowSwipeHint(true);
          // Reset hint after animation duration
          setTimeout(() => {
            setShowSwipeHint(false);
          }, 400);
        }, 3000);
      }
    };

    startHintTimer();

    return () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
    };
  }, [questionIndex, isDragging, isTransitioning]);

  // Cancel hint on any interaction
  useEffect(() => {
    if (isDragging || isTransitioning) {
      setShowSwipeHint(false);
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
    }
  }, [isDragging, isTransitioning]);

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return;
      
      // Calculate slide distance: on desktop use viewport-based offset, on mobile use card width
      const getSlideDistance = () => {
        if (isMobile) {
          return getCardWidth() + 16;
        }
        // Desktop: 50vw + 50% of card width
        return (window.innerWidth / 2) + (getCardWidth() / 2);
      };
      
      if (e.key === 'ArrowLeft' && prevQuestion) {
        const slideDistance = getSlideDistance();
        setIsTransitioning(true);
        setTransitionDirection('right');
        setDragOffset(slideDistance);
        if (onDragStateChange) {
          onDragStateChange(false, 1, prevQuestion.category, 1);
        }
        setTimeout(() => {
          onSwipeRight();
        }, isMobile ? 300 : 400);
      } else if (e.key === 'ArrowRight' && nextQuestion) {
        const slideDistance = getSlideDistance();
        setIsTransitioning(true);
        setTransitionDirection('left');
        setDragOffset(-slideDistance);
        if (onDragStateChange) {
          onDragStateChange(false, 1, nextQuestion.category, -1);
        }
        setTimeout(() => {
          onSwipeLeft();
        }, isMobile ? 300 : 400);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTransitioning, prevQuestion, nextQuestion, onSwipeLeft, onSwipeRight, onDragStateChange, isMobile]);

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

  // Get translated or original question text - uses translation API
  const getQuestionText = (questionObj: Question): string => {
    if (language === 'de') return questionObj.question;
    // Use the translation from the API cache
    return getTranslation(questionObj.question) || questionObj.question;
  };
  
  const minSwipeDistance = 50;

  // Track if we need to skip transition on next render (after question change)
  const [skipTransition, setSkipTransition] = useState(false);
  const prevQuestionIndexRef = useRef(questionIndex);
  
  // Reset drag when question changes - use useLayoutEffect for synchronous update before paint
  useLayoutEffect(() => {
    if (prevQuestionIndexRef.current !== questionIndex) {
      // Disable transitions synchronously before paint
      setSkipTransition(true);
      setDragOffset(0);
      setIsTransitioning(false);
      setTransitionDirection(null);
      prevQuestionIndexRef.current = questionIndex;
    }
  }, [questionIndex]);
  
  // Re-enable transitions after the position has settled
  useEffect(() => {
    if (skipTransition) {
      // Wait for 2 frames to ensure the DOM has updated with no transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSkipTransition(false);
        });
      });
    }
  }, [skipTransition]);

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

  // Generate randomized dark shadow positions for each slide based on questionIndex
  const getDarkShadows = (seed: number) => {
    // Use seed to create pseudo-random but consistent values per slide
    const rand1 = ((seed * 13) % 30) + 70; // 70-100% for top right x
    const rand2 = ((seed * 17) % 25) + 5;  // 5-30% for top right y
    const rand3 = ((seed * 23) % 35) + 40; // 40-75% ellipse width
    const rand4 = ((seed * 29) % 30) + 30; // 30-60% ellipse height
    
    const rand5 = ((seed * 31) % 25) + 5;  // 5-30% for top left x
    const rand6 = ((seed * 37) % 20) + 5;  // 5-25% for top left y
    const rand7 = ((seed * 41) % 30) + 35; // 35-65% ellipse width
    const rand8 = ((seed * 43) % 25) + 30; // 30-55% ellipse height
    
    return {
      topRight: `radial-gradient(ellipse ${rand3}% ${rand4}% at ${rand1}% ${rand2}%, rgba(20, 25, 35, 0.25) 0%, transparent 70%)`,
      topLeft: `radial-gradient(ellipse ${rand7}% ${rand8}% at ${rand5}% ${rand6}%, rgba(25, 30, 40, 0.22) 0%, transparent 70%)`
    };
  };

  // Generate randomized glow positions - aura-like spread with varied shapes
  const getGlowPositions = (seed: number) => {
    // More shape variety per slide
    const shapeVariant = seed % 4;
    
    // Main glow - larger aura spread
    const mainX = ((seed * 47) % 18) + 58; // 58-76% x
    const mainY = ((seed * 53) % 18) + 52; // 52-70% y
    // Vary aspect ratios more dramatically for aura effect
    const mainW = shapeVariant === 0 ? ((seed * 59) % 20) + 50 : 
                  shapeVariant === 1 ? ((seed * 59) % 15) + 35 :
                  shapeVariant === 2 ? ((seed * 59) % 25) + 45 :
                  ((seed * 59) % 18) + 40;
    const mainH = shapeVariant === 0 ? ((seed * 61) % 15) + 25 : 
                  shapeVariant === 1 ? ((seed * 61) % 20) + 45 :
                  shapeVariant === 2 ? ((seed * 61) % 12) + 20 :
                  ((seed * 61) % 22) + 38;
    
    // Secondary glow - offset aura layer
    const secX = ((seed * 67) % 20) + 52; // 52-72% x
    const secY = ((seed * 71) % 20) + 55; // 55-75% y
    const secVariant = (seed + 1) % 4;
    const secW = secVariant === 0 ? ((seed * 73) % 18) + 42 : 
                 secVariant === 1 ? ((seed * 73) % 12) + 28 :
                 secVariant === 2 ? ((seed * 73) % 22) + 38 :
                 ((seed * 73) % 15) + 32;
    const secH = secVariant === 0 ? ((seed * 79) % 12) + 20 : 
                 secVariant === 1 ? ((seed * 79) % 18) + 38 :
                 secVariant === 2 ? ((seed * 79) % 10) + 18 :
                 ((seed * 79) % 20) + 35;
    
    // Tertiary glow - outer aura layer
    const terX = ((seed * 83) % 22) + 55; // 55-77% x
    const terY = ((seed * 89) % 22) + 48; // 48-70% y
    const terVariant = (seed + 2) % 4;
    const terW = terVariant === 0 ? ((seed * 97) % 20) + 45 : 
                 terVariant === 1 ? ((seed * 97) % 14) + 30 :
                 terVariant === 2 ? ((seed * 97) % 25) + 40 :
                 ((seed * 97) % 16) + 35;
    const terH = terVariant === 0 ? ((seed * 101) % 14) + 22 : 
                 terVariant === 1 ? ((seed * 101) % 20) + 40 :
                 terVariant === 2 ? ((seed * 101) % 12) + 18 :
                 ((seed * 101) % 18) + 32;
    
    return { mainX, mainY, mainW, mainH, secX, secY, secW, secH, terX, terY, terW, terH };
  };

  // Build simple radial glow gradient (circle style for most categories)
  const buildAuraGradient = (w: number, h: number, x: number, y: number, r: number, g: number, b: number, intensity: number) => {
    return `radial-gradient(ellipse ${w}% ${h}% at ${x}% ${y}%, 
      rgba(${r}, ${g}, ${b}, ${intensity}) 0%, 
      rgba(${r}, ${g}, ${b}, ${intensity * 0.5}) 40%, 
      transparent 70%)`;
  };

  // Build flame-like glow for fuck category - visible flames
  const buildFlameGradient = (w: number, h: number, x: number, y: number, r: number, g: number, b: number, intensity: number) => {
    const flame1 = `radial-gradient(ellipse ${w * 0.8}% ${h * 2.0}% at ${x}% 85%, 
      rgba(${r}, ${g}, ${b}, ${intensity}) 0%, 
      rgba(${r}, ${g * 0.5}, ${b * 0.3}, ${intensity * 0.6}) 35%, 
      transparent 70%)`;
    const flame2 = `radial-gradient(ellipse ${w * 0.6}% ${h * 1.6}% at ${x - 20}% 90%, 
      rgba(255, 120, 20, ${intensity * 0.9}) 0%, 
      rgba(255, 50, 10, ${intensity * 0.5}) 40%, 
      transparent 75%)`;
    const flame3 = `radial-gradient(ellipse ${w * 0.7}% ${h * 1.4}% at ${x + 25}% 88%, 
      rgba(255, 80, 50, ${intensity}) 0%, 
      rgba(200, 30, 30, ${intensity * 0.4}) 45%, 
      transparent 80%)`;
    const flameCore = `radial-gradient(ellipse ${w}% ${h * 0.8}% at ${x}% 95%, 
      rgba(255, 220, 120, ${intensity * 0.8}) 0%, 
      rgba(255, 150, 50, ${intensity * 0.5}) 50%, 
      transparent 80%)`;
    return `${flame1}, ${flame2}, ${flame3}, ${flameCore}`;
  };

  // Build vertical nebula fog gradient (only for party category)
  const buildVerticalAuraGradient = (w: number, h: number, x: number, y: number, r: number, g: number, b: number, intensity: number) => {
    const fogLayer1 = `radial-gradient(ellipse ${w * 0.4}% ${h * 1.8}% at ${x + 8}% ${y - 5}%, 
      rgba(${r}, ${g}, ${b}, ${intensity * 0.6}) 0%, 
      rgba(${r}, ${g}, ${b}, ${intensity * 0.3}) 40%, 
      transparent 70%)`;
    const fogLayer2 = `radial-gradient(ellipse ${w * 0.35}% ${h * 2.5}% at ${x - 5}% ${y + 12}%, 
      rgba(${r}, ${g}, ${b}, ${intensity * 0.5}) 0%, 
      rgba(${r}, ${g}, ${b}, ${intensity * 0.2}) 50%, 
      transparent 80%)`;
    const fogLayer3 = `radial-gradient(ellipse ${w * 0.5}% ${h * 1.4}% at ${x + 15}% ${y + 5}%, 
      rgba(${r}, ${g}, ${b}, ${intensity * 0.4}) 0%, 
      rgba(${r}, ${g}, ${b}, ${intensity * 0.15}) 60%, 
      transparent 90%)`;
    return `${fogLayer1}, ${fogLayer2}, ${fogLayer3}`;
  };

  // Get category-specific neon color - using sharp edge glows with multiple colors from bottom-right
  const getCategoryColors = (category: string, qIndex: number = 0) => {
    const shadows = getDarkShadows(qIndex);
    const glow = getGlowPositions(qIndex);
    
    switch (category.toLowerCase()) {
      case 'fuck':
        return { 
          stripBg: 'hsl(15, 100%, 50%)', 
          bodyBg: 'hsl(15, 100%, 50%)', 
          cardFill: 'rgba(150, 10, 10, 0.35)',
          gradient: `
            ${shadows.topRight},
            ${shadows.topLeft},
            ${buildFlameGradient(glow.mainW, glow.mainH, glow.mainX, glow.mainY, 255, 60, 30, 0.85)},
            ${buildFlameGradient(glow.secW * 0.8, glow.secH, glow.secX + 10, glow.secY, 255, 100, 50, 0.7)},
            ${buildFlameGradient(glow.terW * 0.6, glow.terH, glow.terX - 5, glow.terY, 255, 40, 20, 0.75)}
          `
        };
      case 'friends':
      case 'wer aus der runde':
        return { 
          stripBg: 'hsl(278, 100%, 57%)', 
          bodyBg: 'hsl(278, 100%, 57%)', 
          cardFill: 'rgba(60, 180, 160, 0.15)',
          gradient: `
            ${shadows.topRight},
            ${shadows.topLeft},
            ${buildAuraGradient(glow.mainW, glow.mainH, glow.mainX, glow.mainY, 100, 220, 200, 0.75)},
            ${buildAuraGradient(glow.secW, glow.secH, glow.secX, glow.secY, 255, 80, 80, 0.55)},
            ${buildAuraGradient(glow.terW, glow.terH, glow.terX, glow.terY, 100, 255, 150, 0.5)}
          `
        };
      case 'self reflection':
        return { 
          stripBg: 'hsl(290, 100%, 50%)', 
          bodyBg: 'hsl(290, 100%, 50%)', 
          cardFill: 'hsla(340, 100%, 35%, 0.12)',
          gradient: `
            ${shadows.topRight},
            ${shadows.topLeft},
            ${buildAuraGradient(glow.mainW, glow.mainH, glow.mainX, glow.mainY, 255, 180, 120, 0.7)},
            ${buildAuraGradient(glow.secW, glow.secH, glow.secX, glow.secY, 200, 100, 255, 0.6)},
            ${buildAuraGradient(glow.terW, glow.terH, glow.terX, glow.terY, 255, 200, 100, 0.5)}
          `
        };
      case 'party':
        return { 
          stripBg: 'hsl(300, 100%, 50%)', 
          bodyBg: 'hsl(300, 100%, 50%)', 
          cardFill: 'rgba(180, 30, 30, 0.18)',
          gradient: `
            ${shadows.topRight},
            ${shadows.topLeft},
            ${buildVerticalAuraGradient(glow.mainW, glow.mainH, glow.mainX, glow.mainY, 255, 30, 60, 0.75)},
            ${buildVerticalAuraGradient(glow.secW, glow.secH, glow.secX, glow.secY, 255, 50, 200, 0.65)},
            ${buildVerticalAuraGradient(glow.terW, glow.terH, glow.terX, glow.terY, 200, 30, 255, 0.6)}
          `
        };
      case 'family':
        return { 
          stripBg: 'hsl(328, 100%, 56%)', 
          bodyBg: 'hsl(328, 100%, 56%)', 
          cardFill: 'hsla(300, 100%, 60%, 0.10)',
          gradient: `
            ${shadows.topRight},
            ${shadows.topLeft},
            ${buildAuraGradient(glow.mainW, glow.mainH, glow.mainX, glow.mainY, 255, 180, 200, 0.7)},
            ${buildAuraGradient(glow.secW, glow.secH, glow.secX, glow.secY, 255, 100, 180, 0.55)},
            ${buildAuraGradient(glow.terW, glow.terH, glow.terX, glow.terY, 200, 150, 255, 0.5)}
          `
        };
      case 'connection':
        return { 
          stripBg: 'hsl(0, 100%, 50%)', 
          bodyBg: 'hsl(0, 100%, 50%)', 
          cardFill: 'rgba(90, 25, 45, 0.35)',
          gradient: `
            ${shadows.topRight},
            ${shadows.topLeft},
            ${buildAuraGradient(glow.mainW, glow.mainH, glow.mainX, glow.mainY, 255, 80, 150, 0.72)},
            ${buildAuraGradient(glow.secW, glow.secH, glow.secX, glow.secY, 255, 140, 50, 0.55)},
            ${buildAuraGradient(glow.terW, glow.terH, glow.terX, glow.terY, 255, 120, 180, 0.5)}
          `
        };
      case 'identity':
        return { 
          stripBg: 'hsl(328, 100%, 56%)', 
          bodyBg: 'hsl(328, 100%, 56%)', 
          cardFill: 'rgba(60, 10, 25, 0.22)',
          gradient: `
            ${shadows.topRight},
            ${shadows.topLeft},
            ${buildAuraGradient(glow.secW, glow.mainH * 1.2, glow.mainX + 15, glow.mainY - 10, 255, 140, 30, 0.6)},
            ${buildAuraGradient(glow.mainW * 0.8, glow.secH, glow.secX - 10, glow.secY + 5, 255, 120, 20, 0.55)},
            ${buildAuraGradient(glow.terW * 1.3, glow.terH * 0.7, glow.terX, glow.terY, 255, 50, 30, 0.35)}
          `
        };
      case 'career':
        return { 
          stripBg: 'hsl(290, 100%, 50%)', 
          bodyBg: 'hsl(290, 100%, 50%)', 
          cardFill: 'hsla(340, 100%, 35%, 0.12)',
          gradient: `
            ${shadows.topRight},
            ${shadows.topLeft},
            ${buildAuraGradient(glow.mainW, glow.mainH, glow.mainX, glow.mainY, 100, 180, 255, 0.7)},
            ${buildAuraGradient(glow.secW, glow.secH, glow.secX, glow.secY, 150, 100, 255, 0.58)},
            ${buildAuraGradient(glow.terW, glow.terH, glow.terX, glow.terY, 100, 220, 200, 0.48)}
          `
        };
      case 'travel':
        return { 
          stripBg: 'hsl(15, 100%, 50%)', 
          bodyBg: 'hsl(15, 100%, 50%)', 
          cardFill: 'hsla(175, 70%, 40%, 0.08)',
          gradient: `
            ${shadows.topRight},
            ${shadows.topLeft},
            ${buildAuraGradient(glow.mainW, glow.mainH, glow.mainX, glow.mainY, 80, 220, 200, 0.75)},
            ${buildAuraGradient(glow.secW, glow.secH, glow.secX, glow.secY, 100, 180, 255, 0.58)},
            ${buildAuraGradient(glow.terW, glow.terH, glow.terX, glow.terY, 150, 255, 180, 0.48)}
          `
        };
      case 'health':
        return { 
          stripBg: 'hsl(300, 100%, 50%)', 
          bodyBg: 'hsl(300, 100%, 50%)', 
          cardFill: 'hsla(0, 100%, 40%, 0.10)',
          gradient: `
            ${shadows.topRight},
            ${shadows.topLeft},
            ${buildAuraGradient(glow.mainW, glow.mainH, glow.mainX, glow.mainY, 120, 255, 150, 0.72)},
            ${buildAuraGradient(glow.secW, glow.secH, glow.secX, glow.secY, 100, 200, 255, 0.58)},
            ${buildAuraGradient(glow.terW, glow.terH, glow.terX, glow.terY, 200, 255, 150, 0.48)}
          `
        };
      case 'money':
        return { 
          stripBg: 'hsl(290, 100%, 50%)', 
          bodyBg: 'hsl(290, 100%, 50%)', 
          cardFill: 'hsla(340, 100%, 35%, 0.12)',
          gradient: `
            ${shadows.topRight},
            ${shadows.topLeft},
            ${buildAuraGradient(glow.mainW, glow.mainH, glow.mainX, glow.mainY, 255, 220, 100, 0.75)},
            ${buildAuraGradient(glow.secW, glow.secH, glow.secX, glow.secY, 255, 180, 50, 0.6)},
            ${buildAuraGradient(glow.terW, glow.terH, glow.terX, glow.terY, 200, 255, 100, 0.48)}
          `
        };
      case 'love':
        return { 
          stripBg: 'hsl(15, 100%, 50%)', 
          bodyBg: 'hsl(15, 100%, 50%)', 
          cardFill: 'hsla(300, 100%, 60%, 0.10)',
          gradient: `
            ${shadows.topRight},
            ${shadows.topLeft},
            ${buildAuraGradient(glow.mainW, glow.mainH, glow.mainX, glow.mainY, 255, 120, 150, 0.72)},
            ${buildAuraGradient(glow.secW, glow.secH, glow.secX, glow.secY, 255, 80, 120, 0.58)},
            ${buildAuraGradient(glow.terW, glow.terH, glow.terX, glow.terY, 255, 180, 200, 0.5)}
          `
        };
      case 'hobby':
        return { 
          stripBg: 'hsl(328, 100%, 56%)', 
          bodyBg: 'hsl(328, 100%, 56%)', 
          cardFill: 'hsla(175, 70%, 40%, 0.08)',
          gradient: `
            ${shadows.topRight},
            ${shadows.topLeft},
            ${buildAuraGradient(glow.mainW, glow.mainH, glow.mainX, glow.mainY, 100, 200, 255, 0.7)},
            ${buildAuraGradient(glow.secW, glow.secH, glow.secX, glow.secY, 150, 100, 255, 0.58)},
            ${buildAuraGradient(glow.terW, glow.terH, glow.terX, glow.terY, 100, 255, 220, 0.48)}
          `
        };
      case 'dreams':
        return { 
          stripBg: 'hsl(300, 100%, 50%)', 
          bodyBg: 'hsl(300, 100%, 50%)', 
          cardFill: 'hsla(0, 100%, 40%, 0.10)',
          gradient: `
            ${shadows.topRight},
            ${shadows.topLeft},
            ${buildAuraGradient(glow.mainW, glow.mainH, glow.mainX, glow.mainY, 200, 150, 255, 0.75)},
            ${buildAuraGradient(glow.secW, glow.secH, glow.secX, glow.secY, 255, 100, 200, 0.58)},
            ${buildAuraGradient(glow.terW, glow.terH, glow.terX, glow.terY, 150, 200, 255, 0.5)}
          `
        };
      case 'fear':
        return { 
          stripBg: 'hsl(0, 100%, 50%)', 
          bodyBg: 'hsl(0, 100%, 50%)', 
          cardFill: 'hsla(340, 100%, 35%, 0.12)',
          gradient: `
            ${shadows.topRight},
            ${shadows.topLeft},
            ${buildAuraGradient(glow.mainW, glow.mainH, glow.mainX, glow.mainY, 100, 120, 180, 0.7)},
            ${buildAuraGradient(glow.secW, glow.secH, glow.secX, glow.secY, 80, 100, 200, 0.55)},
            ${buildAuraGradient(glow.terW, glow.terH, glow.terX, glow.terY, 150, 100, 180, 0.48)}
          `
        };
      case 'wisdom':
        return { 
          stripBg: 'hsl(290, 100%, 50%)', 
          bodyBg: 'hsl(290, 100%, 50%)', 
          cardFill: 'hsla(300, 100%, 60%, 0.10)',
          gradient: `
            ${shadows.topRight},
            ${shadows.topLeft},
            ${buildAuraGradient(glow.mainW, glow.mainH, glow.mainX, glow.mainY, 255, 220, 180, 0.72)},
            ${buildAuraGradient(glow.secW, glow.secH, glow.secX, glow.secY, 255, 180, 120, 0.55)},
            ${buildAuraGradient(glow.terW, glow.terH, glow.terX, glow.terY, 220, 200, 150, 0.48)}
          `
        };
      case 'future':
        return { 
          stripBg: 'hsl(15, 100%, 50%)', 
          bodyBg: 'hsl(15, 100%, 50%)', 
          cardFill: 'hsla(175, 70%, 40%, 0.08)',
          gradient: `
            ${shadows.topRight},
            ${shadows.topLeft},
            ${buildAuraGradient(glow.mainW, glow.mainH, glow.mainX, glow.mainY, 100, 255, 200, 0.75)},
            ${buildAuraGradient(glow.secW, glow.secH, glow.secX, glow.secY, 80, 200, 255, 0.58)},
            ${buildAuraGradient(glow.terW, glow.terH, glow.terX, glow.terY, 150, 255, 180, 0.5)}
          `
        };
      default:
        return { 
          stripBg: 'hsl(290, 100%, 50%)', 
          bodyBg: 'hsl(290, 100%, 50%)', 
          cardFill: 'hsla(300, 100%, 60%, 0.10)',
          gradient: `
            ${shadows.topRight},
            ${shadows.topLeft},
            ${buildAuraGradient(glow.mainW, glow.mainH, glow.mainX, glow.mainY, 200, 180, 255, 0.7)},
            ${buildAuraGradient(glow.secW, glow.secH, glow.secX, glow.secY, 255, 150, 200, 0.55)},
            ${buildAuraGradient(glow.terW, glow.terH, glow.terX, glow.terY, 150, 200, 255, 0.48)}
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
    
    // Calculate slide distance: on desktop use viewport-based offset, on mobile use card width
    const getSlideDistance = () => {
      if (isMobile) {
        return getCardWidth() + 16;
      }
      // Desktop: 50vw + 50% of card width
      return (window.innerWidth / 2) + (getCardWidth() / 2);
    };
    const slideDistance = getSlideDistance();
    const transitionDuration = isMobile ? 300 : 400;
    
    if (Math.abs(dragOffset) > dragThreshold) {
      if (dragOffset < 0 && nextQuestion) {
        // Swipe left - trigger transition
        setIsTransitioning(true);
        setTransitionDirection('left');
        setIsDragging(false);
        setDragOffset(-slideDistance);
        
        if (onDragStateChange) {
          onDragStateChange(false, 1, nextQuestion.category, -1);
        }
        
        setTimeout(() => {
          onSwipeLeft();
        }, transitionDuration);
        return;
      } else if (dragOffset > 0 && prevQuestion) {
        // Swipe right - trigger transition
        setIsTransitioning(true);
        setTransitionDirection('right');
        setIsDragging(false);
        setDragOffset(slideDistance);
        
        if (onDragStateChange) {
          onDragStateChange(false, 1, prevQuestion.category, 1);
        }
        
        setTimeout(() => {
          onSwipeRight();
        }, transitionDuration);
        return;
      }
    }
    
    // Snap back to center if cancelled
    setIsTransitioning(true);
    setIsDragging(false);
    
    setTimeout(() => {
      setDragOffset(0);
      setTimeout(() => {
        setIsTransitioning(false);
        setTransitionDirection(null);
        // Reset logo after snap-back transition completes
        if (onDragStateChange) {
          onDragStateChange(false, 0, currentQuestion.category, 0);
        }
      }, 300);
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

  // Calculate transformations based on drag - following described architecture
  // Scale: 1 → 0.8 during drag (20% reduction)
  // Rotation: 0 → ±5° during drag
  const getDragProgress = () => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.offsetWidth;
    return Math.min(Math.abs(dragOffset) / 300, 1); // Using 300px as reference for max effect
  };

  const progress = getDragProgress();
  const totalOffset = dragOffset;
  const direction = totalOffset < 0 ? -1 : 1;
  const containerWidthPx = containerRef.current?.offsetWidth || window.innerWidth;

  // Active Slide: scale 1 → 0.8, rotation 0 → ±5°
  const currentScale = 1 - (progress * 0.2);
  const currentRotation = (totalOffset / 300) * 5;

  // Incoming Slide: scale 0.8 → 1, rotation ±5° → 0°
  const incomingScale = 0.8 + (progress * 0.2);

  // Determine which category color to show based on drag
  const getActiveCategory = () => {
    if (totalOffset < 0 && nextQuestion && progress > 0) {
      return nextQuestion.category;
    } else if (totalOffset > 0 && prevQuestion && progress > 0) {
      return prevQuestion.category;
    }
    return currentQuestion.category;
  };

  const activeCategoryForColor = getActiveCategory();
  const activeCategoryColors = getCategoryColors(activeCategoryForColor, questionIndex);

  // 5-slide window rendering helper
  // Position calculations:
  // prev-2: translateX(-200% - 32px) scale(0.8)
  // prev:   translateX(-100% - 16px) scale(0.8)
  // active: translateX(-50%) translateY(-50%) scale(1) - centered
  // next:   translateX(100% + 16px) scale(0.8)
  // next-2: translateX(200% + 32px) scale(0.8)
  const getSlideStyle = (slidePosition: 'prev2' | 'prev' | 'active' | 'next' | 'next2'): React.CSSProperties => {
    // Disable transitions during drag OR when skipping (after question change)
    // Desktop: 400ms for smoother feel, mobile: 300ms
    const transitionDuration = isMobile ? '0.3s' : '0.4s';
    const baseTransition = (isDragging || skipTransition) ? 'none' : `all ${transitionDuration} ease-out`;
    // Use pixel offset directly for drag, not percentage
    const slideOffsetPx = totalOffset;
    
    // Desktop: use 100vw offset to hide prev/next cards outside viewport
    // Mobile: use percentage-based offset for visible peek
    // Desktop: 50vw + 50% positions card edge exactly at viewport edge
    // Mobile: percentage-based for visible peek
    // Calculate desktop base positions in pixels for consistent drag behavior
    const cardWidth = getCardWidth();
    const viewportHalf = window.innerWidth / 2;
    const cardHalf = cardWidth / 2;
    const desktopOffset = viewportHalf + cardHalf;
    
    const prevBase = isMobile ? '-100% - 16px' : `${-desktopOffset}px`;
    const nextBase = isMobile ? '100% + 16px' : `${desktopOffset}px`;
    const prev2Base = isMobile ? '-200% - 32px' : `${-desktopOffset * 2}px`;
    const next2Base = isMobile ? '200% + 32px' : `${desktopOffset * 2}px`;
    
    switch (slidePosition) {
      case 'prev2':
        return {
          transform: `translate(-50%, -50%) translateX(calc(${prev2Base} + ${slideOffsetPx}px)) scale(0.8) rotate(-5deg)`,
          transition: baseTransition,
          zIndex: 0,
        };
      case 'prev':
        // Refined scale: starts smaller (0.85) for more dramatic entrance
        const prevScale = totalOffset > 0 ? (0.85 + (progress * 0.15)) : 0.85;
        // Base rotation -5° at rest, animates to 0° when becoming active
        const prevRotation = totalOffset > 0 ? (-5 * (1 - progress)) : -5;
        // When dragging right (positive offset), prev card moves toward center
        // Only move when dragging toward this card (positive = right = toward prev)
        const prevOffsetPx = totalOffset > 0 ? slideOffsetPx : 0;
        return {
          transform: `translate(-50%, -50%) translateX(calc(${prevBase} + ${prevOffsetPx}px)) scale(${prevScale}) rotate(${prevRotation}deg)`,
          transition: baseTransition,
          zIndex: 1,
        };
      case 'active':
        if (showSwipeHint) {
          return {
            transform: 'translate(-50%, -50%) translateX(-60px) scale(0.96) rotate(-2deg)',
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: 2,
          };
        }
        return {
          transform: `translate(-50%, -50%) translateX(${slideOffsetPx}px) scale(${currentScale}) rotate(${currentRotation}deg)`,
          transition: baseTransition,
          zIndex: 2,
        };
      case 'next':
        // Refined scale: starts smaller (0.85) for more dramatic entrance
        const nextScale = totalOffset < 0 ? (0.85 + (progress * 0.15)) : 0.85;
        // Base rotation 5° at rest, animates to 0° when becoming active
        const nextRotation = totalOffset < 0 ? (5 * (1 - progress)) : 5;
        if (showSwipeHint) {
          return {
            transform: `translate(-50%, -50%) translateX(calc(${nextBase} - 60px)) scale(0.86) rotate(5deg)`,
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: 1,
          };
        }
        // When dragging left (negative offset), next card moves toward center
        // Only move when dragging toward this card (negative = left = toward next)
        const nextOffsetPx = totalOffset < 0 ? slideOffsetPx : 0;
        return {
          transform: `translate(-50%, -50%) translateX(calc(${nextBase} + ${nextOffsetPx}px)) scale(${nextScale}) rotate(${nextRotation}deg)`,
          transition: baseTransition,
          zIndex: 1,
        };
      case 'next2':
        return {
          transform: `translate(-50%, -50%) translateX(calc(${next2Base} + ${slideOffsetPx}px)) scale(0.8) rotate(5deg)`,
          transition: baseTransition,
          zIndex: 0,
        };
    }
  };

  

  const renderCard = (question: Question, style: React.CSSProperties, cardQuestionIndex: number) => {
    const categoryColors = getCategoryColors(question.category, cardQuestionIndex);
    const questionText = getQuestionText(question);
    const hyphenatedText = hyphenateQuestion(questionText);
    const showShimmer = isTranslating(question.question);
    const isCurrent = cardQuestionIndex === questionIndex;
    
    return (
      <div 
        ref={isCurrent ? activeCardRef : undefined}
        className="absolute left-1/2 top-1/2 flex-shrink-0 rounded-2xl overflow-hidden"
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
          maxWidth: isMobile ? 'calc(min(700px, 100%) - 32px)' : '500px',
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
        {/* 5-Slide Window: prev-2, prev, active, next, next-2 */}
        <div className="relative h-full w-full flex items-center justify-center">
          {/* prev-2 slide */}
          {prevQuestion2 && renderCard(prevQuestion2, getSlideStyle('prev2'), questionIndex - 2)}
          
          {/* prev slide */}
          {prevQuestion && renderCard(prevQuestion, getSlideStyle('prev'), questionIndex - 1)}
          
          {/* active slide */}
          {renderCard(currentQuestion, getSlideStyle('active'), questionIndex)}
          
          {/* next slide */}
          {nextQuestion && renderCard(nextQuestion, getSlideStyle('next'), questionIndex + 1)}
          
          {/* next-2 slide */}
          {nextQuestion2 && renderCard(nextQuestion2, getSlideStyle('next2'), questionIndex + 2)}
        </div>
        
        {/* Edge Click Zones */}
        {/* Left edge click zone */}
        {prevQuestion && (
          <div
            className="absolute cursor-pointer z-20"
            style={{ 
              width: isMobile ? '16px' : '40px',
              height: '100%',
              top: 0,
              left: 0,
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isTransitioning) {
                const slideDistance = isMobile ? getCardWidth() + 16 : (window.innerWidth / 2) + (getCardWidth() / 2);
                const transitionDuration = isMobile ? 300 : 400;
                setIsTransitioning(true);
                setTransitionDirection('right');
                setDragOffset(slideDistance);
                if (onDragStateChange) {
                  onDragStateChange(false, 1, prevQuestion.category, 1);
                }
                setTimeout(() => {
                  onSwipeRight();
                }, transitionDuration);
              }
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isTransitioning) {
                const slideDistance = isMobile ? getCardWidth() + 16 : (window.innerWidth / 2) + (getCardWidth() / 2);
                const transitionDuration = isMobile ? 300 : 400;
                setIsTransitioning(true);
                setTransitionDirection('right');
                setDragOffset(slideDistance);
                if (onDragStateChange) {
                  onDragStateChange(false, 1, prevQuestion.category, 1);
                }
                setTimeout(() => {
                  onSwipeRight();
                }, transitionDuration);
              }
            }}
          />
        )}
        
        {/* Right edge click zone */}
        {nextQuestion && (
          <div
            className="absolute cursor-pointer z-20"
            style={{ 
              width: isMobile ? '16px' : '40px',
              height: '100%',
              top: 0,
              right: 0,
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isTransitioning) {
                const slideDistance = isMobile ? getCardWidth() + 16 : (window.innerWidth / 2) + (getCardWidth() / 2);
                const transitionDuration = isMobile ? 300 : 400;
                setIsTransitioning(true);
                setTransitionDirection('left');
                setDragOffset(-slideDistance);
                if (onDragStateChange) {
                  onDragStateChange(false, 1, nextQuestion.category, -1);
                }
                setTimeout(() => {
                  onSwipeLeft();
                }, transitionDuration);
              }
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isTransitioning) {
                const slideDistance = isMobile ? getCardWidth() + 16 : (window.innerWidth / 2) + (getCardWidth() / 2);
                const transitionDuration = isMobile ? 300 : 400;
                setIsTransitioning(true);
                setTransitionDirection('left');
                setDragOffset(-slideDistance);
                if (onDragStateChange) {
                  onDragStateChange(false, 1, nextQuestion.category, -1);
                }
                setTimeout(() => {
                  onSwipeLeft();
                }, transitionDuration);
              }
            }}
          />
        )}
      </div>
    </>
  );
}
