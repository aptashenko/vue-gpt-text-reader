import { supabase } from '../supabase'

export async function getTextCount(language, level) {
  
  try {
    // Try different possible column name combinations
    let query = supabase
      .from('texts')
      .select('*', { count: 'exact', head: true })
    
    // Add language filter - try different column names
    if (language) {
      query = query.eq('language', language)
    }
    
    // Add level filter - try different column names  
    if (level) {
      query = query.eq('level', level)
    }
    
    const { count, error } = await query
    
    
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    return count || 0
  } catch (err) {
    console.error('Exception in getTextCount:', err)
    return 0
  }
} 