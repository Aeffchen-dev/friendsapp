import Hypher from 'hypher';
import german from 'hyphenation.de';

const hyphenator = new Hypher(german);

interface HyphenationOptions {
  containerWidth: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  bufferPx?: number;
}

/**
 * Checks if a word should be excluded from hyphenation
 */
function shouldExcludeWord(word: string): boolean {
  // Words shorter than 6 characters
  if (word.length < 6) return true;
  
  // All uppercase (abbreviations like USA, BMW)
  if (word === word.toUpperCase() && /^[A-ZÄÖÜ]+$/.test(word)) return true;
  
  // Contains numbers or symbols
  if (/[\d§$%€&@#]/.test(word)) return true;
  
  // Already contains a hyphen (don't add additional hyphens)
  if (word.includes('-')) return true;
  
  return false;
}

/**
 * Measures the width of text using canvas
 */
function measureTextWidth(text: string, font: string): number {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return 0;
  
  context.font = font;
  return context.measureText(text).width;
}

/**
 * Applies German hyphenation to text, only breaking words that exceed line width
 */
export function applyGermanHyphenation(
  text: string,
  options: HyphenationOptions
): string {
  const { containerWidth, fontSize, fontFamily, fontWeight, bufferPx = 16 } = options;
  const availableWidth = containerWidth - bufferPx;
  const font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  
  // Split text into words while preserving spaces and punctuation
  const words = text.split(/(\s+)/);
  
  return words.map(word => {
    // Skip whitespace
    if (/^\s+$/.test(word)) return word;
    
    // Check if word should be excluded
    if (shouldExcludeWord(word)) return word;
    
    // Measure word width
    const wordWidth = measureTextWidth(word, font);
    
    // Only hyphenate if word exceeds available width
    if (wordWidth <= availableWidth) return word;
    
    // Apply German hyphenation (returns array of syllables)
    const syllables = hyphenator.hyphenate(word);
    
    // Join with soft hyphen
    return syllables.join('\u00AD');
  }).join('');
}
