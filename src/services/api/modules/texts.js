import {request} from "../core/request.js";
import {ENDPOINTS} from "../configs/endpoints.js";

export class TextService {
    languages;
    levels;

    async getLanguagesList() {
        const response = await request({url: ENDPOINTS.TEXTS.languages})
        this.languages = response.data;
        return this.languages;
    }

    async getLevelsList() {
        const response = await request({url: ENDPOINTS.TEXTS.levels});
        this.levels = response.data;
        return this.levels;
    }

    async getRandomText({level, language_learning, language_native}) {
        return await request({url: ENDPOINTS.TEXTS.random_text({level, language_learning, language_native})})
    }

    async getTextById(id, {level, language_learning, language_native}) {
        return await request({url: ENDPOINTS.TEXTS.text_by_id(id, {level, language_learning, language_native})})
    }
}
