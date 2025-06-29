// Debug script for import process
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key for testing
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables: VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Test data
const testText = {
  title: 'Test Text for Debug',
  text: 'This is a test text with some words.',
  target_language: 'en',
  level: 'A1',
  words: [
    {
      word: 'test',
      translations: {
        en: 'test',
        fr: 'test',
        es: 'test',
        de: 'test',
        uk: 'тест',
        ru: 'тест'
      },
      part_of_speech: 'noun'
    },
    {
      word: 'text',
      translations: {
        en: 'text',
        fr: 'texte',
        es: 'texto',
        de: 'text',
        uk: 'текст',
        ru: 'текст'
      },
      part_of_speech: 'noun'
    }
  ],
  questions: [
    'What is this text about?',
    'How many words are in this text?'
  ]
}

async function testImport() {
  console.log('🧪 Starting import test...')
  
  try {
    // 1. Check if text_words table exists
    console.log('\n1. Checking if text_words table exists...')
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'text_words')
    
    if (tableError) {
      console.error('Error checking tables:', tableError)
    } else {
      console.log('Tables found:', tables)
      if (tables.length === 0) {
        console.log('❌ text_words table does not exist!')
        return
      } else {
        console.log('✅ text_words table exists')
      }
    }
    
    // 2. Insert test text
    console.log('\n2. Inserting test text...')
    const { data: insertedText, error: textError } = await supabase
      .from('texts')
      .insert({
        title: testText.title,
        content: testText.text,
        language: testText.target_language,
        level: testText.level
      })
      .select()
      .single()
    
    if (textError) {
      console.error('Error inserting text:', textError)
      return
    }
    
    console.log('✅ Text inserted:', insertedText)
    
    // 3. Insert words
    console.log('\n3. Inserting words...')
    for (let i = 0; i < testText.words.length; i++) {
      const wordData = testText.words[i]
      
      console.log(`Processing word ${i + 1}: "${wordData.word}"`)
      
      const wordRecord = {
        word: wordData.word,
        language: testText.target_language,
        translation_en: wordData.translations.en,
        translation_fr: wordData.translations.fr,
        translation_es: wordData.translations.es,
        translation_de: wordData.translations.de,
        translation_uk: wordData.translations.uk,
        translation_ru: wordData.translations.ru,
        part_of_speech: wordData.part_of_speech,
        difficulty: testText.level
      }
      
      const { data: insertedWord, error: wordError } = await supabase
        .from('dictionary')
        .upsert([wordRecord], { 
          onConflict: 'word,language',
          ignoreDuplicates: false 
        })
        .select()
        .single()
      
      if (wordError) {
        console.error('Error inserting word:', wordError)
        continue
      }
      
      console.log('✅ Word inserted:', insertedWord)
      
      // 4. Link word to text
      console.log('Linking word to text...')
      const textWordRecord = {
        text_id: insertedText.id,
        word_id: insertedWord.id,
        word_order: i + 1
      }
      
      const { error: linkError } = await supabase
        .from('text_words')
        .insert(textWordRecord)
      
      if (linkError) {
        console.error('Error linking word to text:', linkError)
      } else {
        console.log('✅ Word linked to text successfully')
      }
    }
    
    // 5. Insert questions
    console.log('\n4. Inserting questions...')
    for (let i = 0; i < testText.questions.length; i++) {
      const questionRecord = {
        text_id: insertedText.id,
        question_text: testText.questions[i],
        question_number: i + 1,
        question_type: 'comprehension',
        difficulty: testText.level
      }
      
      const { error: questionError } = await supabase
        .from('text_questions')
        .insert(questionRecord)
      
      if (questionError) {
        console.error('Error inserting question:', questionError)
      } else {
        console.log(`✅ Question ${i + 1} inserted`)
      }
    }
    
    // 6. Verify the data
    console.log('\n5. Verifying data...')
    
    // Check text
    const { data: textCheck, error: textCheckError } = await supabase
      .from('texts')
      .select('*')
      .eq('id', insertedText.id)
      .single()
    
    if (textCheckError) {
      console.error('Error checking text:', textCheckError)
    } else {
      console.log('✅ Text found:', textCheck.title)
    }
    
    // Check words
    const { data: wordsCheck, error: wordsCheckError } = await supabase
      .from('text_words')
      .select(`
        word_order,
        dictionary (
          word,
          translation_en
        )
      `)
      .eq('text_id', insertedText.id)
      .order('word_order')
    
    if (wordsCheckError) {
      console.error('Error checking words:', wordsCheckError)
    } else {
      console.log('✅ Words found:', wordsCheck.length)
      wordsCheck.forEach(item => {
        console.log(`  - ${item.word_order}. ${item.dictionary.word} (${item.dictionary.translation_en})`)
      })
    }
    
    // Check questions
    const { data: questionsCheck, error: questionsCheckError } = await supabase
      .from('text_questions')
      .select('*')
      .eq('text_id', insertedText.id)
      .order('question_number')
    
    if (questionsCheckError) {
      console.error('Error checking questions:', questionsCheckError)
    } else {
      console.log('✅ Questions found:', questionsCheck.length)
      questionsCheck.forEach(q => {
        console.log(`  - ${q.question_number}. ${q.question_text}`)
      })
    }
    
    console.log('\n🎉 Import test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testImport() 