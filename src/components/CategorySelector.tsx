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
  showGroupQuestions: boolean;
  onShowGroupQuestionsChange: (show: boolean) => void;
}

export function CategorySelector({ 
  open, 
  onOpenChange, 
  categories, 
  selectedCategories, 
  onCategoriesChange,
  showGroupQuestions,
  onShowGroupQuestionsChange
}: CategorySelectorProps) {
  const [tempSelection, setTempSelection] = useState<string[]>(selectedCategories);

  // Update temp selection when selectedCategories prop changes
  useEffect(() => {
    setTempSelection(selectedCategories);
  }, [selectedCategories]);

  const getCategoryColors = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fuck':
        return 'border-l-quiz-fuck-bg';
      case 'friends':
        return 'border-l-quiz-friends-bg';
      case 'family':
        return 'border-l-quiz-family-bg';
      case 'self reflection':
        return 'border-l-quiz-self-reflection-bg';
      case 'party':
        return 'border-l-quiz-party-bg';
      case 'connection':
        return 'border-l-quiz-connection-bg';
      case 'identity':
        return 'border-l-quiz-identity-bg';
      case 'career':
        return 'border-l-quiz-career-bg';
      case 'travel':
        return 'border-l-quiz-travel-bg';
      case 'health':
        return 'border-l-quiz-health-bg';
      case 'money':
        return 'border-l-quiz-money-bg';
      case 'relationship':
        return 'border-l-quiz-relationship-bg';
      case 'spirituality':
        return 'border-l-quiz-spirituality-bg';
      case 'ambition':
        return 'border-l-quiz-ambition-bg';
      case 'pleasure':
        return 'border-l-quiz-pleasure-bg';
      case 'personal growth':
        return 'border-l-quiz-personal-growth-bg';
      case 'intimacy':
        return 'border-l-quiz-intimacy-bg';
      case 'love':
        return 'border-l-quiz-love-bg';
      case 'childhood':
        return 'border-l-quiz-childhood-bg';
      case 'gratitude':
        return 'border-l-quiz-gratitude-bg';
      case 'secrets':
        return 'border-l-quiz-secrets-bg';
      case 'life advice':
        return 'border-l-quiz-life-advice-bg';
      case 'wild':
        return 'border-l-quiz-wild-bg';
      case 'fail':
        return 'border-l-quiz-fail-bg';
      case 'dirty':
        return 'border-l-quiz-dirty-bg';
      case 'crazy':
        return 'border-l-quiz-crazy-bg';
      case 'toys':
        return 'border-l-quiz-toys-bg';
      default:
        return 'border-l-quiz-default-bg';
    }
  };

  const handleCategoryToggle = (category: string) => {
    const isSelected = tempSelection.includes(category);
    const newCategories = isSelected 
      ? tempSelection.filter(c => c !== category)
      : [...tempSelection, category];
    setTempSelection(newCategories);
  };

  const handleApply = () => {
    onCategoriesChange(tempSelection);
    onOpenChange(false);
  };

  const handleClose = () => {
    onCategoriesChange(tempSelection);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="bg-black border-none max-w-sm mx-auto h-screen max-h-screen flex flex-col"
      >
        <div className="flex flex-col h-full relative">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>

          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="text-white text-left text-lg font-semibold">
              Filter
            </DialogTitle>
          </DialogHeader>

          {/* Categories List */}
          <div className="flex-1 px-6 pt-20 space-y-3 overflow-y-auto">
            {categories.map((category) => {
              const isSelected = tempSelection.includes(category);
              const colorClass = getCategoryColors(category);
              
              return (
                <div 
                  key={category}
                  className={`flex items-center justify-between p-4 border-l-8 ${colorClass} bg-[#161616] cursor-pointer`}
                  style={{ borderRadius: '4px' }}
                  onClick={() => handleCategoryToggle(category)}
                >
                  <span className="text-white font-bold text-sm uppercase tracking-wide">
                    {category}
                  </span>
                  <div onClick={(e) => e.stopPropagation()}>
                    <div
                      className="relative cursor-pointer"
                      onClick={() => handleCategoryToggle(category)}
                    >
                      <div
                        className={`w-5 h-5 border border-white flex items-center justify-center ${isSelected ? 'bg-white' : 'bg-transparent'}`}
                        style={{ 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '24px',
                          outline: '1px solid white',
                          outlineOffset: '0px'
                        }}
                      >
                        {isSelected && (
                          <Check 
                            className="text-black" 
                            style={{ width: '14px', height: '14px' }}
                            strokeWidth={2}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Group Questions Filter - Last element */}
            <div className="pt-3">
              <div 
                className="flex items-center justify-between p-4 border-l-8 border-l-quiz-connection-bg bg-[#161616] cursor-pointer"
                style={{ borderRadius: '4px' }}
                onClick={() => onShowGroupQuestionsChange(!showGroupQuestions)}
              >
                <span className="text-white font-bold text-sm uppercase tracking-wide">
                  Wer aus der Runde
                </span>
                <div onClick={(e) => e.stopPropagation()}>
                  <div
                    className="relative cursor-pointer"
                    onClick={() => onShowGroupQuestionsChange(!showGroupQuestions)}
                  >
                    <div
                      className={`w-5 h-5 border border-white flex items-center justify-center ${showGroupQuestions ? 'bg-white' : 'bg-transparent'}`}
                      style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '24px',
                        outline: '1px solid white',
                        outlineOffset: '0px'
                      }}
                    >
                      {showGroupQuestions && (
                        <Check 
                          className="text-black" 
                          style={{ width: '14px', height: '14px' }}
                          strokeWidth={2}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}