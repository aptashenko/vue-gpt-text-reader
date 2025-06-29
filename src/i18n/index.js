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
      // Handle both correct and incorrect property names due to previous typo
      return preferences.nativeLanguage || preferences.NativeLanguage || 'en'
    }
  } catch (error) {
    console.error('Error loading stored preferences for i18n:', error)
  }
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
  console.log('setLocale called with:', locale)
  console.log('Current locale before change:', i18n.global.locale.value)
  i18n.global.locale.value = locale
  console.log('Current locale after change:', i18n.global.locale.value)
  try {
    const stored = localStorage.getItem('languageLearningPreferences')
    const preferences = stored ? JSON.parse(stored) : {}
    preferences.nativeLanguage = locale
    localStorage.setItem('languageLearningPreferences', JSON.stringify(preferences))
    console.log('Locale preference saved to localStorage:', locale)
  } catch (error) {
    console.error('Error saving locale preference:', error)
  }
}

// Function to get current locale
export function getCurrentLocale() {
  return i18n.global.locale.value
} 