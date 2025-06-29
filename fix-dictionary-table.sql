-- Полная настройка таблицы dictionary и добавление Anna's Morning
-- Запустите этот скрипт в Supabase SQL Editor

-- 1. Сначала посмотрим на текущую структуру таблицы dictionary
SELECT 'Текущая структура таблицы dictionary:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'dictionary' 
ORDER BY ordinal_position;

-- 2. Добавим все необходимые колонки если их нет
DO $$ 
BEGIN
    -- Добавляем колонку language
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dictionary' AND column_name = 'language'
    ) THEN
        ALTER TABLE dictionary ADD COLUMN language VARCHAR(10) DEFAULT 'en';
        RAISE NOTICE 'Добавлена колонка language';
    END IF;
    
    -- Добавляем колонку translation_en
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dictionary' AND column_name = 'translation_en'
    ) THEN
        ALTER TABLE dictionary ADD COLUMN translation_en TEXT;
        RAISE NOTICE 'Добавлена колонка translation_en';
    END IF;
    
    -- Добавляем колонку translation_fr
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dictionary' AND column_name = 'translation_fr'
    ) THEN
        ALTER TABLE dictionary ADD COLUMN translation_fr TEXT;
        RAISE NOTICE 'Добавлена колонка translation_fr';
    END IF;
    
    -- Добавляем колонку translation_es
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dictionary' AND column_name = 'translation_es'
    ) THEN
        ALTER TABLE dictionary ADD COLUMN translation_es TEXT;
        RAISE NOTICE 'Добавлена колонка translation_es';
    END IF;
    
    -- Добавляем колонку translation_de
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dictionary' AND column_name = 'translation_de'
    ) THEN
        ALTER TABLE dictionary ADD COLUMN translation_de TEXT;
        RAISE NOTICE 'Добавлена колонка translation_de';
    END IF;
    
    -- Добавляем колонку translation_uk
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dictionary' AND column_name = 'translation_uk'
    ) THEN
        ALTER TABLE dictionary ADD COLUMN translation_uk TEXT;
        RAISE NOTICE 'Добавлена колонка translation_uk';
    END IF;
    
    -- Добавляем колонку difficulty
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dictionary' AND column_name = 'difficulty'
    ) THEN
        ALTER TABLE dictionary ADD COLUMN difficulty VARCHAR(50) DEFAULT 'beginner';
        RAISE NOTICE 'Добавлена колонка difficulty';
    END IF;
END $$;

-- 3. Добавим уникальное ограничение если его нет
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'dictionary_word_language_key'
    ) THEN
        ALTER TABLE dictionary ADD CONSTRAINT dictionary_word_language_key UNIQUE (word, language);
        RAISE NOTICE 'Добавлено уникальное ограничение для (word, language)';
    ELSE
        RAISE NOTICE 'Уникальное ограничение для (word, language) уже существует';
    END IF;
END $$;

-- 4. Покажем обновленную структуру таблицы
SELECT 'Обновленная структура таблицы dictionary:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'dictionary' 
ORDER BY ordinal_position;

-- 5. Добавим текст Anna's Morning
INSERT INTO texts (title, content, language, level, question1, question2) VALUES (
  'Anna''s Morning',
  'Anna wakes up early every day. She opens the window and takes a deep breath. The sky is blue, and the birds are singing. Anna goes to the kitchen and makes a cup of tea. She eats toast with jam. After breakfast, she takes her bag and walks to work. On the way, she sees her neighbor Mr. Lee. ''Good morning!'' she says. He smiles and waves. Anna likes mornings. They are quiet and peaceful.',
  'en',
  'beginner',
  'What does Anna do after waking up?',
  'Why does Anna like mornings?'
);

