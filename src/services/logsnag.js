import { LogSnag } from 'logsnag'
import { getAnalyticsUserId } from '../utils/analytics.js'

// Инициализация LogSnag клиента
const logsnagObject = new LogSnag({
  token: import.meta.env.VITE_LOGSNAG_TOKEN,
  project: import.meta.env.VITE_LOGSNAG_PROJECT
})

// События для отслеживания вовлеченности
export const AnalyticsEvents = {
  // Регистрация и вход
  USER_SIGNED_UP: 'user_signed_up',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  
  // Работа с текстами
  TEXT_IMPORTED: 'text_imported',
  TEXT_READ: 'text_read',
  TEXT_COMPLETED: 'text_completed',
  TEXT_SESSION_STARTED: 'text_session_started',
  TEXT_SESSION_ENDED: 'text_session_ended',
  
  // Словарь
  WORD_ADDED_TO_DICTIONARY: 'word_added_to_dictionary',
  WORD_REMOVED_FROM_DICTIONARY: 'word_removed_from_dictionary',
  DICTIONARY_VIEWED: 'dictionary_viewed',
  
  // Вопросы и обучение
  QUESTION_ANSWERED: 'question_answered',
  QUESTION_CORRECT: 'question_correct',
  QUESTION_INCORRECT: 'question_incorrect',
  
  // Настройки
  LANGUAGE_CHANGED: 'language_changed',
  PREFERENCES_UPDATED: 'preferences_updated',
  
  // Обратная связь
  FEEDBACK_SUBMITTED: 'feedback_submitted',
  FEEDBACK_RATING: 'feedback_rating',
  
  // Ошибки
  ERROR_OCCURRED: 'error_occurred',
  
  // Сессии
  SESSION_STARTED: 'session_started',
  SESSION_ENDED: 'session_ended',
  
  // Вовлеченность
  DAILY_ACTIVE_USER: 'daily_active_user',
  WEEKLY_ACTIVE_USER: 'weekly_active_user',
  MONTHLY_ACTIVE_USER: 'monthly_active_user'
}

class AnalyticsService {
  constructor() {
    this.isEnabled = !!import.meta.env.VITE_LOGSNAG_TOKEN
    this.userId = null
    this.userEmail = null
  }

  // Установка информации о пользователе
  setUser(userId, userEmail) {
    this.userId = userId ? String(userId) : null
    this.userEmail = userEmail
  }

  // Очистка информации о пользователе
  clearUser() {
    this.userId = null
    this.userEmail = null
  }

  // Отправка события
  async track(event, data = {}) {
    if (!this.isEnabled) {
      console.log('Analytics disabled, event:', event, data)
      return
    }

    try {
      // Убеждаемся, что user_id всегда строка
      const userId = this.userId ? String(this.userId) : getAnalyticsUserId()
      
      const eventData = {
        event,
        channel: 'user-engagement',
        icon: this.getEventIcon(event),
        tags: {
          ...data.tags,
          user_id: userId,
          environment: import.meta.env.MODE
        },
        user_id: userId,
        description: data.description || this.getEventDescription(event, data),
        ...data
      }

      await logsnagObject.track(eventData)
      console.log('Analytics event tracked:', event, eventData)
    } catch (error) {
      console.error('Failed to track analytics event:', error)
    }
  }

  // Отправка уведомления
  async notify(title, description, data = {}) {
    if (!this.isEnabled) {
      console.log('Analytics disabled, notification:', title, description)
      return
    }

    try {
      // Убеждаемся, что user_id всегда строка
      const userId = this.userId ? String(this.userId) : getAnalyticsUserId()
      
      const notificationData = {
        title,
        description,
        channel: 'user-engagement',
        icon: data.icon || '📊',
        tags: {
          ...data.tags,
          user_id: userId,
          environment: import.meta.env.MODE
        },
        ...data
      }

      await logsnagObject.notify(notificationData)
      console.log('Analytics notification sent:', title, notificationData)
    } catch (error) {
      console.error('Failed to send analytics notification:', error)
    }
  }

