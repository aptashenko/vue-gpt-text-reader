import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.error('Please add VITE_SUPABASE_SERVICE_ROLE_KEY to your .env file')
  process.exit(1)
}

// Use service key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function importTexts(textsFile) {
  try {
    const textsData = JSON.parse(fs.readFileSync(textsFile, 'utf8'))
    
    console.log(`Importing ${textsData.length} texts...`)
    
    for (const text of textsData) {
      // Insert the text first
      const { data: textData, error: textError } = await supabase
        .from('texts')
        .insert({
          title: text.title,
          content: text.content,
          language: text.language,
          level: text.level || text.difficulty || 'intermediate',
          question1: text.question1 || null,
          question2: text.question2 || null,
          created_at: new Date().toISOString()
        })
        .select()
      
      if (textError) {
        console.error(`Error importing text "${text.title}":`, textError.message)
        continue
      }
      
      console.log(`✓ Imported: ${text.title}`)
      
      // If there are questions in the enhanced format, import them
      if (text.questions && Array.isArray(text.questions) && textData && textData[0]) {
        const textId = textData[0].id
        console.log(`  📝 Importing ${text.questions.length} questions...`)
        
        for (const question of text.questions) {
          const { error: questionError } = await supabase
            .from('text_questions')
            .insert({
              text_id: textId,
              question_text: question.questionText,
              question_number: question.questionNumber,
              question_type: question.questionType || 'comprehension',
              difficulty: question.difficulty || 'medium',
              created_at: new Date().toISOString()
            })
          
          if (questionError) {
            console.error(`    Error importing question ${question.questionNumber}:`, questionError.message)
          } else {
            console.log(`    ✓ Question ${question.questionNumber}: ${question.questionText.substring(0, 50)}...`)
          }
        }
      } else if (text.question1 || text.question2) {
        console.log(`  📝 Basic questions included`)
      }
    }
    
    console.log('Texts import completed!')
  } catch (error) {
    console.error('Error reading texts file:', error.message)
  }
}

async function importDictionary(dictionaryFile) {
  try {
    const dictionaryData = JSON.parse(fs.readFileSync(dictionaryFile, 'utf8'))
    
    console.log(`Importing ${dictionaryData.length} dictionary entries...`)
    
    for (const entry of dictionaryData) {
      const { data, error } = await supabase
        .from('dictionary')
        .insert({
          word: entry.word,
          language: entry.language || 'en',
          translation_en: entry.translation_en || null,
          translation_fr: entry.translation_fr || null,
          translation_es: entry.translation_es || null,
          translation_de: entry.translation_de || null,
          translation_uk: entry.translation_uk || null,
          part_of_speech: entry.part_of_speech || 'noun',
          difficulty: entry.difficulty || 'beginner',
          created_at: new Date().toISOString()
        })
      
      if (error) {
        console.error(`Error importing word "${entry.word}":`, error.message)
      } else {
        console.log(`✓ Imported: ${entry.word}`)
      }
    }
    
    console.log('Dictionary import completed!')
  } catch (error) {
    console.error('Error reading dictionary file:', error.message)
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log(`
Usage: node import-with-service-key.js <command> <file>

Commands:
  texts <file>     - Import texts from JSON file
  dictionary <file> - Import dictionary entries from JSON file
  both <texts-file> <dictionary-file> - Import both

Examples:
  node import-with-service-key.js texts annas-morning-text.json
  node import-with-service-key.js dictionary annas-morning-dictionary.json
  node import-with-service-key.js both annas-morning-text.json annas-morning-dictionary.json

Note: This script uses the service role key to bypass RLS policies.
Make sure VITE_SUPABASE_SERVICE_ROLE_KEY is set in your .env file.
    `)
    return
  }
  
  const command = args[0]
  
  switch (command) {
    case 'texts':
      if (!args[1]) {
        console.error('Please provide a texts JSON file')
        return
      }
      await importTexts(args[1])
      break
      
    case 'dictionary':
      if (!args[1]) {
        console.error('Please provide a dictionary JSON file')
        return
      }
      await importDictionary(args[1])
      break
      
    case 'both':
      if (!args[1] || !args[2]) {
        console.error('Please provide both texts and dictionary JSON files')
        return
      }
      await importTexts(args[1])
      await importDictionary(args[2])
      break
      
    default:
      console.error('Unknown command. Use: texts, dictionary, or both')
  }
}

main().catch(console.error) 