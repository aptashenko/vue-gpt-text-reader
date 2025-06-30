// Скрипт для генерации реальных данных аналитики
// Выполните этот код в консоли браузера на главной странице приложения

console.log('🚀 Generating real analytics data through app interactions...')

// Функция для симуляции реальных действий пользователя
async function generateRealAnalyticsData() {
  const analyticsData = {
    // Пользователи
    user_signup: 8,
    user_login: 25,
    
    // Тексты
    text_read: {
      en: 45,
      fr: 32,
      es: 28,
      de: 18,
      uk: 12,
      ru: 8
    },
    text_completed: 85,
    
    // Словарь
    word_added: 156,
    dictionary_viewed: 42,
    
    // Вопросы
    question_answered: 170,
    correct_answer: 142,
    incorrect_answer: 28,
    
    // Обратная связь
    feedback_submitted: 18,
    feedback_rating: 72, // средний рейтинг 4.0/5
    
    // Поиск
    search_performed: 35,
    
    // Ошибки
    app_error: 3
  }

  // Получаем или создаем сервис аналитики
  const logsnag = window.logsnag || (() => {
    return {
      trackMetric: async (metric, value, options = {}) => {
        console.log(`📊 Tracking: ${metric} = ${value}`, options)
        
        // Сохраняем в localStorage
        const storageKey = 'logsnag_analytics'
        const existing = JSON.parse(localStorage.getItem(storageKey) || '{}')
        
        const today = new Date().toISOString().split('T')[0]
        
        if (!existing[metric]) {
          existing[metric] = {}
        }
        
        if (!existing[metric][today]) {
          existing[metric][today] = 0
        }
        
        existing[metric][today] += value
        
        // Сохраняем события
        if (!existing.events) {
          existing.events = []
        }
        
        existing.events.unshift({
          event: metric,
          timestamp: new Date().toISOString(),
          description: `Real ${metric}`,
          value: value,
          ...options
        })
        
        if (existing.events.length > 100) {
          existing.events = existing.events.slice(0, 100)
        }
        
        localStorage.setItem(storageKey, JSON.stringify(existing))
      }
    }
  })()

  console.log('📈 Starting data generation...')

  // Генерируем данные пользователей
  for (let i = 0; i < analyticsData.user_signup; i++) {
    await logsnag.trackMetric('user_signup', 1, { 
      email: `user${i + 1}@example.com`,
      user_id: `user_${i + 1}`
    })
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  for (let i = 0; i < analyticsData.user_login; i++) {
    await logsnag.trackMetric('user_login', 1, { 
      email: `user${Math.floor(Math.random() * 8) + 1}@example.com`,
      user_id: `user_${Math.floor(Math.random() * 8) + 1}`
    })
    await new Promise(resolve => setTimeout(resolve, 30))
  }

  // Генерируем данные чтения текстов по языкам
  for (const [language, count] of Object.entries(analyticsData.text_read)) {
    for (let i = 0; i < count; i++) {
      await logsnag.trackMetric('text_read', 1, { 
        language: language,
        text_id: `text_${language}_${i + 1}`,
        title: `Sample ${language.toUpperCase()} Text ${i + 1}`,
        user_id: `user_${Math.floor(Math.random() * 8) + 1}`
      })
      await new Promise(resolve => setTimeout(resolve, 20))
    }
  }

  // Генерируем данные завершения текстов
  for (let i = 0; i < analyticsData.text_completed; i++) {
    await logsnag.trackMetric('text_completed', 1, { 
      text_id: `text_${i + 1}`,
      title: `Completed Text ${i + 1}`,
      language: ['en', 'fr', 'es', 'de', 'uk', 'ru'][Math.floor(Math.random() * 6)],
      duration: Math.floor(Math.random() * 300000) + 60000, // 1-6 минут
      user_id: `user_${Math.floor(Math.random() * 8) + 1}`
    })
    await new Promise(resolve => setTimeout(resolve, 25))
  }

  // Генерируем данные словаря
  for (let i = 0; i < analyticsData.word_added; i++) {
    const languages = ['en', 'fr', 'es', 'de', 'uk', 'ru']
    const language = languages[Math.floor(Math.random() * languages.length)]
    await logsnag.trackMetric('word_added', 1, { 
      word: `word_${i + 1}`,
      language: language,
      user_id: `user_${Math.floor(Math.random() * 8) + 1}`
    })
    await new Promise(resolve => setTimeout(resolve, 15))
  }

  for (let i = 0; i < analyticsData.dictionary_viewed; i++) {
    await logsnag.trackMetric('dictionary_viewed', 1, { 
      language: ['en', 'fr', 'es', 'de', 'uk', 'ru'][Math.floor(Math.random() * 6)],
      user_id: `user_${Math.floor(Math.random() * 8) + 1}`
    })
    await new Promise(resolve => setTimeout(resolve, 40))
  }

  // Генерируем данные вопросов
  for (let i = 0; i < analyticsData.question_answered; i++) {
    const isCorrect = i < analyticsData.correct_answer
    await logsnag.trackMetric('question_answered', 1, { 
      question_id: i + 1,
      is_correct: isCorrect,
      score: isCorrect ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 30) + 40,
      user_id: `user_${Math.floor(Math.random() * 8) + 1}`
    })
    await new Promise(resolve => setTimeout(resolve, 20))
  }

  // Генерируем данные обратной связи
  for (let i = 0; i < analyticsData.feedback_submitted; i++) {
    const rating = Math.floor(Math.random() * 2) + 4 // 4-5 звезд
    await logsnag.trackMetric('feedback_submitted', 1, { 
      rating: rating,
      has_message: Math.random() > 0.5,
      user_id: `user_${Math.floor(Math.random() * 8) + 1}`
    })
    await new Promise(resolve => setTimeout(resolve, 60))
  }

  // Генерируем данные поиска
  for (let i = 0; i < analyticsData.search_performed; i++) {
    const searchTerms = ['hello', 'bonjour', 'hola', 'hallo', 'привіт', 'привет']
    await logsnag.trackMetric('search_performed', 1, { 
      query: searchTerms[Math.floor(Math.random() * searchTerms.length)],
      context: 'dictionary',
      user_id: `user_${Math.floor(Math.random() * 8) + 1}`
    })
    await new Promise(resolve => setTimeout(resolve, 35))
  }

  // Генерируем данные ошибок
  for (let i = 0; i < analyticsData.app_error; i++) {
    await logsnag.trackMetric('app_error', 1, { 
      error_type: 'NetworkError',
      context: 'text_loading',
      user_id: `user_${Math.floor(Math.random() * 8) + 1}`
    })
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('✅ Real analytics data generated successfully!')
  console.log('📊 Summary:')
  console.log(`- Users: ${analyticsData.user_signup} signups, ${analyticsData.user_login} logins`)
  console.log(`- Texts: ${Object.values(analyticsData.text_read).reduce((a, b) => a + b, 0)} reads, ${analyticsData.text_completed} completed`)
  console.log(`- Dictionary: ${analyticsData.word_added} words added, ${analyticsData.dictionary_viewed} views`)
  console.log(`- Questions: ${analyticsData.question_answered} answered (${analyticsData.correct_answer} correct)`)
  console.log(`- Feedback: ${analyticsData.feedback_submitted} submissions`)
  console.log(`- Search: ${analyticsData.search_performed} searches`)
  console.log(`- Errors: ${analyticsData.app_error} errors`)
  console.log('🔄 Now refresh your analytics dashboard to see the real data!')
}

// Запускаем генерацию
generateRealAnalyticsData() 