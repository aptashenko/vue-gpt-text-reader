# LogSnag Analytics Setup

Этот документ описывает настройку системы аналитики LogSnag для отслеживания вовлеченности пользователей в приложении для изучения языков.

## Что такое LogSnag?

LogSnag - это платформа для отслеживания событий и аналитики, которая позволяет:
- Отслеживать действия пользователей в реальном времени
- Получать уведомления о важных событиях
- Анализировать метрики вовлеченности
- Создавать инсайты и отчеты

## Настройка

### 1. Создание аккаунта LogSnag

1. Перейдите на [logsnag.com](https://logsnag.com)
2. Зарегистрируйтесь и создайте аккаунт
3. Создайте новый проект для вашего приложения

### 2. Получение токена

1. В настройках проекта найдите раздел "API Keys"
2. Создайте новый API ключ
3. Скопируйте токен

### 3. Настройка переменных окружения

Добавьте следующие переменные в ваш `.env` файл:

```env
# LogSnag Analytics Configuration
VITE_LOGSNAG_TOKEN=your_logsnag_token_here
VITE_LOGSNAG_PROJECT=your_logsnag_project_name_here
```

### 4. Установка зависимостей

```bash
npm install logsnag
```

## Отслеживаемые события

### Аутентификация
- `user_signed_up` - Регистрация нового пользователя
- `user_logged_in` - Вход пользователя
- `user_logged_out` - Выход пользователя

### Работа с текстами
- `text_imported` - Импорт текста
- `text_read` - Чтение текста
- `text_completed` - Завершение текста
- `text_session_started` - Начало сессии чтения
- `text_session_ended` - Завершение сессии чтения

### Словарь
- `word_added_to_dictionary` - Добавление слова в словарь
- `word_removed_from_dictionary` - Удаление слова из словаря
- `dictionary_viewed` - Просмотр словаря

### Обучение
- `question_answered` - Ответ на вопрос
- `question_correct` - Правильный ответ
- `question_incorrect` - Неправильный ответ

### Настройки
- `language_changed` - Изменение языка
- `preferences_updated` - Обновление настроек

### Обратная связь
- `feedback_submitted` - Отправка обратной связи
- `feedback_rating` - Рейтинг обратной связи

### Сессии
- `session_started` - Начало сессии пользователя
- `session_ended` - Завершение сессии пользователя

### Вовлеченность
- `daily_active_user` - Ежедневный активный пользователь
- `weekly_active_user` - Еженедельный активный пользователь
- `monthly_active_user` - Ежемесячный активный пользователь

## Использование в коде

### Импорт сервиса

```javascript
import analyticsService from '../services/logsnag.js'
```

### Отслеживание событий

```javascript
// Простое событие
await analyticsService.track('user_action', {
  description: 'User performed an action',
  tags: { action_type: 'click' }
})

// Событие с пользователем
await analyticsService.trackUserLogin(email, userId)

// Отслеживание ошибок
analyticsService.trackError(error, 'context', userId)
```

### Отправка уведомлений

```javascript
await analyticsService.notify(
  'New User Registered',
  'A new user has joined the platform',
  { icon: '👤' }
)
```

### Отправка инсайтов

```javascript
await analyticsService.insight(
  'Daily Active Users',
  '1,234',
  { icon: '📊' }
)
```

## Админ-панель аналитики

В админ-панели доступен компонент `AnalyticsDashboard.vue`, который отображает:

- Метрики вовлеченности пользователей
- Статистику контента
- Метрики обучения
- Обратную связь
- Распределение по языкам
- Последнюю активность

## Настройка каналов в LogSnag

### 1. Создание канала

1. В LogSnag создайте канал `user-engagement`
2. Настройте уведомления для важных событий

### 2. Настройка инсайтов

Создайте инсайты для отслеживания:
- Количество активных пользователей
- Количество прочитанных текстов
- Точность ответов на вопросы
- Средний рейтинг обратной связи

### 3. Настройка уведомлений

Настройте уведомления для:
- Новых регистраций
- Высоких рейтингов обратной связи
- Ошибок в приложении
- Достижения целей

## Примеры использования

### Отслеживание регистрации

```javascript
// В компоненте регистрации
async function handleSignUp() {
  const result = await authStore.signUp(email, password)
  if (result.success) {
    await analyticsService.trackUserSignUp(email, result.data.user.id)
  }
}
```

### Отслеживание чтения текста

```javascript
// В компоненте чтения текста
async function startReading() {
  await analyticsService.trackTextRead(
    text.title,
    text.language,
    authStore.user?.id
  )
}
```

### Отслеживание добавления слова

```javascript
// В компоненте словаря
async function addWord(word) {
  await analyticsService.trackWordAdded(
    word.word,
    word.translation,
    word.language,
    authStore.user?.id
  )
}
```

## Безопасность

- Токен LogSnag хранится в переменных окружения
- Аналитика отключается, если токен не настроен
- Пользовательские данные анонимизируются
- Соблюдаются принципы GDPR

## Мониторинг

### Проверка работы аналитики

1. Откройте консоль браузера
2. Выполните действие в приложении
3. Проверьте логи: `Analytics event tracked: event_name`

### Проверка в LogSnag

1. Войдите в LogSnag
2. Перейдите в ваш проект
3. Проверьте вкладки Events, Insights, Notifications

## Troubleshooting

### Аналитика не работает

1. Проверьте наличие токена в переменных окружения
2. Убедитесь, что токен правильный
3. Проверьте консоль на ошибки

### События не отображаются

1. Проверьте подключение к интернету
2. Убедитесь, что проект в LogSnag создан правильно
3. Проверьте настройки каналов

### Ошибки в консоли

```javascript
// Включение отладки
console.log('Analytics enabled:', analyticsService.isEnabled)
console.log('User set:', analyticsService.userId)
```

## Дополнительные возможности

### Кастомные события

```javascript
await analyticsService.track('custom_event', {
  description: 'Custom event description',
  tags: { 
    custom_field: 'value',
    user_segment: 'premium'
  },
  icon: '🎯'
})
```

### Группировка событий

```javascript
await analyticsService.track('user_flow_step', {
  description: 'User completed step 2',
  tags: { 
    flow: 'onboarding',
    step: 2,
    total_steps: 5
  }
})
```

### Отслеживание конверсий

```javascript
await analyticsService.track('conversion', {
  description: 'User completed tutorial',
  tags: { 
    conversion_type: 'tutorial_completion',
    value: 1
  }
})
```

## Заключение

LogSnag предоставляет мощные инструменты для отслеживания вовлеченности пользователей. Правильная настройка и использование аналитики поможет улучшить пользовательский опыт и увеличить эффективность обучения. 