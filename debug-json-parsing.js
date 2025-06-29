// Debug script to test JSON parsing
const testJson = `{
  "text": {
    "title": "Le Chat de Lucie",
    "content": "Lucie a un chat noir qui s'appelle Minou. Il aime dormir sous le canapé et regarder la pluie par la fenêtre. Chaque soir, Lucie lui donne du lait et joue avec lui. Minou ronronne toujours quand il est content.",
    "language": "fr",
    "level": "Beginner",
    "questions": [
      {
        "questionText": "Comment s'appelle le chat de Lucie ?",
        "questionNumber": 1,
        "questionType": "comprehension",
        "difficulty": "easy"
      },
      {
        "questionText": "Qu'est-ce que Minou aime faire ?",
        "questionNumber": 2,
        "questionType": "comprehension",
        "difficulty": "easy"
      },
      {
        "questionText": "Pourquoi Minou ronronne-t-il ?",
        "questionNumber": 3,
        "questionType": "analysis",
        "difficulty": "medium"
      }
    ]
  },
  "dictionary": [
    {
      "word": "chat",
      "language": "fr",
      "translation_en": "cat",
      "translation_fr": "chat",
      "translation_es": "gato",
      "translation_de": "Katze",
      "translation_uk": "кіт",
      "part_of_speech": "noun",
      "difficulty": "beginner"
    },
    {
      "word": "noir",
      "language": "fr",
      "translation_en": "black",
      "translation_fr": "noir",
      "translation_es": "negro",
      "translation_de": "schwarz",
      "translation_uk": "чорний",
      "part_of_speech": "adjective",
      "difficulty": "beginner"
    },
    {
      "word": "canapé",
      "language": "fr",
      "translation_en": "sofa",
      "translation_fr": "canapé",
      "translation_es": "sofá",
      "translation_de": "Sofa",
      "translation_uk": "диван",
      "part_of_speech": "noun",
      "difficulty": "intermediate"
    },
    {
      "word": "pluie",
      "language": "fr",
      "translation_en": "rain",
      "translation_fr": "pluie",
      "translation_es": "lluvia",
      "translation_de": "Regen",
      "translation_uk": "дощ",
      "part_of_speech": "noun",
      "difficulty": "beginner"
    },
    {
      "word": "fenêtre",
      "language": "fr",
      "translation_en": "window",
      "translation_fr": "fenêtre",
      "translation_es": "ventana",
      "translation_de": "Fenster",
      "translation_uk": "вікно",
      "part_of_speech": "noun",
      "difficulty": "beginner"
    },
    {
      "word": "soir",
      "language": "fr",
      "translation_en": "evening",
      "translation_fr": "soir",
      "translation_es": "tarde",
      "translation_de": "Abend",
      "translation_uk": "вечір",
      "part_of_speech": "noun",
      "difficulty": "beginner"
    },
    {
      "word": "lait",
      "language": "fr",
      "translation_en": "milk",
      "translation_fr": "lait",
      "translation_es": "leche",
      "translation_de": "Milch",
      "translation_uk": "молоко",
      "part_of_speech": "noun",
      "difficulty": "beginner"
    },
    {
      "word": "jouer",
      "language": "fr",
      "translation_en": "play",
      "translation_fr": "jouer",
      "translation_es": "jugar",
      "translation_de": "spielen",
      "translation_uk": "грати",
      "part_of_speech": "verb",
      "difficulty": "beginner"
    },
    {
      "word": "ronronner",
      "language": "fr",
      "translation_en": "purr",
      "translation_fr": "ronronner",
      "translation_es": "ronronear",
      "translation_de": "schnurren",
      "translation_uk": "муркотіти",
      "part_of_speech": "verb",
      "difficulty": "intermediate"
    },
    {
      "word": "content",
      "language": "fr",
      "translation_en": "happy",
      "translation_fr": "content",
      "translation_es": "contento",
      "translation_de": "glücklich",
      "translation_uk": "щасливий",
      "part_of_speech": "adjective",
      "difficulty": "beginner"
    }
  ]
}`

function parseJson(jsonString) {
  try {
    const data = JSON.parse(jsonString)
    
    console.log('🔍 JSON Structure Analysis:')
    console.log('Text title:', data.text?.title)
    console.log('Text language:', data.text?.language)
    console.log('Questions count:', data.text?.questions?.length || 0)
    console.log('Dictionary count:', data.dictionary?.length || 0)
    
    // Validate the structure
    if (!data.text || !data.dictionary) {
      throw new Error('JSON must contain "text" and "dictionary" sections')
    }
    
    if (!data.text.title || !data.text.content) {
      throw new Error('Text section must contain "title" and "content"')
    }
    
    // Validate dictionary structure
    if (!Array.isArray(data.dictionary)) {
      throw new Error('Dictionary must be an array of word objects')
    }
    
    console.log('\n📚 Dictionary Analysis:')
    console.log('Total dictionary entries:', data.dictionary.length)
    
    // Validate each dictionary entry
    const validWords = []
    const invalidWords = []
    
    data.dictionary.forEach((word, index) => {
      console.log(`\nWord ${index + 1}:`, word.word)
      console.log('  - Has word field:', !!word.word)
      console.log('  - Has translation_en:', !!word.translation_en)
      console.log('  - Translation_en value:', word.translation_en)
      
      if (!word.word) {
        invalidWords.push(`Word at index ${index}: missing "word" field`)
        console.log('  ❌ Invalid: missing word field')
      } else if (!word.translation_en) {
        invalidWords.push(`Word "${word.word}": missing English translation`)
        console.log('  ❌ Invalid: missing English translation')
      } else {
        validWords.push(word)
        console.log('  ✅ Valid')
      }
    })
    
    if (invalidWords.length > 0) {
      console.log('\n⚠️ Invalid dictionary entries:')
      invalidWords.forEach(error => console.log('  -', error))
    }
    
    console.log('\n📊 Summary:')
    console.log(`✅ Valid words: ${validWords.length}`)
    console.log(`❌ Invalid words: ${invalidWords.length}`)
    console.log(`📝 Total processed: ${validWords.length + invalidWords.length}`)
    
    // Update the data with validated words
    data.dictionary = validWords
    
    return data
    
  } catch (error) {
    console.error('❌ JSON parsing error:', error)
    return null
  }
}

console.log('🧪 Testing JSON Parsing Logic...\n')
const result = parseJson(testJson)

if (result) {
  console.log('\n🎉 Parsing completed successfully!')
  console.log(`Final dictionary count: ${result.dictionary.length}`)
  console.log('\n📋 Valid words:')
  result.dictionary.forEach((word, index) => {
    console.log(`${index + 1}. ${word.word} → ${word.translation_en}`)
  })
} else {
  console.log('\n❌ Parsing failed!')
} 