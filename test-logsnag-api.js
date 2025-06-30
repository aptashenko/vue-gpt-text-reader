import dotenv from 'dotenv'

// Загружаем переменные окружения
dotenv.config()

console.log('Testing LogSnag API endpoints...')
console.log('Token:', process.env.VITE_LOGSNAG_TOKEN ? 'Set' : 'Not set')
console.log('Project:', process.env.VITE_LOGSNAG_PROJECT)

async function testLogSnagAPI() {
  const token = process.env.VITE_LOGSNAG_TOKEN
  const project = process.env.VITE_LOGSNAG_PROJECT

  if (!token || !project) {
    console.error('❌ Missing LogSnag credentials')
    return
  }

  try {
    // Тест 1: Создание инсайта (правильный формат)
    console.log('\n1. Testing insight creation...')
    const insightRes = await fetch('https://api.logsnag.com/v1/insight', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        project: project,
        title: 'Test Metric',
        value: 42,
        icon: '📊'
      })
    })

    console.log('Insight response status:', insightRes.status)
    if (!insightRes.ok) {
      const errorData = await insightRes.json()
      console.error('Insight error:', errorData)
    } else {
      const insightData = await insightRes.json()
      console.log('✅ Insight created successfully:', insightData)
    }

    // Тест 2: Отправка события
    console.log('\n2. Testing event tracking...')
    const eventRes = await fetch('https://api.logsnag.com/v1/event', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        project: project,
        event: 'test_event',
        channel: 'user-engagement',
        icon: '🧪',
        description: 'Test event from API',
        tags: {
          test: true,
          environment: 'development'
        }
      })
    })

    console.log('Event response status:', eventRes.status)
    if (!eventRes.ok) {
      const errorData = await eventRes.json()
      console.error('Event error:', errorData)
    } else {
      const eventData = await eventRes.json()
      console.log('✅ Event tracked successfully:', eventData)
    }

    // Тест 3: Получение событий (если API поддерживает)
    console.log('\n3. Testing events retrieval...')
    try {
      const eventsRes = await fetch('https://api.logsnag.com/v1/events', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Events retrieval status:', eventsRes.status)
      if (!eventsRes.ok) {
        const errorData = await eventsRes.json()
        console.error('Events retrieval error:', errorData)
      } else {
        const eventsData = await eventsRes.json()
        console.log('✅ Events retrieved successfully:', eventsData)
      }
    } catch (error) {
      console.log('⚠️ Events retrieval not supported or failed:', error.message)
    }

  } catch (error) {
    console.error('❌ API test failed:', error.message)
  }
}

testLogSnagAPI() 