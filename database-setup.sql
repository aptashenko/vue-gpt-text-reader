-- Create the texts table with language support
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

-- Create user preferences table to store user's native language
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  native_language VARCHAR(10) NOT NULL DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Insert sample data in multiple languages
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
(
  'The Tortoise and the Hare',
  'Once upon a time, there was a hare who was very proud of his speed. He often made fun of the tortoise for being so slow. "You are so slow, tortoise!" the hare would say. "I can run circles around you!" The tortoise was tired of the hare''s boasting. "Let us have a race," said the tortoise. "I will race you to the finish line." The hare laughed. "A race? With you? That is ridiculous! But I will race you anyway. It will be easy to win." The race began. The hare ran very fast and was soon far ahead of the tortoise. He looked back and saw the tortoise was still at the starting line. "I have plenty of time," thought the hare. "I will take a nap." The hare lay down under a tree and fell asleep. Meanwhile, the tortoise kept walking slowly and steadily. He did not stop. He did not rest. He just kept going. When the hare woke up, he saw the tortoise was almost at the finish line! The hare ran as fast as he could, but it was too late. The tortoise had already won the race. "Slow and steady wins the race," said the tortoise. The hare learned that being fast is not everything. Being consistent and determined is more important.',
  'en',
  'Intermediate',
  'Why did the hare decide to take a nap during the race?',
  'What lesson did the hare learn from the race?'
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
(
  'Les Trois Petits Cochons',
  'Il était une fois trois petits cochons qui vivaient avec leur mère. Un jour, leur mère dit : "Vous êtes tous grands maintenant. Il est temps que vous construisiez vos propres maisons." Le premier petit cochon était très paresseux. Il construisit rapidement sa maison en paille. Le deuxième petit cochon était un peu moins paresseux. Il construisit sa maison en bois. Le troisième petit cochon était très sage et travailleur. Il construisit sa maison en briques. Un jour, un grand méchant loup vint au village. Il avait très faim et voulait manger les petits cochons. Le loup alla à la première maison, faite de paille. "Petit cochon, petit cochon, laisse-moi entrer !" dit-il. "Pas par les poils de mon menton !" dit le petit cochon. "Alors je vais souffler et souffler et faire tomber ta maison !" dit le loup. Et il le fit ! Le premier petit cochon courut vers la maison de son frère, faite de bois. Le loup suivit et fit tomber la maison de bois aussi. Les deux cochons coururent vers la maison de briques de leur frère. Le loup essaya de faire tomber la maison de briques, mais il ne put pas. La maison de briques était trop solide. Le loup essaya de descendre par la cheminée, mais les cochons avaient une marmite d''eau bouillante qui l''attendait. Le loup s''enfuit et ne revint jamais. Les trois petits cochons vécurent heureux pour toujours dans la maison de briques.',
  'fr',
  'Beginner',
  'Quel matériau le troisième petit cochon a-t-il utilisé pour construire sa maison ?',
  'Comment les cochons ont-ils finalement vaincu le loup ?'
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
(
  'Los Tres Cerditos',
  'Érase una vez tres cerditos que vivían con su madre. Un día, su madre dijo: "Ya sois todos mayores. Es hora de que construyáis vuestras propias casas." El primer cerdito era muy perezoso. Construyó rápidamente su casa de paja. El segundo cerdito era un poco menos perezoso. Construyó su casa de madera. El tercer cerdito era muy sabio y trabajador. Construyó su casa de ladrillos. Un jour, un lobo malo grande vino al pueblo. Tenía mucha hambre y quería comerse a los cerditos. El lobo fue a la primera casa, hecha de paja. "¡Cerdito, cerdito, déjame entrar!" dijo. "¡No por los pelos de mi barbilla!" dijo el cerdito. "¡Entonces soplaré y soplaré y derribaré tu casa!" dijo el lobo. ¡Y lo hizo! El primer cerdito corrió hacia la casa de su hermano, hecha de madera. El lobo siguió y también derribó la casa de madera. Ambos cerditos corrieron hacia la casa de ladrillos de su hermano. El lobo intentó derribar la casa de ladrillos, pero no pudo. La casa de ladrillos era demasiado fuerte. El lobo intentó bajar por la chimenea, pero los cerditos tenían una olla de agua hirviendo esperándolo. El lobo huyó y nunca volvió. Los tres cerditos vivieron felices para siempre en la casa de ladrillos.',
  'es',
  'Beginner',
  '¿Qué material usó el tercer cerdito para construir su casa?',
  '¿Cómo derrotaron finalmente los cerditos al lobo?'
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
(
  'Die Drei Kleinen Schweinchen',
  'Es war einmal drei kleine Schweinchen, die mit ihrer Mutter lebten. Eines Tages sagte ihre Mutter: "Ihr seid alle erwachsen geworden. Es ist Zeit, dass ihr eure eigenen Häuser baut." Das erste kleine Schweinchen war sehr faul. Es baute schnell sein Haus aus Stroh. Das zweite kleine Schweinchen war ein bisschen weniger faul. Es baute sein Haus aus Holz. Das dritte kleine Schweinchen war sehr weise und fleißig. Es baute sein Haus aus Ziegeln. Eines Tages kam ein großer böser Wolf ins Dorf. Er hatte großen Hunger und wollte die kleinen Schweinchen fressen. Der Wolf ging zum ersten Haus, das aus Stroh gemacht war. "Kleines Schweinchen, kleines Schweinchen, lass mich herein!" sagte er. "Nicht bei den Haaren meines Kinns!" sagte das Schweinchen. "Dann werde ich pusten und pusten und dein Haus einblasen!" sagte der Wolf. Und das tat er! Das erste kleine Schweinchen rannte zum Haus seines Bruders, das aus Holz gemacht war. Der Wolf folgte und blies auch das Holzhaus um. Beide Schweinchen rannten zum Ziegelhaus ihres Bruders. Der Wolf versuchte, das Ziegelhaus umzublasen, aber er konnte es nicht. Das Ziegelhaus war zu stark. Der Wolf versuchte, durch den Schornstein zu kommen, aber die Schweinchen hatten einen Topf mit kochendem Wasser bereit. Der Wolf rannte weg und kam nie wieder. Die drei kleinen Schweinchen lebten glücklich für immer im Ziegelhaus.',
  'de',
  'Beginner',
  'Welches Material verwendete das dritte kleine Schweinchen für sein Haus?',
  'Wie besiegten die Schweinchen schließlich den Wolf?'
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

-- Enable Row Level Security (RLS)
ALTER TABLE texts ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all authenticated users to read texts
CREATE POLICY "Allow authenticated users to read texts" ON texts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create a policy that allows authenticated users to insert texts (optional, for admin functionality)
CREATE POLICY "Allow authenticated users to insert texts" ON texts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create a policy that allows authenticated users to update texts (optional, for admin functionality)
CREATE POLICY "Allow authenticated users to update texts" ON texts
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create a policy that allows authenticated users to delete texts (optional, for admin functionality)
CREATE POLICY "Allow authenticated users to delete texts" ON texts
  FOR DELETE USING (auth.role() = 'authenticated');

-- Enable RLS for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user_preferences
CREATE POLICY "Users can read their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id); 