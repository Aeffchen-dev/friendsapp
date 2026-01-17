import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateCategory } from '@/lib/questionTranslations';
interface CategorySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

export function CategorySelector({ 
  open, 
  onOpenChange, 
  categories, 
  selectedCategories, 
  onCategoriesChange 
}: CategorySelectorProps) {
  const [tempSelection, setTempSelection] = useState<string[]>(selectedCategories);
  const [strokeAnimations, setStrokeAnimations] = useState<{[key: string]: boolean}>({});
  const [bounceAnimations, setBounceAnimations] = useState<{[key: string]: boolean}>({});
  const { language, toggleLanguage, t } = useLanguage();

  // Update temp selection when selectedCategories prop changes
  useEffect(() => {
    setTempSelection(selectedCategories);
  }, [selectedCategories]);

  const getCategoryColors = (category: string) => {
    switch (category.toLowerCase()) {
      case 'drink':
        return 'hsl(141 99% 59%)'; // Green #31FE6A
      case 'talk':
        return 'hsl(268 100% 79%)'; // Purple #C294FF
      case 'fuck':
        return 'hsl(22 100% 50%)'; // Orange #FF5D01
      case 'party':
        return 'hsl(300 100% 73%)'; // Pink #FF6FFF
      case 'friends':
      case 'wer aus der runde':
        return 'hsl(141 99% 59%)'; // Green
      case 'self reflection':
        return 'hsl(268 100% 79%)'; // Purple
      case 'family':
        return 'hsl(300 100% 73%)'; // Pink
      case 'connection':
        return 'hsl(22 100% 50%)'; // Orange
      case 'identity':
        return 'hsl(268 100% 79%)'; // Purple
      case 'career':
        return 'hsl(141 99% 59%)'; // Green
      case 'travel':
        return 'hsl(22 100% 50%)'; // Orange
      case 'health':
        return 'hsl(300 100% 73%)'; // Pink
      case 'money':
        return 'hsl(141 99% 59%)'; // Green
      case 'love':
        return 'hsl(300 100% 73%)'; // Pink
      case 'hobby':
        return 'hsl(268 100% 79%)'; // Purple
      case 'dreams':
        return 'hsl(141 99% 59%)'; // Green
      case 'fear':
        return 'hsl(22 100% 50%)'; // Orange
      case 'wisdom':
        return 'hsl(268 100% 79%)'; // Purple
      case 'future':
        return 'hsl(300 100% 73%)'; // Pink
      default:
        return 'hsl(268 100% 79%)'; // Purple default
    }
  };

  const getCategoryTextColors = (category: string) => {
    // All vibrant colors work with white text for better contrast
    return 'hsl(0 0% 100%)';
  };

  const handleCategoryToggle = (category: string) => {
    const isCurrentlySelected = tempSelection.includes(category);
    
    setTempSelection(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    
    // Trigger bounce animation quickly
    if (!isCurrentlySelected) {
      setTimeout(() => {
        setBounceAnimations(prev => ({ ...prev, [category]: true }));
        setTimeout(() => {
          setBounceAnimations(prev => ({ ...prev, [category]: false }));
        }, 150);
      }, 100);
    }
  };

  const handleApply = () => {
    onCategoriesChange(tempSelection);
    onOpenChange(false);
  };

  const handleClose = () => {
    onCategoriesChange(tempSelection); // Apply changes when closing
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen h-screen max-w-none bg-background border-0 rounded-none p-0 overflow-hidden [&>button]:hidden data-[state=closed]:animate-none data-[state=closed]:duration-0 [&]:rounded-none" style={{ width: '100vw', height: '100vh', borderRadius: '0' }}>
        <DialogDescription className="sr-only">
          {t.selectCategoriesDescription}
        </DialogDescription>
        <div className="flex flex-col h-full relative w-full">
          {/* Header with close button */}
          <div className="absolute left-0 right-4 z-10 flex items-center justify-between pl-4" style={{ top: '16px' }}>
            <h2 className="text-white text-xl font-normal">
              {t.chooseCategories}
            </h2>
            
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Categories List */}
          <div className="flex-1 pt-20 pb-20 space-y-3 overflow-y-auto">
            {categories.map((category) => {
              const isSelected = tempSelection.includes(category);
              const colorClasses = getCategoryColors(category);
              const textColor = getCategoryTextColors(category);
              
              const isBouncing = bounceAnimations[category];
              
              return (
                <div 
                  key={category}
                  className="flex items-center justify-between pl-4 bg-[#161616] cursor-pointer relative overflow-visible"
                  style={{ 
                    borderRadius: '0 999px 999px 0', 
                    width: isSelected 
                      ? (isBouncing ? '90.2vw' : '88vw')
                      : (isBouncing ? 'calc(90.2vw - 32px)' : 'calc(88vw - 32px)'),
                    paddingTop: '8px',
                    paddingRight: '8px',
                    paddingBottom: '8px',
                    transition: 'width 170ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                  onClick={() => handleCategoryToggle(category)}
                >
                  {/* Color strip - 8px when unselected, full width when selected */}
                  <div 
                    className="absolute inset-y-0 left-0"
                    style={{ 
                      backgroundColor: colorClasses,
                      opacity: 0.8,
                      borderRadius: '0 999px 999px 0',
                      width: isSelected ? '100%' : '8px',
                      transition: 'width 220ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }} 
                  />
                  
                  <span className="font-bold text-sm tracking-wide relative z-10 uppercase" 
                    style={{ 
                      color: isSelected ? textColor : 'white',
                      fontFamily: "'Factor A', sans-serif",
                      transition: 'color 120ms ease-out',
                    }}>
                    {translateCategory(category, language)}
                  </span>
                  <div onClick={(e) => e.stopPropagation()}>
                    <div
                      className="relative cursor-pointer"
                      onClick={() => {
                         const newCategories = isSelected 
                           ? tempSelection.filter(c => c !== category)
                           : [...tempSelection, category];
                         setTempSelection(newCategories);
                       }}
                    >
                      <div
                        className="flex items-center justify-center"
                         style={{ 
                           width: '32px', 
                           height: '32px', 
                           borderRadius: '32px',
                           outline: '1px solid white',
                           outlineOffset: '0px',
                           backgroundColor: isSelected ? 'white' : 'transparent',
                           transition: 'background-color 120ms ease-out',
                         }}
                      >
                         <svg 
                           width="20" 
                           height="20" 
                           viewBox="0 0 16 16" 
                           fill="none"
                           style={{
                             opacity: isSelected ? 1 : 0,
                             transform: isSelected ? 'scale(1.1)' : 'scale(0.3)',
                             transition: 'opacity 120ms ease-out, transform 120ms cubic-bezier(0.34, 1.8, 0.64, 1)',
                           }}
                         >
                           <path 
                             d="M3 8l3 3 7-7" 
                             stroke="black" 
                             strokeWidth="2" 
                             strokeLinecap="round" 
                             strokeLinejoin="round"
                             fill="none"
                           />
                         </svg>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Links */}
          <div className="flex-shrink-0 h-20 flex items-center justify-between px-4">
            <a 
              href="mailto:hello@relationshipbydesign.de?subject=Friends%20App%20Frage" 
              className="text-white font-normal"
              style={{fontSize: '14px', lineHeight: '20px'}}
            >
              {t.submitQuestion}
            </a>
            <button
              onClick={toggleLanguage}
              className="text-white font-normal hover:opacity-70 transition-opacity"
              style={{fontSize: '14px', lineHeight: '20px'}}
            >
              {language === 'de' ? 'English' : 'Deutsch'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}