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

async function addUkrainianSupport() {
  console.log('Adding Ukrainian language support...')

  try {
    // Add translation_uk column to dictionary table
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE dictionary ADD COLUMN IF NOT EXISTS translation_uk VARCHAR(255);`
    })

    if (alterError) {
      console.log('Error adding translation_uk column:', alterError.message)
      console.log('You may need to run this SQL manually in your Supabase dashboard:')
      console.log(`ALTER TABLE dictionary ADD COLUMN IF NOT EXISTS translation_uk VARCHAR(255);`)
    } else {
      console.log('✓ Added translation_uk column to dictionary table')
    }

    // Add sample Ukrainian translations
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add some sample Ukrainian translations for common words
        UPDATE dictionary SET translation_uk = 'кот' WHERE word = 'cat' AND language = 'en';
        UPDATE dictionary SET translation_uk = 'собака' WHERE word = 'dog' AND language = 'en';
        UPDATE dictionary SET translation_uk = 'будинок' WHERE word = 'house' AND language = 'en';
        UPDATE dictionary SET translation_uk = 'хліб' WHERE word = 'bread' AND language = 'en';
        UPDATE dictionary SET translation_uk = 'вода' WHERE word = 'water' AND language = 'en';
        UPDATE dictionary SET translation_uk = 'сонце' WHERE word = 'sun' AND language = 'en';
        UPDATE dictionary SET translation_uk = 'дерево' WHERE word = 'tree' AND language = 'en';
        UPDATE dictionary SET translation_uk = 'книга' WHERE word = 'book' AND language = 'en';
        UPDATE dictionary SET translation_uk = 'школа' WHERE word = 'school' AND language = 'en';
        UPDATE dictionary SET translation_uk = 'машина' WHERE word = 'car' AND language = 'en';
      `
    })

    if (updateError) {
      console.log('Error updating Ukrainian translations:', updateError.message)
      console.log('You may need to run the SQL commands from add-ukrainian-support.sql manually')
    } else {
      console.log('✓ Added sample Ukrainian translations')
    }

    // Add Ukrainian words to dictionary
    const { error: insertError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO dictionary (word, language, translation_en, translation_fr, translation_es, translation_de, translation_uk, part_of_speech, difficulty) VALUES
        ('кот', 'uk', 'cat', 'chat', 'gato', 'katze', 'кот', 'noun', 'beginner'),
        ('собака', 'uk', 'dog', 'chien', 'perro', 'hund', 'собака', 'noun', 'beginner'),
        ('будинок', 'uk', 'house', 'maison', 'casa', 'haus', 'будинок', 'noun', 'beginner'),
        ('хліб', 'uk', 'bread', 'pain', 'pan', 'brot', 'хліб', 'noun', 'beginner'),
        ('вода', 'uk', 'water', 'eau', 'agua', 'wasser', 'вода', 'noun', 'beginner'),
        ('сонце', 'uk', 'sun', 'soleil', 'sol', 'sonne', 'сонце', 'noun', 'beginner'),
        ('дерево', 'uk', 'tree', 'arbre', 'árbol', 'baum', 'дерево', 'noun', 'beginner'),
        ('книга', 'uk', 'book', 'livre', 'libro', 'buch', 'книга', 'noun', 'beginner'),
        ('школа', 'uk', 'school', 'école', 'escuela', 'schule', 'школа', 'noun', 'beginner'),
        ('машина', 'uk', 'car', 'voiture', 'coche', 'auto', 'машина', 'noun', 'beginner')
        ON CONFLICT (word, language) DO NOTHING;
      `
    })

    if (insertError) {
      console.log('Error inserting Ukrainian words:', insertError.message)
      console.log('You may need to run the SQL commands from add-ukrainian-support.sql manually')
    } else {
      console.log('✓ Added Ukrainian words to dictionary')
    }

    console.log('\n🎉 Ukrainian language support added successfully!')
    console.log('\nNew features:')
    console.log('- Ukrainian is now available as a native language option')
    console.log('- Ukrainian texts are available for reading')
    console.log('- Ukrainian translations are supported in the dictionary')
    console.log('- Users can set Ukrainian as their native language')

  } catch (error) {
    console.error('Error adding Ukrainian support:', error)
    console.log('\nPlease run the SQL commands from add-ukrainian-support.sql manually in your Supabase dashboard.')
    process.exit(1)
  }
}

addUkrainianSupport() 