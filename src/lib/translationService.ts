// Free translation service using MyMemory API (no API key required)

const translationCache = new Map<string, string>();

export async function translateToEnglish(germanText: string): Promise<string> {
  // Check cache first
  if (translationCache.has(germanText)) {
    return translationCache.get(germanText)!;
  }

  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(germanText)}&langpair=de|en`
    );
    
    if (!response.ok) {
      console.warn('Translation API error, returning original text');
      return germanText;
    }

    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      translationCache.set(germanText, translated);
      return translated;
    }
    
    return germanText;
  } catch (error) {
    console.warn('Translation failed, returning original text:', error);
    return germanText;
  }
}

export function getCachedTranslation(germanText: string): string | undefined {
  return translationCache.get(germanText);
}
