import { supabase } from '../supabase'

export async function getTextCount(language, level) {
  console.log('getTextCount called with:', { language, level })
  
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
    
    console.log('Executing query for language:', language, 'level:', level)
    const { count, error } = await query
    
    
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    console.log('Final count:', count)
    return count || 0
  } catch (err) {
    console.error('Exception in getTextCount:', err)
    return 0
  }
} 