import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

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

  // Update temp selection when selectedCategories prop changes
  useEffect(() => {
    setTempSelection(selectedCategories);
  }, [selectedCategories]);

  const getCategoryColors = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fuck':
        return 'hsl(300 100% 50%)'; // #FF00FF
      case 'connection':
        return 'hsl(0 100% 50%)'; // #FF0000
      case 'identity':
        return 'hsl(328 100% 56%)'; // #FF20A2
      case 'party':
        return 'hsl(15 100% 50%)'; // #FF4100
      case 'friends':
        return 'hsl(0 100% 50%)'; // #FF0000 (Wer aus der Runde)
      case 'self reflection':
        return 'hsl(290 100% 50%)'; // #D400FF
      case 'family':
        return 'hsl(328 100% 56%)'; // #FF20A2
      case 'career':
        return 'hsl(290 100% 50%)'; // #D400FF
      case 'travel':
        return 'hsl(15 100% 50%)'; // #FF4100
      case 'health':
        return 'hsl(300 100% 50%)'; // #FF00FF
      case 'money':
        return 'hsl(290 100% 50%)'; // #D400FF
      case 'love':
        return 'hsl(15 100% 50%)'; // #FF4100
      case 'hobby':
        return 'hsl(328 100% 56%)'; // #FF20A2
      case 'dreams':
        return 'hsl(300 100% 50%)'; // #FF00FF
      case 'fear':
        return 'hsl(0 100% 50%)'; // #FF0000
      case 'wisdom':
        return 'hsl(290 100% 50%)'; // #D400FF
      case 'future':
        return 'hsl(15 100% 50%)'; // #FF4100
      default:
        return 'hsl(290 100% 50%)'; // #D400FF
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
          Wählen Sie die Kategorien aus, die Sie sehen möchten
        </DialogDescription>
        <div className="flex flex-col h-full relative w-full">
          {/* Header with close button */}
          <div className="absolute left-0 right-4 z-10 flex items-center justify-between pl-4" style={{ top: '16px' }}>
            <h2 className="text-white text-xl font-normal">
              Kategorien wählen
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
                  className={`flex items-center justify-between pl-4 bg-[#161616] cursor-pointer relative overflow-visible transition-all ${isBouncing ? 'duration-100' : 'duration-100'}`}
                  style={{ 
                    borderRadius: '0 999px 999px 0', 
                    width: isBouncing ? '90.2vw' : isSelected ? '88vw' : 'calc(88vw - 52px)',
                    paddingTop: '8px',
                    paddingRight: '8px',
                    paddingBottom: '8px'
                  }}
                  onClick={() => handleCategoryToggle(category)}
                >
                  {/* Color strip - 8px when unselected, full width when selected */}
                  <div 
                    className={`absolute inset-y-0 left-0 transition-all duration-350 ease-out ${isSelected ? 'w-full' : 'w-2'}`}
                    style={{ 
                      backgroundColor: colorClasses,
                      opacity: 0.8,
                      borderRadius: '0 999px 999px 0'
                    }} 
                  />
                  
                  <span className="font-bold text-sm tracking-wide relative z-10 transition-colors duration-300 uppercase" 
                    style={{ 
                      color: isSelected ? textColor : 'white',
                      fontFamily: "'Factor A', sans-serif"
                    }}>
                    {category}
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
                      {/* Toggle switch */}
                      <div
                        className={`transition-all ease-out duration-75`}
                         style={{ 
                           width: '52px', 
                           height: '32px', 
                           borderRadius: '32px',
                           backgroundColor: isSelected ? 'white' : 'transparent',
                           outline: '1px solid white',
                           outlineOffset: '0px',
                           position: 'relative'
                         }}
                      >
                        {/* Toggle circle */}
                        <div
                          className="transition-all ease-out duration-75"
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: isSelected ? 'black' : 'white',
                            position: 'absolute',
                            top: '3px',
                            left: isSelected ? '24px' : '3px',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Link */}
          <div className="flex-shrink-0 h-20 flex items-center justify-center">
            <a 
              href="mailto:hello@relationshipbydesign.de?subject=Friends%20App%20Frage" 
              className="text-white font-normal text-xs"
              style={{fontSize: '14px', lineHeight: '20px'}}
            >
              Frage einreichen
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}