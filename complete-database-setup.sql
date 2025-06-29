-- Complete Database Setup for Vue GPT Text Reader
-- Run this entire script in your Supabase SQL Editor

-- 1. Create the texts table with language support
CREATE TABLE IF NOT EXISTS texts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  level VARCHAR(50) NOT NULL,
  question1 TEXT,
  question2 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the dictionary table with multi-language support
CREATE TABLE IF NOT EXISTS dictionary (
  id SERIAL PRIMARY KEY,
  word VARCHAR(100) NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  translation_en TEXT,
  translation_fr TEXT,
  translation_es TEXT,
  translation_de TEXT,
  translation_uk TEXT,
  part_of_speech VARCHAR(50) DEFAULT 'noun',
  difficulty VARCHAR(50) DEFAULT 'beginner',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(word, language)
);

-- 3. Create user preferences table to store user's native language
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  native_language VARCHAR(10) NOT NULL DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. Insert sample texts in multiple languages
INSERT INTO texts (title, content, language, level, question1, question2) VALUES
-- English texts
(
  'The Little Red Hen',
  'Once upon a time, there was a little red hen who lived on a farm. She was a very busy hen and always liked to do things for herself. One day, she found some wheat seeds in the barnyard. "Who will help me plant these seeds?" she asked. "Not I," said the cat. "Not I," said the dog. "Not I," said the pig. "Then I will plant them myself," said the little red hen. And she did. The wheat grew tall and golden. "Who will help me cut the wheat?" asked the little red hen. "Not I," said the cat. "Not I," said the dog. "Not I," said the pig. "Then I will cut it myself," said the little red hen. And she did. "Who will help me take the wheat to the mill?" asked the little red hen. "Not I," said the cat. "Not I," said the dog. "Not I," said the pig. "Then I will take it myself," said the little red hen. And she did. The miller ground the wheat into flour. "Who will help me bake the bread?" asked the little red hen. "Not I," said the cat. "Not I," said the dog. "Not I," said the pig. "Then I will bake it myself," said the little red hen. And she did. The bread smelled wonderful! "Who will help me eat the bread?" asked the little red hen. "I will!" said the cat. "I will!" said the dog. "I will!" said the pig. "No, you will not," said the little red hen. "I will eat it myself." And she did.',
  'en',
  'Beginner',
  'What did the little red hen find in the barnyard?',
  'Why did the little red hen eat the bread by herself?'
),
(
  'The Three Little Pigs',
  'Once upon a time, there were three little pigs who lived with their mother. One day, their mother said, "You are all grown up now. It is time for you to build your own houses." The first little pig was very lazy. He quickly built his house out of straw. The second little pig was a little less lazy. He built his house out of sticks. The third little pig was very wise and hardworking. He built his house out of bricks. One day, a big bad wolf came to the village. He was very hungry and wanted to eat the little pigs. The wolf went to the first house, made of straw. "Little pig, little pig, let me come in!" he said. "Not by the hair on my chinny chin chin!" said the little pig. "Then I will huff and puff and blow your house in!" said the wolf. And he did! The first little pig ran to his brother''s house made of sticks. The wolf followed and blew down the stick house too. Both pigs ran to their brother''s brick house. The wolf tried to blow down the brick house, but he could not. The brick house was too strong. The wolf tried to come down the chimney, but the pigs had a pot of boiling water waiting. The wolf ran away and never came back. The three little pigs lived happily ever after in the brick house.',
  'en',
  'Beginner',
  'What material did the third little pig use to build his house?',
  'How did the pigs finally defeat the wolf?'
),

