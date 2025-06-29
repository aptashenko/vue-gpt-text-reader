// Text Import Service
import { supabase } from '../supabase.js'
import { useAuthStore } from '../stores/auth.js'

export class TextImportService {
  constructor() {
    this.texts = []
  }
  
  // Get the appropriate Supabase client based on auth state
  getSupabaseClient() {
    const authStore = useAuthStore()
    
    // If in guest mode, use service role key to bypass RLS
    if (authStore.isGuestMode) {
      // Create a new client with service role key
      const { createClient } = require('@supabase/supabase-js')
      const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
      
      if (serviceKey) {
        return createClient(
          import.meta.env.VITE_SUPABASE_URL,
          serviceKey,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        )
      }
    }
    
    // Otherwise use the regular client
    return supabase
  }
  
  // Import texts from JSON file
  async importFromFile(file) {
    try {
      const text = await file.text()
      const jsonData = JSON.parse(text)
      
      const textsToImport = Array.isArray(jsonData) ? jsonData : [jsonData]
      
      // Validate all texts before importing
      const validation = this.validateAllTexts(textsToImport)
      if (!validation.valid) {
        return {
          success: false,
          error: `Ошибки валидации: ${validation.errors.join(', ')}`
        }
      }
      
      // Save texts to database
      const result = await this.saveTextsToDatabase(textsToImport)
      
      if (result.success) {
        this.texts = textsToImport
        return {
          success: true,
          count: textsToImport.length,
          message: `Успешно импортировано ${textsToImport.length} текстов в базу данных`
        }
      } else {
        return result
      }
    } catch (error) {
      console.error('Error importing texts:', error)
      return {
        success: false,
        error: 'Ошибка при импорте файла. Проверьте формат JSON.'
      }
    }
  }
  
  // Import texts from JSON string
  async importFromJSON(jsonString) {
    try {
      const jsonData = JSON.parse(jsonString)
      
      const textsToImport = Array.isArray(jsonData) ? jsonData : [jsonData]
      
      // Validate all texts before importing
      const validation = this.validateAllTexts(textsToImport)
      if (!validation.valid) {
        return {
          success: false,
          error: `Ошибки валидации: ${validation.errors.join(', ')}`
        }
      }
      
      // Save texts to database
      const result = await this.saveTextsToDatabase(textsToImport)
      
      if (result.success) {
        this.texts = textsToImport
        return {
          success: true,
          count: textsToImport.length,
          message: `Успешно импортировано ${textsToImport.length} текстов в базу данных`
        }
      } else {
        return result
      }
    } catch (error) {
      console.error('Error importing from JSON:', error)
      return {
        success: false,
        error: 'Ошибка при парсинге JSON'
      }
    }
  }
  
