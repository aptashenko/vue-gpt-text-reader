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


export const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: localStorage.getItem('language_native') ?? 'en',
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

  try {
    const stored = localStorage.getItem('language_native');
    const localeValue = locale ? locale : stored;
    i18n.global.locale.value = localeValue;
    localStorage.setItem('language_native', localeValue);

  } catch (error) {
    console.error('Error saving locale preference:', error)
  }
}
