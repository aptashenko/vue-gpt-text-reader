import {ENDPOINTS} from "../configs/endpoints.js";
import {request} from "../core/request.js";


export class ProfileService {
    get() {
        return request({ url: ENDPOINTS.PROFILE.GET });
    }
    update(data) {
        return request({ url: ENDPOINTS.PROFILE.UPDATE, method: 'PATCH', data });
    }
}
