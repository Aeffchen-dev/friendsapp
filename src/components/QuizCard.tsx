import { useState, useEffect, useRef } from 'react';

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

  // Get category-specific colors
  const getCategoryColors = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fuck':
        return { bg: 'bg-quiz-fuck-bg', text: 'text-quiz-fuck-text' };
      case 'friends':
        return { bg: 'bg-quiz-friends-bg', text: 'text-quiz-friends-text' };
      case 'self reflection':
        return { bg: 'bg-quiz-self-reflection-bg', text: 'text-quiz-self-reflection-text' };
      case 'party':
        return { bg: 'bg-quiz-party-bg', text: 'text-quiz-party-text' };
      case 'family':
        return { bg: 'bg-quiz-family-bg', text: 'text-quiz-family-text' };
      case 'connection':
        return { bg: 'bg-quiz-connection-bg', text: 'text-quiz-connection-text' };
      case 'identity':
        return { bg: 'bg-quiz-identity-bg', text: 'text-quiz-identity-text' };
      case 'career':
        return { bg: 'bg-quiz-career-bg', text: 'text-quiz-career-text' };
      case 'travel':
        return { bg: 'bg-quiz-travel-bg', text: 'text-quiz-travel-text' };
      case 'health':
        return { bg: 'bg-quiz-health-bg', text: 'text-quiz-health-text' };
      case 'money':
        return { bg: 'bg-quiz-money-bg', text: 'text-quiz-money-text' };
      case 'love':
        return { bg: 'bg-quiz-love-bg', text: 'text-quiz-love-text' };
      case 'hobby':
        return { bg: 'bg-quiz-hobby-bg', text: 'text-quiz-hobby-text' };
      case 'dreams':
        return { bg: 'bg-quiz-dreams-bg', text: 'text-quiz-dreams-text' };
      case 'fear':
        return { bg: 'bg-quiz-fear-bg', text: 'text-quiz-fear-text' };
      case 'wisdom':
        return { bg: 'bg-quiz-wisdom-bg', text: 'text-quiz-wisdom-text' };
      case 'future':
        return { bg: 'bg-quiz-future-bg', text: 'text-quiz-future-text' };
      default:
        return { bg: 'bg-quiz-category-bg', text: 'text-quiz-category-text' };
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

  // Current card: 100% -> 90% scale, 0deg -> 5deg rotation
  const currentScale = 1 - (progress * 0.1);
  const currentRotation = progress * 5 * direction;

  // Incoming card: 90% -> 100% scale, 5deg -> 0deg rotation
  const incomingScale = 0.9 + (progress * 0.1);
  const incomingRotation = 5 * -direction * (1 - progress);

  const renderCard = (question: Question, style: React.CSSProperties, isMain: boolean = false) => {
    const categoryColors = getCategoryColors(question.category);
    
    return (
      <div 
        className={`absolute inset-0 max-w-[500px] mx-auto ${categoryColors.bg} rounded-2xl shadow-card overflow-hidden`}
        style={{
          ...style,
          height: 'calc(100svh - 64px - 20px - 16px - 32px)',
          maxHeight: '100%',
          transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Category Strip */}
        <div className={`absolute left-0 top-0 h-full w-8 ${categoryColors.bg} flex items-center justify-center`}>
          <div className="transform -rotate-90 whitespace-nowrap">
            {Array(20).fill(question.category).map((cat, index) => (
              <span 
                key={`${cat}-${index}`} 
                className={`${categoryColors.text} font-bold text-sm tracking-wide uppercase`} 
                style={{ marginRight: index < 19 ? '8px' : '0' }}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-8 lg:ml-10 h-full flex flex-col justify-center px-8 lg:pr-10">
          <div className="flex-1 flex items-start justify-start text-left w-full pt-16">
            <h1 className={`question-text text-3xl md:text-4xl lg:text-4xl font-bold ${categoryColors.text} leading-tight w-full max-w-full`}>
              {question.question}
            </h1>
          </div>
        </div>
      </div>
    );
  };

  const shouldShowPrev = dragOffset > 0 && prevQuestion;
  const shouldShowNext = dragOffset < 0 && nextQuestion;

  return (
    <div 
      ref={containerRef}
      className="relative h-full w-full max-w-[500px] mx-auto select-none"
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
      {/* Incoming card (behind) */}
      {shouldShowNext && nextQuestion && renderCard(nextQuestion, {
        transform: `scale(${incomingScale}) rotate(${incomingRotation}deg)`,
        zIndex: 1,
        opacity: progress,
      })}
      
      {shouldShowPrev && prevQuestion && renderCard(prevQuestion, {
        transform: `scale(${incomingScale}) rotate(${incomingRotation}deg)`,
        zIndex: 1,
        opacity: progress,
      })}

      {/* Current card (on top) */}
      {renderCard(currentQuestion, {
        transform: `scale(${currentScale}) rotate(${currentRotation}deg) translateX(${dragOffset}px)`,
        zIndex: 2,
      }, true)}
    </div>
  );
}
