-- Create the dictionary table
CREATE TABLE IF NOT EXISTS dictionary (
  id SERIAL PRIMARY KEY,
  word VARCHAR(100) NOT NULL UNIQUE,
  translation TEXT NOT NULL,
  part_of_speech VARCHAR(50) DEFAULT 'noun',
  difficulty VARCHAR(50) DEFAULT 'beginner',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample translations for common words in our texts
INSERT INTO dictionary (word, translation, part_of_speech, difficulty) VALUES
-- Animals
('hen', 'gallina', 'noun', 'beginner'),
('cat', 'gato', 'noun', 'beginner'),
('dog', 'perro', 'noun', 'beginner'),
('pig', 'cerdo', 'noun', 'beginner'),
('wolf', 'lobo', 'noun', 'beginner'),
('tortoise', 'tortuga', 'noun', 'intermediate'),
('hare', 'liebre', 'noun', 'intermediate'),
('ant', 'hormiga', 'noun', 'intermediate'),
('grasshopper', 'saltamontes', 'noun', 'advanced'),
('sheep', 'oveja', 'noun', 'intermediate'),

-- Objects and Materials
('house', 'casa', 'noun', 'beginner'),
('straw', 'paja', 'noun', 'intermediate'),
('sticks', 'palos', 'noun', 'intermediate'),
('bricks', 'ladrillos', 'noun', 'intermediate'),
('bread', 'pan', 'noun', 'beginner'),
('wheat', 'trigo', 'noun', 'intermediate'),
('seeds', 'semillas', 'noun', 'intermediate'),
('flour', 'harina', 'noun', 'intermediate'),
('mill', 'molino', 'noun', 'intermediate'),
('chimney', 'chimenea', 'noun', 'advanced'),
('pot', 'olla', 'noun', 'intermediate'),
('water', 'agua', 'noun', 'beginner'),
('corn', 'maíz', 'noun', 'intermediate'),
('food', 'comida', 'noun', 'beginner'),
('nest', 'nido', 'noun', 'intermediate'),

-- Actions
('plant', 'plantar', 'verb', 'intermediate'),
('cut', 'cortar', 'verb', 'beginner'),
('bake', 'hornear', 'verb', 'intermediate'),
('eat', 'comer', 'verb', 'beginner'),
('build', 'construir', 'verb', 'intermediate'),
('run', 'correr', 'verb', 'beginner'),
('sleep', 'dormir', 'verb', 'beginner'),
('walk', 'caminar', 'verb', 'beginner'),
('work', 'trabajar', 'verb', 'beginner'),
('help', 'ayudar', 'verb', 'beginner'),
('cry', 'llorar', 'verb', 'beginner'),
('sing', 'cantar', 'verb', 'beginner'),
('chat', 'charlar', 'verb', 'intermediate'),
('prepare', 'preparar', 'verb', 'intermediate'),
('collect', 'recolectar', 'verb', 'intermediate'),

-- Adjectives
('lazy', 'perezoso', 'adjective', 'intermediate'),
('wise', 'sabio', 'adjective', 'intermediate'),
('hardworking', 'trabajador', 'adjective', 'advanced'),
('hungry', 'hambriento', 'adjective', 'intermediate'),
('strong', 'fuerte', 'adjective', 'beginner'),
('slow', 'lento', 'adjective', 'beginner'),
('fast', 'rápido', 'adjective', 'beginner'),
('proud', 'orgulloso', 'adjective', 'intermediate'),
('steady', 'constante', 'adjective', 'advanced'),
('determined', 'determinado', 'adjective', 'advanced'),
('bored', 'aburrido', 'adjective', 'intermediate'),
('angry', 'enojado', 'adjective', 'intermediate'),
('naughty', 'travieso', 'adjective', 'intermediate'),
('stern', 'severo', 'adjective', 'advanced'),
('comfort', 'consolar', 'verb', 'intermediate'),

-- Other important words
('farm', 'granja', 'noun', 'beginner'),
('barnyard', 'patio de la granja', 'noun', 'advanced'),
('village', 'pueblo', 'noun', 'intermediate'),
('field', 'campo', 'noun', 'beginner'),
('winter', 'invierno', 'noun', 'beginner'),
('summer', 'verano', 'noun', 'beginner'),
('race', 'carrera', 'noun', 'intermediate'),
('finish', 'terminar', 'verb', 'intermediate'),
('line', 'línea', 'noun', 'beginner'),
('tree', 'árbol', 'noun', 'beginner'),
('hill', 'colina', 'noun', 'intermediate'),
('sunset', 'atardecer', 'noun', 'intermediate'),
('morning', 'mañana', 'noun', 'beginner'),
('lesson', 'lección', 'noun', 'intermediate'),
('truth', 'verdad', 'noun', 'intermediate'),
('liar', 'mentiroso', 'noun', 'intermediate'),
('necessity', 'necesidad', 'noun', 'advanced'),
('toil', 'trabajo duro', 'noun', 'advanced'),
('moiling', 'trabajando duro', 'verb', 'advanced'),
('distribute', 'distribuir', 'verb', 'advanced')
ON CONFLICT (word) DO NOTHING;

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
CREATE INDEX IF NOT EXISTS idx_dictionary_difficulty ON dictionary(difficulty); 