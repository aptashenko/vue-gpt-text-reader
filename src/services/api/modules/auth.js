import {ENDPOINTS} from "../configs/endpoints.js";
import {request} from "../core/request.js";


export class AuthService {
    login(data) {
        return request({ url: ENDPOINTS.AUTH.signIn, method: 'POST', data });
    }
    register(data) {
        return request({ url: ENDPOINTS.AUTH.signUp, method: 'POST', data });
    }
    logout() {
        return request({ url: ENDPOINTS.AUTH.logout, method: 'POST' });
    }
}
