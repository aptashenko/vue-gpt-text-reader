import {defineStore} from "pinia";
import {computed, reactive} from "vue";

export const useUserStore = defineStore('user', () => {
    const user = reactive({
        email: '',
        role: localStorage.getItem('guest') || '',
        token: localStorage.getItem('access_token') || '',
    })

    const isGuest = computed(() => user.role === 'guest')
    const isLogged = computed(() => user.role);

    const setUser = (userData) => {
        user.email = userData.email;
        user.role = userData.role;
        user.token = userData.token;
    }

    const clearUser = () => {
        user.email = '';
        user.role = '';
    }

    return {
        user,
        isGuest,
        isLogged,
        setUser,
        clearUser
    }
})
