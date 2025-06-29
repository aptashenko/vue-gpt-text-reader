import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:')
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '❌')
  console.error('   VITE_SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function importTexts(textsFile) {
  try {
    console.log('📖 Reading texts file...')
    const textsData = JSON.parse(fs.readFileSync(textsFile, 'utf8'))
    
    console.log(`📚 Found ${textsData.length} texts to import`)
    
    for (const text of textsData) {
      console.log(`\n📝 Importing: "${text.title}" (${text.language})`)
      
      // Insert the text
      const { data: textData, error: textError } = await supabase
        .from('texts')
        .insert({
          title: text.title,
          content: text.content,
          language: text.language,
          level: text.level || 'Beginner',
          question1: text.question1 || '',
          question2: text.question2 || '',
          created_at: new Date().toISOString()
        })
        .select()
      
      if (textError) {
        console.error(`  ❌ Error importing text:`, textError.message)
        continue
      }
      
      console.log(`  ✓ Text imported successfully`)
      
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
            console.error(`    ❌ Error importing question ${question.questionNumber}:`, questionError.message)
          } else {
            console.log(`    ✓ Question ${question.questionNumber}: ${question.questionText.substring(0, 50)}...`)
          }
        }
      } else if (text.question1 || text.question2) {
        console.log(`  📝 Basic questions included`)
      }
    }
    
    console.log('\n✅ Texts import completed!')
  } catch (error) {
    console.error('❌ Error reading texts file:', error.message)
  }
}

async function importDictionary(dictionaryFile) {
  try {
    console.log('📖 Reading dictionary file...')
    const dictionaryData = JSON.parse(fs.readFileSync(dictionaryFile, 'utf8'))
    
    console.log(`📚 Found ${dictionaryData.length} dictionary entries to import`)
    
    // Process in batches to avoid overwhelming the database
    const batchSize = 50
    for (let i = 0; i < dictionaryData.length; i += batchSize) {
      const batch = dictionaryData.slice(i, i + batchSize)
      
      console.log(`\n📝 Importing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(dictionaryData.length / batchSize)}`)
      
      const { error: batchError } = await supabase
        .from('dictionary')
        .insert(batch.map(entry => ({
          word: entry.word,
          language: entry.language,
          translation_en: entry.translation_en || '',
          translation_fr: entry.translation_fr || '',
          translation_es: entry.translation_es || '',
          translation_de: entry.translation_de || '',
          translation_uk: entry.translation_uk || '',
          part_of_speech: entry.part_of_speech || 'noun',
          difficulty: entry.difficulty || 'beginner',
          created_at: new Date().toISOString()
        })))
      
      if (batchError) {
        console.error(`  ❌ Error importing batch:`, batchError.message)
      } else {
        console.log(`  ✓ Batch imported successfully (${batch.length} entries)`)
      }
    }
    
    console.log('\n✅ Dictionary import completed!')
  } catch (error) {
    console.error('❌ Error reading dictionary file:', error.message)
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('📖 Vue GPT Text Reader - Data Import Tool')
    console.log('\nUsage:')
    console.log('  node import-data.js texts <texts-file.json>')
    console.log('  node import-data.js dictionary <dictionary-file.json>')
    console.log('  node import-data.js all <texts-file.json> <dictionary-file.json>')
    console.log('\nExamples:')
    console.log('  node import-data.js texts example-texts.json')
    console.log('  node import-data.js dictionary example-dictionary.json')
    console.log('  node import-data.js all example-texts.json example-dictionary.json')
    process.exit(0)
  }
  
  const command = args[0]
  
  try {
    switch (command) {
      case 'texts':
        if (args.length < 2) {
          console.error('❌ Please provide a texts file path')
          process.exit(1)
        }
        await importTexts(args[1])
        break
        
      case 'dictionary':
        if (args.length < 2) {
          console.error('❌ Please provide a dictionary file path')
          process.exit(1)
        }
        await importDictionary(args[1])
        break
        
      case 'all':
        if (args.length < 3) {
          console.error('❌ Please provide both texts and dictionary file paths')
          process.exit(1)
        }
        console.log('🚀 Starting full import...\n')
        await importTexts(args[1])
        console.log('\n' + '='.repeat(50) + '\n')
        await importDictionary(args[2])
        console.log('\n🎉 Full import completed!')
        break
        
      default:
        console.error('❌ Unknown command:', command)
        console.log('Available commands: texts, dictionary, all')
        process.exit(1)
    }
  } catch (error) {
    console.error('❌ Import failed:', error.message)
    process.exit(1)
  }
}

// Run the import
main() 