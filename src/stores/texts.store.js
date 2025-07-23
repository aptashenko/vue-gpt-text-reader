import {defineStore} from "pinia";
import {ref} from "vue";
import {TextService} from "../services/api/modules/texts.js";
import {useLoader} from "../composables/loader.js";

const texts = new TextService();

export const useTextsStore = defineStore('texts', () => {
    const allTexts = ref(null);
    const currentText = ref(null);
    const languagesList = ref(null);
    const levelsList = ref(null);
    const { loading: textLoader, toggleLoader } = useLoader();

    const getLanguages = async () => {
        try {
           const response = await texts.getLanguagesList();
           languagesList.value = response.sort((a, b) => {
               const aValue = Object.values(a)[0];
               const bValue = Object.values(b)[0];
               return (aValue === bValue) ? 0 : aValue ? -1 : 1;
           });
        } catch (error) {
            console.error(error);
        }
    }

    const getLevels = async () => {
        try {
            levelsList.value = await texts.getLevelsList();
        } catch (error) {
            console.error(error);
        }
    }

    const getRandomText = async ({level, language_learning, language_native}) => {
        toggleLoader();
        try {
            const { data } = await texts.getRandomText({level, language_learning, language_native});
            currentText.value = data;
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            toggleLoader();
        }
    }

    const getTextById = async (id, payload) => {
        if (currentText.value) return
        toggleLoader()
        try {
            const { data } = await texts.getTextById(id, payload);
            currentText.value = data;
        } catch (error) {
            console.error(error);
        } finally {
            toggleLoader()
        }
    }

    return {
        getLanguages,
        getLevels,
        getRandomText,
        getTextById,
        currentText,
        languagesList,
        levelsList,
        textLoader
    }
})