-- French texts
(
  'La Petite Poule Rousse',
  'Il était une fois une petite poule rousse qui vivait dans une ferme. Elle était très occupée et aimait toujours faire les choses elle-même. Un jour, elle trouva des graines de blé dans la cour de la ferme. "Qui m''aidera à planter ces graines ?" demanda-t-elle. "Pas moi," dit le chat. "Pas moi," dit le chien. "Pas moi," dit le cochon. "Alors je les planterai moi-même," dit la petite poule rousse. Et elle le fit. Le blé poussa haut et doré. "Qui m''aidera à couper le blé ?" demanda la petite poule rousse. "Pas moi," dit le chat. "Pas moi," dit le chien. "Pas moi," dit le cochon. "Alors je le couperai moi-même," dit la petite poule rousse. Et elle le fit. "Qui m''aidera à porter le blé au moulin ?" demanda la petite poule rousse. "Pas moi," dit le chat. "Pas moi," dit le chien. "Pas moi," dit le cochon. "Alors je le porterai moi-même," dit la petite poule rousse. Et elle le fit. Le meunier moulut le blé en farine. "Qui m''aidera à faire le pain ?" demanda la petite poule rousse. "Pas moi," dit le chat. "Pas moi," dit le chien. "Pas moi," dit le cochon. "Alors je le ferai moi-même," dit la petite poule rousse. Et elle le fit. Le pain sentait merveilleusement bon ! "Qui m''aidera à manger le pain ?" demanda la petite poule rousse. "Moi !" dit le chat. "Moi !" dit le chien. "Moi !" dit le cochon. "Non, vous ne le ferez pas," dit la petite poule rousse. "Je le mangerai moi-même." Et elle le fit.',
  'fr',
  'Beginner',
  'Qu''est-ce que la petite poule rousse a trouvé dans la cour de la ferme ?',
  'Pourquoi la petite poule rousse a-t-elle mangé le pain toute seule ?'
),

-- Spanish texts
(
  'La Pequeña Gallina Roja',
  'Érase una vez una pequeña gallina roja que vivía en una granja. Era una gallina muy ocupada y siempre le gustaba hacer las cosas por sí misma. Un día, encontró algunas semillas de trigo en el corral. "¿Quién me ayudará a plantar estas semillas?" preguntó. "Yo no," dijo el gato. "Yo no," dijo el perro. "Yo no," dijo el cerdo. "Entonces las plantaré yo misma," dijo la pequeña gallina roja. Y lo hizo. El trigo creció alto y dorado. "¿Quién me ayudará a cortar el trigo?" preguntó la pequeña gallina roja. "Yo no," dijo el gato. "Yo no," dijo el perro. "Yo no," dijo el cerdo. "Entonces lo cortaré yo misma," dijo la pequeña gallina roja. Y lo hizo. "¿Quién me ayudará a llevar el trigo al molino?" preguntó la pequeña gallina roja. "Yo no," dijo el gato. "Yo no," dijo el perro. "Yo no," dijo el cerdo. "Entonces lo llevaré yo misma," dijo la pequeña gallina roja. Y lo hizo. El molinero molió el trigo en harina. "¿Quién me ayudará a hornear el pan?" preguntó la pequeña gallina roja. "Yo no," dijo el gato. "Yo no," dijo el perro. "Yo no," dijo el cerdo. "Entonces lo hornearé yo misma," dijo la pequeña gallina roja. Y lo hizo. ¡El pan olía maravillosamente! "¿Quién me ayudará a comer el pan?" preguntó la pequeña gallina roja. "¡Yo!" dijo el gato. "¡Yo!" dijo el perro. "¡Yo!" dijo el cerdo. "No, no lo haréis," dijo la pequeña gallina roja. "Lo comeré yo misma." Y lo hizo.',
  'es',
  'Beginner',
  '¿Qué encontró la pequeña gallina roja en el corral?',
  '¿Por qué la pequeña gallina roja comió el pan ella sola?'
),

