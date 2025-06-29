import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- VITE_SUPABASE_URL')
  console.error('- VITE_SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function importFrenchText() {
  try {
    console.log('📚 Importing French text: "Le Chat de Lucie"')
    
    // Read the JSON file
    const jsonData = JSON.parse(fs.readFileSync('test-import.json', 'utf8'))
    
    console.log('✅ JSON parsed successfully')
    console.log(`📖 Text: ${jsonData.text.title}`)
    console.log(`❓ Questions: ${jsonData.text.questions.length}`)
    console.log(`📚 Dictionary words: ${jsonData.dictionary.length}`)
    
    // 1. Import the text
    const textData = {
      title: jsonData.text.title,
      content: jsonData.text.content,
      language: jsonData.text.language,
      level: jsonData.text.level,
      question1: jsonData.text.questions[0]?.questionText || '',
      question2: jsonData.text.questions[1]?.questionText || ''
    }
    
    console.log('📝 Inserting text...')
    const { data: insertedText, error: textError } = await supabase
      .from('texts')
      .insert([textData])
      .select()
    
    if (textError) {
      console.error('❌ Text import error:', textError)
      return
    }
    
    console.log('✅ Text imported successfully:', insertedText[0].title)
    const textId = insertedText[0].id
    
    // 2. Import questions
    console.log('❓ Inserting questions...')
    let questionCount = 0
    
    for (const question of jsonData.text.questions) {
      const { error: questionError } = await supabase
        .from('text_questions')
        .insert({
          text_id: textId,
          question_text: question.questionText,
          question_number: question.questionNumber,
          question_type: question.questionType,
          difficulty: question.difficulty
        })
      
      if (!questionError) {
        questionCount++
        console.log(`✅ Question ${question.questionNumber} imported`)
      } else {
        console.warn(`⚠️ Question ${question.questionNumber} failed:`, questionError.message)
      }
    }
    
    // 3. Import dictionary words
    console.log('📚 Inserting dictionary words...')
    const wordsToAdd = jsonData.dictionary.map(word => ({
      word: word.word,
      language: word.language,
      translation: word.translation_en || word.word,
      translation_en: word.translation_en || word.word,
      translation_fr: word.translation_fr || '',
      translation_es: word.translation_es || '',
      translation_de: word.translation_de || '',
      translation_uk: word.translation_uk || '',
      part_of_speech: word.part_of_speech || 'noun',
      difficulty: word.difficulty || 'beginner'
    }))
    
    let wordCount = 0
    
    for (const word of wordsToAdd) {
      const { error: wordError } = await supabase
        .from('dictionary')
        .insert([word])
      
      if (!wordError) {
        wordCount++
        console.log(`✅ Word imported: ${word.word} → ${word.translation_en}`)
      } else {
        console.warn(`⚠️ Word import failed: ${word.word} - ${wordError.message}`)
      }
    }
    
    // Summary
    console.log('\n🎉 Import completed successfully!')
    console.log(`📖 Text: ${insertedText[0].title} (ID: ${textId})`)
    console.log(`❓ Questions: ${questionCount}/${jsonData.text.questions.length}`)
    console.log(`📚 Dictionary words: ${wordCount}/${jsonData.dictionary.length}`)
    console.log('\n🔗 You can now view the text at:')
    console.log(`http://localhost:5174/reader/${textId}`)
    
  } catch (error) {
    console.error('❌ Import failed:', error)
  }
}

importFrenchText() 