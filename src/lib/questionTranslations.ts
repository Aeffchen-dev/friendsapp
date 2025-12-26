// Frontend translation map for German to English questions
// This allows translation without requiring changes to the data source

const translationMap: Record<string, string> = {
  // FUCK category
  "Was ist deine Lieblings-Porno-Kategorie?": "What is your favorite porn category?",
  "Welche Fantasie würdest du gerne mal ausleben?": "What fantasy would you like to live out?",
  "Was war dein peinlichster Moment beim Sex?": "What was your most embarrassing moment during sex?",
  "An welchem ungewöhnlichen Ort hattest du schon mal Sex?": "What unusual place have you had sex?",
  "Was ist das Verrückteste, was du im Bett gemacht hast?": "What's the craziest thing you've done in bed?",
  "Welches Spielzeug sollte jeder mal ausprobiert haben?": "What toy should everyone try at least once?",
  
  // Add more translations as needed - the function will fall back to German if no translation exists
};

// Category translation map
const categoryTranslationMap: Record<string, string> = {
  'wer aus der runde': 'Which of us',
  'friends': 'Friends',
  'party': 'Party',
  'self reflection': 'Self Reflection',
  'family': 'Family',
  'fuck': 'Fuck',
  'deep': 'Deep',
  'work': 'Work',
};

export function translateQuestion(germanQuestion: string, language: 'de' | 'en'): string {
  if (language === 'de') {
    return germanQuestion;
  }
  
  // Return English translation if available, otherwise return original German
  return translationMap[germanQuestion] || germanQuestion;
}

export function translateCategory(category: string, language: 'de' | 'en'): string {
  if (language === 'de') {
    return category;
  }
  
  const lowerCategory = category.toLowerCase();
  return categoryTranslationMap[lowerCategory] || category;
}
