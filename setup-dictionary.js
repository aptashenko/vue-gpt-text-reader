import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ujqcpxdqpqlxnowyptbw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqcWNweGRxcHFseG5vd3lwdGJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NzUyMjUsImV4cCI6MjA2NjU1MTIyNX0.C2ZTtfGoZ1fm9pmSIHffI8xdYtdIWOWubrfxTm6FPyc'

const supabase = createClient(supabaseUrl, supabaseKey)

// Sample dictionary data
const sampleDictionary = [
  // Animals
  { word: 'hen', translation: 'gallina', part_of_speech: 'noun', difficulty: 'beginner' },
  { word: 'cat', translation: 'gato', part_of_speech: 'noun', difficulty: 'beginner' },
  { word: 'dog', translation: 'perro', part_of_speech: 'noun', difficulty: 'beginner' },
  { word: 'pig', translation: 'cerdo', part_of_speech: 'noun', difficulty: 'beginner' },
  { word: 'wolf', translation: 'lobo', part_of_speech: 'noun', difficulty: 'beginner' },
  { word: 'tortoise', translation: 'tortuga', part_of_speech: 'noun', difficulty: 'intermediate' },
  { word: 'hare', translation: 'liebre', part_of_speech: 'noun', difficulty: 'intermediate' },
  { word: 'ant', translation: 'hormiga', part_of_speech: 'noun', difficulty: 'intermediate' },
  { word: 'grasshopper', translation: 'saltamontes', part_of_speech: 'noun', difficulty: 'advanced' },
  { word: 'sheep', translation: 'oveja', part_of_speech: 'noun', difficulty: 'intermediate' },

  // Objects and Materials
  { word: 'house', translation: 'casa', part_of_speech: 'noun', difficulty: 'beginner' },
  { word: 'straw', translation: 'paja', part_of_speech: 'noun', difficulty: 'intermediate' },
  { word: 'sticks', translation: 'palos', part_of_speech: 'noun', difficulty: 'intermediate' },
  { word: 'bricks', translation: 'ladrillos', part_of_speech: 'noun', difficulty: 'intermediate' },
  { word: 'bread', translation: 'pan', part_of_speech: 'noun', difficulty: 'beginner' },
  { word: 'wheat', translation: 'trigo', part_of_speech: 'noun', difficulty: 'intermediate' },
  { word: 'seeds', translation: 'semillas', part_of_speech: 'noun', difficulty: 'intermediate' },
  { word: 'flour', translation: 'harina', part_of_speech: 'noun', difficulty: 'intermediate' },
  { word: 'mill', translation: 'molino', part_of_speech: 'noun', difficulty: 'intermediate' },
  { word: 'chimney', translation: 'chimenea', part_of_speech: 'noun', difficulty: 'advanced' },
  { word: 'pot', translation: 'olla', part_of_speech: 'noun', difficulty: 'intermediate' },
  { word: 'water', translation: 'agua', part_of_speech: 'noun', difficulty: 'beginner' },
  { word: 'corn', translation: 'maíz', part_of_speech: 'noun', difficulty: 'intermediate' },
  { word: 'food', translation: 'comida', part_of_speech: 'noun', difficulty: 'beginner' },
  { word: 'nest', translation: 'nido', part_of_speech: 'noun', difficulty: 'intermediate' },

  // Actions
  { word: 'plant', translation: 'plantar', part_of_speech: 'verb', difficulty: 'intermediate' },
  { word: 'cut', translation: 'cortar', part_of_speech: 'verb', difficulty: 'beginner' },
  { word: 'bake', translation: 'hornear', part_of_speech: 'verb', difficulty: 'intermediate' },
  { word: 'eat', translation: 'comer', part_of_speech: 'verb', difficulty: 'beginner' },
  { word: 'build', translation: 'construir', part_of_speech: 'verb', difficulty: 'intermediate' },
  { word: 'run', translation: 'correr', part_of_speech: 'verb', difficulty: 'beginner' },
  { word: 'sleep', translation: 'dormir', part_of_speech: 'verb', difficulty: 'beginner' },
  { word: 'walk', translation: 'caminar', part_of_speech: 'verb', difficulty: 'beginner' },
  { word: 'work', translation: 'trabajar', part_of_speech: 'verb', difficulty: 'beginner' },
  { word: 'help', translation: 'ayudar', part_of_speech: 'verb', difficulty: 'beginner' },
  { word: 'cry', translation: 'llorar', part_of_speech: 'verb', difficulty: 'beginner' },
  { word: 'sing', translation: 'cantar', part_of_speech: 'verb', difficulty: 'beginner' },
  { word: 'chat', translation: 'charlar', part_of_speech: 'verb', difficulty: 'intermediate' },
  { word: 'prepare', translation: 'preparar', part_of_speech: 'verb', difficulty: 'intermediate' },
  { word: 'collect', translation: 'recolectar', part_of_speech: 'verb', difficulty: 'intermediate' },

  // Adjectives
  { word: 'lazy', translation: 'perezoso', part_of_speech: 'adjective', difficulty: 'intermediate' },
  { word: 'wise', translation: 'sabio', part_of_speech: 'adjective', difficulty: 'intermediate' },
  { word: 'hardworking', translation: 'trabajador', part_of_speech: 'adjective', difficulty: 'advanced' },
  { word: 'hungry', translation: 'hambriento', part_of_speech: 'adjective', difficulty: 'intermediate' },
  { word: 'strong', translation: 'fuerte', part_of_speech: 'adjective', difficulty: 'beginner' },
  { word: 'slow', translation: 'lento', part_of_speech: 'adjective', difficulty: 'beginner' },
  { word: 'fast', translation: 'rápido', part_of_speech: 'adjective', difficulty: 'beginner' },
  { word: 'proud', translation: 'orgulloso', part_of_speech: 'adjective', difficulty: 'intermediate' },
  { word: 'steady', translation: 'constante', part_of_speech: 'adjective', difficulty: 'advanced' },
  { word: 'determined', translation: 'determinado', part_of_speech: 'adjective', difficulty: 'advanced' },
  { word: 'bored', translation: 'aburrido', part_of_speech: 'adjective', difficulty: 'intermediate' },
  { word: 'angry', translation: 'enojado', part_of_speech: 'adjective', difficulty: 'intermediate' },
  { word: 'naughty', translation: 'travieso', part_of_speech: 'adjective', difficulty: 'intermediate' },
  { word: 'stern', translation: 'severo', part_of_speech: 'adjective', difficulty: 'advanced' },

  // Other important words
  { word: 'farm', translation: 'granja', part_of_speech: 'noun', difficulty: 'beginner' },
  { word: 'barnyard', translation: 'patio de la granja', part_of_speech: 'noun', difficulty: 'advanced' },
  { word: 'village', translation: 'pueblo', part_of_speech: 'noun', difficulty: 'intermediate' },
  { word: 'field', translation: 'campo', part_of_speech: 'noun', difficulty: 'beginner' },
  { word: 'winter', translation: 'invierno', part_of_speech: 'noun', difficulty: 'beginner' },
  { word: 'summer', translation: 'verano', part_of_speech: 'noun', difficulty: 'beginner' },
  { word: 'race', translation: 'carrera', part_of_speech: 'noun', difficulty: 'intermediate' },
  { word: 'finish', translation: 'terminar', part_of_speech: 'verb', difficulty: 'intermediate' },
  { word: 'line', translation: 'línea', part_of_speech: 'noun', difficulty: 'beginner' },
  { word: 'tree', translation: 'árbol', part_of_speech: 'noun', difficulty: 'beginner' },
  { word: 'hill', translation: 'colina', part_of_speech: 'noun', difficulty: 'intermediate' },
  { word: 'sunset', translation: 'atardecer', part_of_speech: 'noun', difficulty: 'intermediate' },
  { word: 'morning', translation: 'mañana', part_of_speech: 'noun', difficulty: 'beginner' },
  { word: 'lesson', translation: 'lección', part_of_speech: 'noun', difficulty: 'intermediate' },
  { word: 'truth', translation: 'verdad', part_of_speech: 'noun', difficulty: 'intermediate' },
  { word: 'liar', translation: 'mentiroso', part_of_speech: 'noun', difficulty: 'intermediate' },
  { word: 'necessity', translation: 'necesidad', part_of_speech: 'noun', difficulty: 'advanced' },
  { word: 'toil', translation: 'trabajo duro', part_of_speech: 'noun', difficulty: 'advanced' },
  { word: 'distribute', translation: 'distribuir', part_of_speech: 'verb', difficulty: 'advanced' }
]

