export const ENDPOINTS = {
    AUTH: {
        signIn: 'api/auth/login',
        signUp: 'api/auth/register',
        logout: 'api/auth/logout',
    },
    TEXTS: {
        levels: 'api/texts/levels-list',
        languages: 'api/texts/languages-list',
        random_text: ({level, language_learning, language_native}) => `api/texts/random?level=${level}&language_learning=${language_learning}&language_native=${language_native}`,
        text_by_id: (id, {level, language_learning, language_native}) => `api/texts/${id}?level=${level}&language_learning=${language_learning}&language_native=${language_native}`,
    }
}