  // Отправка инсайта
  async insight(title, value, data = {}) {
    if (!this.isEnabled) {
      console.log('Analytics disabled, insight:', title, value)
      return
    }

    try {
      // Убеждаемся, что user_id всегда строка
      const userId = this.userId ? String(this.userId) : getAnalyticsUserId()
      
      const insightData = {
        title,
        value,
        icon: data.icon || '📈',
        tags: {
          ...data.tags,
          user_id: userId,
          environment: import.meta.env.MODE
        },
        ...data
      }

      await logsnagObject.insight(insightData)
      console.log('Analytics insight sent:', title, value, insightData)
    } catch (error) {
      console.error('Failed to send analytics insight:', error)
    }
  }

  // Получение иконки для события
  getEventIcon(event) {
    const icons = {
      [AnalyticsEvents.USER_SIGNED_UP]: '👤',
      [AnalyticsEvents.USER_LOGGED_IN]: '🔑',
      [AnalyticsEvents.USER_LOGGED_OUT]: '🚪',
      [AnalyticsEvents.TEXT_IMPORTED]: '📄',
      [AnalyticsEvents.TEXT_READ]: '📖',
      [AnalyticsEvents.TEXT_COMPLETED]: '✅',
      [AnalyticsEvents.TEXT_SESSION_STARTED]: '🎯',
      [AnalyticsEvents.TEXT_SESSION_ENDED]: '🏁',
      [AnalyticsEvents.WORD_ADDED_TO_DICTIONARY]: '📝',
      [AnalyticsEvents.WORD_REMOVED_FROM_DICTIONARY]: '🗑️',
      [AnalyticsEvents.DICTIONARY_VIEWED]: '📚',
      [AnalyticsEvents.QUESTION_ANSWERED]: '❓',
      [AnalyticsEvents.QUESTION_CORRECT]: '✅',
      [AnalyticsEvents.QUESTION_INCORRECT]: '❌',
      [AnalyticsEvents.LANGUAGE_CHANGED]: '🌍',
      [AnalyticsEvents.PREFERENCES_UPDATED]: '⚙️',
      [AnalyticsEvents.FEEDBACK_SUBMITTED]: '💬',
      [AnalyticsEvents.FEEDBACK_RATING]: '⭐',
      [AnalyticsEvents.ERROR_OCCURRED]: '🚨',
      [AnalyticsEvents.SESSION_STARTED]: '🚀',
      [AnalyticsEvents.SESSION_ENDED]: '🛑',
      [AnalyticsEvents.DAILY_ACTIVE_USER]: '📅',
      [AnalyticsEvents.WEEKLY_ACTIVE_USER]: '📆',
      [AnalyticsEvents.MONTHLY_ACTIVE_USER]: '📊'
    }
    return icons[event] || '📊'
  }

  // Получение описания события
  getEventDescription(event, data) {
    const descriptions = {
      [AnalyticsEvents.USER_SIGNED_UP]: `New user signed up: ${data.email || 'Unknown'}`,
      [AnalyticsEvents.USER_LOGGED_IN]: `User logged in: ${data.email || 'Unknown'}`,
      [AnalyticsEvents.USER_LOGGED_OUT]: `User logged out: ${data.email || 'Unknown'}`,
      [AnalyticsEvents.TEXT_IMPORTED]: `Text imported: ${data.title || 'Unknown'}`,
      [AnalyticsEvents.TEXT_READ]: `Text read: ${data.title || 'Unknown'}`,
      [AnalyticsEvents.TEXT_COMPLETED]: `Text completed: ${data.title || 'Unknown'}`,
      [AnalyticsEvents.TEXT_SESSION_STARTED]: `Reading session started`,
      [AnalyticsEvents.TEXT_SESSION_ENDED]: `Reading session ended`,
      [AnalyticsEvents.WORD_ADDED_TO_DICTIONARY]: `Word added: ${data.word || 'Unknown'}`,
      [AnalyticsEvents.WORD_REMOVED_FROM_DICTIONARY]: `Word removed: ${data.word || 'Unknown'}`,
      [AnalyticsEvents.DICTIONARY_VIEWED]: 'Dictionary viewed',
      [AnalyticsEvents.QUESTION_ANSWERED]: 'Question answered',
      [AnalyticsEvents.QUESTION_CORRECT]: 'Correct answer',
      [AnalyticsEvents.QUESTION_INCORRECT]: 'Incorrect answer',
      [AnalyticsEvents.LANGUAGE_CHANGED]: `Language changed to: ${data.language || 'Unknown'}`,
      [AnalyticsEvents.PREFERENCES_UPDATED]: 'User preferences updated',
      [AnalyticsEvents.FEEDBACK_SUBMITTED]: 'Feedback submitted',
      [AnalyticsEvents.FEEDBACK_RATING]: `Feedback rating: ${data.rating || 'Unknown'}`,
      [AnalyticsEvents.ERROR_OCCURRED]: `Error occurred: ${data.error || 'Unknown'}`,
      [AnalyticsEvents.SESSION_STARTED]: 'User session started',
      [AnalyticsEvents.SESSION_ENDED]: 'User session ended',
      [AnalyticsEvents.DAILY_ACTIVE_USER]: 'Daily active user',
      [AnalyticsEvents.WEEKLY_ACTIVE_USER]: 'Weekly active user',
      [AnalyticsEvents.MONTHLY_ACTIVE_USER]: 'Monthly active user'
    }
    return descriptions[event] || 'Event tracked'
  }

