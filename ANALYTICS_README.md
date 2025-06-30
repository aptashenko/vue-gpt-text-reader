# 📊 Analytics System Documentation

## Overview

The Language Reader app includes a comprehensive analytics system that tracks user engagement, learning progress, and app usage patterns. The system uses LogSnag for event tracking and local storage for real-time analytics.

## 🎯 Tracked Metrics

### User Engagement
- **user_signup** - New user registrations
- **user_login** - User login events
- **user_logout** - User logout events
- **active_users** - Daily/weekly/monthly active users

### Content Usage
- **text_read** - Text reading sessions started
- **text_completed** - Text reading sessions completed
- **texts_imported** - Number of texts imported
- **text_session_started** - Reading session started
- **text_session_ended** - Reading session ended

### Learning Progress
- **question_answered** - Questions answered by users
- **correct_answer** - Correct answers given
- **incorrect_answer** - Incorrect answers given
- **accuracy_rate** - Calculated accuracy percentage

### Dictionary Usage
- **word_added** - Words added to dictionary
- **word_removed** - Words removed from dictionary
- **dictionary_viewed** - Dictionary page views
- **word_updated** - Words updated in dictionary

### User Feedback
- **feedback_submitted** - Feedback submissions
- **feedback_rating** - Average feedback ratings

### App Interactions
- **search_performed** - Search queries
- **language_changed** - Language preference changes
- **preferences_updated** - User preference updates
- **app_error** - Application errors

## 🔧 Implementation

### Service Integration

The analytics system is integrated throughout the app:

1. **Authentication** (`src/stores/auth.js`)
   - Tracks signup, login, logout events
   - Records user session data

2. **Text Reading** (`src/components/TextReaderPage.vue`)
   - Tracks text reading sessions
   - Records question answering
   - Monitors completion rates

3. **Dictionary** (`src/components/DictionaryManager.vue`)
   - Tracks word additions/removals
   - Records dictionary views
   - Monitors search activity

4. **Text Import** (`src/services/textImport.js`)
   - Tracks import events
   - Records content statistics

5. **Feedback** (`src/components/FeedbackPage.vue`)
   - Tracks feedback submissions
   - Records user ratings

### Data Storage

- **LogSnag**: Real-time event tracking and notifications
- **localStorage**: Local analytics data for dashboard
- **Fallback**: Mock data when services unavailable

## 📈 Analytics Dashboard

### Features
- **Real-time metrics** from user interactions
- **Date range filtering** (7d, 30d, 90d)
- **Language distribution** charts
- **Recent activity** feed
- **Error tracking** and monitoring

### Access
- Navigate to Admin Panel → Analytics Dashboard
- Or visit: `/admin/analytics`

## 🚀 Testing Analytics

### Generate Test Data

1. **Browser Console Method**:
   ```javascript
   // Copy and paste the code from generate-real-analytics.js
   // Execute in browser console on main page
   ```

2. **HTML Generator Method**:
   - Open `generate-analytics.html` in browser
   - Click "Generate Test Data"
   - Refresh analytics dashboard

### Clear Test Data

```javascript
// Clear all analytics data
localStorage.removeItem('logsnag_analytics')
console.log('✅ Analytics data cleared!')
```

## 🔍 Key Metrics Explained

### User Engagement
- **Active Users**: Users who performed any action in the selected period
- **New Users**: First-time registrations
- **Returning Users**: Users who logged in but didn't register in the period

### Learning Effectiveness
- **Accuracy Rate**: Percentage of correct answers
- **Completion Rate**: Percentage of started texts that were completed
- **Engagement Time**: Average time spent reading texts

### Content Performance
- **Popular Languages**: Most used languages for learning
- **Difficulty Distribution**: Spread across beginner/intermediate/advanced
- **Word Learning**: Rate of vocabulary acquisition

## 🛠️ Configuration

### Environment Variables
```env
VITE_LOGSNAG_TOKEN=your_logsnag_token
VITE_LOGSNAG_PROJECT=your_project_name
```

### LogSnag Setup
1. Create account at [logsnag.com](https://logsnag.com)
2. Create a new project
3. Get your API token
4. Add to environment variables

## 📊 Dashboard Sections

### 1. User Engagement
- Active users count
- New user registrations
- Returning user sessions

### 2. Content Metrics
- Texts read and completed
- Words added to dictionary
- Import statistics

### 3. Learning Metrics
- Questions answered
- Correct/incorrect answers
- Accuracy rates

### 4. Feedback Metrics
- Feedback submissions
- Average ratings
- User satisfaction

### 5. Language Distribution
- Usage by language
- Learning preferences
- Geographic insights

### 6. Recent Activity
- Latest user actions
- Real-time events
- System notifications

## 🔄 Data Flow

```
User Action → Component → Analytics Service → LogSnag API + localStorage → Dashboard
```

## 🎯 Use Cases

### For Product Managers
- Track feature adoption
- Monitor user engagement
- Identify popular content

### For Educators
- Monitor learning progress
- Identify difficult concepts
- Track vocabulary acquisition

### For Developers
- Monitor app performance
- Track error rates
- Optimize user experience

## 📝 Adding New Metrics

1. **Define the metric** in `src/services/logsnag.js`
2. **Add tracking** in relevant components
3. **Update dashboard** to display new data
4. **Test** with real user interactions

## 🚨 Troubleshooting

### Common Issues
- **No data showing**: Check localStorage and LogSnag configuration
- **Errors in console**: Verify API tokens and network connectivity
- **Missing metrics**: Ensure tracking is implemented in components

### Debug Commands
```javascript
// Check localStorage data
console.log(JSON.parse(localStorage.getItem('logsnag_analytics')))

// Test LogSnag connection
// Run test-logsnag-api.js

// Clear and regenerate data
localStorage.removeItem('logsnag_analytics')
// Then run generate-real-analytics.js
```

## 📈 Future Enhancements

- **Real-time dashboards** with WebSocket updates
- **Advanced filtering** by user segments
- **Export functionality** for data analysis
- **Custom metrics** for specific use cases
- **A/B testing** integration
- **Predictive analytics** for user behavior

---

**Last Updated**: December 2024
**Version**: 1.0.0 