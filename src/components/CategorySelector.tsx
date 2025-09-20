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

  // Update temp selection when selectedCategories prop changes
  useEffect(() => {
    setTempSelection(selectedCategories);
  }, [selectedCategories]);

  const getCategoryColors = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fuck':
        return 'hsl(0 100% 50%)';
      case 'friends':
        return 'hsl(120 100% 50%)';
      case 'family':
        return 'hsl(30 100% 70%)';
      case 'self reflection':
        return 'hsl(195 100% 50%)';
      case 'party':
        return 'hsl(60 100% 71%)';
      case 'connection':
        return 'hsl(240 100% 50%)';
      case 'identity':
        return 'hsl(266 100% 51%)';
      case 'career':
        return 'hsl(35 100% 62%)';
      case 'travel':
        return 'hsl(92 100% 83%)';
      case 'health':
        return 'hsl(330 84% 67%)';
      case 'money':
        return 'hsl(45 95% 55%)';
      case 'love':
        return 'hsl(350 85% 60%)';
      case 'hobby':
        return 'hsl(25 60% 45%)';
      case 'dreams':
        return 'hsl(270 75% 65%)';
      case 'fear':
        return 'hsl(210 10% 40%)';
      case 'wisdom':
        return 'hsl(239 84% 67%)';
      case 'future':
        return 'hsl(199 89% 48%)';
      default:
        return 'hsl(290 100% 85%)';
    }
  };

  const getCategoryTextColors = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fuck':
        return 'hsl(0 0% 98%)'; // White text on red
      case 'friends':
        return 'hsl(0 0% 0%)'; // Black text on green
      case 'family':
        return 'hsl(0 0% 0%)'; // Black text on orange
      case 'self reflection':
        return 'hsl(0 0% 0%)'; // Black text on light blue
      case 'party':
        return 'hsl(0 0% 0%)'; // Black text on yellow
      case 'connection':
        return 'hsl(0 0% 100%)'; // White text on blue
      case 'identity':
        return 'hsl(0 0% 98%)'; // White text on purple
      case 'career':
        return 'hsl(0 0% 0%)'; // Black text on orange
      case 'travel':
        return 'hsl(0 0% 0%)'; // Black text on light green
      case 'health':
        return 'hsl(0 0% 98%)'; // White text on pink
      case 'money':
        return 'hsl(0 0% 0%)'; // Black text on gold
      case 'love':
        return 'hsl(0 0% 98%)'; // White text on red
      case 'hobby':
        return 'hsl(0 0% 98%)'; // White text on brown
      case 'dreams':
        return 'hsl(0 0% 98%)'; // White text on purple
      case 'fear':
        return 'hsl(0 0% 98%)'; // White text on gray
      case 'wisdom':
        return 'hsl(0 0% 98%)'; // White text on indigo
      case 'future':
        return 'hsl(0 0% 98%)'; // White text on sky blue
      default:
        return 'hsl(0 0% 15%)'; // Default dark text
    }
  };

  const handleCategoryToggle = (category: string) => {
    setTempSelection(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
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
      <DialogContent className="w-full max-w-[500px] mx-auto bg-background border-0 rounded-2xl p-0 overflow-hidden [&>button]:hidden h-[100svh] md:h-[90vh] data-[state=closed]:animate-none data-[state=closed]:duration-0">
        <DialogDescription className="sr-only">
          Wählen Sie die Kategorien aus, die Sie sehen möchten
        </DialogDescription>
        <div className="flex flex-col h-full relative w-full">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute right-6 top-6 z-10 text-white hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Header */}
          <DialogHeader className="absolute top-6 left-6 z-10">
            <DialogTitle className="text-white text-xl font-normal">
              Kategorien wählen
            </DialogTitle>
          </DialogHeader>

          {/* Categories List */}
          <div className="flex-1 px-6 pt-20 space-y-3 overflow-y-auto">
            {categories.map((category) => {
              const isSelected = tempSelection.includes(category);
              const colorClasses = getCategoryColors(category);
              const textColor = getCategoryTextColors(category);
              
              return (
                <div 
                  key={category}
                  className="flex items-center justify-between py-3 pr-3 pl-6 bg-[#161616] cursor-pointer relative overflow-hidden"
                  onClick={() => handleCategoryToggle(category)}
                  style={{ 
                    borderTopLeftRadius: '4px',
                    borderBottomLeftRadius: '4px',
                    borderTopRightRadius: '9999px',
                    borderBottomRightRadius: '9999px',
                    clipPath: 'inset(0 round 4px 9999px 9999px 4px)'
                  }}
                >
                  <div 
                    className="absolute inset-0 z-0"
                    style={{ 
                      backgroundColor: colorClasses,
                      borderRadius: 'inherit',
                      transformOrigin: 'left',
                      transform: isSelected ? 'scaleX(1)' : 'scaleX(0.03)',
                      transition: 'transform 500ms cubic-bezier(0.23, 1, 0.32, 1)',
                      pointerEvents: 'none'
                    }} 
                  />
                  <span className="font-bold text-sm uppercase tracking-wide relative z-10 transition-colors duration-300" 
                    style={{ color: isSelected ? textColor : 'white', borderTopLeftRadius: '4px', borderBottomLeftRadius: '4px' }}>
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
                      <div
                        className={`w-8 h-8 border border-white flex items-center justify-center transition-all ease-out ${isSelected ? 'bg-white duration-300 delay-200' : 'bg-transparent duration-100 hover:bg-white/10'}`}
                         style={{ 
                           width: '32px', 
                           height: '32px', 
                           borderRadius: '32px',
                           outline: '1px solid white',
                           outlineOffset: '0px'
                         }}
                      >
                         {isSelected && (
                           <svg 
                             width="20" 
                             height="20" 
                             viewBox="0 0 16 16" 
                             fill="none"
                             className="checkmark-animate"
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
                         )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}