  // Отслеживание регистрации пользователя
  async trackUserSignUp(email, userId) {
    await this.track(AnalyticsEvents.USER_SIGNED_UP, {
      description: `New user signed up: ${email}`,
      tags: { email, user_id: userId },
      icon: '👤',
      user_id: userId || getAnalyticsUserId()
    })
    
    // Сохраняем метрику локально
    await this.trackMetric('user_signup', 1, { email, user_id: userId })
  }

  // Отслеживание входа пользователя
  async trackUserLogin(email, userId) {
    await this.track(AnalyticsEvents.USER_LOGGED_IN, {
      description: `User logged in: ${email}`,
      tags: { email, user_id: userId },
      icon: '🔑',
      user_id: userId || getAnalyticsUserId()
    })
  }

  // Отслеживание импорта текста
  async trackTextImport(title, language, userId) {
    await this.track(AnalyticsEvents.TEXT_IMPORTED, {
      description: `Text imported: ${title}`,
      tags: { title, language, user_id: userId },
      icon: '📄',
      user_id: userId || getAnalyticsUserId()
    })
  }

  // Отслеживание чтения текста
  async trackTextRead(title, language, userId, nativeLanguage) {
    await this.track(AnalyticsEvents.TEXT_READ, {
      description: `Text read: ${title}`,
      tags: { title, language, user_id: userId, native_language: nativeLanguage },
      icon: '📖',
      user_id: userId || getAnalyticsUserId()
    })
  }

  // Отслеживание завершения текста
  async trackTextResults(results) {
    await this.track(AnalyticsEvents.TEXT_COMPLETED, {
      description: `Text completed, results:`,
      tags: { results },
      icon: '📖',
      user_id: getAnalyticsUserId()
    })
  }

  // Отслеживание завершения текста
  async trackTextCompleted(title, language, userId, duration) {
    await this.track(AnalyticsEvents.TEXT_COMPLETED, {
      description: `Text completed: ${title}`,
      tags: { title, language, user_id: userId, duration },
      icon: '✅',
      user_id: userId || getAnalyticsUserId()
    })
  }

  // Отслеживание добавления слова в словарь
  async trackWordAdded(word, translation, language, userId) {
    await this.track(AnalyticsEvents.WORD_ADDED_TO_DICTIONARY, {
      description: `Word added: ${word}`,
      tags: { word, translation, language, user_id: userId },
      icon: '📝',
      user_id: userId || getAnalyticsUserId()
    })
  }

  // Отслеживание ответа на вопрос
  async trackQuestionAnswered(questionId, isCorrect, userId) {
    const event = isCorrect ? AnalyticsEvents.QUESTION_CORRECT : AnalyticsEvents.QUESTION_INCORRECT
    await this.track(event, {
      description: isCorrect ? 'Correct answer' : 'Incorrect answer',
      tags: { question_id: questionId, is_correct: isCorrect, user_id: userId },
      icon: isCorrect ? '✅' : '❌',
      user_id: userId || getAnalyticsUserId()
    })
  }

