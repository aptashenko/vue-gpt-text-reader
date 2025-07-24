import {defineStore} from "pinia";
import {useLoader} from "../composables/loader.js";
import {AuthService} from "../services/api/modules/auth.js";
import {useUserStore} from "./user.store.js";
import {isAuthenticated} from "../utils/auth.js";
import {generateUUID} from "../utils/get-uuid.js";
import {useRouter} from "vue-router";

const auth = new AuthService();
export const useAuthStore1 = defineStore('auth1', () => {
    const { loading: authLoader, toggleLoader: toggleAuthLoader } = useLoader();
    const userStore = useUserStore();
    const router = useRouter();
    const userSignIn = async (payload) => {
        try {
            const {data} = await auth.login(payload);
            userStore.getUserInfo();
            localStorage.setItem('access_token', data.token);

        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    const userSignUp = async (payload) => {
        try {
            await auth.register(payload);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    const loginAsGuest = (uuid) => {
        localStorage.setItem('access_token', uuid);
        userStore.setUser({email: uuid, role: 'guest', token: uuid}, userStore.userCopy);
    }

    const logoutUser = async () => {
        if (!userStore.isGuest) {
            await auth.logout();
        }
        userStore.clearUser();
        localStorage.removeItem('access_token');
        localStorage.removeItem('guest');
        router.push('/');
    }

    return {
        userSignIn,
        userSignUp,
        loginAsGuest,
        authLoader,
        isAuthenticated,
        logoutUser,
    }
})
