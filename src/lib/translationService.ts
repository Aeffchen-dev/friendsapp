// Free translation service using MyMemory API (no API key required)

const translationCache = new Map<string, string>();

export async function translateToEnglish(germanText: string): Promise<string> {
  // Check cache first
  if (translationCache.has(germanText)) {
    return translationCache.get(germanText)!;
  }

  try {
    // Use MyMemory translation API (free, no API key needed)
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(germanText)}&langpair=de|en`
    );
    
    if (!response.ok) {
      console.warn('MyMemory API failed with status:', response.status);
      return germanText;
    }

    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translation = data.responseData.translatedText;
      translationCache.set(germanText, translation);
      return translation;
    }
  } catch (error) {
    console.warn('Translation failed:', error);
  }

  // API failed, return original text
  return germanText;
}

export function getCachedTranslation(germanText: string): string | undefined {
  return translationCache.get(germanText);
}