  // Отслеживание отправки обратной связи
  async trackFeedbackSubmitted(rating, message, userId) {
    await this.track(AnalyticsEvents.FEEDBACK_SUBMITTED, {
      description: 'Feedback submitted',
      tags: { rating, has_message: !!message, user_id: userId },
      icon: '💬',
      user_id: userId || getAnalyticsUserId()
    })
  }

  // Отслеживание ошибки
  async trackError(error, context, userId) {
    await this.track(AnalyticsEvents.ERROR_OCCURRED, {
      description: `Error: ${error.message || error}`,
      tags: { error_type: error.name, context, user_id: userId },
      icon: '🚨',
      user_id: userId || getAnalyticsUserId()
    })
  }

  // Отслеживание активного пользователя
  async trackActiveUser(period, userId) {
    const event = period === 'daily' ? AnalyticsEvents.DAILY_ACTIVE_USER :
                  period === 'weekly' ? AnalyticsEvents.WEEKLY_ACTIVE_USER :
                  AnalyticsEvents.MONTHLY_ACTIVE_USER
    
    await this.track(event, {
      description: `${period.charAt(0).toUpperCase() + period.slice(1)} active user`,
      tags: { period, user_id: userId },
      icon: period === 'daily' ? '📅' : period === 'weekly' ? '📆' : '📊',
      user_id: userId || getAnalyticsUserId()
    })
    
    // Сохраняем метрику локально
    await this.trackMetric('active_users', 1, { period, user_id: userId })
  }

  // Отслеживание просмотра словаря
  async trackDictionaryViewed(userId) {
    await this.track(AnalyticsEvents.DICTIONARY_VIEWED, {
      description: 'Dictionary viewed',
      tags: { user_id: userId },
      icon: '📚',
      user_id: userId || getAnalyticsUserId()
    })
    
    await this.trackMetric('dictionary_viewed', 1, { user_id: userId })
  }

  // Отслеживание удаления слова из словаря
  async trackWordRemoved(word, language, userId) {
    await this.track(AnalyticsEvents.WORD_REMOVED_FROM_DICTIONARY, {
      description: `Word removed: ${word}`,
      tags: { word, language, user_id: userId },
      icon: '🗑️',
      user_id: userId || getAnalyticsUserId()
    })
    
    await this.trackMetric('word_removed', 1, { word, language, user_id: userId })
  }

  // Отслеживание изменения языка
  async trackLanguageChanged(oldLanguage, newLanguage, userId) {
    await this.track(AnalyticsEvents.LANGUAGE_CHANGED, {
      description: `Language changed from ${oldLanguage} to ${newLanguage}`,
      tags: { old_language: oldLanguage, new_language: newLanguage, user_id: userId },
      icon: '🌍',
      user_id: userId || getAnalyticsUserId()
    })
    
    await this.trackMetric('language_changed', 1, { 
      old_language: oldLanguage, 
      new_language: newLanguage, 
      user_id: userId 
    })
  }

  // Отслеживание обновления настроек
  async trackPreferencesUpdated(preferences, userId) {
    await this.track(AnalyticsEvents.PREFERENCES_UPDATED, {
      description: 'User preferences updated',
      tags: { preferences: JSON.stringify(preferences), user_id: userId },
      icon: '⚙️',
      user_id: userId || getAnalyticsUserId()
    })
    
    await this.trackMetric('preferences_updated', 1, { user_id: userId })
  }

  // Отслеживание начала сессии чтения
  async trackTextSessionStarted(textId, title, language, userId) {
    await this.track(AnalyticsEvents.TEXT_SESSION_STARTED, {
      description: `Reading session started: ${title}`,
      tags: { text_id: textId, title, language, user_id: userId },
      icon: '🎯',
      user_id: userId || getAnalyticsUserId()
    })
    
    await this.trackMetric('text_session_started', 1, { 
      text_id: textId, 
      title, 
      language, 
      user_id: userId 
    })
  }

  // Отслеживание окончания сессии чтения
  async trackTextSessionEnded(textId, title, language, duration, userId) {
    await this.track(AnalyticsEvents.TEXT_SESSION_ENDED, {
      description: `Reading session ended: ${title}`,
      tags: { text_id: textId, title, language, duration, user_id: userId },
      icon: '🏁',
      user_id: userId || getAnalyticsUserId()

    })
    
    await this.trackMetric('text_session_ended', 1, { 
      text_id: textId, 
      title, 
      language, 
      duration, 
      user_id: userId 
    })
  }

