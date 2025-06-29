import { supabase } from '../supabase.js'

export class UserPreferencesService {
  // Get user's native language preference
  static async getNativeLanguage(userId) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('native_language')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user preferences:', error)
        return 'en' // Default to English
      }

      return data?.native_language || 'en'
    } catch (error) {
      console.error('Error in getNativeLanguage:', error)
      return 'en' // Default to English
    }
  }

  // Set user's native language preference
  static async setNativeLanguage(userId, nativeLanguage) {
    try {
      // First, try to update existing record
      const { data: updateData, error: updateError } = await supabase
        .from('user_preferences')
        .update({
          native_language: nativeLanguage,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()

      if (updateError && updateError.code !== 'PGRST116') {
        console.error('Error updating native language:', updateError)
        throw updateError
      }

      // If no rows were updated, insert a new record
      if (!updateData || updateData.length === 0) {
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: userId,
            native_language: nativeLanguage,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('Error inserting native language:', insertError)
          throw insertError
        }
      }

      return true
    } catch (error) {
      console.error('Error in setNativeLanguage:', error)
      throw error
    }
  }

  // Get or create user preferences
  static async getUserPreferences(userId) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user preferences:', error)
        return { native_language: 'en' }
      }

      if (!data) {
        // Create default preferences
        const defaultPrefs = {
          user_id: userId,
          native_language: 'en'
        }
        
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert([defaultPrefs])

        if (insertError) {
          console.error('Error creating default preferences:', insertError)
          return { native_language: 'en' }
        }

        return defaultPrefs
      }

      return data
    } catch (error) {
      console.error('Error in getUserPreferences:', error)
      return { native_language: 'en' }
    }
  }

  // Update user preferences
  static async updateUserPreferences(userId, preferences) {
    try {
      // First, try to update existing record
      const { data: updateData, error: updateError } = await supabase
        .from('user_preferences')
        .update({
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()

      if (updateError && updateError.code !== 'PGRST116') {
        console.error('Error updating user preferences:', updateError)
        throw updateError
      }

      // If no rows were updated, insert a new record
      if (!updateData || updateData.length === 0) {
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: userId,
            ...preferences,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('Error inserting user preferences:', insertError)
          throw insertError
        }
      }

      return true
    } catch (error) {
      console.error('Error in updateUserPreferences:', error)
      throw error
    }
  }
} 