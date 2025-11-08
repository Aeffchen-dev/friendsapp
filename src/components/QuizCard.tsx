import { useState, useRef, useEffect } from 'react';

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
  onDragStateChange?: (isDragging: boolean, progress: number, targetCategory: string, direction: number) => void;
}

export function QuizCard({ currentQuestion, nextQuestion, prevQuestion, onSwipeLeft, onSwipeRight, onDragStateChange }: QuizCardProps) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationOffset, setAnimationOffset] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const minSwipeDistance = 50;

  // After parent index changes (currentQuestion updates), reset track instantly without anim
  useEffect(() => {
    setIsAnimating(false);
    setDragOffset(0);
    setAnimationOffset(0);
  }, [currentQuestion]);

  // Get category-specific neon color - using the 5 color palette
  const getCategoryColors = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fuck':
        return { stripBg: 'hsl(300, 100%, 50%)', bodyBg: 'hsl(300, 100%, 50%)' }; // #FF00FF
      case 'friends':
        return { stripBg: 'hsl(0, 100%, 50%)', bodyBg: 'hsl(0, 100%, 50%)' }; // #FF0000
      case 'self reflection':
        return { stripBg: 'hsl(290, 100%, 50%)', bodyBg: 'hsl(290, 100%, 50%)' }; // #D400FF
      case 'party':
        return { stripBg: 'hsl(15, 100%, 50%)', bodyBg: 'hsl(15, 100%, 50%)' }; // #FF4100
      case 'family':
        return { stripBg: 'hsl(328, 100%, 56%)', bodyBg: 'hsl(328, 100%, 56%)' }; // #FF20A2
      case 'connection':
        return { stripBg: 'hsl(0, 100%, 50%)', bodyBg: 'hsl(0, 100%, 50%)' }; // #FF0000
      case 'identity':
        return { stripBg: 'hsl(328, 100%, 56%)', bodyBg: 'hsl(328, 100%, 56%)' }; // #FF20A2
      case 'career':
        return { stripBg: 'hsl(290, 100%, 50%)', bodyBg: 'hsl(290, 100%, 50%)' }; // #D400FF
      case 'travel':
        return { stripBg: 'hsl(15, 100%, 50%)', bodyBg: 'hsl(15, 100%, 50%)' }; // #FF4100
      case 'health':
        return { stripBg: 'hsl(300, 100%, 50%)', bodyBg: 'hsl(300, 100%, 50%)' }; // #FF00FF
      case 'money':
        return { stripBg: 'hsl(290, 100%, 50%)', bodyBg: 'hsl(290, 100%, 50%)' }; // #D400FF
      case 'love':
        return { stripBg: 'hsl(15, 100%, 50%)', bodyBg: 'hsl(15, 100%, 50%)' }; // #FF4100
      case 'hobby':
        return { stripBg: 'hsl(328, 100%, 56%)', bodyBg: 'hsl(328, 100%, 56%)' }; // #FF20A2
      case 'dreams':
        return { stripBg: 'hsl(300, 100%, 50%)', bodyBg: 'hsl(300, 100%, 50%)' }; // #FF00FF
      case 'fear':
        return { stripBg: 'hsl(0, 100%, 50%)', bodyBg: 'hsl(0, 100%, 50%)' }; // #FF0000
      case 'wisdom':
        return { stripBg: 'hsl(290, 100%, 50%)', bodyBg: 'hsl(290, 100%, 50%)' }; // #D400FF
      case 'future':
        return { stripBg: 'hsl(15, 100%, 50%)', bodyBg: 'hsl(15, 100%, 50%)' }; // #FF4100
      default:
        return { stripBg: 'hsl(290, 100%, 50%)', bodyBg: 'hsl(290, 100%, 50%)' }; // #D400FF
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
      setIsAnimating(true);
      
      if (dragOffset < 0 && nextQuestion) {
        // Swipe left - animate to full left
        setAnimationOffset(-containerWidth);
        setDragOffset(0);
        setIsDragging(false);
        
        // Continue color transition and logo squeeze during animation
        if (onDragStateChange) {
          onDragStateChange(false, 1, nextQuestion.category, -1);
        }
        
        setTimeout(() => {
          onSwipeLeft();
          // Do not reset here; wait for parent to update currentQuestion
        }, 300);
        return;
      } else if (dragOffset > 0 && prevQuestion) {
        // Swipe right - animate to full right
        setAnimationOffset(containerWidth);
        setDragOffset(0);
        setIsDragging(false);
        
        // Continue color transition and logo squeeze during animation
        if (onDragStateChange) {
          onDragStateChange(false, 1, prevQuestion.category, 1);
        }
        
        setTimeout(() => {
          onSwipeRight();
          // Do not reset here; wait for parent to update currentQuestion
        }, 300);
        return;
      }
    }
    
    // Reset color and logo if drag cancelled
    if (onDragStateChange) {
      onDragStateChange(false, 0, currentQuestion.category, 0);
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
    const totalOffset = dragOffset + animationOffset;
    return Math.min(Math.abs(totalOffset) / containerWidth, 1);
  };

  const progress = getDragProgress();
  const totalOffset = dragOffset + animationOffset;
  const direction = totalOffset < 0 ? -1 : 1;
  const containerWidthPx = containerRef.current?.offsetWidth || 1;
  const normalizedOffset = totalOffset / containerWidthPx; // -1 .. 1

  // Current card: 100% -> 80% scale, 0deg -> 5deg rotation (away from direction)
  const currentScale = 1 - (progress * 0.2);
  const currentRotation = progress * 5 * direction;

  // Incoming card: 80% -> 100% scale, 5deg -> 0deg rotation (towards center)
  const incomingScale = 0.8 + (progress * 0.2);
  const incomingRotation = -5 * direction * (1 - progress);

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

  return (
    <>
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
          transform: `translateX(${(-33.333 + normalizedOffset * 33.333).toFixed(3)}%)`,
          transition: (isDragging || !isAnimating) ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
            transform: `scale(${totalOffset > 0 ? incomingScale : 0.8}) rotate(${totalOffset > 0 ? incomingRotation : 5}deg)`,
            transition: (isDragging || !isAnimating) ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: 1,
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
            transform: `scale(${totalOffset < 0 ? incomingScale : 0.8}) rotate(${totalOffset < 0 ? incomingRotation : -5}deg)`,
            transition: (isDragging || !isAnimating) ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: 1,
            position: 'relative',
          })}
        </div>
      </div>
      </div>
    </>
  );
}
