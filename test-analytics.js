// Test script for LogSnag analytics
import { LogSnag } from 'logsnag'
import dotenv from 'dotenv'

// Загружаем переменные окружения
dotenv.config()

// Инициализация LogSnag клиента
const logsnag = new LogSnag({
  token: process.env.VITE_LOGSNAG_TOKEN,
  project: process.env.VITE_LOGSNAG_PROJECT
})

console.log('Testing LogSnag API...')
console.log('Token:', process.env.VITE_LOGSNAG_TOKEN ? 'Set' : 'Not set')
console.log('Project:', process.env.VITE_LOGSNAG_PROJECT)

async function testLogSnag() {
  try {
    // Тестируем отправку события
    console.log('\n1. Testing event tracking...')
    await logsnag.track({
      event: 'test_event',
      channel: 'user-engagement',
      icon: '🧪',
      description: 'Test event from analytics integration',
      tags: {
        test: true,
        environment: 'development'
      }
    })
    console.log('✅ Event tracking successful')

    // Тестируем отправку инсайта
    console.log('\n2. Testing insight...')
    await logsnag.insight({
      title: 'Test Metric',
      value: 42,
      icon: '📈'
    })
    console.log('✅ Insight successful')

    console.log('\n🎉 All LogSnag API tests passed!')
    console.log('\nNote: The analytics dashboard will show mock data until LogSnag API endpoints for retrieving data are implemented.')

  } catch (error) {
    console.error('❌ LogSnag API test failed:', error.message)
    console.error('Full error:', error)
  }
}

testLogSnag()

export { testLogSnag } 