# Questions System Guide

Your Vue GPT Text Reader app has a comprehensive questions system for testing comprehension! Here's everything you need to know:

## 🎯 Current Features

### 1. **Basic Questions System** (Already Working)
- Each text can have 2 questions (`question1`, `question2`)
- Questions are displayed in the TextReaderPage
- AI-powered feedback using OpenAI
- Users can submit answers and get scores

### 2. **Enhanced Questions System** (New)
- Multiple questions per text (unlimited)
- Different question types: comprehension, analysis, vocabulary, grammar
- Difficulty levels: easy, medium, hard
- User progress tracking
- Detailed statistics

## 📝 How to Add Questions

### Option 1: Admin Panel (Easiest)
1. Go to `/admin` in your app
2. Click "Add New Text"
3. Fill in the form including `Question 1` and `Question 2`
4. Save the text

### Option 2: JSON Import (Best for Bulk)

#### Basic Format (2 questions per text):
```json
{
  "title": "Story Title",
  "content": "Story content...",
  "language": "en",
  "level": "intermediate",
  "question1": "What happened in the story?",
  "question2": "Why did the character do that?"
}
```

#### Enhanced Format (Multiple questions):
```json
{
  "title": "Story Title",
  "content": "Story content...",
  "language": "en",
  "level": "intermediate",
  "questions": [
    {
      "questionText": "What happened in the story?",
      "questionNumber": 1,
      "questionType": "comprehension",
      "difficulty": "easy"
    },
    {
      "questionText": "Why did the character do that?",
      "questionNumber": 2,
      "questionType": "analysis",
      "difficulty": "medium"
    },
    {
      "questionText": "What lesson does this story teach?",
      "questionNumber": 3,
      "questionType": "analysis",
      "difficulty": "hard"
    }
  ]
}
```

### Option 3: Import Script
```bash
# Import basic format
node import-data.js texts your-texts.json

# Import enhanced format
node import-data.js texts your-texts-with-questions.json
```

## 🗄️ Database Setup

To use the enhanced questions system, run this SQL in your Supabase SQL Editor:

```sql
-- Run the contents of questions-system.sql
```

This will create:
- `text_questions` table for multiple questions per text
- `user_answers` table for tracking user responses
- Migrate existing questions from the `texts` table

## 🎨 Question Types

- **comprehension**: Basic understanding questions
- **analysis**: Critical thinking questions
- **vocabulary**: Word meaning questions
- **grammar**: Language structure questions

## 📊 User Experience

### In TextReaderPage:
1. User reads the text
2. Clicks on words for translations
3. Answers comprehension questions
4. Gets AI-powered feedback and scores
5. Progress is saved for review

### Features:
- ✅ Word-by-word translation
- ✅ Multiple questions per text
- ✅ AI feedback using OpenAI
- ✅ Progress tracking
- ✅ Score calculation
- ✅ Answer history

## 🔧 Technical Implementation

### Services:
- `QuestionsService` - Handles all question operations
- `DictionaryService` - Word translations
- `UserPreferencesService` - User settings

### Components:
- `TextReaderPage` - Main reading and question interface
- `AdminPage` - Manage texts and questions
- `UserSettings` - User preferences

## 📈 Future Enhancements

Potential features to add:
- [ ] Multiple choice questions
- [ ] Fill-in-the-blank questions
- [ ] Speaking practice questions
- [ ] Writing prompts
- [ ] Progress analytics dashboard
- [ ] Question difficulty adaptation
- [ ] Spaced repetition system

## 🚀 Quick Start

1. **Set up the database:**
   ```bash
   # Run in Supabase SQL Editor
   # Copy and paste the contents of questions-system.sql
   ```

2. **Import sample data:**
   ```bash
   node import-data.js texts example-texts-with-questions.json
   ```

3. **Test the system:**
   - Go to your app
   - Read a text
   - Answer the questions
   - Check your feedback

## 📋 Example JSON Files

- `example-texts.json` - Basic format with 2 questions
- `example-texts-with-questions.json` - Enhanced format with multiple questions
- `example-dictionary.json` - Dictionary entries

## 🎯 Best Practices

1. **Question Writing:**
   - Start with easy comprehension questions
   - Add analysis questions for deeper thinking
   - Use clear, specific language
   - Match question difficulty to text level

2. **Content Organization:**
   - Group related questions together
   - Use consistent numbering
   - Include various question types
   - Balance difficulty levels

3. **User Experience:**
   - Provide immediate feedback
   - Show progress indicators
   - Allow answer review
   - Track long-term progress

Your questions system is now ready to provide comprehensive language learning assessment! 🎉 