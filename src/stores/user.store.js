import {defineStore} from "pinia";
import {computed, reactive} from "vue";

export const useUserStore = defineStore('user', () => {
    const user = reactive({
        email: '',
        role: localStorage.getItem('guest') || '',
        token: localStorage.getItem('access_token') || '',
        language_native: localStorage.getItem('language_native') || '',
        language_learning: '',
        level: ''
    })

    const isGuest = computed(() => user.role === 'guest')
    const isLogged = computed(() => user.role);

    const setUser = (userData) => {
        const entries = Object.entries(userData);
        entries.forEach(([key, value]) => {
            if (key in user) {
                user[key] = value
            }
        })
    }

    const clearUser = () => {
        user.email = '';
        user.role = '';
        user.token = '';
        user.language_native = '';
        user.language_learning = '';
        user.level = ''
    }

    return {
        user,
        isGuest,
        isLogged,
        setUser,
        clearUser
    }
})
