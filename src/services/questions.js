import { supabase } from '../supabase.js'

export class QuestionsService {
  // Get all questions for a specific text
  static async getTextQuestions(textId) {
    try {
      const { data, error } = await supabase
        .from('text_questions')
        .select('*')
        .eq('text_id', textId)
        .order('question_number', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching text questions:', error)
      throw error
    }
  }

  // Get user's previous answers for a text
  static async getUserAnswers(userId, textId) {
    try {
      const { data, error } = await supabase
        .from('user_answers')
        .select(`
          *,
          text_questions (
            question_text,
            question_number,
            question_type,
            difficulty
          )
        `)
        .eq('user_id', userId)
        .eq('text_id', textId)
        .order('submitted_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user answers:', error)
      throw error
    }
  }

  // Submit user answers with AI feedback
  static async submitAnswers(userId, textId, answers) {
    try {
      const results = []

      for (const answer of answers) {
        const { data, error } = await supabase
          .from('user_answers')
          .upsert({
            user_id: userId,
            text_id: textId,
            question_id: answer.questionId,
            user_answer: answer.answer,
            ai_feedback: answer.aiFeedback,
            score: answer.score,
            is_correct: answer.isCorrect,
            submitted_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,question_id'
          })

        if (error) throw error
        results.push(data)
      }

      return results
    } catch (error) {
      console.error('Error submitting answers:', error)
      throw error
    }
  }

  // Get user's progress statistics
  static async getUserProgress(userId) {
    try {
      const { data, error } = await supabase
        .from('user_answers')
        .select(`
          *,
          texts (
            title,
            language,
            level
          ),
          text_questions (
            question_type,
            difficulty
          )
        `)
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false })

      if (error) throw error

      // Calculate statistics
      const totalAnswers = data.length
      const correctAnswers = data.filter(a => a.is_correct).length
      const averageScore = totalAnswers > 0 
        ? data.reduce((sum, a) => sum + (a.score || 0), 0) / totalAnswers 
        : 0

      return {
        totalAnswers,
        correctAnswers,
        accuracy: totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0,
        averageScore,
        recentAnswers: data.slice(0, 10) // Last 10 answers
      }
    } catch (error) {
      console.error('Error fetching user progress:', error)
      throw error
    }
  }

  // Add new questions to a text (admin function)
  static async addQuestion(textId, questionData) {
    try {
      const { data, error } = await supabase
        .from('text_questions')
        .insert({
          text_id: textId,
          question_text: questionData.questionText,
          question_number: questionData.questionNumber,
          question_type: questionData.questionType || 'comprehension',
          difficulty: questionData.difficulty || 'medium'
        })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding question:', error)
      throw error
    }
  }

  // Update existing question (admin function)
  static async updateQuestion(questionId, questionData) {
    try {
      const { data, error } = await supabase
        .from('text_questions')
        .update({
          question_text: questionData.questionText,
          question_type: questionData.questionType,
          difficulty: questionData.difficulty,
          updated_at: new Date().toISOString()
        })
        .eq('id', questionId)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating question:', error)
      throw error
    }
  }

  // Delete question (admin function)
  static async deleteQuestion(questionId) {
    try {
      const { error } = await supabase
        .from('text_questions')
        .delete()
        .eq('id', questionId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting question:', error)
      throw error
    }
  }
} 