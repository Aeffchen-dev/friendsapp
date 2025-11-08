import { useState, useRef } from 'react';

interface Question {
  question: string;
  category: string;
}

interface QuizCardProps {
  currentQuestion: Question;
  nextQuestion: Question | null;
  prevQuestion: Question | null;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export function QuizCard({ currentQuestion, nextQuestion, prevQuestion, onSwipeLeft, onSwipeRight }: QuizCardProps) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const minSwipeDistance = 50;

  // Get category-specific color pairs
  const getCategoryColors = (category: string) => {
    const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-');
    switch (normalizedCategory) {
      case 'fuck':
        return { cardBg: 'bg-quiz-fuck-card', textColor: 'text-quiz-fuck-text', stripBg: 'bg-quiz-fuck-strip', stripText: 'text-white' };
      case 'friends':
        return { cardBg: 'bg-quiz-friends-card', textColor: 'text-quiz-friends-text', stripBg: 'bg-quiz-friends-strip', stripText: 'text-white' };
      case 'self-reflection':
        return { cardBg: 'bg-quiz-self-reflection-card', textColor: 'text-quiz-self-reflection-text', stripBg: 'bg-quiz-self-reflection-strip', stripText: 'text-black' };
      case 'party':
        return { cardBg: 'bg-quiz-party-card', textColor: 'text-quiz-party-text', stripBg: 'bg-quiz-party-strip', stripText: 'text-black' };
      case 'family':
        return { cardBg: 'bg-quiz-family-card', textColor: 'text-quiz-family-text', stripBg: 'bg-quiz-family-strip', stripText: 'text-white' };
      case 'connection':
        return { cardBg: 'bg-quiz-connection-card', textColor: 'text-quiz-connection-text', stripBg: 'bg-quiz-connection-strip', stripText: 'text-white' };
      case 'identity':
        return { cardBg: 'bg-quiz-identity-card', textColor: 'text-quiz-identity-text', stripBg: 'bg-quiz-identity-strip', stripText: 'text-white' };
      case 'career':
        return { cardBg: 'bg-quiz-career-card', textColor: 'text-quiz-career-text', stripBg: 'bg-quiz-career-strip', stripText: 'text-white' };
      case 'travel':
        return { cardBg: 'bg-quiz-travel-card', textColor: 'text-quiz-travel-text', stripBg: 'bg-quiz-travel-strip', stripText: 'text-white' };
      case 'health':
        return { cardBg: 'bg-quiz-health-card', textColor: 'text-quiz-health-text', stripBg: 'bg-quiz-health-strip', stripText: 'text-black' };
      case 'money':
        return { cardBg: 'bg-quiz-money-card', textColor: 'text-quiz-money-text', stripBg: 'bg-quiz-money-strip', stripText: 'text-white' };
      case 'love':
        return { cardBg: 'bg-quiz-love-card', textColor: 'text-quiz-love-text', stripBg: 'bg-quiz-love-strip', stripText: 'text-black' };
      case 'hobby':
        return { cardBg: 'bg-quiz-hobby-card', textColor: 'text-quiz-hobby-text', stripBg: 'bg-quiz-hobby-strip', stripText: 'text-white' };
      case 'dreams':
        return { cardBg: 'bg-quiz-dreams-card', textColor: 'text-quiz-dreams-text', stripBg: 'bg-quiz-dreams-strip', stripText: 'text-white' };
      case 'fear':
        return { cardBg: 'bg-quiz-fear-card', textColor: 'text-quiz-fear-text', stripBg: 'bg-quiz-fear-strip', stripText: 'text-white' };
      case 'wisdom':
        return { cardBg: 'bg-quiz-wisdom-card', textColor: 'text-quiz-wisdom-text', stripBg: 'bg-quiz-wisdom-strip', stripText: 'text-black' };
      case 'future':
        return { cardBg: 'bg-quiz-future-card', textColor: 'text-quiz-future-text', stripBg: 'bg-quiz-future-strip', stripText: 'text-white' };
      case 'wer-aus-der-runde':
        return { cardBg: 'bg-quiz-wer-aus-der-runde-card', textColor: 'text-quiz-wer-aus-der-runde-text', stripBg: 'bg-quiz-wer-aus-der-runde-strip', stripText: 'text-black' };
      default:
        return { cardBg: 'bg-primary', textColor: 'text-primary-foreground', stripBg: 'bg-primary', stripText: 'text-white' };
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
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    if (Math.abs(dragOffset) > minSwipeDistance) {
      if (dragOffset < 0 && nextQuestion) {
        onSwipeLeft();
      } else if (dragOffset > 0 && prevQuestion) {
        onSwipeRight();
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
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
  const direction = dragOffset < 0 ? -1 : 1;

  // Current card: 100% -> 90% scale, 0deg -> 5deg rotation (away from direction)
  const currentScale = 1 - (progress * 0.1);
  const currentRotation = progress * 5 * direction;

  // Incoming card: 90% -> 100% scale, 5deg -> 0deg rotation (towards center)
  const incomingScale = 0.9 + (progress * 0.1);
  const incomingRotation = -5 * direction * (1 - progress);

  const renderCard = (question: Question, style: React.CSSProperties) => {
    const categoryColors = getCategoryColors(question.category);
    
    return (
      <div 
        className={`flex-shrink-0 w-full max-w-[500px] ${categoryColors.cardBg} rounded-2xl shadow-card overflow-hidden`}
        style={{
          ...style,
          height: 'calc(100svh - 64px - 20px - 16px - 32px)',
          maxHeight: '100%',
        }}
      >
        {/* Category Strip */}
        <div className={`absolute left-0 top-0 h-full w-8 ${categoryColors.stripBg} flex items-center justify-center overflow-hidden`}>
          <div className="transform -rotate-90 whitespace-nowrap">
            {Array(20).fill(question.category).map((cat, index) => (
              <span 
                key={`${cat}-${index}`} 
                className={`${categoryColors.stripText} font-bold text-sm tracking-wide uppercase`}
                style={{ 
                  marginRight: index < 19 ? '8px' : '0',
                  fontFamily: "'Factor A', sans-serif"
                }}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-8 lg:ml-10 h-full flex flex-col justify-center px-8 lg:pr-10">
          <div className="flex-1 flex items-start justify-start text-left w-full pt-8">
            <h1 className={`question-text text-4xl md:text-5xl lg:text-6xl font-bold ${categoryColors.textColor} w-full max-w-full`} style={{ lineHeight: '1.15' }}>
              {question.question}
            </h1>
          </div>
        </div>
      </div>
    );
  };

  const shouldShowPrev = prevQuestion !== null;
  const shouldShowNext = nextQuestion !== null;

  return (
    <div 
      ref={containerRef}
      className="relative h-full w-full overflow-hidden select-none"
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
      }}
    >
      <div 
        className="flex items-center h-full"
        style={{
          transform: `translateX(calc(-33.333% + ${dragOffset}px))`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
            transform: `scale(${dragOffset > 0 ? incomingScale : 0.9}) rotate(${dragOffset > 0 ? incomingRotation : 5}deg)`,
            transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: dragOffset > 0 ? progress : 0,
            position: 'relative',
          })}
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
            transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
          })}
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
            transform: `scale(${dragOffset < 0 ? incomingScale : 0.9}) rotate(${dragOffset < 0 ? incomingRotation : -5}deg)`,
            transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: dragOffset < 0 ? progress : 0,
            position: 'relative',
          })}
        </div>
      </div>
    </div>
  );
}
