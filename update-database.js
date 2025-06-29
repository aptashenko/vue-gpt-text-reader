import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateDatabase() {
  console.log('Starting database update...')

  try {
    // Step 1: Add language column to texts table if it doesn't exist
    console.log('Adding language column to texts table...')
    const { error: alterTextsError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'texts' AND column_name = 'language'
          ) THEN
            ALTER TABLE texts ADD COLUMN language VARCHAR(10) NOT NULL DEFAULT 'en';
          END IF;
        END $$;
      `
    })

    if (alterTextsError) {
      console.log('Language column already exists or error:', alterTextsError.message)
    } else {
      console.log('✓ Language column added to texts table')
    }

    // Step 2: Update existing texts to have language 'en'
    console.log('Updating existing texts to English language...')
    const { error: updateTextsError } = await supabase
      .from('texts')
      .update({ language: 'en' })
      .is('language', null)

    if (updateTextsError) {
      console.log('Error updating texts:', updateTextsError.message)
    } else {
      console.log('✓ Existing texts updated to English')
    }

    // Step 3: Drop and recreate dictionary table with new structure
    console.log('Recreating dictionary table with multi-language support...')
    
    // Drop existing table
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'DROP TABLE IF EXISTS dictionary CASCADE;'
    })

    if (dropError) {
      console.log('Error dropping dictionary table:', dropError.message)
    }

    // Create new table structure
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE dictionary (
          id SERIAL PRIMARY KEY,
          word VARCHAR(100) NOT NULL,
          language VARCHAR(10) NOT NULL DEFAULT 'en',
          translation_en TEXT,
          translation_fr TEXT,
          translation_es TEXT,
          translation_de TEXT,
          part_of_speech VARCHAR(50) DEFAULT 'noun',
          difficulty VARCHAR(50) DEFAULT 'beginner',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(word, language)
        );
      `
    })

    if (createError) {
      console.log('Error creating dictionary table:', createError.message)
    } else {
      console.log('✓ Dictionary table recreated with multi-language support')
    }

    // Step 4: Insert sample multi-language data
    console.log('Inserting sample multi-language dictionary data...')
    const sampleWords = [
      // Animals
      ['hen', 'en', 'hen', 'poule', 'gallina', 'Huhn', 'noun', 'beginner'],
      ['cat', 'en', 'cat', 'chat', 'gato', 'Katze', 'noun', 'beginner'],
      ['dog', 'en', 'dog', 'chien', 'perro', 'Hund', 'noun', 'beginner'],
      ['pig', 'en', 'pig', 'cochon', 'cerdo', 'Schwein', 'noun', 'beginner'],
      ['wolf', 'en', 'wolf', 'loup', 'lobo', 'Wolf', 'noun', 'beginner'],
      ['tortoise', 'en', 'tortoise', 'tortue', 'tortuga', 'Schildkröte', 'noun', 'intermediate'],
      ['hare', 'en', 'hare', 'lièvre', 'liebre', 'Hase', 'noun', 'intermediate'],
      ['ant', 'en', 'ant', 'fourmi', 'hormiga', 'Ameise', 'noun', 'intermediate'],
      ['grasshopper', 'en', 'grasshopper', 'sauterelle', 'saltamontes', 'Heuschrecke', 'noun', 'advanced'],
      ['sheep', 'en', 'sheep', 'mouton', 'oveja', 'Schaf', 'noun', 'intermediate'],

      // Objects and Materials
      ['house', 'en', 'house', 'maison', 'casa', 'Haus', 'noun', 'beginner'],
      ['straw', 'en', 'straw', 'paille', 'paja', 'Stroh', 'noun', 'intermediate'],
      ['sticks', 'en', 'sticks', 'bâtons', 'palos', 'Stöcke', 'noun', 'intermediate'],
      ['bricks', 'en', 'bricks', 'briques', 'ladrillos', 'Ziegel', 'noun', 'intermediate'],
      ['bread', 'en', 'bread', 'pain', 'pan', 'Brot', 'noun', 'beginner'],
      ['wheat', 'en', 'wheat', 'blé', 'trigo', 'Weizen', 'noun', 'intermediate'],
      ['seeds', 'en', 'seeds', 'graines', 'semillas', 'Samen', 'noun', 'intermediate'],
      ['flour', 'en', 'flour', 'farine', 'harina', 'Mehl', 'noun', 'intermediate'],
      ['mill', 'en', 'mill', 'moulin', 'molino', 'Mühle', 'noun', 'intermediate'],
      ['chimney', 'en', 'chimney', 'cheminée', 'chimenea', 'Schornstein', 'noun', 'advanced'],
      ['pot', 'en', 'pot', 'marmite', 'olla', 'Topf', 'noun', 'intermediate'],
      ['water', 'en', 'water', 'eau', 'agua', 'Wasser', 'noun', 'beginner'],
      ['corn', 'en', 'corn', 'maïs', 'maíz', 'Mais', 'noun', 'intermediate'],
      ['food', 'en', 'food', 'nourriture', 'comida', 'Essen', 'noun', 'beginner'],
      ['nest', 'en', 'nest', 'nid', 'nido', 'Nest', 'noun', 'intermediate'],

      // Actions
      ['plant', 'en', 'plant', 'planter', 'plantar', 'pflanzen', 'verb', 'intermediate'],
      ['cut', 'en', 'cut', 'couper', 'cortar', 'schneiden', 'verb', 'beginner'],
      ['bake', 'en', 'bake', 'cuire', 'hornear', 'backen', 'verb', 'intermediate'],
      ['eat', 'en', 'eat', 'manger', 'comer', 'essen', 'verb', 'beginner'],
      ['build', 'en', 'build', 'construire', 'construir', 'bauen', 'verb', 'intermediate'],
      ['run', 'en', 'run', 'courir', 'correr', 'laufen', 'verb', 'beginner'],
      ['sleep', 'en', 'sleep', 'dormir', 'dormir', 'schlafen', 'verb', 'beginner'],
      ['walk', 'en', 'walk', 'marcher', 'caminar', 'gehen', 'verb', 'beginner'],
      ['work', 'en', 'work', 'travailler', 'trabajar', 'arbeiten', 'verb', 'beginner'],
      ['help', 'en', 'help', 'aider', 'ayudar', 'helfen', 'verb', 'beginner'],
      ['cry', 'en', 'cry', 'pleurer', 'llorar', 'weinen', 'verb', 'beginner'],
      ['sing', 'en', 'sing', 'chanter', 'cantar', 'singen', 'verb', 'beginner'],
      ['chat', 'en', 'chat', 'bavarder', 'charlar', 'plaudern', 'verb', 'intermediate'],
      ['prepare', 'en', 'prepare', 'préparer', 'preparar', 'vorbereiten', 'verb', 'intermediate'],
      ['collect', 'en', 'collect', 'collecter', 'recolectar', 'sammeln', 'verb', 'intermediate'],

      // Adjectives
      ['lazy', 'en', 'lazy', 'paresseux', 'perezoso', 'faul', 'adjective', 'intermediate'],
      ['wise', 'en', 'wise', 'sage', 'sabio', 'weise', 'adjective', 'intermediate'],
      ['hardworking', 'en', 'hardworking', 'travailleur', 'trabajador', 'fleißig', 'adjective', 'advanced'],
      ['hungry', 'en', 'hungry', 'affamé', 'hambriento', 'hungrig', 'adjective', 'intermediate'],
      ['strong', 'en', 'strong', 'fort', 'fuerte', 'stark', 'adjective', 'beginner'],
      ['slow', 'en', 'slow', 'lent', 'lento', 'langsam', 'adjective', 'beginner'],
      ['fast', 'en', 'fast', 'rapide', 'rápido', 'schnell', 'adjective', 'beginner'],
      ['proud', 'en', 'proud', 'fier', 'orgulloso', 'stolz', 'adjective', 'intermediate'],
      ['steady', 'en', 'steady', 'constant', 'constante', 'beständig', 'adjective', 'advanced'],
      ['determined', 'en', 'determined', 'déterminé', 'determinado', 'entschlossen', 'adjective', 'advanced'],
      ['bored', 'en', 'bored', 'ennuyé', 'aburrido', 'gelangweilt', 'adjective', 'intermediate'],
      ['angry', 'en', 'angry', 'en colère', 'enojado', 'wütend', 'adjective', 'intermediate'],
      ['naughty', 'en', 'naughty', 'méchant', 'travieso', 'frech', 'adjective', 'intermediate'],
      ['stern', 'en', 'stern', 'sévère', 'severo', 'streng', 'adjective', 'advanced'],

      // Other important words
      ['farm', 'en', 'farm', 'ferme', 'granja', 'Bauernhof', 'noun', 'beginner'],
      ['barnyard', 'en', 'barnyard', 'cour de ferme', 'patio de la granja', 'Hof', 'noun', 'advanced'],
      ['village', 'en', 'village', 'village', 'pueblo', 'Dorf', 'noun', 'intermediate'],
      ['field', 'en', 'field', 'champ', 'campo', 'Feld', 'noun', 'beginner'],
      ['winter', 'en', 'winter', 'hiver', 'invierno', 'Winter', 'noun', 'beginner'],
      ['summer', 'en', 'summer', 'été', 'verano', 'Sommer', 'noun', 'beginner'],
      ['race', 'en', 'race', 'course', 'carrera', 'Rennen', 'noun', 'intermediate'],
      ['finish', 'en', 'finish', 'terminer', 'terminar', 'beenden', 'verb', 'intermediate'],
      ['line', 'en', 'line', 'ligne', 'línea', 'Linie', 'noun', 'beginner'],
      ['tree', 'en', 'tree', 'arbre', 'árbol', 'Baum', 'noun', 'beginner'],
      ['hill', 'en', 'hill', 'colline', 'colina', 'Hügel', 'noun', 'intermediate'],
      ['sunset', 'en', 'sunset', 'coucher de soleil', 'atardecer', 'Sonnenuntergang', 'noun', 'intermediate'],
      ['morning', 'en', 'morning', 'matin', 'mañana', 'Morgen', 'noun', 'beginner'],
      ['lesson', 'en', 'lesson', 'leçon', 'lección', 'Lektion', 'noun', 'intermediate'],
      ['truth', 'en', 'truth', 'vérité', 'verdad', 'Wahrheit', 'noun', 'intermediate'],
      ['liar', 'en', 'liar', 'menteur', 'mentiroso', 'Lügner', 'noun', 'intermediate'],
      ['necessity', 'en', 'necessity', 'nécessité', 'necesidad', 'Notwendigkeit', 'noun', 'advanced'],
      ['toil', 'en', 'toil', 'travail dur', 'trabajo duro', 'harte Arbeit', 'noun', 'advanced'],
      ['moiling', 'en', 'moiling', 'travailler dur', 'trabajando duro', 'hart arbeiten', 'verb', 'advanced'],
      ['distribute', 'en', 'distribute', 'distribuer', 'distribuir', 'verteilen', 'verb', 'advanced']
    ]

    for (const wordData of sampleWords) {
      const [word, language, translation_en, translation_fr, translation_es, translation_de, part_of_speech, difficulty] = wordData
      
      const { error: insertError } = await supabase
        .from('dictionary')
        .insert({
          word,
          language,
          translation_en,
          translation_fr,
          translation_es,
          translation_de,
          part_of_speech,
          difficulty
        })

      if (insertError) {
        console.log(`Error inserting word "${word}":`, insertError.message)
      }
    }

    console.log('✓ Sample dictionary data inserted')

    // Step 5: Enable RLS and create policies
    console.log('Setting up Row Level Security...')
    
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE dictionary ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow authenticated users to read dictionary" ON dictionary;
        CREATE POLICY "Allow authenticated users to read dictionary" ON dictionary
          FOR SELECT USING (auth.role() = 'authenticated');

        DROP POLICY IF EXISTS "Allow authenticated users to insert dictionary entries" ON dictionary;
        CREATE POLICY "Allow authenticated users to insert dictionary entries" ON dictionary
          FOR INSERT WITH CHECK (auth.role() = 'authenticated');

        DROP POLICY IF EXISTS "Allow authenticated users to update dictionary entries" ON dictionary;
        CREATE POLICY "Allow authenticated users to update dictionary entries" ON dictionary
          FOR UPDATE USING (auth.role() = 'authenticated');

        DROP POLICY IF EXISTS "Allow authenticated users to delete dictionary entries" ON dictionary;
        CREATE POLICY "Allow authenticated users to delete dictionary entries" ON dictionary
          FOR DELETE USING (auth.role() = 'authenticated');
      `
    })

    if (rlsError) {
      console.log('Error setting up RLS:', rlsError.message)
    } else {
      console.log('✓ Row Level Security configured')
    }

    // Step 6: Create indexes
    console.log('Creating indexes...')
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_dictionary_word ON dictionary(word);
        CREATE INDEX IF NOT EXISTS idx_dictionary_language ON dictionary(language);
        CREATE INDEX IF NOT EXISTS idx_dictionary_difficulty ON dictionary(difficulty);
      `
    })

    if (indexError) {
      console.log('Error creating indexes:', indexError.message)
    } else {
      console.log('✓ Indexes created')
    }

    console.log('\n🎉 Database update completed successfully!')
    console.log('\nNew features:')
    console.log('- Multi-language support (English, French, Spanish, German)')
    console.log('- Updated dictionary structure with translations for all languages')
    console.log('- Admin panel for managing texts and dictionary entries')
    console.log('- Language filtering in text list')

  } catch (error) {
    console.error('Error updating database:', error)
    process.exit(1)
  }
}

updateDatabase() 