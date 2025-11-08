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
        return { stripBg: 'hsl(300, 100%, 50%)', bodyBg: 'hsl(300, 100%, 50%)' };
      case 'friends':
        return { stripBg: 'hsl(0, 100%, 65%)', bodyBg: 'hsl(0, 100%, 65%)' }; // 200% more vibrant
      case 'self reflection':
        return { stripBg: 'hsl(300, 100%, 50%)', bodyBg: 'hsl(300, 100%, 50%)' };
      case 'party':
        return { stripBg: 'hsl(25, 100%, 50%)', bodyBg: 'hsl(25, 100%, 50%)' };
      case 'family':
        return { stripBg: 'hsl(0, 100%, 50%)', bodyBg: 'hsl(0, 100%, 50%)' };
      case 'connection':
        return { stripBg: 'hsl(0, 100%, 50%)', bodyBg: 'hsl(0, 100%, 50%)' };
      case 'identity':
        return { stripBg: 'hsl(328, 100%, 55%)', bodyBg: 'hsl(328, 100%, 55%)' }; // More vibrant
      case 'career':
        return { stripBg: 'hsl(328, 100%, 70%)', bodyBg: 'hsl(328, 100%, 70%)' };
      case 'travel':
        return { stripBg: 'hsl(25, 100%, 50%)', bodyBg: 'hsl(25, 100%, 50%)' };
      case 'health':
        return { stripBg: 'hsl(0, 100%, 65%)', bodyBg: 'hsl(0, 100%, 65%)' };
      case 'money':
        return { stripBg: 'hsl(300, 100%, 50%)', bodyBg: 'hsl(300, 100%, 50%)' };
      case 'love':
        return { stripBg: 'hsl(0, 100%, 50%)', bodyBg: 'hsl(0, 100%, 50%)' };
      case 'hobby':
        return { stripBg: 'hsl(328, 100%, 70%)', bodyBg: 'hsl(328, 100%, 70%)' };
      case 'dreams':
        return { stripBg: 'hsl(25, 100%, 50%)', bodyBg: 'hsl(25, 100%, 50%)' };
      case 'fear':
        return { stripBg: 'hsl(0, 100%, 65%)', bodyBg: 'hsl(0, 100%, 65%)' };
      case 'wisdom':
        return { stripBg: 'hsl(300, 100%, 50%)', bodyBg: 'hsl(300, 100%, 50%)' };
      case 'future':
        return { stripBg: 'hsl(0, 100%, 50%)', bodyBg: 'hsl(0, 100%, 50%)' };
      default:
        return { stripBg: 'hsl(290, 100%, 85%)', bodyBg: 'hsl(290, 100%, 85%)' };
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
        className="flex-shrink-0 w-full max-w-[500px] rounded-2xl overflow-hidden mx-4 md:mx-0"
        style={{
          ...style,
          height: '80vh',
          maxHeight: '80vh',
          backgroundColor: 'rgba(0, 0, 0, 0.30)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          boxShadow: '0 0 24px 4px rgba(0, 0, 0, 0.32)',
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
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-8 lg:ml-10 h-full flex flex-col justify-center px-8 lg:pr-10">
          <div className="flex-1 flex items-start justify-start text-left w-full pt-8">
            <h1 className="question-text text-3xl md:text-4xl lg:text-4xl font-bold text-white w-full max-w-full" style={{ lineHeight: '1.15' }}>
              {question.question}
            </h1>
          </div>
        </div>
      </div>
    );
  };

  const shouldShowPrev = prevQuestion !== null;
  const shouldShowNext = nextQuestion !== null;

  // Get body background color for current card
  const currentCategoryColors = getCategoryColors(currentQuestion.category);

  return (
    <>
      {/* Large background category text */}
      <div 
        className="fixed left-0 right-0 pointer-events-none z-0 overflow-hidden"
        style={{
          bottom: '20px',
          height: '100vw',
        }}
      >
        <div 
          className="font-bold uppercase whitespace-nowrap transition-opacity duration-500"
          style={{
            fontSize: '100vw',
            lineHeight: '1',
            fontFamily: "'Factor A', sans-serif",
            color: currentCategoryColors.stripBg,
            opacity: 0.15,
          }}
        >
          {currentQuestion.category}
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative h-full w-full overflow-hidden select-none z-10 pt-8 md:pt-0"
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
    </>
  );
}
