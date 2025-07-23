import {request} from "../core/request.js";
import {ENDPOINTS} from "../configs/endpoints.js";

export class WordsService {
    async getTranslation(params) {
        return await request({url: ENDPOINTS.WORDS.translate, params });
    }
}
