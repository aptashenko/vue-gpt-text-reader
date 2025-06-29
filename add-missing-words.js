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

async function addMissingWords() {
  try {
    console.log('📚 Adding missing dictionary words for "Le Chat de Lucie"')
    
    // Only the words that were missing from the original import
    const missingWords = [
      {
        word: "noir",
        language: "fr",
        translation_en: "black",
        translation_fr: "noir",
        translation_es: "negro",
        translation_de: "schwarz",
        translation_uk: "чорний",
        part_of_speech: "adjective",
        difficulty: "beginner"
      },
      {
        word: "canapé",
        language: "fr",
        translation_en: "sofa",
        translation_fr: "canapé",
        translation_es: "sofá",
        translation_de: "Sofa",
        translation_uk: "диван",
        part_of_speech: "noun",
        difficulty: "intermediate"
      },
      {
        word: "pluie",
        language: "fr",
        translation_en: "rain",
        translation_fr: "pluie",
        translation_es: "lluvia",
        translation_de: "Regen",
        translation_uk: "дощ",
        part_of_speech: "noun",
        difficulty: "beginner"
      },
      {
        word: "soir",
        language: "fr",
        translation_en: "evening",
        translation_fr: "soir",
        translation_es: "tarde",
        translation_de: "Abend",
        translation_uk: "вечір",
        part_of_speech: "noun",
        difficulty: "beginner"
      },
      {
        word: "content",
        language: "fr",
        translation_en: "happy",
        translation_fr: "content",
        translation_es: "contento",
        translation_de: "glücklich",
        translation_uk: "щасливий",
        part_of_speech: "adjective",
        difficulty: "beginner"
      }
    ]
    
    const wordsToAdd = missingWords.map(word => ({
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
    
    let successCount = 0
    
    for (const word of wordsToAdd) {
      const { error: wordError } = await supabase
        .from('dictionary')
        .insert([word])
      
      if (!wordError) {
        successCount++
        console.log(`✅ Word added: ${word.word} → ${word.translation_en}`)
      } else {
        console.warn(`⚠️ Word failed: ${word.word} - ${wordError.message}`)
      }
    }
    
    console.log(`\n🎉 Missing words added: ${successCount}/${wordsToAdd.length}`)
    console.log('🔗 You can now view the complete text at:')
    console.log('http://localhost:5174/reader/22')
    
  } catch (error) {
    console.error('❌ Failed to add missing words:', error)
  }
}

addMissingWords() 