  // Save texts to Supabase database
  async saveTextsToDatabase(texts) {
    try {
      const textsToInsert = []
      const wordsToInsert = []
      const questionsToInsert = []
      
      for (const text of texts) {
        // Prepare text data for database
        const textData = {
          title: text.title,
          content: text.text,
          language: text.target_language,
          level: text.level,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        textsToInsert.push(textData)
      }
      
      // Get the appropriate Supabase client
      let client = supabase
      
      // If in guest mode, try to use service role key
      const authStore = useAuthStore()
      if (authStore.isGuestMode) {
        const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
        if (serviceKey) {
          const { createClient } = await import('@supabase/supabase-js')
          client = createClient(
            import.meta.env.VITE_SUPABASE_URL,
            serviceKey,
            {
              auth: {
                autoRefreshToken: false,
                persistSession: false
              }
            }
          )
        }
      }
      
      // Insert texts first
      const { data: insertedTexts, error: textError } = await client
        .from('texts')
        .insert(textsToInsert)
        .select()
      
      if (textError) {
        console.error('Error inserting texts:', textError)
        return {
          success: false,
          error: `Ошибка при сохранении текстов: ${textError.message}`
        }
      }
      
      console.log('Successfully inserted texts:', insertedTexts)
      
      // Only proceed with words and questions if texts were successfully inserted
      if (!insertedTexts || insertedTexts.length === 0) {
        return {
          success: false,
          error: 'Тексты не были вставлены в базу данных'
        }
      }
      
      // Insert words and questions for each successfully inserted text
      for (let i = 0; i < texts.length; i++) {
        const text = texts[i]
        const insertedText = insertedTexts[i]
        
        if (!insertedText || !insertedText.id) {
          console.error('Text was not properly inserted:', text.title)
          continue
        }
        
        console.log(`Processing text "${text.title}" with ID: ${insertedText.id}`)
        
        // Insert words into dictionary and link them to text
        for (let j = 0; j < text.words.length; j++) {
          const wordData = text.words[j]
          
          console.log(`Processing word ${j + 1}/${text.words.length}: "${wordData.word}"`)
          
          // First, insert or get the word from dictionary
          const wordRecord = {
            word: wordData.word,
            language: text.target_language,
            translation_en: wordData.translations.en || wordData.word,
            translation_fr: wordData.translations.fr || wordData.word,
            translation_es: wordData.translations.es || wordData.word,
            translation_de: wordData.translations.de || wordData.word,
            translation_uk: wordData.translations.uk || wordData.word,
            translation_ru: wordData.translations.ru || wordData.word,
            part_of_speech: wordData.part_of_speech || 'unknown',
            difficulty: text.level,
            created_at: new Date().toISOString()
          }
          
          console.log('Word record to insert:', wordRecord)
          
          // Insert word into dictionary (upsert to avoid duplicates)
          const { data: insertedWord, error: wordError } = await client
            .from('dictionary')
            .upsert([wordRecord], { 
              onConflict: 'word,language',
              ignoreDuplicates: false 
            })
            .select()
            .single()
          
          if (wordError) {
            console.error('Error inserting word:', wordError)
            console.error('Word error details:', {
              message: wordError.message,
              details: wordError.details,
              hint: wordError.hint,
              code: wordError.code
            })
            continue
          }
          
          console.log('Word inserted successfully:', insertedWord)
          
          // Link word to text using text_words table
          if (insertedWord) {
            const textWordRecord = {
              text_id: insertedText.id,
              word_id: insertedWord.id,
              word_order: j + 1
            }
            
            console.log('Linking word to text:', textWordRecord)
            
            const { error: textWordError } = await client
              .from('text_words')
              .insert(textWordRecord)
            
            if (textWordError) {
              console.error('Error linking word to text:', textWordError)
              console.error('Text word error details:', {
                message: textWordError.message,
                details: textWordError.details,
                hint: textWordError.hint,
                code: textWordError.code
              })
            } else {
              console.log(`✅ Linked word "${wordData.word}" to text "${text.title}"`)
            }
          } else {
            console.error('Word was not inserted, cannot link to text')
          }
        }
        
        // Insert questions for this specific text
        for (let j = 0; j < text.questions.length; j++) {
          const questionRecord = {
            text_id: insertedText.id, // Use the actual inserted text ID
            question_text: text.questions[j],
            question_number: j + 1,
            question_type: 'comprehension',
            difficulty: text.level,
            created_at: new Date().toISOString()
          }
          
          questionsToInsert.push(questionRecord)
        }
      }
      
      // Insert questions
      if (questionsToInsert.length > 0) {
        console.log('Attempting to insert questions:', questionsToInsert)
        const { data: insertedQuestions, error: questionError } = await client
          .from('text_questions')
          .insert(questionsToInsert)
          .select()
        
        if (questionError) {
          console.error('Error inserting questions:', questionError)
          console.error('Question error details:', {
            message: questionError.message,
            details: questionError.details,
            hint: questionError.hint,
            code: questionError.code
          })
          
          // Don't fail the entire import if questions fail
          // Just log the error and continue
          console.warn('Question insertion failed, but continuing with text import')
        } else {
          console.log('Successfully inserted questions:', insertedQuestions)
        }
      }
      
      return {
        success: true,
        textsInserted: insertedTexts.length,
        wordsInserted: wordsToInsert.length,
        questionsInserted: questionsToInsert.length
      }
      
    } catch (error) {
      console.error('Error saving texts to database:', error)
      return {
        success: false,
        error: `Ошибка при сохранении в базу данных: ${error.message}`
      }
    }
  }
  
  // Get all imported texts
  getAllTexts() {
    return this.texts
  }
  
  // Get texts by language and level
  getTextsByLanguageAndLevel(targetLanguage, level) {
    return this.texts.filter(text => 
      text.target_language === targetLanguage && 
      text.level === level
    )
  }
  
  // Get random text by language and level
  getRandomText(targetLanguage, level) {
    const filteredTexts = this.getTextsByLanguageAndLevel(targetLanguage, level)
    
    if (filteredTexts.length === 0) {
      return null
    }
    
    const randomIndex = Math.floor(Math.random() * filteredTexts.length)
    return filteredTexts[randomIndex]
  }
  
  // Validate text format
  validateText(text) {
    const requiredFields = ['title', 'level', 'target_language', 'text', 'words', 'questions']
    
    for (const field of requiredFields) {
      if (!text[field]) {
        return {
          valid: false,
          error: `Отсутствует обязательное поле: ${field}`
        }
      }
    }
    
    if (!Array.isArray(text.words) || text.words.length === 0) {
      return {
        valid: false,
        error: 'Поле words должно быть массивом и содержать хотя бы одно слово'
      }
    }
    
    if (!Array.isArray(text.questions) || text.questions.length === 0) {
      return {
        valid: false,
        error: 'Поле questions должно быть массивом и содержать хотя бы один вопрос'
      }
    }
    
    // Validate words format
    for (const word of text.words) {
      if (!word.word || !word.translations) {
        return {
          valid: false,
          error: 'Каждое слово должно содержать поле word и translations'
        }
      }
    }
    
    return { valid: true }
  }
  
  // Validate all texts
  validateAllTexts(texts) {
    const errors = []
    
    for (let i = 0; i < texts.length; i++) {
      const validation = this.validateText(texts[i])
      if (!validation.valid) {
        errors.push(`Текст ${i + 1}: ${validation.error}`)
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
  
  // Clear all texts
  clear() {
    this.texts = []
  }
  
  // Clear all texts from database
  async clearFromDatabase() {
    try {
      // Delete all questions first (due to foreign key constraints)
      const { error: questionError } = await this.getSupabaseClient()
        .from('text_questions')
        .delete()
        .neq('id', 0) // Delete all records
      
      if (questionError) {
        console.error('Error deleting questions:', questionError)
        return {
          success: false,
          error: `Ошибка при удалении вопросов: ${questionError.message}`
        }
      }
      
      // Delete all texts
      const { error: textError } = await this.getSupabaseClient()
        .from('texts')
        .delete()
        .neq('id', 0) // Delete all records
      
      if (textError) {
        console.error('Error deleting texts:', textError)
        return {
          success: false,
          error: `Ошибка при удалении текстов: ${textError.message}`
        }
      }
      
      // Clear local texts
      this.texts = []
      
      return {
        success: true,
        message: 'Все тексты успешно удалены из базы данных'
      }
      
    } catch (error) {
      console.error('Error clearing database:', error)
      return {
        success: false,
        error: `Ошибка при очистке базы данных: ${error.message}`
      }
    }
  }
  
  // Get available languages
  getAvailableLanguages() {
    const languages = new Set()
    this.texts.forEach(text => {
      if (text.target_language) {
        languages.add(text.target_language)
      }
    })
    return Array.from(languages)
  }
  
  // Get available levels
  getAvailableLevels() {
    const levels = new Set()
    this.texts.forEach(text => {
      if (text.level) {
        levels.add(text.level)
      }
    })
    return Array.from(levels)
  }
  
  // Get statistics
  getStatistics() {
    const languages = this.getAvailableLanguages()
    const levels = this.getAvailableLevels()
    
    const stats = {
      total: this.texts.length,
      byLanguage: {},
      byLevel: {},
      byLanguageAndLevel: {}
    }
    
    // Count by language
    languages.forEach(lang => {
      stats.byLanguage[lang] = this.texts.filter(t => t.target_language === lang).length
    })
    
    // Count by level
    levels.forEach(level => {
      stats.byLevel[level] = this.texts.filter(t => t.level === level).length
    })
    
    // Count by language and level
    languages.forEach(lang => {
      stats.byLanguageAndLevel[lang] = {}
      levels.forEach(level => {
        stats.byLanguageAndLevel[lang][level] = this.texts.filter(
          t => t.target_language === lang && t.level === level
        ).length
      })
    })
    
    return stats
  }
}

export const textImportService = new TextImportService() 