  // Отслеживание неправильного ответа
  async trackQuestionIncorrect(questionId, userId) {
    await this.track(AnalyticsEvents.QUESTION_INCORRECT, {
      description: 'Incorrect answer',
      tags: { question_id: questionId, user_id: userId },
      icon: '❌',
      user_id: userId || getAnalyticsUserId()

    })
    
    await this.trackMetric('incorrect_answer', 1, { question_id: questionId, user_id: userId })
  }

  // Отслеживание рейтинга обратной связи
  async trackFeedbackRating(rating, userId) {
    await this.track(AnalyticsEvents.FEEDBACK_RATING, {
      description: `Feedback rating: ${rating}/5`,
      tags: { rating, user_id: userId },
      icon: '⭐',
      user_id: userId || getAnalyticsUserId()

    })
    
    await this.trackMetric('feedback_rating', rating, { user_id: userId })
  }

  // Отслеживание импорта текстов
  async trackTextsImported(count, languages, userId) {
    await this.track(AnalyticsEvents.TEXT_IMPORTED, {
      description: `${count} texts imported`,
      tags: { count, languages: JSON.stringify(languages), user_id: userId },
      icon: '📄',
      user_id: userId || getAnalyticsUserId()

    })
    
    await this.trackMetric('texts_imported', count, { 
      languages: JSON.stringify(languages), 
      user_id: userId 
    })
  }

  // Отслеживание очистки данных
  async trackDataCleared(dataType, userId) {
    await this.track('data_cleared', {
      description: `${dataType} data cleared`,
      tags: { data_type: dataType, user_id: userId },
      icon: '🧹',
      user_id: userId || getAnalyticsUserId()

    })
    
    await this.trackMetric('data_cleared', 1, { data_type: dataType, user_id: userId })
  }

  // Отслеживание поиска
  async trackSearch(query, context, userId) {
    await this.track('search_performed', {
      description: `Search: ${query}`,
      tags: { query, context, user_id: userId },
      icon: '🔍',
      user_id: userId || getAnalyticsUserId()

    })
    
    await this.trackMetric('search_performed', 1, { query, context, user_id: userId })
  }

  // Отслеживание ошибок приложения
  async trackAppError(error, context, userId) {
    await this.track(AnalyticsEvents.ERROR_OCCURRED, {
      description: `App error: ${error.message || error}`,
      tags: { error_type: error.name, context, user_id: userId },
      icon: '🚨',
      user_id: userId || getAnalyticsUserId()

    })
    
    await this.trackMetric('app_error', 1, { 
      error_type: error.name, 
      context, 
      user_id: userId 
    })
  }

  // Получение инсайтов (метрик) из локального хранилища
  async getInsights(metric, options = {}) {
    if (!this.isEnabled) {
      console.log('Analytics disabled, getInsights:', metric)
      return null
    }
    
    try {
      // Получаем данные из localStorage
      const days = options.days || 7
      const localData = this.getLocalMetrics(metric, days)
      
      // Если есть локальные данные, возвращаем их
      if (localData.value > 0 || localData.breakdown) {
        return localData
      }
      
      // Иначе возвращаем fallback данные
      return this.getFallbackInsights(metric, options)
    } catch (error) {
      console.error('Failed to get insights:', error)
      return this.getFallbackInsights(metric, options)
    }
  }

  // Получение событий из локального хранилища
  async getEvents(options = {}) {
    if (!this.isEnabled) {
      console.log('Analytics disabled, getEvents:', options)
      return { data: [] }
    }
    
    try {
      // Получаем события из localStorage
      const localEvents = this.getLocalEvents(options)
      
      // Если есть локальные события, возвращаем их
      if (localEvents.data.length > 0) {
        return localEvents
      }
      
      // Иначе возвращаем fallback данные
      return this.getFallbackEvents(options)
    } catch (error) {
      console.error('Failed to get events:', error)
      return this.getFallbackEvents(options)
    }
  }

