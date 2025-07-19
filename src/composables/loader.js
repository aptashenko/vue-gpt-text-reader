import {ref} from "vue";

const globalLoader = ref(false);
export function useLoader () {
    const loading = ref(false);
    const toggleLoader = () => {
        loading.value = !loading.value;
    }
    const toggleGlobalLoader = () => {
        globalLoader.value = !globalLoader.value;
    }

    return {
        loading,
        toggleLoader,
        globalLoader,
        toggleGlobalLoader,
    }
}
