import { supabase } from '../supabase.js'

export class SavedWordsService {
  // Get all saved words for a user, joined with dictionary info
  static async getUserSavedWords(userId) {
    const { data, error } = await supabase
      .from('user_saved_words')
      .select(`
        id,
        saved_at,
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
      .order('saved_at', { ascending: false })
    if (error) throw error
    return data
  }

  // Get saved words filtered by language
  static async getUserSavedWordsByLanguage(userId, language) {
    const { data, error } = await supabase
      .from('user_saved_words')
      .select(`
        id,
        saved_at,
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
      .eq('dictionary.language', language)
      .order('saved_at', { ascending: false })
    if (error) throw error
    return data
  }

  // Save a word for a user
  static async saveWordForUser(userId, wordId) {
    const { data, error } = await supabase
      .from('user_saved_words')
      .insert({
        user_id: userId,
        word_id: wordId
      })
      .select()
    if (error) throw error
    return data[0]
  }

  // Remove a saved word for a user
  static async removeSavedWord(userId, wordId) {
    const { error } = await supabase
      .from('user_saved_words')
      .delete()
      .eq('user_id', userId)
      .eq('word_id', wordId)
    if (error) throw error
  }

  // Check if a word is saved by a user
  static async isWordSaved(userId, wordId) {
    const { data, error } = await supabase
      .from('user_saved_words')
      .select('id')
      .eq('user_id', userId)
      .eq('word_id', wordId)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return !!data
  }

  // Remove all saved words for a user
  static async clearAllSavedWords(userId) {
    const { error } = await supabase
      .from('user_saved_words')
      .delete()
      .eq('user_id', userId);
    if (error) throw error;
  }

  // Get available languages from saved words and folders
  static async getSavedWordsLanguages(userId) {
    try {
      // Get languages from saved words
      const { data: savedWordsData, error: savedError } = await supabase
        .from('user_saved_words')
        .select(`
          dictionary:word_id (
            language
          )
        `)
        .eq('user_id', userId)
      
      if (savedError) throw savedError
      
      // Get languages from folder words
      const { data: folderWordsData, error: folderError } = await supabase
        .from('user_folder_words')
        .select(`
          dictionary:word_id (
            language
          )
        `)
        .eq('user_id', userId)
      
      if (folderError) throw folderError
      
      // Combine and extract unique languages
      const allData = [...(savedWordsData || []), ...(folderWordsData || [])]
      const languages = [...new Set(allData.map(item => item.dictionary?.language).filter(Boolean))]
      
      // If no languages found, provide default languages
      if (languages.length === 0) {
        return ['fr', 'en', 'es', 'de', 'ru', 'uk']
      }
      
      return languages.sort()
    } catch (error) {
      console.error('Failed to get languages:', error)
      // Return default languages as fallback
      return ['fr', 'en', 'es', 'de', 'ru', 'uk']
    }
  }

  // Populate "All Words" folder with saved words
  static async populateAllWordsFolder(userId) {
    try {
      // Get the "All Words" folder
      const { data: folders } = await supabase
        .from('word_folders')
        .select('id')
        .eq('is_default', true)
        .single()
      
      if (!folders) return

      // Get all saved words
      const savedWords = await this.getUserSavedWords(userId)
      
      for (const savedWord of savedWords) {
        try {
          // Check if already present
          const { data: existing } = await supabase
            .from('user_folder_words')
            .select('id')
            .eq('user_id', userId)
            .eq('folder_id', folders.id)
            .eq('word_id', savedWord.dictionary.id)
            .single()
          if (!existing) {
            await supabase
              .from('user_folder_words')
              .insert({
                user_id: userId,
                folder_id: folders.id,
                word_id: savedWord.dictionary.id
              })
              .select()
          }
        } catch (error) {
          console.error('Failed to add word to All Words folder:', error)
        }
      }
    } catch (error) {
      console.error('Failed to populate All Words folder:', error)
    }
  }

  // Save a word from the reading text (with translation and language info)
  static async saveWordFromText(userId, word, translation, targetLanguage, nativeLanguage) {
    // 1. Check if word exists in dictionary for this language
    let { data: dictRows, error: dictError } = await supabase
      .from('dictionary')
      .select('*')
      .eq('word', word)
      .eq('language', targetLanguage)
      .limit(1)
    if (dictError) throw dictError
    let dictId
    if (dictRows && dictRows.length > 0) {
      dictId = dictRows[0].id
      // Optionally update translation if missing
      const translationCol = `translation_${nativeLanguage}`
      if (!dictRows[0][translationCol] && translation) {
        await supabase
          .from('dictionary')
          .update({ [translationCol]: translation })
          .eq('id', dictId)
      }
    } else {
      // Insert new dictionary entry
      const insertObj = {
        word,
        language: targetLanguage,
        [`translation_${nativeLanguage}`]: translation
      }
      const { data: newDict, error: insertError } = await supabase
        .from('dictionary')
        .insert(insertObj)
        .select()
        .single()
      if (insertError) throw insertError
      dictId = newDict.id
    }
    // 2. Insert into user_saved_words if not already present
    const { data: existing, error: existError } = await supabase
      .from('user_saved_words')
      .select('id')
      .eq('user_id', userId)
      .eq('word_id', dictId)
      .maybeSingle()
    if (existError && existError.code !== 'PGRST116') throw existError
    if (!existing) {
      const { error: saveError } = await supabase
        .from('user_saved_words')
        .insert({ user_id: userId, word_id: dictId })
      if (saveError) throw saveError
    }
    return { word, translation, dictId }
  }
} 