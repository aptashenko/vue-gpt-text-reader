-- Create the dictionary table with multi-language support
CREATE TABLE IF NOT EXISTS dictionary (
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

-- Insert sample translations for common words in multiple languages
INSERT INTO dictionary (word, language, translation_en, translation_fr, translation_es, translation_de, part_of_speech, difficulty) VALUES
-- Animals
('hen', 'en', 'hen', 'poule', 'gallina', 'Huhn', 'noun', 'beginner'),
('cat', 'en', 'cat', 'chat', 'gato', 'Katze', 'noun', 'beginner'),
('dog', 'en', 'dog', 'chien', 'perro', 'Hund', 'noun', 'beginner'),
('pig', 'en', 'pig', 'cochon', 'cerdo', 'Schwein', 'noun', 'beginner'),
('wolf', 'en', 'wolf', 'loup', 'lobo', 'Wolf', 'noun', 'beginner'),
('tortoise', 'en', 'tortoise', 'tortue', 'tortuga', 'Schildkröte', 'noun', 'intermediate'),
('hare', 'en', 'hare', 'lièvre', 'liebre', 'Hase', 'noun', 'intermediate'),
('ant', 'en', 'ant', 'fourmi', 'hormiga', 'Ameise', 'noun', 'intermediate'),
('grasshopper', 'en', 'grasshopper', 'sauterelle', 'saltamontes', 'Heuschrecke', 'noun', 'advanced'),
('sheep', 'en', 'sheep', 'mouton', 'oveja', 'Schaf', 'noun', 'intermediate'),

-- Objects and Materials
('house', 'en', 'house', 'maison', 'casa', 'Haus', 'noun', 'beginner'),
('straw', 'en', 'straw', 'paille', 'paja', 'Stroh', 'noun', 'intermediate'),
('sticks', 'en', 'sticks', 'bâtons', 'palos', 'Stöcke', 'noun', 'intermediate'),
('bricks', 'en', 'bricks', 'briques', 'ladrillos', 'Ziegel', 'noun', 'intermediate'),
('bread', 'en', 'bread', 'pain', 'pan', 'Brot', 'noun', 'beginner'),
('wheat', 'en', 'wheat', 'blé', 'trigo', 'Weizen', 'noun', 'intermediate'),
('seeds', 'en', 'seeds', 'graines', 'semillas', 'Samen', 'noun', 'intermediate'),
('flour', 'en', 'flour', 'farine', 'harina', 'Mehl', 'noun', 'intermediate'),
('mill', 'en', 'mill', 'moulin', 'molino', 'Mühle', 'noun', 'intermediate'),
('chimney', 'en', 'chimney', 'cheminée', 'chimenea', 'Schornstein', 'noun', 'advanced'),
('pot', 'en', 'pot', 'marmite', 'olla', 'Topf', 'noun', 'intermediate'),
('water', 'en', 'water', 'eau', 'agua', 'Wasser', 'noun', 'beginner'),
('corn', 'en', 'corn', 'maïs', 'maíz', 'Mais', 'noun', 'intermediate'),
('food', 'en', 'food', 'nourriture', 'comida', 'Essen', 'noun', 'beginner'),
('nest', 'en', 'nest', 'nid', 'nido', 'Nest', 'noun', 'intermediate'),

-- Actions
('plant', 'en', 'plant', 'planter', 'plantar', 'pflanzen', 'verb', 'intermediate'),
('cut', 'en', 'cut', 'couper', 'cortar', 'schneiden', 'verb', 'beginner'),
('bake', 'en', 'bake', 'cuire', 'hornear', 'backen', 'verb', 'intermediate'),
('eat', 'en', 'eat', 'manger', 'comer', 'essen', 'verb', 'beginner'),
('build', 'en', 'build', 'construire', 'construir', 'bauen', 'verb', 'intermediate'),
('run', 'en', 'run', 'courir', 'correr', 'laufen', 'verb', 'beginner'),
('sleep', 'en', 'sleep', 'dormir', 'dormir', 'schlafen', 'verb', 'beginner'),
('walk', 'en', 'walk', 'marcher', 'caminar', 'gehen', 'verb', 'beginner'),
('work', 'en', 'work', 'travailler', 'trabajar', 'arbeiten', 'verb', 'beginner'),
('help', 'en', 'help', 'aider', 'ayudar', 'helfen', 'verb', 'beginner'),
('cry', 'en', 'cry', 'pleurer', 'llorar', 'weinen', 'verb', 'beginner'),
('sing', 'en', 'sing', 'chanter', 'cantar', 'singen', 'verb', 'beginner'),
('chat', 'en', 'chat', 'bavarder', 'charlar', 'plaudern', 'verb', 'intermediate'),
('prepare', 'en', 'prepare', 'préparer', 'preparar', 'vorbereiten', 'verb', 'intermediate'),
('collect', 'en', 'collect', 'collecter', 'recolectar', 'sammeln', 'verb', 'intermediate'),

-- Adjectives
('lazy', 'en', 'lazy', 'paresseux', 'perezoso', 'faul', 'adjective', 'intermediate'),
('wise', 'en', 'wise', 'sage', 'sabio', 'weise', 'adjective', 'intermediate'),
('hardworking', 'en', 'hardworking', 'travailleur', 'trabajador', 'fleißig', 'adjective', 'advanced'),
('hungry', 'en', 'hungry', 'affamé', 'hambriento', 'hungrig', 'adjective', 'intermediate'),
('strong', 'en', 'strong', 'fort', 'fuerte', 'stark', 'adjective', 'beginner'),
('slow', 'en', 'slow', 'lent', 'lento', 'langsam', 'adjective', 'beginner'),
('fast', 'en', 'fast', 'rapide', 'rápido', 'schnell', 'adjective', 'beginner'),
('proud', 'en', 'proud', 'fier', 'orgulloso', 'stolz', 'adjective', 'intermediate'),
('steady', 'en', 'steady', 'constant', 'constante', 'beständig', 'adjective', 'advanced'),
('determined', 'en', 'determined', 'déterminé', 'determinado', 'entschlossen', 'adjective', 'advanced'),
('bored', 'en', 'bored', 'ennuyé', 'aburrido', 'gelangweilt', 'adjective', 'intermediate'),
('angry', 'en', 'angry', 'en colère', 'enojado', 'wütend', 'adjective', 'intermediate'),
('naughty', 'en', 'naughty', 'méchant', 'travieso', 'frech', 'adjective', 'intermediate'),
('stern', 'en', 'stern', 'sévère', 'severo', 'streng', 'adjective', 'advanced'),

-- Other important words
('farm', 'en', 'farm', 'ferme', 'granja', 'Bauernhof', 'noun', 'beginner'),
('barnyard', 'en', 'barnyard', 'cour de ferme', 'patio de la granja', 'Hof', 'noun', 'advanced'),
('village', 'en', 'village', 'village', 'pueblo', 'Dorf', 'noun', 'intermediate'),
('field', 'en', 'field', 'champ', 'campo', 'Feld', 'noun', 'beginner'),
('winter', 'en', 'winter', 'hiver', 'invierno', 'Winter', 'noun', 'beginner'),
('summer', 'en', 'summer', 'été', 'verano', 'Sommer', 'noun', 'beginner'),
('race', 'en', 'race', 'course', 'carrera', 'Rennen', 'noun', 'intermediate'),
('finish', 'en', 'finish', 'terminer', 'terminar', 'beenden', 'verb', 'intermediate'),
('line', 'en', 'line', 'ligne', 'línea', 'Linie', 'noun', 'beginner'),
('tree', 'en', 'tree', 'arbre', 'árbol', 'Baum', 'noun', 'beginner'),
('hill', 'en', 'hill', 'colline', 'colina', 'Hügel', 'noun', 'intermediate'),
('sunset', 'en', 'sunset', 'coucher de soleil', 'atardecer', 'Sonnenuntergang', 'noun', 'intermediate'),
('morning', 'en', 'morning', 'matin', 'mañana', 'Morgen', 'noun', 'beginner'),
('lesson', 'en', 'lesson', 'leçon', 'lección', 'Lektion', 'noun', 'intermediate'),
('truth', 'en', 'truth', 'vérité', 'verdad', 'Wahrheit', 'noun', 'intermediate'),
('liar', 'en', 'liar', 'menteur', 'mentiroso', 'Lügner', 'noun', 'intermediate'),
('necessity', 'en', 'necessity', 'nécessité', 'necesidad', 'Notwendigkeit', 'noun', 'advanced'),
('toil', 'en', 'toil', 'travail dur', 'trabajo duro', 'harte Arbeit', 'noun', 'advanced'),
('moiling', 'en', 'moiling', 'travailler dur', 'trabajando duro', 'hart arbeiten', 'verb', 'advanced'),
('distribute', 'en', 'distribute', 'distribuer', 'distribuir', 'verteilen', 'verb', 'advanced')
ON CONFLICT (word, language) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE dictionary ENABLE ROW LEVEL SECURITY;

-- Create policies for dictionary access
CREATE POLICY "Allow authenticated users to read dictionary" ON dictionary
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert dictionary entries" ON dictionary
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update dictionary entries" ON dictionary
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_dictionary_word ON dictionary(word);
CREATE INDEX IF NOT EXISTS idx_dictionary_language ON dictionary(language);
CREATE INDEX IF NOT EXISTS idx_dictionary_difficulty ON dictionary(difficulty); 