-- German texts
(
  'Das Kleine Rote Huhn',
  'Es war einmal ein kleines rotes Huhn, das auf einem Bauernhof lebte. Es war ein sehr beschäftigtes Huhn und mochte es immer, Dinge selbst zu tun. Eines Tages fand es einige Weizenkörner im Hof. "Wer wird mir helfen, diese Körner zu pflanzen?" fragte es. "Nicht ich," sagte die Katze. "Nicht ich," sagte der Hund. "Nicht ich," sagte das Schwein. "Dann werde ich sie selbst pflanzen," sagte das kleine rote Huhn. Und das tat es. Der Weizen wuchs hoch und golden. "Wer wird mir helfen, den Weizen zu schneiden?" fragte das kleine rote Huhn. "Nicht ich," sagte die Katze. "Nicht ich," sagte der Hund. "Nicht ich," sagte das Schwein. "Dann werde ich ihn selbst schneiden," sagte das kleine rote Huhn. Und das tat es. "Wer wird mir helfen, den Weizen zur Mühle zu bringen?" fragte das kleine rote Huhn. "Nicht ich," sagte die Katze. "Nicht ich," sagte der Hund. "Nicht ich," sagte das Schwein. "Dann werde ich ihn selbst bringen," sagte das kleine rote Huhn. Und das tat es. Der Müller mahlte den Weizen zu Mehl. "Wer wird mir helfen, das Brot zu backen?" fragte das kleine rote Huhn. "Nicht ich," sagte die Katze. "Nicht ich," sagte der Hund. "Nicht ich," sagte das Schwein. "Dann werde ich es selbst backen," sagte das kleine rote Huhn. Und das tat es. Das Brot duftete wunderbar! "Wer wird mir helfen, das Brot zu essen?" fragte das kleine rote Huhn. "Ich!" sagte die Katze. "Ich!" sagte der Hund. "Ich!" sagte das Schwein. "Nein, das werdet ihr nicht," sagte das kleine rote Huhn. "Ich werde es selbst essen." Und das tat es.',
  'de',
  'Beginner',
  'Was fand das kleine rote Huhn im Hof?',
  'Warum aß das kleine rote Huhn das Brot allein?'
),

-- Ukrainian texts
(
  'Червона Курка',
  'Жили-були червона курка на фермі. Вона була дуже зайнятою куркою і завжди любила робити все сама. Одного дня вона знайшла пшеничні зерна на подвір''ї. "Хто допоможе мені посадити ці зерна?" - запитала вона. "Не я," - сказав кіт. "Не я," - сказав пес. "Не я," - сказав порося. "Тоді я посажу їх сама," - сказала червона курка. І вона це зробила. Пшениця виросла висока і золота. "Хто допоможе мені зібрати пшеницю?" - запитала червона курка. "Не я," - сказав кіт. "Не я," - сказав пес. "Не я," - сказав порося. "Тоді я зіберу її сама," - сказала червона курка. І вона це зробила. "Хто допоможе мені віднести пшеницю до млина?" - запитала червона курка. "Не я," - сказав кіт. "Не я," - сказав пес. "Не я," - сказав порося. "Тоді я віднесу її сама," - сказала червона курка. І вона це зробила. Мірошник змелив пшеницю в борошно. "Хто допоможе мені спекти хліб?" - запитала червона курка. "Не я," - сказав кіт. "Не я," - сказав пес. "Не я," - сказав порося. "Тоді я спеку його сама," - сказала червона курка. І вона це зробила. Хліб пахнув чудово! "Хто допоможе мені з''їсти хліб?" - запитала червона курка. "Я!" - сказав кіт. "Я!" - сказав пес. "Я!" - сказав порося. "Ні, ви не будете," - сказала червона курка. "Я з''їм його сама." І вона це зробила.',
  'uk',
  'Beginner',
  'Що знайшла червона курка на подвір''ї?',
  'Чому червона курка з''їла хліб сама?'
),
(
  'Три Поросята',
  'Жили-були три поросята зі своєю матір''ю. Одного дня їхня мати сказала: "Ви всі вже дорослі. Час вам будувати свої власні будинки." Перше порося було дуже ліниве. Воно швидко збудувало свій будинок з соломи. Друге порося було трохи менш ліниве. Воно збудувало свій будинок з дерева. Третє порося було дуже мудре і працьовите. Воно збудувало свій будинок з цегли. Одного дня до села прийшов великий злий вовк. Він був дуже голодний і хотів з''їсти поросят. Вовк пішов до першого будинку, зробленого з соломи. "Порося, порося, впусти мене!" - сказав він. "Не за волосся на моїй борідці!" - сказав порося. "Тоді я буду дути і дути, і знесу твій будинок!" - сказав вовк. І він це зробив! Перше порося побігло до будинку свого брата, зробленого з дерева. Вовк пішов слідом і зніс дерев''яний будинок теж. Обидва поросята побігли до цегляного будинку свого брата. Вовк спробував знести цегляний будинок, але не зміг. Цегляний будинок був занадто міцний. Вовк спробував спуститися через димохід, але поросята мали казанок з окропом, який чекав на нього. Вовк втік і більше не повертався. Три поросята жили щасливо назавжди в цегляному будинку.',
  'uk',
  'Beginner',
  'Який матеріал використав третій порося для будівництва свого будинку?',
  'Як поросята нарешті перемогли вовка?'
);

