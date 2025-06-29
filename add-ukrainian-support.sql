-- Add Ukrainian language support to the dictionary table
-- First, add the translation_uk column if it doesn't exist
ALTER TABLE dictionary ADD COLUMN IF NOT EXISTS translation_uk VARCHAR(255);

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

-- Add Ukrainian translations for French words
UPDATE dictionary SET translation_uk = 'кот' WHERE word = 'chat' AND language = 'fr';
UPDATE dictionary SET translation_uk = 'хліб' WHERE word = 'pain' AND language = 'fr';
UPDATE dictionary SET translation_uk = 'вода' WHERE word = 'eau' AND language = 'fr';
UPDATE dictionary SET translation_uk = 'будинок' WHERE word = 'maison' AND language = 'fr';
UPDATE dictionary SET translation_uk = 'дерево' WHERE word = 'arbre' AND language = 'fr';

-- Add Ukrainian translations for Spanish words
UPDATE dictionary SET translation_uk = 'кот' WHERE word = 'gato' AND language = 'es';
UPDATE dictionary SET translation_uk = 'хліб' WHERE word = 'pan' AND language = 'es';
UPDATE dictionary SET translation_uk = 'вода' WHERE word = 'agua' AND language = 'es';
UPDATE dictionary SET translation_uk = 'будинок' WHERE word = 'casa' AND language = 'es';
UPDATE dictionary SET translation_uk = 'дерево' WHERE word = 'árbol' AND language = 'es';

-- Add Ukrainian translations for German words
UPDATE dictionary SET translation_uk = 'кот' WHERE word = 'katze' AND language = 'de';
UPDATE dictionary SET translation_uk = 'хліб' WHERE word = 'brot' AND language = 'de';
UPDATE dictionary SET translation_uk = 'вода' WHERE word = 'wasser' AND language = 'de';
UPDATE dictionary SET translation_uk = 'будинок' WHERE word = 'haus' AND language = 'de';
UPDATE dictionary SET translation_uk = 'дерево' WHERE word = 'baum' AND language = 'de';

-- Add some Ukrainian words to the dictionary
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

-- Create index for better performance on Ukrainian translations
CREATE INDEX IF NOT EXISTS idx_dictionary_translation_uk ON dictionary(translation_uk) WHERE translation_uk IS NOT NULL; 