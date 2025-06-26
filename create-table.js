import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ujqcpxdqpqlxnowyptbw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqcWNweGRxcHFseG5vd3lwdGJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NzUyMjUsImV4cCI6MjA2NjU1MTIyNX0.C2ZTtfGoZ1fm9pmSIHffI8xdYtdIWOWubrfxTm6FPyc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTableAndData() {
  console.log('🚀 Creating texts table and sample data...')
  
  try {
    // First, let's try to create the table using SQL
    console.log('📝 Creating texts table...')
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS texts (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          level VARCHAR(50) NOT NULL,
          question1 TEXT,
          question2 TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (createError) {
      console.log('⚠️  Could not create table via RPC, you may need to use the SQL Editor')
      console.log('📋 Please run the SQL commands from database-setup.sql in your Supabase SQL Editor')
      return
    }
    
    console.log('✅ Table created successfully!')
    
    // Now insert sample data
    console.log('📚 Inserting sample texts...')
    const sampleTexts = [
      {
        title: 'The Little Red Hen',
        content: 'Once upon a time, there was a little red hen who lived on a farm. She was a very busy hen and always liked to do things for herself. One day, she found some wheat seeds in the barnyard. "Who will help me plant these seeds?" she asked. "Not I," said the cat. "Not I," said the dog. "Not I," said the pig. "Then I will plant them myself," said the little red hen. And she did. The wheat grew tall and golden. "Who will help me cut the wheat?" asked the little red hen. "Not I," said the cat. "Not I," said the dog. "Not I," said the pig. "Then I will cut it myself," said the little red hen. And she did. "Who will help me take the wheat to the mill?" asked the little red hen. "Not I," said the cat. "Not I," said the dog. "Not I," said the pig. "Then I will take it myself," said the little red hen. And she did. The miller ground the wheat into flour. "Who will help me bake the bread?" asked the little red hen. "Not I," said the cat. "Not I," said the dog. "Not I," said the pig. "Then I will bake it myself," said the little red hen. And she did. The bread smelled wonderful! "Who will help me eat the bread?" asked the little red hen. "I will!" said the cat. "I will!" said the dog. "I will!" said the pig. "No, you will not," said the little red hen. "I will eat it myself." And she did.',
        level: 'Beginner',
        question1: 'What did the little red hen find in the barnyard?',
        question2: 'Why did the little red hen eat the bread by herself?'
      },
      {
        title: 'The Three Little Pigs',
        content: 'Once upon a time, there were three little pigs who lived with their mother. One day, their mother said, "You are all grown up now. It is time for you to build your own houses." The first little pig was very lazy. He quickly built his house out of straw. The second little pig was a little less lazy. He built his house out of sticks. The third little pig was very wise and hardworking. He built his house out of bricks. One day, a big bad wolf came to the village. He was very hungry and wanted to eat the little pigs. The wolf went to the first house, made of straw. "Little pig, little pig, let me come in!" he said. "Not by the hair on my chinny chin chin!" said the little pig. "Then I will huff and puff and blow your house in!" said the wolf. And he did! The first little pig ran to his brother\'s house made of sticks. The wolf followed and blew down the stick house too. Both pigs ran to their brother\'s brick house. The wolf tried to blow down the brick house, but he could not. The brick house was too strong. The wolf tried to come down the chimney, but the pigs had a pot of boiling water waiting. The wolf ran away and never came back. The three little pigs lived happily ever after in the brick house.',
        level: 'Beginner',
        question1: 'What material did the third little pig use to build his house?',
        question2: 'How did the pigs finally defeat the wolf?'
      },
      {
        title: 'The Tortoise and the Hare',
        content: 'Once upon a time, there was a hare who was very proud of his speed. He often made fun of the tortoise for being so slow. "You are so slow, tortoise!" the hare would say. "I can run circles around you!" The tortoise was tired of the hare\'s boasting. "Let us have a race," said the tortoise. "I will race you to the finish line." The hare laughed. "A race? With you? That is ridiculous! But I will race you anyway. It will be easy to win." The race began. The hare ran very fast and was soon far ahead of the tortoise. He looked back and saw the tortoise was still at the starting line. "I have plenty of time," thought the hare. "I will take a nap." The hare lay down under a tree and fell asleep. Meanwhile, the tortoise kept walking slowly and steadily. He did not stop. He did not rest. He just kept going. When the hare woke up, he saw the tortoise was almost at the finish line! The hare ran as fast as he could, but it was too late. The tortoise had already won the race. "Slow and steady wins the race," said the tortoise. The hare learned that being fast is not everything. Being consistent and determined is more important.',
        level: 'Intermediate',
        question1: 'Why did the hare decide to take a nap during the race?',
        question2: 'What lesson did the hare learn from the race?'
      }
    ]
    
    const { data, error } = await supabase
      .from('texts')
      .insert(sampleTexts)
    
    if (error) {
      console.error('❌ Error inserting data:', error)
      return
    }
    
    console.log('✅ Sample texts inserted successfully!')
    console.log('🎉 Your database is now ready to use!')
    console.log('📖 You can now access your app at http://localhost:5173/')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    console.log('📋 Please use the SQL Editor method instead:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Open SQL Editor')
    console.log('3. Run the commands from database-setup.sql')
  }
}

createTableAndData() 