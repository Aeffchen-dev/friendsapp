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
        return 'hsl(327 100% 79%)'; // #FF92D3 - light pink
      case 'friends':
        return 'hsl(290 100% 72%)'; // #E772FF - light purple
      case 'family':
        return 'hsl(24 100% 50%)'; // #FF6600 - orange
      case 'self reflection':
        return 'hsl(315 100% 64%)'; // #FF47D1 - bright pink
      case 'party':
        return 'hsl(338 97% 61%)'; // #FC3D82 - hot pink
      case 'connection':
        return 'hsl(278 100% 57%)'; // #AF25FF - bright purple
      case 'identity':
        return 'hsl(327 100% 79%)'; // #FF92D3 - light pink
      case 'career':
        return 'hsl(10 100% 50%)'; // #FF2B00 - red-orange
      case 'travel':
        return 'hsl(290 100% 72%)'; // #E772FF - light purple
      case 'health':
        return 'hsl(315 100% 64%)'; // #FF47D1 - bright pink
      case 'money':
        return 'hsl(338 97% 61%)'; // #FC3D82 - hot pink
      case 'love':
        return 'hsl(327 100% 79%)'; // #FF92D3 - light pink
      case 'hobby':
        return 'hsl(24 100% 50%)'; // #FF6600 - orange
      case 'dreams':
        return 'hsl(290 100% 72%)'; // #E772FF - light purple
      case 'fear':
        return 'hsl(278 100% 57%)'; // #AF25FF - bright purple
      case 'wisdom':
        return 'hsl(10 100% 50%)'; // #FF2B00 - red-orange
      case 'future':
        return 'hsl(315 100% 64%)'; // #FF47D1 - bright pink
      default:
        return 'hsl(327 100% 79%)'; // Default light pink
    }
  };

  const getCategoryTextColors = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fuck':
        return 'hsl(0 0% 0%)'; // Black text on light pink
      case 'friends':
        return 'hsl(0 0% 0%)'; // Black text on light purple
      case 'family':
        return 'hsl(0 0% 0%)'; // Black text on orange
      case 'self reflection':
        return 'hsl(0 0% 0%)'; // Black text on bright pink
      case 'party':
        return 'hsl(0 0% 0%)'; // Black text on hot pink
      case 'connection':
        return 'hsl(0 0% 0%)'; // Black text on bright purple
      case 'identity':
        return 'hsl(0 0% 0%)'; // Black text on light pink
      case 'career':
        return 'hsl(0 0% 98%)'; // White text on red-orange
      case 'travel':
        return 'hsl(0 0% 0%)'; // Black text on light purple
      case 'health':
        return 'hsl(0 0% 0%)'; // Black text on bright pink
      case 'money':
        return 'hsl(0 0% 0%)'; // Black text on hot pink
      case 'love':
        return 'hsl(0 0% 0%)'; // Black text on light pink
      case 'hobby':
        return 'hsl(0 0% 0%)'; // Black text on orange
      case 'dreams':
        return 'hsl(0 0% 0%)'; // Black text on light purple
      case 'fear':
        return 'hsl(0 0% 0%)'; // Black text on bright purple
      case 'wisdom':
        return 'hsl(0 0% 98%)'; // White text on red-orange
      case 'future':
        return 'hsl(0 0% 0%)'; // Black text on bright pink
      default:
        return 'hsl(0 0% 0%)'; // Default black text
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
          {/* Header with close button */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-baseline justify-between">
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
          <div className="flex-1 p-4 pt-20 space-y-3 overflow-y-auto">
            {categories.map((category) => {
              const isSelected = tempSelection.includes(category);
              const colorClasses = getCategoryColors(category);
              const textColor = getCategoryTextColors(category);
              
              return (
                <div 
                  key={category}
                  className="flex items-center justify-between py-3 pr-3 pl-6 bg-[#161616] cursor-pointer relative overflow-hidden"
                  style={{ borderRadius: '4px 999px 999px 4px' }}
                  onClick={() => handleCategoryToggle(category)}
                >
                  {/* Color strip - 8px when unselected, full width when selected */}
                  <div 
                    className={`absolute inset-y-0 left-0 transition-all duration-500 ease-out ${isSelected ? 'w-full' : 'w-2'}`}
                    style={{ 
                      backgroundColor: colorClasses,
                      borderTopLeftRadius: isSelected ? '4px' : '4px',
                      borderBottomLeftRadius: isSelected ? '4px' : '4px',
                      borderTopRightRadius: isSelected ? '999px' : '4px',
                      borderBottomRightRadius: isSelected ? '999px' : '4px'
                    }} 
                  />
                  
                  <span className="font-bold text-sm uppercase tracking-wide relative z-10 transition-colors duration-300" 
                    style={{ color: isSelected ? textColor : 'white' }}>
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