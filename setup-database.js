import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

// Sample data for the texts table
const sampleTexts = [
  {
    title: 'The Little Red Hen',
    content: 'Once upon a time, there was a little red hen who lived on a farm. She was a very busy hen and always liked to do things for herself. One day, she found some wheat seeds in the barnyard. "Who will help me plant these seeds?" she asked. "Not I," said the cat. "Not I," said the dog. "Not I," said the pig. "Then I will plant them myself," said the little red hen. And she did. The wheat grew tall and golden. "Who will help me cut the wheat?" asked the little red hen. "Not I," said the cat. "Not I," said the dog. "Not I," said the pig. "Then I will cut it myself," said the little red hen. And she did. "Who will help me take the wheat to the mill?" asked the little red hen. "Not I," said the cat. "Not I," said the dog. "Not I," said the pig. "Then I will take it myself," said the little red hen. And she did. The miller ground the wheat into flour. "Who will help me bake the bread?" asked the little red hen. "Not I," said the cat. "Not I," said the dog. "Not I," said the pig. "Then I will bake it myself," said the little red hen. And she did. The bread smelled wonderful! "Who will help me eat the bread?" asked the little red hen. "I will!" said the cat. "I will!" said the dog. "I will!" said the pig. "No, you will not," said the little red hen. "I will eat it myself." And she did.',
    language: 'en',
    level: 'Beginner',
    question1: 'What did the little red hen find in the barnyard?',
    question2: 'Why did the little red hen eat the bread by herself?'
  },
  {
    title: 'The Three Little Pigs',
    content: 'Once upon a time, there were three little pigs who lived with their mother. One day, their mother said, "You are all grown up now. It is time for you to build your own houses." The first little pig was very lazy. He quickly built his house out of straw. The second little pig was a little less lazy. He built his house out of sticks. The third little pig was very wise and hardworking. He built his house out of bricks. One day, a big bad wolf came to the village. He was very hungry and wanted to eat the little pigs. The wolf went to the first house, made of straw. "Little pig, little pig, let me come in!" he said. "Not by the hair on my chinny chin chin!" said the little pig. "Then I will huff and puff and blow your house in!" said the wolf. And he did! The first little pig ran to his brother\'s house made of sticks. The wolf followed and blew down the stick house too. Both pigs ran to their brother\'s brick house. The wolf tried to blow down the brick house, but he could not. The brick house was too strong. The wolf tried to come down the chimney, but the pigs had a pot of boiling water waiting. The wolf ran away and never came back. The three little pigs lived happily ever after in the brick house.',
    language: 'en',
    level: 'Beginner',
    question1: 'What material did the third little pig use to build his house?',
    question2: 'How did the pigs finally defeat the wolf?'
  },
  {
    title: 'The Tortoise and the Hare',
    content: 'Once upon a time, there was a hare who was very proud of his speed. He often made fun of the tortoise for being so slow. "You are so slow, tortoise!" the hare would say. "I can run circles around you!" The tortoise was tired of the hare\'s boasting. "Let us have a race," said the tortoise. "I will race you to the finish line." The hare laughed. "A race? With you? That is ridiculous! But I will race you anyway. It will be easy to win." The race began. The hare ran very fast and was soon far ahead of the tortoise. He looked back and saw the tortoise was still at the starting line. "I have plenty of time," thought the hare. "I will take a nap." The hare lay down under a tree and fell asleep. Meanwhile, the tortoise kept walking slowly and steadily. He did not stop. He did not rest. He just kept going. When the hare woke up, he saw the tortoise was almost at the finish line! The hare ran as fast as he could, but it was too late. The tortoise had already won the race. "Slow and steady wins the race," said the tortoise. The hare learned that being fast is not everything. Being consistent and determined is more important.',
    language: 'en',
    level: 'Intermediate',
    question1: 'Why did the hare decide to take a nap during the race?',
    question2: 'What lesson did the hare learn from the race?'
  },
  {
    title: 'The Boy Who Cried Wolf',
    content: 'There was once a young shepherd boy who was bored while watching over the village sheep. To amuse himself, he took a great breath and sang out, "Wolf! Wolf! The Wolf is chasing the sheep!" The villagers came running up the hill to help the boy drive the wolf away. But when they arrived at the top of the hill, they found no wolf. The boy laughed at the sight of their angry faces. "Don\'t cry wolf, shepherd boy," said the villagers, "when there\'s no wolf!" They went grumbling back down the hill. Later, the boy sang out again, "Wolf! Wolf! The Wolf is chasing the sheep!" To his naughty delight, he watched the villagers run up the hill to help him drive the wolf away. When the villagers saw no wolf, they sternly said, "Save your frightened song for when there is really something wrong! Don\'t cry wolf when there is no wolf!" But the boy just grinned and watched them go grumbling down the hill once more. Later, he saw a real wolf prowling about his flock. Alarmed, he leaped to his feet and sang out as loudly as he could, "Wolf! Wolf!" But the villagers thought he was trying to fool them again, and so they didn\'t come. At sunset, everyone wondered why the shepherd boy hadn\'t returned to the village with their sheep. They went up the hill to find the boy. They found him weeping. "There really was a wolf here! The flock has scattered! I cried out, \'Wolf!\' Why didn\'t you come?" An old man tried to comfort the boy as they walked back to the village. "We\'ll help you look for the lost sheep in the morning," he said, putting his arm around the youth, "Nobody believes a liar...even when he is telling the truth!"',
    level: 'Intermediate',
    question1: 'Why did the villagers stop believing the boy when he cried wolf?',
    question2: 'What happened when a real wolf actually appeared?'
  },
  {
    title: 'The Ant and the Grasshopper',
    content: 'In a field one summer\'s day, a grasshopper was hopping about, chirping and singing to its heart\'s content. An ant passed by, bearing along with great toil an ear of corn he was taking to the nest. "Why not come and chat with me," said the grasshopper, "instead of toiling and moiling in that way?" "I am helping to lay up food for the winter," said the ant, "and recommend you to do the same." "Why bother about winter?" said the grasshopper. "We have got plenty of food at present." But the ant went on its way and continued its toil. When the winter came, the grasshopper had no food and found itself dying of hunger, while it saw the ants distributing every day corn and grain from the stores they had collected in the summer. Then the grasshopper knew: it is best to prepare for the days of necessity.',
    level: 'Advanced',
    question1: 'What was the grasshopper doing while the ant was working?',
    question2: 'What lesson does this story teach about preparation?'
  }
]

async function setupDatabase() {
  console.log('Setting up database...')
  
  try {
    // First, let's check if the texts table exists
    const { data: existingData, error: checkError } = await supabase
      .from('texts')
      .select('count')
      .limit(1)
    
    if (checkError && checkError.code === 'PGRST116') {
      console.log('Texts table does not exist. You need to create it first.')
      console.log('Please run the SQL commands in database-setup.sql in your Supabase SQL editor.')
      return
    }
    
    // Check if we already have data
    const { data: existingTexts, error: countError } = await supabase
      .from('texts')
      .select('*')
    
    if (countError) {
      console.error('Error checking existing data:', countError)
      return
    }
    
    if (existingTexts && existingTexts.length > 0) {
      console.log(`Database already has ${existingTexts.length} texts. Skipping setup.`)
      return
    }
    
    // Insert sample data
    console.log('Inserting sample texts...')
    const { data, error } = await supabase
      .from('texts')
      .insert(sampleTexts)
    
    if (error) {
      console.error('Error inserting data:', error)
      return
    }
    
    console.log('Successfully inserted sample texts!')
    console.log('Your database is now ready to use.')
    
  } catch (error) {
    console.error('Setup failed:', error)
  }
}

setupDatabase() 