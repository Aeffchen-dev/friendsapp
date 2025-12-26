// Free translation service using Lingva Translate API (no API key required)

const translationCache = new Map<string, string>();

// List of Lingva Translate instances to try (fallbacks)
const LINGVA_INSTANCES = [
  'https://lingva.ml',
  'https://lingva.pussthecat.org',
  'https://translate.plausibility.cloud'
];

export async function translateToEnglish(germanText: string): Promise<string> {
  // Check cache first
  if (translationCache.has(germanText)) {
    return translationCache.get(germanText)!;
  }

  // Try each instance until one works
  for (const instance of LINGVA_INSTANCES) {
    try {
      const response = await fetch(
        `${instance}/api/v1/de/en/${encodeURIComponent(germanText)}`
      );
      
      if (!response.ok) {
        continue; // Try next instance
      }

      const data = await response.json();
      
      if (data.translation) {
        translationCache.set(germanText, data.translation);
        return data.translation;
      }
    } catch (error) {
      console.warn(`Lingva instance ${instance} failed:`, error);
      continue; // Try next instance
    }
  }

  // All instances failed, return original text
  console.warn('All Lingva instances failed, returning original text');
  return germanText;
}

export function getCachedTranslation(germanText: string): string | undefined {
  return translationCache.get(germanText);
}
