/**
 * Detects and resolves the browser's language to one of our supported languages.
 * @returns {string} One of 'en', 'es', or 'pt'
 */
export function detectLanguage() {
  // Get browser language
  const browserLang = navigator.language || navigator.userLanguage;
  
  // Split by '-' to get the base language code
  const baseLang = browserLang.split('-')[0].toLowerCase();
  
  // Check if it's one of our supported languages
  if (['en', 'es', 'pt'].includes(baseLang)) {
    return baseLang;
  }
  
  // Default to English if no match
  return 'en';
} 