-- 5. Insert sample dictionary entries with Ukrainian translations
INSERT INTO dictionary (word, language, translation_en, translation_fr, translation_es, translation_de, translation_uk, part_of_speech, difficulty) VALUES
-- Animals
('hen', 'en', 'hen', 'poule', 'gallina', 'Huhn', 'курка', 'noun', 'beginner'),
('cat', 'en', 'cat', 'chat', 'gato', 'Katze', 'кот', 'noun', 'beginner'),
('dog', 'en', 'dog', 'chien', 'perro', 'Hund', 'собака', 'noun', 'beginner'),
('pig', 'en', 'pig', 'cochon', 'cerdo', 'Schwein', 'порося', 'noun', 'beginner'),
('wolf', 'en', 'wolf', 'loup', 'lobo', 'Wolf', 'вовк', 'noun', 'beginner'),

-- Objects and Materials
('house', 'en', 'house', 'maison', 'casa', 'Haus', 'будинок', 'noun', 'beginner'),
('bread', 'en', 'bread', 'pain', 'pan', 'Brot', 'хліб', 'noun', 'beginner'),
('water', 'en', 'water', 'eau', 'agua', 'Wasser', 'вода', 'noun', 'beginner'),
('tree', 'en', 'tree', 'arbre', 'árbol', 'Baum', 'дерево', 'noun', 'beginner'),
('sun', 'en', 'sun', 'soleil', 'sol', 'Sonne', 'сонце', 'noun', 'beginner'),
('book', 'en', 'book', 'livre', 'libro', 'Buch', 'книга', 'noun', 'beginner'),
('school', 'en', 'school', 'école', 'escuela', 'Schule', 'школа', 'noun', 'beginner'),
('car', 'en', 'car', 'voiture', 'coche', 'Auto', 'машина', 'noun', 'beginner'),

-- Actions
('eat', 'en', 'eat', 'manger', 'comer', 'essen', 'їсти', 'verb', 'beginner'),
('run', 'en', 'run', 'courir', 'correr', 'laufen', 'бігти', 'verb', 'beginner'),
('sleep', 'en', 'sleep', 'dormir', 'dormir', 'schlafen', 'спати', 'verb', 'beginner'),
('work', 'en', 'work', 'travailler', 'trabajar', 'arbeiten', 'працювати', 'verb', 'beginner'),
('help', 'en', 'help', 'aider', 'ayudar', 'helfen', 'допомагати', 'verb', 'beginner'),

-- Ukrainian words
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

-- 6. Enable Row Level Security (RLS) for all tables
ALTER TABLE texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dictionary ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 7. Create policies for texts table
CREATE POLICY "Allow authenticated users to read texts" ON texts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert texts" ON texts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update texts" ON texts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete texts" ON texts
  FOR DELETE USING (auth.role() = 'authenticated');

-- 8. Create policies for dictionary table
CREATE POLICY "Allow authenticated users to read dictionary" ON dictionary
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert dictionary entries" ON dictionary
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update dictionary entries" ON dictionary
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 9. Create policies for user_preferences table
CREATE POLICY "Users can read their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_texts_language ON texts(language);
CREATE INDEX IF NOT EXISTS idx_dictionary_word ON dictionary(word);
CREATE INDEX IF NOT EXISTS idx_dictionary_language ON dictionary(language);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_dictionary_translation_uk ON dictionary(translation_uk) WHERE translation_uk IS NOT NULL; 