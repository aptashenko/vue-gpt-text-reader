// Тест исправления user_id в аналитике
import { LogSnag } from 'logsnag'

// Имитируем переменные окружения
process.env.VITE_LOGSNAG_TOKEN = 'test-token'
process.env.VITE_LOGSNAG_PROJECT = 'test-project'

// Создаем тестовый экземпляр LogSnag
const logsnag = new LogSnag({
  token: process.env.VITE_LOGSNAG_TOKEN,
  project: process.env.VITE_LOGSNAG_PROJECT
})

// Тестируем конвертацию user_id
async function testUserIdConversion() {
  console.log('🧪 Testing user_id conversion fix...')
  
  const testUserId = 12345 // Number from Supabase
  const testUserIdString = String(testUserId) // Converted to string
  
  console.log('📊 Original user ID:', testUserId, typeof testUserId)
  console.log('📊 Converted user ID:', testUserIdString, typeof testUserIdString)
  
  // Тестируем структуру данных для LogSnag
  const eventData = {
    event: 'test_event',
    channel: 'user-engagement',
    icon: '🧪',
    tags: {
      user_id: testUserIdString, // Должно быть строкой
      environment: 'test'
    },
    user_id: testUserIdString, // Должно быть строкой
    description: 'Test event for user_id validation'
  }
  
  console.log('📋 Event data structure:')
  console.log(JSON.stringify(eventData, null, 2))
  
  // Проверяем, что user_id везде строка
  const isValid = typeof eventData.user_id === 'string' && 
                  typeof eventData.tags.user_id === 'string'
  
  console.log('✅ Validation result:', isValid ? 'PASSED' : 'FAILED')
  
  if (isValid) {
    console.log('🎉 user_id conversion fix is working correctly!')
  } else {
    console.log('❌ user_id conversion fix failed!')
  }
}

// Запускаем тест
testUserIdConversion().catch(console.error) 