async function setupDictionary() {
  console.log('📚 Setting up dictionary...')
  
  try {
    // Check if dictionary table exists
    const { data: existingData, error: checkError } = await supabase
      .from('dictionary')
      .select('count')
      .limit(1)
    
    if (checkError && checkError.code === 'PGRST116') {
      console.log('❌ Dictionary table does not exist.')
      console.log('📋 Please run the SQL commands from dictionary-setup.sql in your Supabase SQL Editor first.')
      return
    }
    
    // Check if we already have data
    const { data: existingWords, error: countError } = await supabase
      .from('dictionary')
      .select('*')
    
    if (countError) {
      console.error('❌ Error checking existing dictionary:', countError)
      return
    }
    
    if (existingWords && existingWords.length > 0) {
      console.log(`✅ Dictionary already has ${existingWords.length} words. Skipping setup.`)
      return
    }
    
    // Insert sample data
    console.log('📝 Inserting sample dictionary entries...')
    const { data, error } = await supabase
      .from('dictionary')
      .insert(sampleDictionary)
    
    if (error) {
      console.error('❌ Error inserting dictionary data:', error)
      return
    }
    
    console.log('✅ Dictionary setup completed successfully!')
    console.log(`📖 Added ${sampleDictionary.length} words to the dictionary.`)
    console.log('🎉 You can now use the dictionary feature in your app!')
    
  } catch (error) {
    console.error('❌ Dictionary setup failed:', error)
    console.log('📋 Please use the SQL Editor method instead:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Open SQL Editor')
    console.log('3. Run the commands from dictionary-setup.sql')
  }
}

setupDictionary() 