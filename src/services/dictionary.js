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
  static async getAllWords() {
    const { data, error } = await supabase
      .from('dictionary')
      .select('*')
      .order('word')
    
    if (error) {
      console.error('Error fetching dictionary:', error)
      return []
    }
    
    return data || []
  }

  // Get translation for a specific word
  static async getTranslation(word) {
    const { data, error } = await supabase
      .from('dictionary')
      .select('*')
      .eq('word', word.toLowerCase())
      .single()
    
    if (error) {
      console.error('Error fetching translation:', error)
      return null
    }
    
    return data
  }

  // Add a word to the dictionary
  static async addWord(word, translation, partOfSpeech = 'noun', difficulty = 'beginner') {
    const { data, error } = await supabase
      .from('dictionary')
      .insert({
        word: word.toLowerCase(),
        translation,
        part_of_speech: partOfSpeech,
        difficulty,
        created_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('Error adding word to dictionary:', error)
      return false
    }
    
    return true
  }

  // Update a word in the dictionary
  static async updateWord(word, translation, partOfSpeech, difficulty) {
    const { data, error } = await supabase
      .from('dictionary')
      .update({
        translation,
        part_of_speech: partOfSpeech,
        difficulty,
        updated_at: new Date().toISOString()
      })
      .eq('word', word.toLowerCase())
    
    if (error) {
      console.error('Error updating word in dictionary:', error)
      return false
    }
    
    return true
  }

  // Extract all words from texts and add them to dictionary
  static async buildDictionaryFromTexts() {
    try {
      // Get all texts
      const { data: texts, error: textsError } = await supabase
        .from('texts')
        .select('content')
      
      if (textsError) {
        console.error('Error fetching texts:', textsError)
        return false
      }

      // Extract all unique words
      const allWords = new Set()
      texts.forEach(text => {
        const words = this.extractWords(text.content)
        words.forEach(word => allWords.add(word))
      })

      // Get existing dictionary words
      const { data: existingWords, error: dictError } = await supabase
        .from('dictionary')
        .select('word')
      
      if (dictError) {
        console.error('Error fetching existing dictionary:', dictError)
        return false
      }

      const existingWordSet = new Set(existingWords.map(item => item.word))
      const newWords = [...allWords].filter(word => !existingWordSet.has(word))

      console.log(`Found ${newWords.length} new words to add to dictionary`)

      // Add new words with placeholder translations
      for (const word of newWords) {
        await this.addWord(word, `[Translation needed for: ${word}]`, 'unknown', 'unknown')
      }

      return true
    } catch (error) {
      console.error('Error building dictionary:', error)
      return false
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