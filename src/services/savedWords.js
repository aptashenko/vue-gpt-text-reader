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
    // Filter out any null dictionary joins
    return (data || []).filter(item => item.dictionary)
  }

  // Save a word for a user
  static async saveWordForUser(userId, wordId) {
    const { error } = await supabase
      .from('user_saved_words')
      .insert({ user_id: userId, word_id: wordId })
    if (error) throw error
    return true
  }

  // Remove a saved word for a user
  static async removeSavedWordForUser(userId, wordId) {
    const { error } = await supabase
      .from('user_saved_words')
      .delete()
      .eq('user_id', userId)
      .eq('word_id', wordId)
    if (error) throw error
    return true
  }
} 