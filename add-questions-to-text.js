import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

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

async function addQuestionsToText() {
  try {
    console.log('❓ Adding questions to "Le Chat de Lucie" (ID: 22)')
    
    const questions = [
      {
        questionText: "Comment s'appelle le chat de Lucie ?",
        questionNumber: 1,
        questionType: "comprehension",
        difficulty: "easy"
      },
      {
        questionText: "Qu'est-ce que Minou aime faire ?",
        questionNumber: 2,
        questionType: "comprehension",
        difficulty: "easy"
      },
      {
        questionText: "Pourquoi Minou ronronne-t-il ?",
        questionNumber: 3,
        questionType: "analysis",
        difficulty: "medium"
      }
    ]
    
    let successCount = 0
    
    for (const question of questions) {
      const { error: questionError } = await supabase
        .from('text_questions')
        .insert({
          text_id: 22, // The ID of "Le Chat de Lucie"
          question_text: question.questionText,
          question_number: question.questionNumber,
          question_type: question.questionType,
          difficulty: question.difficulty
        })
      
      if (!questionError) {
        successCount++
        console.log(`✅ Question ${question.questionNumber} added: ${question.questionText.substring(0, 50)}...`)
      } else {
        console.warn(`⚠️ Question ${question.questionNumber} failed:`, questionError.message)
      }
    }
    
    console.log(`\n🎉 Questions added successfully: ${successCount}/${questions.length}`)
    console.log('🔗 You can now view the text with questions at:')
    console.log('http://localhost:5174/reader/22')
    
  } catch (error) {
    console.error('❌ Failed to add questions:', error)
  }
}

addQuestionsToText() 