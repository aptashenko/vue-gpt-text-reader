import axios from 'axios';
import {useAuthStore1} from "../../../stores/auth.store.js";

export const createHttpClient = (withAuth) => {
    const instance = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/',
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (withAuth) {
        instance.interceptors.request.use((config) => {
            const token = localStorage.getItem('access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        instance.interceptors.response.use(
            (config) => config,
            (error) => {
                const authStore = useAuthStore1();
                if (error.status === 401) {
                    authStore.logoutUser()
                }
            }
        )
    }

    return instance;
};
