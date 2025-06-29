import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import fr from './locales/fr.json'
import es from './locales/es.json'
import de from './locales/de.json'
import uk from './locales/uk.json'
import ru from './locales/ru.json'

const messages = {
  en,
  fr,
  es,
  de,
  uk,
  ru
}

// Get user's preferred language from localStorage or default to English
function getDefaultLocale() {
  try {
    const stored = localStorage.getItem('languageLearningPreferences')
    if (stored) {
      const preferences = JSON.parse(stored)
      const locale = preferences.nativeLanguage || preferences.NativeLanguage || 'en'
      return locale
    }
  } catch (error) {
    console.error('Error loading stored preferences for i18n:', error)
  }
  console.log('i18n initialized with default locale: en')
  return 'en'
}

export const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: getDefaultLocale(),
  fallbackLocale: 'en',
  messages,
  globalInjection: true,
  silentTranslationWarn: true
})

// Function to change locale and save to localStorage
export function setLocale(locale) {
  
  if (!i18n.global.messages.value[locale]) {
    console.error('Locale not found:', locale)
    return
  }
  
  i18n.global.locale.value = locale
  
  try {
    const stored = localStorage.getItem('languageLearningPreferences')
    const preferences = stored ? JSON.parse(stored) : {}
    preferences.nativeLanguage = locale
    localStorage.setItem('languageLearningPreferences', JSON.stringify(preferences))
  } catch (error) {
    console.error('Error saving locale preference:', error)
  }
}

// Function to get current locale
export function getCurrentLocale() {
  return i18n.global.locale.value
} 