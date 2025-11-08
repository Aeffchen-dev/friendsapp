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

  // Get category-specific neon color
  const getCategoryColors = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fuck':
        return { stripBg: 'bg-quiz-fuck-strip', cardBg: 'hsl(300, 100%, 8%)' };
      case 'friends':
        return { stripBg: 'bg-quiz-friends-strip', cardBg: 'hsl(180, 100%, 8%)' };
      case 'self reflection':
        return { stripBg: 'bg-quiz-self-reflection-strip', cardBg: 'hsl(270, 100%, 8%)' };
      case 'party':
        return { stripBg: 'bg-quiz-party-strip', cardBg: 'hsl(50, 100%, 8%)' };
      case 'family':
        return { stripBg: 'bg-quiz-family-strip', cardBg: 'hsl(30, 100%, 8%)' };
      case 'connection':
        return { stripBg: 'bg-quiz-connection-strip', cardBg: 'hsl(330, 100%, 8%)' };
      case 'identity':
        return { stripBg: 'bg-quiz-identity-strip', cardBg: 'hsl(210, 100%, 8%)' };
      case 'career':
        return { stripBg: 'bg-quiz-career-strip', cardBg: 'hsl(120, 100%, 8%)' };
      case 'travel':
        return { stripBg: 'bg-quiz-travel-strip', cardBg: 'hsl(200, 100%, 8%)' };
      case 'health':
        return { stripBg: 'bg-quiz-health-strip', cardBg: 'hsl(140, 100%, 8%)' };
      case 'money':
        return { stripBg: 'bg-quiz-money-strip', cardBg: 'hsl(160, 100%, 8%)' };
      case 'love':
        return { stripBg: 'bg-quiz-love-strip', cardBg: 'hsl(350, 100%, 8%)' };
      case 'hobby':
        return { stripBg: 'bg-quiz-hobby-strip', cardBg: 'hsl(280, 100%, 8%)' };
      case 'dreams':
        return { stripBg: 'bg-quiz-dreams-strip', cardBg: 'hsl(260, 100%, 8%)' };
      case 'fear':
        return { stripBg: 'bg-quiz-fear-strip', cardBg: 'hsl(0, 100%, 8%)' };
      case 'wisdom':
        return { stripBg: 'bg-quiz-wisdom-strip', cardBg: 'hsl(240, 100%, 8%)' };
      case 'future':
        return { stripBg: 'bg-quiz-future-strip', cardBg: 'hsl(190, 100%, 8%)' };
      default:
        return { stripBg: 'bg-primary', cardBg: 'hsl(0, 0%, 8%)' };
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
        className={`flex-shrink-0 w-full max-w-[500px] rounded-2xl shadow-card overflow-hidden`}
        style={{
          backgroundColor: categoryColors.cardBg,
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
                className="text-white font-bold text-sm tracking-wide uppercase" 
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
            <h1 className="question-text text-4xl md:text-5xl lg:text-6xl font-bold text-white w-full max-w-full" style={{ lineHeight: '1.15' }}>
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
