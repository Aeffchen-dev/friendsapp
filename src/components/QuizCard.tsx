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

  // Generate randomized glow positions - smaller but elongated diagonally
  const getGlowPositions = (seed: number) => {
    // Randomize shape orientation per slide (some wider, some taller for diagonal effect)
    const isMainDiagonal = (seed % 2) === 0;
    const isSecDiagonal = ((seed + 1) % 2) === 0;
    const isTerDiagonal = ((seed + 2) % 3) === 0;
    
    // Main glow - bottom right middle area, elongated shape
    const mainX = ((seed * 47) % 15) + 60; // 60-75% x
    const mainY = ((seed * 53) % 15) + 55; // 55-70% y
    const mainW = isMainDiagonal ? ((seed * 59) % 15) + 35 : ((seed * 59) % 10) + 20; // wider or narrower
    const mainH = isMainDiagonal ? ((seed * 61) % 10) + 18 : ((seed * 61) % 15) + 30; // shorter or taller
    
    // Secondary glow - slightly offset, elongated
    const secX = ((seed * 67) % 15) + 55; // 55-70% x
    const secY = ((seed * 71) % 15) + 60; // 60-75% y
    const secW = isSecDiagonal ? ((seed * 73) % 12) + 28 : ((seed * 73) % 8) + 15; 
    const secH = isSecDiagonal ? ((seed * 79) % 8) + 15 : ((seed * 79) % 12) + 25;
    
    // Tertiary glow - another offset, elongated
    const terX = ((seed * 83) % 15) + 65; // 65-80% x
    const terY = ((seed * 89) % 15) + 50; // 50-65% y
    const terW = isTerDiagonal ? ((seed * 97) % 12) + 25 : ((seed * 97) % 8) + 12;
    const terH = isTerDiagonal ? ((seed * 101) % 8) + 12 : ((seed * 101) % 12) + 22;
    
    return { mainX, mainY, mainW, mainH, secX, secY, secW, secH, terX, terY, terW, terH };
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
          cardFill: 'rgba(180, 40, 100, 0.20)',
          gradient: `
            ${shadows.topRight},
            ${shadows.topLeft},
            radial-gradient(ellipse ${glow.mainW}% ${glow.mainH}% at ${glow.mainX}% ${glow.mainY}%, rgba(255, 120, 200, 0.75) 0%, rgba(255, 120, 200, 0.4) 40%, transparent 70%),
            radial-gradient(ellipse ${glow.secW}% ${glow.secH}% at ${glow.secX}% ${glow.secY}%, rgba(180, 0, 255, 0.65) 0%, rgba(180, 0, 255, 0.3) 50%, transparent 80%),
            radial-gradient(ellipse ${glow.terW}% ${glow.terH}% at ${glow.terX}% ${glow.terY}%, rgba(255, 100, 50, 0.55) 0%, rgba(255, 100, 50, 0.25) 45%, transparent 75%)
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
            radial-gradient(ellipse ${glow.mainW}% ${glow.mainH}% at ${glow.mainX}% ${glow.mainY}%, rgba(100, 220, 200, 0.80) 0%, rgba(100, 220, 200, 0.35) 45%, transparent 75%),
            radial-gradient(ellipse ${glow.secW}% ${glow.secH}% at ${glow.secX}% ${glow.secY}%, rgba(255, 80, 80, 0.60) 0%, rgba(255, 80, 80, 0.25) 50%, transparent 80%),
            radial-gradient(ellipse ${glow.terW}% ${glow.terH}% at ${glow.terX}% ${glow.terY}%, rgba(100, 255, 150, 0.55) 0%, rgba(100, 255, 150, 0.2) 50%, transparent 75%)
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
            radial-gradient(ellipse ${glow.mainW}% ${glow.mainH}% at ${glow.mainX}% ${glow.mainY}%, rgba(255, 180, 120, 0.75) 0%, rgba(255, 180, 120, 0.35) 45%, transparent 70%),
            radial-gradient(ellipse ${glow.secW}% ${glow.secH}% at ${glow.secX}% ${glow.secY}%, rgba(200, 100, 255, 0.65) 0%, rgba(200, 100, 255, 0.25) 50%, transparent 80%),
            radial-gradient(ellipse ${glow.terW}% ${glow.terH}% at ${glow.terX}% ${glow.terY}%, rgba(255, 200, 100, 0.55) 0%, rgba(255, 200, 100, 0.2) 50%, transparent 75%)
          `
        };
      case 'party':
        return { 
          stripBg: 'hsl(300, 100%, 50%)', 
          bodyBg: 'hsl(300, 100%, 50%)', 
          cardFill: 'rgba(120, 40, 70, 0.18)',
          gradient: `
            ${shadows.topRight},
            ${shadows.topLeft},
            radial-gradient(ellipse ${glow.mainW}% ${glow.mainH}% at ${glow.mainX}% ${glow.mainY}%, rgba(255, 80, 80, 0.80) 0%, rgba(255, 80, 80, 0.4) 40%, transparent 70%),
            radial-gradient(ellipse ${glow.secW}% ${glow.secH}% at ${glow.secX}% ${glow.secY}%, rgba(255, 50, 150, 0.65) 0%, rgba(255, 50, 150, 0.3) 45%, transparent 75%),
            radial-gradient(ellipse ${glow.terW}% ${glow.terH}% at ${glow.terX}% ${glow.terY}%, rgba(255, 180, 50, 0.55) 0%, rgba(255, 180, 50, 0.2) 50%, transparent 80%)
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
            radial-gradient(ellipse ${glow.mainW}% ${glow.mainH}% at ${glow.mainX}% ${glow.mainY}%, rgba(255, 180, 200, 0.75) 0%, rgba(255, 180, 200, 0.35) 45%, transparent 70%),
            radial-gradient(ellipse ${glow.secW}% ${glow.secH}% at ${glow.secX}% ${glow.secY}%, rgba(255, 100, 180, 0.60) 0%, rgba(255, 100, 180, 0.25) 50%, transparent 80%),
            radial-gradient(ellipse ${glow.terW}% ${glow.terH}% at ${glow.terX}% ${glow.terY}%, rgba(200, 150, 255, 0.55) 0%, rgba(200, 150, 255, 0.2) 45%, transparent 75%)
          `
        };
      case 'connection':
        return { 
          stripBg: 'hsl(0, 100%, 50%)', 
          bodyBg: 'hsl(0, 100%, 50%)', 
          cardFill: 'rgba(220, 60, 140, 0.18)',
          gradient: `
            ${shadows.topRight},
            ${shadows.topLeft},
            radial-gradient(ellipse ${glow.mainW}% ${glow.mainH}% at ${glow.mainX}% ${glow.mainY}%, rgba(255, 140, 80, 0.80) 0%, rgba(255, 140, 80, 0.4) 40%, transparent 70%),
            radial-gradient(ellipse ${glow.secW}% ${glow.secH}% at ${glow.secX}% ${glow.secY}%, rgba(255, 80, 180, 0.65) 0%, rgba(255, 80, 180, 0.3) 45%, transparent 75%),
            radial-gradient(ellipse ${glow.terW}% ${glow.terH}% at ${glow.terX}% ${glow.terY}%, rgba(255, 200, 100, 0.55) 0%, rgba(255, 200, 100, 0.2) 50%, transparent 80%)
          `
        };
      case 'identity':
        return { 
          stripBg: 'hsl(328, 100%, 56%)', 
          bodyBg: 'hsl(328, 100%, 56%)', 
          cardFill: 'rgba(200, 30, 50, 0.18)',
          gradient: `
            ${shadows.topRight},
            ${shadows.topLeft},
            radial-gradient(ellipse ${glow.mainW}% ${glow.mainH}% at ${glow.mainX}% ${glow.mainY}%, rgba(255, 100, 80, 0.78) 0%, rgba(255, 100, 80, 0.38) 42%, transparent 70%),
            radial-gradient(ellipse ${glow.secW}% ${glow.secH}% at ${glow.secX}% ${glow.secY}%, rgba(255, 150, 50, 0.62) 0%, rgba(255, 150, 50, 0.28) 48%, transparent 78%),
            radial-gradient(ellipse ${glow.terW}% ${glow.terH}% at ${glow.terX}% ${glow.terY}%, rgba(200, 80, 150, 0.55) 0%, rgba(200, 80, 150, 0.22) 50%, transparent 75%)
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
            radial-gradient(ellipse ${glow.mainW}% ${glow.mainH}% at ${glow.mainX}% ${glow.mainY}%, rgba(100, 180, 255, 0.75) 0%, rgba(100, 180, 255, 0.35) 45%, transparent 70%),
            radial-gradient(ellipse ${glow.secW}% ${glow.secH}% at ${glow.secX}% ${glow.secY}%, rgba(150, 100, 255, 0.62) 0%, rgba(150, 100, 255, 0.28) 48%, transparent 78%),
            radial-gradient(ellipse ${glow.terW}% ${glow.terH}% at ${glow.terX}% ${glow.terY}%, rgba(100, 220, 200, 0.52) 0%, rgba(100, 220, 200, 0.2) 50%, transparent 75%)
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
            radial-gradient(ellipse ${glow.mainW}% ${glow.mainH}% at ${glow.mainX}% ${glow.mainY}%, rgba(80, 220, 200, 0.80) 0%, rgba(80, 220, 200, 0.38) 42%, transparent 70%),
            radial-gradient(ellipse ${glow.secW}% ${glow.secH}% at ${glow.secX}% ${glow.secY}%, rgba(100, 180, 255, 0.62) 0%, rgba(100, 180, 255, 0.25) 48%, transparent 78%),
            radial-gradient(ellipse ${glow.terW}% ${glow.terH}% at ${glow.terX}% ${glow.terY}%, rgba(150, 255, 180, 0.52) 0%, rgba(150, 255, 180, 0.2) 45%, transparent 75%)
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
            radial-gradient(ellipse ${glow.mainW}% ${glow.mainH}% at ${glow.mainX}% ${glow.mainY}%, rgba(120, 255, 150, 0.78) 0%, rgba(120, 255, 150, 0.38) 42%, transparent 70%),
            radial-gradient(ellipse ${glow.secW}% ${glow.secH}% at ${glow.secX}% ${glow.secY}%, rgba(100, 200, 255, 0.62) 0%, rgba(100, 200, 255, 0.28) 48%, transparent 78%),
            radial-gradient(ellipse ${glow.terW}% ${glow.terH}% at ${glow.terX}% ${glow.terY}%, rgba(200, 255, 150, 0.52) 0%, rgba(200, 255, 150, 0.2) 50%, transparent 75%)
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
            radial-gradient(ellipse ${glow.mainW}% ${glow.mainH}% at ${glow.mainX}% ${glow.mainY}%, rgba(255, 220, 100, 0.80) 0%, rgba(255, 220, 100, 0.4) 40%, transparent 70%),
            radial-gradient(ellipse ${glow.secW}% ${glow.secH}% at ${glow.secX}% ${glow.secY}%, rgba(255, 180, 50, 0.65) 0%, rgba(255, 180, 50, 0.3) 45%, transparent 75%),
            radial-gradient(ellipse ${glow.terW}% ${glow.terH}% at ${glow.terX}% ${glow.terY}%, rgba(200, 255, 100, 0.52) 0%, rgba(200, 255, 100, 0.2) 50%, transparent 78%)
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
            radial-gradient(ellipse ${glow.mainW}% ${glow.mainH}% at ${glow.mainX}% ${glow.mainY}%, rgba(255, 120, 150, 0.78) 0%, rgba(255, 120, 150, 0.38) 42%, transparent 70%),
            radial-gradient(ellipse ${glow.secW}% ${glow.secH}% at ${glow.secX}% ${glow.secY}%, rgba(255, 80, 120, 0.62) 0%, rgba(255, 80, 120, 0.28) 48%, transparent 78%),
            radial-gradient(ellipse ${glow.terW}% ${glow.terH}% at ${glow.terX}% ${glow.terY}%, rgba(255, 180, 200, 0.55) 0%, rgba(255, 180, 200, 0.22) 50%, transparent 75%)
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
            radial-gradient(ellipse ${glow.mainW}% ${glow.mainH}% at ${glow.mainX}% ${glow.mainY}%, rgba(100, 200, 255, 0.75) 0%, rgba(100, 200, 255, 0.35) 45%, transparent 70%),
            radial-gradient(ellipse ${glow.secW}% ${glow.secH}% at ${glow.secX}% ${glow.secY}%, rgba(150, 100, 255, 0.62) 0%, rgba(150, 100, 255, 0.28) 48%, transparent 78%),
            radial-gradient(ellipse ${glow.terW}% ${glow.terH}% at ${glow.terX}% ${glow.terY}%, rgba(100, 255, 220, 0.52) 0%, rgba(100, 255, 220, 0.2) 50%, transparent 75%)
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
            radial-gradient(ellipse ${glow.mainW}% ${glow.mainH}% at ${glow.mainX}% ${glow.mainY}%, rgba(200, 150, 255, 0.80) 0%, rgba(200, 150, 255, 0.4) 40%, transparent 70%),
            radial-gradient(ellipse ${glow.secW}% ${glow.secH}% at ${glow.secX}% ${glow.secY}%, rgba(255, 100, 200, 0.62) 0%, rgba(255, 100, 200, 0.28) 48%, transparent 78%),
            radial-gradient(ellipse ${glow.terW}% ${glow.terH}% at ${glow.terX}% ${glow.terY}%, rgba(150, 200, 255, 0.55) 0%, rgba(150, 200, 255, 0.22) 50%, transparent 75%)
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
            radial-gradient(ellipse ${glow.mainW}% ${glow.mainH}% at ${glow.mainX}% ${glow.mainY}%, rgba(100, 120, 180, 0.75) 0%, rgba(100, 120, 180, 0.35) 45%, transparent 70%),
            radial-gradient(ellipse ${glow.secW}% ${glow.secH}% at ${glow.secX}% ${glow.secY}%, rgba(80, 100, 200, 0.60) 0%, rgba(80, 100, 200, 0.25) 48%, transparent 78%),
            radial-gradient(ellipse ${glow.terW}% ${glow.terH}% at ${glow.terX}% ${glow.terY}%, rgba(150, 100, 180, 0.52) 0%, rgba(150, 100, 180, 0.2) 50%, transparent 75%)
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
            radial-gradient(ellipse ${glow.mainW}% ${glow.mainH}% at ${glow.mainX}% ${glow.mainY}%, rgba(255, 220, 180, 0.78) 0%, rgba(255, 220, 180, 0.38) 42%, transparent 70%),
            radial-gradient(ellipse ${glow.secW}% ${glow.secH}% at ${glow.secX}% ${glow.secY}%, rgba(255, 180, 120, 0.60) 0%, rgba(255, 180, 120, 0.25) 48%, transparent 78%),
            radial-gradient(ellipse ${glow.terW}% ${glow.terH}% at ${glow.terX}% ${glow.terY}%, rgba(220, 200, 150, 0.52) 0%, rgba(220, 200, 150, 0.2) 50%, transparent 75%)
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
            radial-gradient(ellipse ${glow.mainW}% ${glow.mainH}% at ${glow.mainX}% ${glow.mainY}%, rgba(100, 255, 200, 0.80) 0%, rgba(100, 255, 200, 0.4) 40%, transparent 70%),
            radial-gradient(ellipse ${glow.secW}% ${glow.secH}% at ${glow.secX}% ${glow.secY}%, rgba(80, 200, 255, 0.62) 0%, rgba(80, 200, 255, 0.28) 48%, transparent 78%),
            radial-gradient(ellipse ${glow.terW}% ${glow.terH}% at ${glow.terX}% ${glow.terY}%, rgba(150, 255, 180, 0.55) 0%, rgba(150, 255, 180, 0.22) 50%, transparent 75%)
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
            radial-gradient(ellipse ${glow.mainW}% ${glow.mainH}% at ${glow.mainX}% ${glow.mainY}%, rgba(200, 180, 255, 0.75) 0%, rgba(200, 180, 255, 0.35) 45%, transparent 70%),
            radial-gradient(ellipse ${glow.secW}% ${glow.secH}% at ${glow.secX}% ${glow.secY}%, rgba(255, 150, 200, 0.60) 0%, rgba(255, 150, 200, 0.25) 48%, transparent 78%),
            radial-gradient(ellipse ${glow.terW}% ${glow.terH}% at ${glow.terX}% ${glow.terY}%, rgba(150, 200, 255, 0.52) 0%, rgba(150, 200, 255, 0.2) 50%, transparent 75%)
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
  const activeCategoryColors = getCategoryColors(activeCategoryForColor, questionIndex);

  const renderCard = (question: Question, style: React.CSSProperties, cardQuestionIndex: number) => {
    const categoryColors = getCategoryColors(question.category, cardQuestionIndex);
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
