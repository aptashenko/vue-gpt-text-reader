-- Add Anna's Morning text and dictionary entries
-- Run this in your Supabase SQL Editor

-- 1. Add the text
INSERT INTO texts (title, content, language, level, question1, question2) VALUES (
  'Anna''s Morning',
  'Anna wakes up early every day. She opens the window and takes a deep breath. The sky is blue, and the birds are singing. Anna goes to the kitchen and makes a cup of tea. She eats toast with jam. After breakfast, she takes her bag and walks to work. On the way, she sees her neighbor Mr. Lee. ''Good morning!'' she says. He smiles and waves. Anna likes mornings. They are quiet and peaceful.',
  'en',
  'beginner',
  'What does Anna do after waking up?',
  'Why does Anna like mornings?'
);

-- 2. Add dictionary entries
INSERT INTO dictionary (word, language, translation_en, translation_fr, translation_es, translation_de, translation_uk, part_of_speech, difficulty) VALUES
('anna', 'en', 'Anna', 'Anna', 'Anna', 'Anna', 'Анна', 'noun', 'beginner'),
('wake', 'en', 'wake', 'se réveiller', 'despertarse', 'aufwachen', 'прокидатися', 'verb', 'beginner'),
('up', 'en', 'up', 'debout', 'arriba', 'auf', 'вгору', 'adverb', 'beginner'),
('early', 'en', 'early', 'tôt', 'temprano', 'früh', 'рано', 'adverb', 'beginner'),
('every', 'en', 'every', 'chaque', 'cada', 'jeder', 'кожен', 'determiner', 'beginner'),
('day', 'en', 'day', 'jour', 'día', 'Tag', 'день', 'noun', 'beginner'),
('she', 'en', 'she', 'elle', 'ella', 'sie', 'вона', 'pronoun', 'beginner'),
('open', 'en', 'open', 'ouvrir', 'abrir', 'öffnen', 'відкривати', 'verb', 'beginner'),
('window', 'en', 'window', 'fenêtre', 'ventana', 'Fenster', 'вікно', 'noun', 'beginner'),
('take', 'en', 'take', 'prendre', 'tomar', 'nehmen', 'брати', 'verb', 'beginner'),
('deep', 'en', 'deep', 'profond', 'profundo', 'tief', 'глибокий', 'adjective', 'beginner'),
('breath', 'en', 'breath', 'souffle', 'respiración', 'Atemzug', 'дихання', 'noun', 'beginner'),
('sky', 'en', 'sky', 'ciel', 'cielo', 'Himmel', 'небо', 'noun', 'beginner'),
('blue', 'en', 'blue', 'bleu', 'azul', 'blau', 'синій', 'adjective', 'beginner'),
('bird', 'en', 'bird', 'oiseau', 'pájaro', 'Vogel', 'птах', 'noun', 'beginner'),
('sing', 'en', 'sing', 'chanter', 'cantar', 'singen', 'співати', 'verb', 'beginner'),
('go', 'en', 'go', 'aller', 'ir', 'gehen', 'йти', 'verb', 'beginner'),
('kitchen', 'en', 'kitchen', 'cuisine', 'cocina', 'Küche', 'кухня', 'noun', 'beginner'),
('make', 'en', 'make', 'faire / préparer', 'hacer', 'machen', 'робити / готувати', 'verb', 'beginner'),
('cup', 'en', 'cup', 'tasse', 'taza', 'Tasse', 'чашка', 'noun', 'beginner'),
('tea', 'en', 'tea', 'thé', 'té', 'Tee', 'чай', 'noun', 'beginner'),
('eat', 'en', 'eat', 'manger', 'comer', 'essen', 'їсти', 'verb', 'beginner'),
('toast', 'en', 'toast', 'pain grillé', 'tostada', 'Toast', 'тост', 'noun', 'beginner'),
('jam', 'en', 'jam', 'confiture', 'mermelada', 'Marmelade', 'повидло', 'noun', 'beginner'),
('after', 'en', 'after', 'après', 'después de', 'nach', 'після', 'preposition', 'beginner'),
('breakfast', 'en', 'breakfast', 'petit-déjeuner', 'desayuno', 'Frühstück', 'сніданок', 'noun', 'beginner'),
('bag', 'en', 'bag', 'sac', 'bolso', 'Tasche', 'сумка', 'noun', 'beginner'),
('walk', 'en', 'walk', 'marcher', 'caminar', 'gehen', 'йти пішки', 'verb', 'beginner'),
('work', 'en', 'work', 'travail', 'trabajo', 'Arbeit', 'робота', 'noun', 'beginner'),
('way', 'en', 'way', 'chemin', 'camino', 'Weg', 'шлях', 'noun', 'beginner'),
('see', 'en', 'see', 'voir', 'ver', 'sehen', 'бачити', 'verb', 'beginner'),
('neighbor', 'en', 'neighbor', 'voisin', 'vecino', 'Nachbar', 'сусід', 'noun', 'beginner'),
('smile', 'en', 'smile', 'sourire', 'sonreír', 'lächeln', 'усміхатися', 'verb', 'beginner'),
('wave', 'en', 'wave', 'saluer de la main', 'saludar con la mano', 'winken', 'махати', 'verb', 'beginner'),
('like', 'en', 'like', 'aimer', 'gustar', 'mögen', 'подобатися', 'verb', 'beginner'),
('quiet', 'en', 'quiet', 'calme', 'tranquilo', 'ruhig', 'тихий', 'adjective', 'beginner'),
('peaceful', 'en', 'peaceful', 'paisible', 'tranquilo', 'friedlich', 'спокійний', 'adjective', 'beginner')
ON CONFLICT (word, language) DO NOTHING;

-- 3. Show the results
SELECT 'Anna''s Morning text added successfully!' as status;
SELECT COUNT(*) as total_texts FROM texts WHERE title = 'Anna''s Morning';
SELECT COUNT(*) as total_dictionary_entries FROM dictionary WHERE language = 'en'; 