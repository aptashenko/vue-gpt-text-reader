// Simple test for text import functionality
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'your_supabase_url_here'
const supabaseKey = 'your_anon_key_here'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testImport() {
  try {
    console.log('🧪 Testing text import functionality...')
    
    // Test data
    const testText = {
      title: "Test Text",
      content: "This is a test text for import functionality.",
      language: "en",
      level: "A1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log('📝 Attempting to insert test text...')
    
    // Try to insert a text
    const { data: insertedText, error: textError } = await supabase
      .from('texts')
      .insert(testText)
      .select()
    
    if (textError) {
      console.error('❌ Text insertion failed:', textError)
      console.error('Error details:', {
        message: textError.message,
        details: textError.details,
        hint: textError.hint,
        code: textError.code
      })
      return
    }
    
    console.log('✅ Text insertion successful:', insertedText)
    
    if (insertedText && insertedText.length > 0) {
      const textId = insertedText[0].id
      console.log(`📋 Inserted text ID: ${textId}`)
      
      // Try to insert a test question
      const testQuestion = {
        text_id: textId,
        question_text: "What is this text about?",
        question_number: 1,
        question_type: "comprehension",
        difficulty: "A1",
        created_at: new Date().toISOString()
      }
      
      console.log('❓ Attempting to insert test question...')
      
      const { data: insertedQuestion, error: questionError } = await supabase
        .from('text_questions')
        .insert(testQuestion)
        .select()
      
      if (questionError) {
        console.error('❌ Question insertion failed:', questionError)
        console.error('Error details:', {
          message: questionError.message,
          details: questionError.details,
          hint: questionError.hint,
          code: questionError.code
        })
      } else {
        console.log('✅ Question insertion successful:', insertedQuestion)
      }
      
      // Try to insert a test word
      const testWord = {
        word: "test",
        language: "en",
        translation_en: "test",
        translation_fr: "test",
        translation_es: "prueba",
        translation_de: "test",
        translation_uk: "тест",
        translation_ru: "тест",
        part_of_speech: "noun",
        difficulty: "A1",
        created_at: new Date().toISOString()
      }
      
      console.log('📚 Attempting to insert test word...')
      
      const { data: insertedWord, error: wordError } = await supabase
        .from('dictionary')
        .upsert(testWord, { 
          onConflict: 'word,language',
          ignoreDuplicates: true 
        })
        .select()
      
      if (wordError) {
        console.error('❌ Word insertion failed:', wordError)
        console.error('Error details:', {
          message: wordError.message,
          details: wordError.details,
          hint: wordError.hint,
          code: wordError.code
        })
      } else {
        console.log('✅ Word insertion successful:', insertedWord)
      }
      
      // Clean up test data
      console.log('🧹 Cleaning up test data...')
      
      if (insertedQuestion) {
        await supabase
          .from('text_questions')
          .delete()
          .eq('id', insertedQuestion[0].id)
      }
      
      await supabase
        .from('texts')
        .delete()
        .eq('id', textId)
      
      console.log('✅ Test completed and cleaned up!')
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

testImport() 