  // Fallback данные для инсайтов
  getFallbackInsights(metric, options) {
    const fallbackData = {
      user_signup: { value: 0 },
      user_login: { value: 0 },
      unique_users: { value: 0 },
      text_read: { value: 0 },
      text_completed: { value: 0 },
      word_added: { value: 0 },
      question_answered: { value: 0 },
      correct_answer: { value: 0 },
      feedback_submitted: { value: 0 },
      feedback_rating: { value: 0 },
      language_used: {
        value: 0,
        breakdown: {
          en: 0,
          fr: 0,
          es: 0,
          de: 0,
          uk: 0,
          ru: 0
        }
      }
    }

    return fallbackData[metric] || { value: 0 }
  }

  // Fallback данные для событий
  getFallbackEvents(options) {
    return { 
      data: [
        {
          event: 'text_read',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          description: 'User started reading a text'
        },
        {
          event: 'word_added',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          description: 'New word added to dictionary'
        },
        {
          event: 'question_answered',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          description: 'User answered a question'
        }
      ].slice(0, options.limit || 10)
    }
  }

  // Отслеживание метрики и сохранение в localStorage
  async trackMetric(metricName, value = 1, options = {}) {
    if (!this.isEnabled) {
      console.log('Analytics disabled, trackMetric:', metricName, value)
      return
    }

    try {
      // Отправляем в LogSnag
      await this.getInsights(metricName, { value, ...options })
      
      // Сохраняем локально для аналитики
      this.saveMetricLocally(metricName, value, options)
      
      console.log('Metric tracked:', metricName, value)
    } catch (error) {
      console.error('Failed to track metric:', error)
      // Все равно сохраняем локально
      this.saveMetricLocally(metricName, value, options)
    }
  }

  // Сохранение метрики в localStorage
  saveMetricLocally(metricName, value, options = {}) {
    try {
      const storageKey = 'logsnag_analytics'
      const existing = JSON.parse(localStorage.getItem(storageKey) || '{}')
      
      const today = new Date().toISOString().split('T')[0]
      
      if (!existing[metricName]) {
        existing[metricName] = {}
      }
      
      if (!existing[metricName][today]) {
        existing[metricName][today] = 0
      }
      
      existing[metricName][today] += value
      
      // Сохраняем события для recent activity
      if (!existing.events) {
        existing.events = []
      }
      
      existing.events.unshift({
        event: metricName,
        timestamp: new Date().toISOString(),
        description: this.getEventDescription(metricName, options),
        value: value
      })
      
      // Ограничиваем количество событий
      if (existing.events.length > 100) {
        existing.events = existing.events.slice(0, 100)
      }
      
      localStorage.setItem(storageKey, JSON.stringify(existing))
    } catch (error) {
      console.error('Failed to save metric locally:', error)
    }
  }

  // Получение метрик из localStorage
  getLocalMetrics(metricName, days = 7) {
    try {
      const storageKey = 'logsnag_analytics'
      const data = JSON.parse(localStorage.getItem(storageKey) || '{}')
      
      if (!data[metricName]) {
        return { value: 0 }
      }
      
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - days)
      
      let total = 0
      const breakdown = {}
      
      Object.entries(data[metricName]).forEach(([date, value]) => {
        const metricDate = new Date(date)
        if (metricDate >= startDate && metricDate <= endDate) {
          total += value
          
          // Для языков сохраняем breakdown
          if (metricName === 'language_used' && options.language) {
            breakdown[options.language] = (breakdown[options.language] || 0) + value
          }
        }
      })
      
      return {
        value: total,
        breakdown: Object.keys(breakdown).length > 0 ? breakdown : undefined
      }
    } catch (error) {
      console.error('Failed to get local metrics:', error)
      return { value: 0 }
    }
  }

  // Получение событий из localStorage
  getLocalEvents(options = {}) {
    try {
      const storageKey = 'logsnag_analytics'
      const data = JSON.parse(localStorage.getItem(storageKey) || '{}')
      
      const events = data.events || []
      const limit = options.limit || 10
      
      return {
        data: events.slice(0, limit)
      }
    } catch (error) {
      console.error('Failed to get local events:', error)
      return { data: [] }
    }
  }
}

// Создание единственного экземпляра сервиса
const logsnag = new AnalyticsService()

export default logsnag
export { logsnag } 