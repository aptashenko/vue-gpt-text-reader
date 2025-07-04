import { supabase } from '../supabase.js'
import { gptService } from './gpt.js'

export class FoldersService {
  // Get all available folders
  static async getFolders() {
    const { data, error } = await supabase
      .from('word_folders')
      .select('*')
      .order('is_default', { ascending: false })
      .order('name')
    
    if (error) throw error
    return data
  }

  // Get words in a specific folder for a user by status
  static async getFolderWords(userId, folderId, status = null) {
    let query = supabase
      .from('user_folder_words')
      .select(`
        id,
        added_at,
        word_status,
        dictionary:word_id (
          id,
          word,
          language,
          translation_en,
          translation_fr,
          translation_es,
          translation_de,
          translation_uk,
          translation_ru,
          part_of_speech,
          difficulty
        )
      `)
      .eq('user_id', userId)
      .eq('folder_id', folderId)
      .order('added_at', { ascending: false })
    
    if (status) {
      query = query.eq('word_status', status)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  }

  // Get known words in a folder
  static async getKnownWords(userId, folderId) {
    try {
      return await this.getFolderWords(userId, folderId, 'known')
    } catch (error) {
      // If word_status column doesn't exist, return empty array
      console.log('getKnownWords failed, word_status column may not exist:', error.message)
      return []
    }
  }

  // Get unknown words in a folder
  static async getUnknownWords(userId, folderId) {
    try {
      return await this.getFolderWords(userId, folderId, 'unknown')
    } catch (error) {
      // If word_status column doesn't exist, return all words as unknown
      console.log('getUnknownWords failed, falling back to all words:', error.message)
      return await this.getFolderWords(userId, folderId)
    }
  }

  // Update word status (known/unknown)
  static async updateWordStatus(userId, folderId, wordId, status) {
    try {
      const { data, error } = await supabase
        .from('user_folder_words')
        .update({ word_status: status })
        .eq('user_id', userId)
        .eq('folder_id', folderId)
        .eq('word_id', wordId)
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.log('updateWordStatus failed, word_status column may not exist:', error.message)
      throw error
    }
  }

  // Mark word as known
  static async markWordAsKnown(userId, folderId, wordId) {
    try {
      return await this.updateWordStatus(userId, folderId, wordId, 'known')
    } catch (error) {
      console.log('markWordAsKnown failed:', error.message)
      throw error
    }
  }

  // Mark word as unknown
  static async markWordAsUnknown(userId, folderId, wordId) {
    try {
      return await this.updateWordStatus(userId, folderId, wordId, 'unknown')
    } catch (error) {
      console.log('markWordAsUnknown failed:', error.message)
      throw error
    }
  }

  // Get word counts by status for a folder
  static async getFolderWordCountsByStatus(userId, folderId) {
    try {
      const { data, error } = await supabase
        .from('user_folder_words')
        .select('word_status')
        .eq('user_id', userId)
        .eq('folder_id', folderId)
      
      if (error) throw error
      
      const counts = { known: 0, unknown: 0 }
      data.forEach(item => {
        counts[item.word_status]++
      })
      
      return counts
    } catch (error) {
      console.log('getFolderWordCountsByStatus failed, word_status column may not exist:', error.message)
      // Return default counts if column doesn't exist
      return { known: 0, unknown: 0 }
    }
  }

  // Add a word to a folder
  static async addWordToFolder(userId, folderId, wordId, status = 'unknown') {
    const { data, error } = await supabase
      .from('user_folder_words')
      .insert({
        user_id: userId,
        folder_id: folderId,
        word_id: wordId,
        word_status: status
      })
      .select()
    
    if (error) throw error
    return data[0]
  }

  // Remove a word from a folder
  static async removeWordFromFolder(userId, folderId, wordId) {
    const { error } = await supabase
      .from('user_folder_words')
      .delete()
      .eq('user_id', userId)
      .eq('folder_id', folderId)
      .eq('word_id', wordId)
    
    if (error) throw error
  }

  // Get folder info
  static async getFolder(folderId) {
    const { data, error } = await supabase
      .from('word_folders')
      .select('*')
      .eq('id', folderId)
      .single()
    
    if (error) throw error
    return data
  }

  // Generate new words for a thematic folder using GPT
  static async generateWordsForFolder(userId, folderId, userNativeLanguage = 'en', targetLanguage = 'fr') {
    try {
      // Get folder info
      const folder = await this.getFolder(folderId)
      if (folder.is_default) {
        throw new Error('Cannot generate words for default folder')
      }

      // Get existing words in the current folder to avoid duplicates
      const existingWords = await this.getFolderWords(userId, folderId)
      const existingWordList = existingWords.map(item => item.dictionary.word.toLowerCase())

      // Map language codes to language names for the prompt
      const languageNames = {
        fr: 'French',
        en: 'English',
        es: 'Spanish',
        de: 'German',
        ru: 'Russian',
        uk: 'Ukrainian'
      }
      const userNativeLanguageName = languageNames[userNativeLanguage] || userNativeLanguage
      const targetLanguageName = languageNames[targetLanguage] || targetLanguage

      // Generate prompt for GPT
      const prompt = `Generate 10 unique ${folder.theme}-related words in ${targetLanguageName} that are useful for language learning.\nEach word should be:\n- Relevant to the theme: ${folder.name}\n- Common and practical for everyday use\n- Not too advanced (beginner to intermediate level)\n- Include the part of speech (noun, verb, adjective, etc.)\n\nTranslate each word into ${userNativeLanguageName}.\n\nFormat the response as a JSON array with this structure:\n[\n  {\n    "word": "the word in ${targetLanguageName}",\n    "translation": "the translation in ${userNativeLanguageName}",\n    "part_of_speech": "noun/verb/adjective/etc"\n  }\n]\n\nDo NOT include any words from this list (already in the folder): ${existingWordList.join(', ')}`

      // Call GPT service
      const response = await gptService.generateText(prompt)
      
      // Parse the response
      let words
      try {
        // Try to extract JSON from the response
        const jsonMatch = response.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          words = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No valid JSON found in response')
        }
      } catch (parseError) {
        console.error('Failed to parse GPT response:', response)
        throw new Error('Failed to parse generated words')
      }

      // Add words to dictionary and folder
      const addedWords = []
      for (const wordData of words) {
        try {
          // First, add to dictionary
          const { data: dictData, error: dictError } = await supabase
            .from('dictionary')
            .insert({
              word: wordData.word,
              language: targetLanguage,
              translation_en: wordData.translation,
              part_of_speech: wordData.part_of_speech,
              difficulty: 'intermediate'
            })
            .select()
            .single()

          if (dictError) {
            // Word might already exist, try to find it
            const { data: existingWord } = await supabase
              .from('dictionary')
              .select('id')
              .eq('word', wordData.word)
              .eq('language', targetLanguage)
              .single()

            if (existingWord) {
              // Add existing word to folder
              await this.addWordToFolder(userId, folderId, existingWord.id, 'unknown')
              addedWords.push({
                word: wordData.word,
                translation: wordData.translation,
                part_of_speech: wordData.part_of_speech
              })
            }
          } else {
            // Add new word to folder
            await this.addWordToFolder(userId, folderId, dictData.id, 'unknown')
            addedWords.push({
              word: wordData.word,
              translation: wordData.translation,
              part_of_speech: wordData.part_of_speech
            })
          }
        } catch (wordError) {
          console.error('Failed to add word:', wordData.word, wordError)
          // Continue with other words
        }
      }

      return addedWords
    } catch (error) {
      console.error('Failed to generate words:', error)
      throw error
    }
  }

  // Get word count for a folder by language
  static async getFolderWordCountByLanguage(userId, folderId, language) {
    const { count, error } = await supabase
      .from('user_folder_words')
      .select(`
        dictionary:word_id (
          language
        )
      `, { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('folder_id', folderId)
      .eq('dictionary.language', language)
    
    if (error) throw error
    return count || 0
  }

  // Get word count for a folder
  static async getFolderWordCount(userId, folderId) {
    const { count, error } = await supabase
      .from('user_folder_words')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('folder_id', folderId)
    
    if (error) throw error
    return count || 0
  }

  // Batch fetch all user_folder_words for a user, returning folderId and language for each word
  static async getAllFolderWordMeta(userId) {
    const { data, error } = await supabase
      .from('user_folder_words')
      .select(`
        folder_id,
        word_status,
        dictionary:word_id (
          language
        )
      `)
      .eq('user_id', userId)
    
    if (error) throw error
    return data
  }
} 