import {defineStore} from "pinia";
import {computed, reactive, ref} from "vue";
import {ProfileService} from "../services/api/modules/profile.js";
import {useRouter} from "vue-router";

const profileApi = new ProfileService();

export const useUserStore = defineStore('user', () => {
    const router = useRouter();
    const user = reactive({
        user_id: '',
        email: '',
        subscription: '',
        created_at: '',
        role: '',
        updated_at: '',
        language: null,
        level: null
    })

    const userCopy = ref({});

    const isGuest = computed(() => user.role === 'guest')
    const isLogged = computed(() => user.role);

    const getUserInfo = async () => {
        try {
            const {data} = await profileApi.get();
            setUser(data);
        } catch (error) {
            console.error(error);
        }
    }

    const updateUserInfo = async (payload) => {
        try {
            let data;
            if (!isGuest.value) {
                const response = await profileApi.update(payload);
                data = response.data;
                setUser(data);
            } else {
                setUser(payload, userCopy);
                setUser(payload, user);
            }
            await router.push('/app')
        } catch (error) {
            console.error(error);
        }
    }

    const setUser = (userData, userForm = userCopy.value) => {
        const entries = Object.entries(userData);
        entries.forEach(([key, value]) => {
            if (key in user) {
                user[key] = value
                userForm[key] = value
            }
        })
    }

    const clearUser = () => {
        user.id = '';
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
        getUserInfo,
        setUser,
        updateUserInfo,
        userCopy,
        clearUser
    }
})
