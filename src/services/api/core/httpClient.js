import axios from 'axios';

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
    }

    return instance;
};
