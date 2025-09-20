import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Question {
  question: string;
  category: string;
}

interface QuizCardProps {
  question: Question;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  animationClass?: string;
}

export function QuizCard({ question, onSwipeLeft, onSwipeRight, animationClass = '' }: QuizCardProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [mouseStart, setMouseStart] = useState<number | null>(null);
  const [mouseEnd, setMouseEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processedText, setProcessedText] = useState<JSX.Element[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const textRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 50;


  // Process text to handle long words individually
  useEffect(() => {
    const processText = () => {
      if (!containerRef.current) return;

      const words = question.question.split(' ');
      const containerWidth = containerRef.current.getBoundingClientRect().width;
      
      // Create temporary element to measure word width with exact same styles
      const tempElement = document.createElement('span');
      tempElement.style.cssText = `
        position: absolute;
        visibility: hidden;
        white-space: nowrap;
        font-size: 3rem;
        font-family: inherit;
        font-weight: normal;
        padding: 0;
        margin: 0;
        border: 0;
      `;
      
      // Add to same container to inherit styles
      containerRef.current.appendChild(tempElement);

      const processedWords = words.map((word, index) => {
        tempElement.textContent = word;
        const wordWidth = tempElement.getBoundingClientRect().width;
        
        // Only apply hyphenation if word is actually wider than available space
        // Use full container width minus some padding buffer
        const needsHyphenation = wordWidth > (containerWidth - 20);
        
        return (
          <span 
            key={index}
            style={{
              hyphens: needsHyphenation ? 'auto' : 'none',
              overflowWrap: needsHyphenation ? 'break-word' : 'normal',
              wordBreak: 'normal'
            }}
            lang="de"
          >
            {word}
            {index < words.length - 1 && ' '}
          </span>
        );
      });

      containerRef.current.removeChild(tempElement);
      setProcessedText(processedWords);
    };

    const timeoutId = setTimeout(processText, 50);
    window.addEventListener('resize', processText);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', processText);
    };
  }, [question.question]);

  // Get category-specific colors
  const getCategoryColors = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fuck':
        return {
          bg: 'bg-quiz-fuck-bg',
          text: 'text-quiz-fuck-bg',
          stripeBg: 'bg-quiz-fuck-dark',
          questionText: 'text-quiz-fuck-dark'
        };
      case 'friends':
        return {
          bg: 'bg-quiz-friends-bg', 
          text: 'text-quiz-friends-bg',
          stripeBg: 'bg-quiz-friends-dark',
          questionText: 'text-quiz-friends-dark'
        };
      case 'self reflection':
        return {
          bg: 'bg-quiz-self-reflection-bg',
          text: 'text-quiz-self-reflection-bg',
          stripeBg: 'bg-quiz-self-reflection-dark',
          questionText: 'text-quiz-self-reflection-dark'
        };
      case 'party':
        return {
          bg: 'bg-quiz-party-bg',
          text: 'text-quiz-party-bg',
          stripeBg: 'bg-quiz-party-dark',
          questionText: 'text-quiz-party-dark'
        };
      case 'family':
        return {
          bg: 'bg-quiz-family-bg',
          text: 'text-quiz-family-bg',
          stripeBg: 'bg-quiz-family-dark',
          questionText: 'text-quiz-family-dark'
        };
      case 'connection':
        return {
          bg: 'bg-quiz-connection-bg',
          text: 'text-quiz-connection-bg',
          stripeBg: 'bg-quiz-connection-dark',
          questionText: 'text-quiz-connection-dark'
        };
      case 'identity':
        return {
          bg: 'bg-quiz-identity-bg',
          text: 'text-quiz-identity-bg',
          stripeBg: 'bg-quiz-identity-dark',
          questionText: 'text-quiz-identity-dark'
        };
      case 'career':
        return {
          bg: 'bg-quiz-career-bg',
          text: 'text-quiz-career-bg',
          stripeBg: 'bg-quiz-career-dark',
          questionText: 'text-quiz-career-dark'
        };
      case 'travel':
        return {
          bg: 'bg-quiz-travel-bg',
          text: 'text-quiz-travel-bg',
          stripeBg: 'bg-quiz-travel-dark',
          questionText: 'text-quiz-travel-dark'
        };
      case 'health':
        return {
          bg: 'bg-quiz-health-bg',
          text: 'text-quiz-health-bg',
          stripeBg: 'bg-quiz-health-dark',
          questionText: 'text-quiz-health-dark'
        };
      case 'money':
        return {
          bg: 'bg-quiz-money-bg',
          text: 'text-quiz-money-bg',
          stripeBg: 'bg-quiz-money-dark',
          questionText: 'text-quiz-money-dark'
        };
      case 'love':
        return {
          bg: 'bg-quiz-love-bg',
          text: 'text-quiz-love-bg',
          stripeBg: 'bg-quiz-love-dark',
          questionText: 'text-quiz-love-dark'
        };
      case 'hobby':
        return {
          bg: 'bg-quiz-hobby-bg',
          text: 'text-quiz-hobby-bg',
          stripeBg: 'bg-quiz-hobby-dark',
          questionText: 'text-quiz-hobby-dark'
        };
      case 'dreams':
        return {
          bg: 'bg-quiz-dreams-bg',
          text: 'text-quiz-dreams-bg',
          stripeBg: 'bg-quiz-dreams-dark',
          questionText: 'text-quiz-dreams-dark'
        };
      case 'fear':
        return {
          bg: 'bg-quiz-fear-bg',
          text: 'text-quiz-fear-bg',
          stripeBg: 'bg-quiz-fear-dark',
          questionText: 'text-quiz-fear-dark'
        };
      case 'wisdom':
        return {
          bg: 'bg-quiz-wisdom-bg',
          text: 'text-quiz-wisdom-bg',
          stripeBg: 'bg-quiz-wisdom-dark',
          questionText: 'text-quiz-wisdom-dark'
        };
      case 'future':
        return {
          bg: 'bg-quiz-future-bg',
          text: 'text-quiz-future-bg',
          stripeBg: 'bg-quiz-future-dark',
          questionText: 'text-quiz-future-dark'
        };
      case 'dirty':
        return {
          bg: 'bg-quiz-fuck-bg',
          text: 'text-quiz-fuck-bg',
          stripeBg: 'bg-quiz-fuck-dark',
          questionText: 'text-quiz-fuck-dark'
        };
      case 'fail':
        return {
          bg: 'bg-quiz-fear-bg',
          text: 'text-quiz-fear-bg',
          stripeBg: 'bg-quiz-fear-dark',
          questionText: 'text-quiz-fear-dark'
        };
      case 'wild':
        return {
          bg: 'bg-quiz-party-bg',
          text: 'text-quiz-party-bg',
          stripeBg: 'bg-quiz-party-dark',
          questionText: 'text-quiz-party-dark'
        };
      case 'crazy':
        return {
          bg: 'bg-quiz-dreams-bg',
          text: 'text-quiz-dreams-bg',
          stripeBg: 'bg-quiz-dreams-dark',
          questionText: 'text-quiz-dreams-dark'
        };
      case 'toys':
        return {
          bg: 'bg-quiz-hobby-bg',
          text: 'text-quiz-hobby-bg',
          stripeBg: 'bg-quiz-hobby-dark',
          questionText: 'text-quiz-hobby-dark'
        };
      default:
        return {
          bg: 'bg-quiz-category-bg',
          text: 'text-quiz-category-text',
          stripeBg: 'bg-quiz-category-bg',
          questionText: 'text-quiz-category-text'
        };
    }
  };

  // Haptic feedback function
  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50); // 50ms vibration
    }
  };

  const categoryColors = getCategoryColors(question.category);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onSwipeLeft();
    } else if (isRightSwipe) {
      onSwipeRight();
    }
  };

  // Mouse drag handlers for desktop
  const onMouseDown = (e: React.MouseEvent) => {
    setMouseEnd(null);
    setMouseStart(e.clientX);
    setIsDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setMouseEnd(e.clientX);
  };

  const onMouseUp = () => {
    if (!isDragging || !mouseStart || !mouseEnd) {
      setIsDragging(false);
      return;
    }
    
    const distance = mouseStart - mouseEnd;
    const isLeftDrag = distance > minSwipeDistance;
    const isRightDrag = distance < -minSwipeDistance;

    if (isLeftDrag) {
      onSwipeLeft();
    } else if (isRightDrag) {
      onSwipeRight();
    }
    
    setIsDragging(false);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className={`relative h-full w-full max-w-[500px] mx-auto ${categoryColors.bg} rounded-2xl shadow-card overflow-hidden select-none ${animationClass}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      style={{
        height: 'calc(100svh - 64px - 20px - 16px - 32px)',
        maxHeight: '100%',
        transition: 'height 0.2s ease-out'
      }}
    >
      {/* Left Click Area - Previous */}
      <div 
        className="absolute left-0 top-0 w-20 h-full z-10 cursor-pointer"
        onClick={() => {
          triggerHaptic();
          onSwipeRight();
        }}
      />

      {/* Right Click Area - Next */}
      <div 
        className="absolute right-0 top-0 w-20 h-full z-10 cursor-pointer"
        onClick={() => {
          triggerHaptic();
          onSwipeLeft();
        }}
      />

      {/* Category Strip */}
      <div className={`absolute left-0 top-0 h-full w-8 ${categoryColors.stripeBg} flex items-center justify-center`}>
        <div className="transform -rotate-90 whitespace-nowrap">
          {Array(20).fill(question.category).map((cat, index) => (
            <span 
              key={`${cat}-${index}`} 
              className={`${categoryColors.text} font-bold text-sm tracking-wide uppercase`} 
              style={{ 
                marginRight: index < 19 ? '8px' : '0'
              }}
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-8 lg:ml-10 h-full flex flex-col justify-center px-8 lg:pr-10">

        <div ref={containerRef} className="flex-1 flex items-start justify-start text-left w-full pt-16">
          <h1 
            ref={textRef}
            className={`text-3xl md:text-4xl lg:text-4xl font-normal ${categoryColors.questionText} leading-tight w-full max-w-full`}
          >
            {processedText.length > 0 ? processedText : question.question}
          </h1>
        </div>

      </div>

    </div>
  );
}