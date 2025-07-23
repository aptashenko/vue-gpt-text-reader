import {defineStore} from "pinia";
import {WordsService} from "../services/api/modules/words.js";
const words = new WordsService();
export const useWordsStore = defineStore('words', () => {
    const translateWord = async (context, word, lang_target, lang_native) => {
        try {
            const payload = {
                word,
                context,
                language_learning: lang_target,
                language_native: lang_native,
            }
            const { data } =  await words.getTranslation(payload)
            return data;

        } catch (error) {
            console.error(error)
        }
    }
    return {
        translateWord
    }
})
