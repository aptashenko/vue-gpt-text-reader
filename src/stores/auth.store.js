import {defineStore} from "pinia";
import {useLoader} from "../composables/loader.js";
import {logIn, signUp, logout} from "../services/api/modules/auth.js";
import {useUserStore} from "./user.store.js";
import {isAuthenticated} from "../utils/auth.js";
import {generateUUID} from "../utils/get-uuid.js";

export const useAuthStore1 = defineStore('auth1', () => {
    const { loading: authLoader, toggleLoader: toggleAuthLoader } = useLoader();
    const userStore = useUserStore();

    const userSignIn = async (payload) => {
        try {
            const {data} = await logIn(payload);
            userStore.setUser(data.user);
            localStorage.setItem('access_token', data.token);

        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    const userSignUp = async (payload) => {
        try {
            await signUp(payload);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    const loginAsGuest = () => {
        const generateGuestId = generateUUID();
        localStorage.setItem('access_token', generateGuestId);
        localStorage.setItem('guest', 'guest');
        userStore.setUser({email: generateGuestId, role: 'guest', token: generateGuestId});
    }

    const logoutUser = async () => {
        if (!userStore.isGuest) {
            await logout();
        }
        userStore.clearUser();
        localStorage.removeItem('access_token');
        localStorage.removeItem('guest');
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
