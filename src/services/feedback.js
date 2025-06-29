import { supabase } from '../supabase'

export class FeedbackService {
  // Submit feedback to database
  static async submitFeedback(feedbackData) {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .insert({
          email: feedbackData.email,
          message: feedbackData.message,
          user_id: feedbackData.userId,
          submitted_at: new Date().toISOString()
        })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error submitting feedback:', error)
      throw error
    }
  }

  // Get all feedback (admin only)
  static async getAllFeedback() {
    try {
      console.log('FeedbackService: Fetching all feedback...')
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('submitted_at', { ascending: false })

      if (error) {
        console.error('FeedbackService: Error fetching feedback:', error)
        throw error
      }
      
      console.log('FeedbackService: Feedback data received:', {
        count: data?.length || 0,
        data: data
      })
      
      return data || []
    } catch (error) {
      console.error('Error fetching feedback:', error)
      throw error
    }
  }

  // Get feedback statistics
  static async getFeedbackStats() {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('submitted_at')

      if (error) throw error

      const totalFeedback = data.length
      const thisMonth = new Date().getMonth()
      const thisYear = new Date().getFullYear()
      
      const monthlyFeedback = data.filter(feedback => {
        const feedbackDate = new Date(feedback.submitted_at)
        return feedbackDate.getMonth() === thisMonth && 
               feedbackDate.getFullYear() === thisYear
      }).length

      return {
        total: totalFeedback,
        thisMonth: monthlyFeedback
      }
    } catch (error) {
      console.error('Error fetching feedback stats:', error)
      throw error
    }
  }

  // Delete feedback (admin only)
  static async deleteFeedback(feedbackId) {
    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', feedbackId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting feedback:', error)
      throw error
    }
  }
} 