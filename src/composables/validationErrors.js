import { isRef } from 'vue'

export function useValidationErrors(errors) {
    function applyErrorsFromBackend(error) {
        if (!error?.errors || typeof error.errors !== 'object') return

        Object.entries(error.errors).forEach(([key, value]) => {
            const message = Array.isArray(value) ? value[0] : value

            // если errors — reactive или ref-объект с полями
            if (key in errors) {
                if (isRef(errors[key])) {
                    errors[key].value = message
                } else {
                    errors[key] = message
                }
            }
        })
    }

    function resetErrors() {
        Object.keys(errors).forEach((key) => {
            if (isRef(errors[key])) {
                errors[key].value = ''
            } else {
                errors[key] = ''
            }
        })
    }

    return {
        applyErrorsFromBackend,
        resetErrors,
    }
}