-- 6. Добавим словарь для Anna's Morning (с колонкой translation)
INSERT INTO dictionary (word, translation, language, translation_en, translation_fr, translation_es, translation_de, translation_uk, part_of_speech, difficulty) VALUES
('anna', 'Анна', 'en', 'Anna', 'Anna', 'Anna', 'Anna', 'Анна', 'noun', 'beginner'),
('wake', 'прокидатися', 'en', 'wake', 'se réveiller', 'despertarse', 'aufwachen', 'прокидатися', 'verb', 'beginner'),
('up', 'вгору', 'en', 'up', 'debout', 'arriba', 'auf', 'вгору', 'adverb', 'beginner'),
('early', 'рано', 'en', 'early', 'tôt', 'temprano', 'früh', 'рано', 'adverb', 'beginner'),
('every', 'кожен', 'en', 'every', 'chaque', 'cada', 'jeder', 'кожен', 'determiner', 'beginner'),
('day', 'день', 'en', 'day', 'jour', 'día', 'Tag', 'день', 'noun', 'beginner'),
('she', 'вона', 'en', 'she', 'elle', 'ella', 'sie', 'вона', 'pronoun', 'beginner'),
('open', 'відкривати', 'en', 'open', 'ouvrir', 'abrir', 'öffnen', 'відкривати', 'verb', 'beginner'),
('window', 'вікно', 'en', 'window', 'fenêtre', 'ventana', 'Fenster', 'вікно', 'noun', 'beginner'),
('take', 'брати', 'en', 'take', 'prendre', 'tomar', 'nehmen', 'брати', 'verb', 'beginner'),
('deep', 'глибокий', 'en', 'deep', 'profond', 'profundo', 'tief', 'глибокий', 'adjective', 'beginner'),
('breath', 'дихання', 'en', 'breath', 'souffle', 'respiración', 'Atemzug', 'дихання', 'noun', 'beginner'),
('sky', 'небо', 'en', 'sky', 'ciel', 'cielo', 'Himmel', 'небо', 'noun', 'beginner'),
('blue', 'синій', 'en', 'blue', 'bleu', 'azul', 'blau', 'синій', 'adjective', 'beginner'),
('bird', 'птах', 'en', 'bird', 'oiseau', 'pájaro', 'Vogel', 'птах', 'noun', 'beginner'),
('sing', 'співати', 'en', 'sing', 'chanter', 'cantar', 'singen', 'співати', 'verb', 'beginner'),
('go', 'йти', 'en', 'go', 'aller', 'ir', 'gehen', 'йти', 'verb', 'beginner'),
('kitchen', 'кухня', 'en', 'kitchen', 'cuisine', 'cocina', 'Küche', 'кухня', 'noun', 'beginner'),
('make', 'робити / готувати', 'en', 'make', 'faire / préparer', 'hacer', 'machen', 'робити / готувати', 'verb', 'beginner'),
('cup', 'чашка', 'en', 'cup', 'tasse', 'taza', 'Tasse', 'чашка', 'noun', 'beginner'),
('tea', 'чай', 'en', 'tea', 'thé', 'té', 'Tee', 'чай', 'noun', 'beginner'),
('eat', 'їсти', 'en', 'eat', 'manger', 'comer', 'essen', 'їсти', 'verb', 'beginner'),
('toast', 'тост', 'en', 'toast', 'pain grillé', 'tostada', 'Toast', 'тост', 'noun', 'beginner'),
('jam', 'повидло', 'en', 'jam', 'confiture', 'mermelada', 'Marmelade', 'повидло', 'noun', 'beginner'),
('after', 'після', 'en', 'after', 'après', 'después de', 'nach', 'після', 'preposition', 'beginner'),
('breakfast', 'сніданок', 'en', 'breakfast', 'petit-déjeuner', 'desayuno', 'Frühstück', 'сніданок', 'noun', 'beginner'),
('bag', 'сумка', 'en', 'bag', 'sac', 'bolso', 'Tasche', 'сумка', 'noun', 'beginner'),
('walk', 'йти пішки', 'en', 'walk', 'marcher', 'caminar', 'gehen', 'йти пішки', 'verb', 'beginner'),
('work', 'робота', 'en', 'work', 'travail', 'trabajo', 'Arbeit', 'робота', 'noun', 'beginner'),
('way', 'шлях', 'en', 'way', 'chemin', 'camino', 'Weg', 'шлях', 'noun', 'beginner'),
('see', 'бачити', 'en', 'see', 'voir', 'ver', 'sehen', 'бачити', 'verb', 'beginner'),
('neighbor', 'сусід', 'en', 'neighbor', 'voisin', 'vecino', 'Nachbar', 'сусід', 'noun', 'beginner'),
('smile', 'усміхатися', 'en', 'smile', 'sourire', 'sonreír', 'lächeln', 'усміхатися', 'verb', 'beginner'),
('wave', 'махати', 'en', 'wave', 'saluer de la main', 'saludar con la mano', 'winken', 'махати', 'verb', 'beginner'),
('like', 'подобатися', 'en', 'like', 'aimer', 'gustar', 'mögen', 'подобатися', 'verb', 'beginner'),
('quiet', 'тихий', 'en', 'quiet', 'calme', 'tranquilo', 'ruhig', 'тихий', 'adjective', 'beginner'),
('peaceful', 'спокійний', 'en', 'peaceful', 'paisible', 'tranquilo', 'friedlich', 'спокійний', 'adjective', 'beginner');

-- 7. Обновим существующие записи
UPDATE dictionary SET language = 'en' WHERE language IS NULL;

-- 8. Покажем результаты
SELECT 'Текст Anna''s Morning и словарь успешно добавлены!' as status;
SELECT COUNT(*) as total_texts FROM texts WHERE title = 'Anna''s Morning';
SELECT COUNT(*) as total_dictionary_entries FROM dictionary WHERE language = 'en'; 