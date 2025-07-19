import {ENDPOINTS} from "../configs/endpoints.js";
import {request} from "../core/request.js";

export const logIn = (data) => {
    return request({ url: ENDPOINTS.AUTH.signIn, method: 'POST', data });
};

export const signUp = (data) => {
    return request({ url: ENDPOINTS.AUTH.signUp, method: 'POST', data });
};

export const logout = () => {
    return request({ url: ENDPOINTS.AUTH.logout, method: 'POST' });
};
