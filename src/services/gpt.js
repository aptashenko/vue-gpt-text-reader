// GPT Service for checking user answers
export class GPTService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY
    this.apiUrl = 'https://api.openai.com/v1/chat/completions'
  }
  
  async checkAnswers(questions, userAnswers, targetLanguage, nativeLanguage) {
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. Using mock responses.')
      return this.getMockResults(questions, userAnswers)
    }
    
    try {
      const prompt = this.buildPrompt(questions, userAnswers, targetLanguage, nativeLanguage)
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful language learning assistant. You evaluate student answers to reading comprehension questions.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      const content = data.choices[0].message.content
      
      return this.parseGPTResponse(content)
      
    } catch (error) {
      console.error('Error calling GPT API:', error)
      return this.getMockResults(questions, userAnswers)
    }
  }
  
  buildPrompt(questions, userAnswers, targetLanguage, nativeLanguage) {
    const targetLangName = this.getLanguageName(targetLanguage)
    const nativeLangName = this.getLanguageName(nativeLanguage)
    
    return `
Проверь ответы студента на вопросы по тексту на ${targetLangName} языке.

Вопросы и ответы студента:
${questions.map((q, i) => `${i + 1}. Вопрос: ${q}\n   Ответ студента: ${userAnswers[i] || 'Нет ответа'}`).join('\n')}

Пожалуйста, проанализируй каждый ответ и верни результат в следующем JSON формате:
{
  "results": [
    {
      "question": "вопрос",
      "userAnswer": "ответ студента", 
      "correctedAnswer": "исправленный ответ",
      "comment": "комментарий на ${nativeLangName} языке",
      "score": 0.8
    }
  ]
}

Критерии оценки (0-1):
- 0.0-0.3: Неправильный ответ или отсутствует
- 0.4-0.6: Частично правильный ответ
- 0.7-0.9: Правильный ответ с небольшими ошибками
- 1.0: Полностью правильный ответ

Комментарии должны быть на ${nativeLangName} языке и содержать полезные советы для улучшения.
`
  }
  
  parseGPTResponse(content) {
    try {
      // Ищем JSON в ответе
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('No JSON found in response')
    } catch (error) {
      console.error('Error parsing GPT response:', error)
      return null
    }
  }
  
  getMockResults(questions, userAnswers) {
    return {
      results: questions.map((question, index) => ({
        question,
        userAnswer: userAnswers[index] || 'Нет ответа',
        correctedAnswer: this.getMockCorrectedAnswer(question, userAnswers[index]),
        comment: this.getMockComment(userAnswers[index]),
        score: this.getMockScore(userAnswers[index])
      }))
    }
  }
  
  getMockCorrectedAnswer(question, userAnswer) {
    if (!userAnswer || userAnswer.trim() === '') {
      return 'Попробуйте ответить на вопрос'
    }
    
    // Простая логика для демо
    if (question.toLowerCase().includes('heure') || question.toLowerCase().includes('time')) {
      return 'Jean se lève à 7h.'
    }
    if (question.toLowerCase().includes('où') || question.toLowerCase().includes('where')) {
      return 'Il va à l\'école.'
    }
    
    return userAnswer + ' (проверьте грамматику)'
  }
  
  getMockComment(userAnswer) {
    if (!userAnswer || userAnswer.trim() === '') {
      return 'Попробуйте дать более развернутый ответ'
    }
    if (userAnswer.length < 5) {
      return 'Ответ слишком короткий, добавьте больше деталей'
    }
    return 'Хороший ответ! Обратите внимание на правильное использование артиклей'
  }
  
  getMockScore(userAnswer) {
    if (!userAnswer || userAnswer.trim() === '') {
      return 0.0
    }
    if (userAnswer.length < 5) {
      return 0.3
    }
    return 0.7 + Math.random() * 0.2 // 0.7-0.9
  }
  
  getLanguageName(code) {
    const languages = {
      'en': 'английском',
      'fr': 'французском',
      'es': 'испанском',
      'de': 'немецком',
      'uk': 'украинском',
      'ru': 'русском'
    }
    return languages[code] || code
  }
}

export const gptService = new GPTService() 