import {isAuthenticated} from "../../utils/auth.js";

export const authGuard= async (to) => {
    const isAuth = isAuthenticated();
    const requiresAuth = to.meta.requiresAuth === true;
    const isAuthPage = to.meta.isAuthPage === true;

    // 🔒 Неавторизованный пользователь пытается попасть на защищённый маршрут
    if (requiresAuth && !isAuth) {
        return { name: 'login' };
    }

    // 🚫 Авторизованный пользователь пытается попасть на /login, /register и т.п.
    if (isAuthPage && isAuth) {
        return { name: 'app' }; // или 'home'
    }

    return true;

};
