import { supabase } from '../supabase.js'

// Dictionary service for managing word translations
export class DictionaryService {
  // Extract all unique words from a text
  static extractWords(text) {
    // Remove punctuation and convert to lowercase
    const cleanText = text.replace(/[^\w\s]/g, ' ').toLowerCase()
    // Split into words and filter out empty strings and common words
    const words = cleanText.split(/\s+/).filter(word => 
      word.length > 0 && 
      !this.isCommonWord(word) &&
      word.length > 2 // Filter out very short words
    )
    // Return unique words
    return [...new Set(words)]
  }

  // Check if a word is a common word that doesn't need translation
  static isCommonWord(word) {
    const commonWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
      'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs',
      'who', 'what', 'where', 'when', 'why', 'how', 'which', 'whose', 'whom',
      'if', 'then', 'else', 'when', 'while', 'before', 'after', 'until', 'since', 'because',
      'so', 'as', 'than', 'like', 'very', 'just', 'now', 'then', 'here', 'there', 'up', 'down',
      'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'all', 'any', 'both',
      'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
      'same', 'so', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'
    ]
    return commonWords.includes(word.toLowerCase())
  }

  // Get all words from the dictionary
  static async getAllWords(language = 'en') {
    try {
      const { data, error } = await supabase
        .from('dictionary')
        .select('*')
        .eq('language', language)
        .order('word', { ascending: true })

      if (error) {
        console.error('Error fetching words:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAllWords:', error)
      return []
    }
  }

  // Get translation for a word from text language to user's native language
  static async getTranslation(word, textLanguage, userNativeLanguage) {
    try {
      // First try to get the word in the text language
      const { data, error } = await supabase
        .from('dictionary')
        .select('*')
        .eq('word', word.toLowerCase())
        .eq('language', textLanguage)
        .single()

      if (error) {
        console.error('Error fetching translation:', error)
        return null
      }

      if (data) {
        // Get the translation to user's native language
        const translations = {
          en: data.translation_en,
          fr: data.translation_fr,
          es: data.translation_es,
          de: data.translation_de,
          uk: data.translation_uk
        }

        return {
          word: data.word,
          translation: translations[userNativeLanguage] || data.translation_en || word,
          part_of_speech: data.part_of_speech,
          difficulty: data.difficulty,
          text_language: textLanguage,
          native_language: userNativeLanguage
        }
      }

      return null
    } catch (error) {
      console.error('Error in getTranslation:', error)
      return null
    }
  }

  // Add a new word to the dictionary
  static async addWord(wordData) {
    try {
      const { data, error } = await supabase
        .from('dictionary')
        .insert([wordData])
        .select()

      if (error) {
        console.error('Error adding word:', error)
        throw error
      }

      return data[0]
    } catch (error) {
      console.error('Error in addWord:', error)
      throw error
    }
  }

  // Update an existing word
  static async updateWord(id, wordData) {
    try {
      const { data, error } = await supabase
        .from('dictionary')
        .update(wordData)
        .eq('id', id)
        .select()

      if (error) {
        console.error('Error updating word:', error)
        throw error
      }

      return data[0]
    } catch (error) {
      console.error('Error in updateWord:', error)
      throw error
    }
  }

  // Delete a word from the dictionary
  static async deleteWord(id) {
    try {
      const { error } = await supabase
        .from('dictionary')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting word:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Error in deleteWord:', error)
      throw error
    }
  }

  // Extract unique words from text content
  static extractUniqueWords(content) {
    if (!content) return []
    
    // Remove punctuation and split into words
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0)
    
    // Remove duplicates and return unique words
    return [...new Set(words)]
  }

  // Build dictionary from texts (extract unique words)
  static async buildDictionaryFromTexts(language = 'en') {
    try {
      // Get all texts for the language
      const { data: texts, error: textsError } = await supabase
        .from('texts')
        .select('content')
        .eq('language', language)

      if (textsError) {
        console.error('Error fetching texts:', textsError)
        throw textsError
      }

      // Extract all unique words from all texts
      const allWords = new Set()
      texts.forEach(text => {
        const words = this.extractUniqueWords(text.content)
        words.forEach(word => allWords.add(word))
      })

      // Get existing dictionary words
      const existingWords = await this.getAllWords(language)
      const existingWordSet = new Set(existingWords.map(w => w.word))

      // Find new words that aren't in the dictionary
      const newWords = Array.from(allWords).filter(word => !existingWordSet.has(word))

      // Add new words to dictionary (with basic translations)
      const wordsToAdd = newWords.map(word => ({
        word,
        language,
        translation_en: word, // Default to same word for English
        part_of_speech: 'unknown',
        difficulty: 'beginner'
      }))

      if (wordsToAdd.length > 0) {
        const { error: insertError } = await supabase
          .from('dictionary')
          .insert(wordsToAdd)

        if (insertError) {
          console.error('Error inserting new words:', insertError)
          throw insertError
        }
      }

      return {
        totalWords: allWords.size,
        newWordsAdded: wordsToAdd.length,
        existingWords: existingWords.length
      }
    } catch (error) {
      console.error('Error in buildDictionaryFromTexts:', error)
      throw error
    }
  }

  // Get translation for a word in multiple languages
  static async getMultiLanguageTranslation(word, targetLanguage = 'en') {
    try {
      const { data, error } = await supabase
        .from('dictionary')
        .select('*')
        .eq('word', word.toLowerCase())
        .eq('language', 'en') // Get the English entry which has all translations
        .single()

      if (error) {
        console.error('Error fetching multi-language translation:', error)
        return null
      }

      // Return the appropriate translation based on target language
      const translations = {
        en: data.translation_en,
        fr: data.translation_fr,
        es: data.translation_es,
        de: data.translation_de,
        uk: data.translation_uk
      }

      return {
        word: data.word,
        translation: translations[targetLanguage] || data.translation_en,
        part_of_speech: data.part_of_speech,
        difficulty: data.difficulty,
        all_translations: translations
      }
    } catch (error) {
      console.error('Error in getMultiLanguageTranslation:', error)
      return null
    }
  }

  // Search words in dictionary
  static async searchWords(query) {
    const { data, error } = await supabase
      .from('dictionary')
      .select('*')
      .ilike('word', `%${query}%`)
      .order('word')
      .limit(10)
    
    if (error) {
      console.error('Error searching dictionary:', error)
      return []
    }
    
    return data || []
  }
} 