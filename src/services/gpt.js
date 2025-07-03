// GPT Service for checking user answers
export class GPTService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY
    this.apiUrl = 'https://api.openai.com/v1/chat/completions'
  }
  
  // Helper to minimize text for token usage
  minimizeText(text, maxChars = 900) {
    if (!text) return ''
    if (text.length <= maxChars) return text
    // Take first 400 and last 400 chars
    const start = text.slice(0, Math.floor(maxChars / 2))
    const end = text.slice(-Math.floor(maxChars / 2))
    return start + '\n...\n' + end
  }

  async checkAnswers(questions, userAnswers, targetLanguage, nativeLanguage, textContent) {
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. Using mock responses.')
      return this.getMockResults(questions, userAnswers)
    }
    
    try {
      const minimizedText = this.minimizeText(textContent)
      const prompt = this.buildPrompt(questions, userAnswers, targetLanguage, nativeLanguage, minimizedText)
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
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
  
  async generateText(prompt) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not found')
    }
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: 'You are a helpful language learning assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    return data.choices[0].message.content
  }

  buildPrompt(questions, userAnswers, targetLanguage, nativeLanguage, minimizedText) {
    const targetLangName = this.getLanguageName(targetLanguage)
    const nativeLangName = this.getLanguageName(nativeLanguage)
    
    return `Текст (${targetLangName}):\n${minimizedText}\n\nВопросы и ответы студента:\n${questions.map((q, i) => `${i + 1}. Вопрос: ${q}\n   Ответ студента: ${userAnswers[i] || 'Нет ответа'}`).join('\n')}\n\nПожалуйста, проанализируй каждый ответ и верни результат в следующем JSON формате:\n{\n  "results": [\n    {\n      "question": "вопрос",\n      "userAnswer": "ответ студента", \n      "correctedAnswer": "исправленный ответ",\n      "comment": "комментарий на ${nativeLangName} языке",\n      "score": 0.8\n    }\n  ]\n}\n\nКритерии оценки (0-1):\n- 0.0-0.3: Неправильный ответ или отсутствует\n- 0.4-0.6: Частично правильный ответ\n- 0.7-0.9: Правильный ответ с небольшими ошибками\n- 1.0: Полностью правильный ответ\n\nКомментарии должны быть на ${nativeLangName} языке и содержать полезные советы для улучшения.`
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