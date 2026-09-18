import { ref, reactive, computed, watch, isRef } from 'vue';

/**
 * Composable Form-Level Validation untuk Vue 3 / InertiaJS
 * Mendukung rule-based validation, live checking, dan integrasi response error Laravel.
 *
 * @param {Object|Ref} formData - Objek form reaktif (reactive, ref, atau Inertia useForm)
 * @param {Object} schemaRules - Aturan validasi per field
 * @param {Object} options - Pengaturan tambahan { mode: 'touched' | 'eager' | 'lazy' }
 */
export function useFormValidation(formData, schemaRules = {}, options = {}) {
    const mode = options.mode || 'touched'; // 'touched', 'eager', 'lazy'

    const errors = reactive({});
    const touched = reactive({});

    // Ambil nilai dari field secara aman
    const getFieldValue = (field) => {
        const data = isRef(formData) ? formData.value : formData;
        return data ? data[field] : undefined;
    };

    const getFieldLabel = (field, ruleConfig) => {
        if (ruleConfig && ruleConfig.label) return ruleConfig.label;
        // Konversi camelCase atau snake_case ke title case yang ramah
        return field
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    };

    /**
     * Eksekusi validasi untuk satu field
     * @param {string} field
     * @returns {string|null} Pesan error pertama atau null jika valid
     */
    const validateFieldRule = (field) => {
        const rule = schemaRules[field];
        if (!rule) return null;

        const val = getFieldValue(field);
        const label = getFieldLabel(field, rule);
        const isEmpty = val === null || val === undefined || val === '' || (Array.isArray(val) && val.length === 0) || val === false;

        // 1. Required Rule
        if (rule.required && isEmpty) {
            return typeof rule.required === 'string'
                ? rule.required
                : `${label} wajib diisi.`;
        }

        // Jika tidak required dan nilai kosong, lewati validasi format lainnya
        if (isEmpty) return null;

        // 2. Email Format
        if (rule.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(String(val))) {
                return typeof rule.email === 'string'
                    ? rule.email
                    : `Format ${label} tidak valid (contoh: nama@domain.com).`;
            }
        }

        // 3. Phone Format (Nomor Indonesia)
        if (rule.phone) {
            const digits = String(val).replace(/\D/g, '');
            if (digits.length < 10 || digits.length > 15) {
                return typeof rule.phone === 'string'
                    ? rule.phone
                    : `${label} harus terdiri dari 10 - 15 digit angka.`;
            }
        }

        // 4. Numeric Rule
        if (rule.numeric) {
            const num = Number(val);
            if (isNaN(num)) {
                return typeof rule.numeric === 'string'
                    ? rule.numeric
                    : `${label} harus berupa angka.`;
            }
        }

        // 5. Min (Nilai angka atau panjang string)
        if (rule.min !== undefined) {
            const minVal = Number(rule.min);
            if (typeof val === 'number' && val < minVal) {
                return `${label} minimal harus bernilai ${minVal}.`;
            }
        }

        // 6. Max (Nilai angka atau panjang string)
        if (rule.max !== undefined) {
            const maxVal = Number(rule.max);
            if (typeof val === 'number' && val > maxVal) {
                return `${label} maksimal bernilai ${maxVal}.`;
            }
        }

        // 7. MinLength (String length)
        if (rule.minLength !== undefined) {
            const minLen = Number(rule.minLength);
            if (String(val).length < minLen) {
                return `${label} minimal harus ${minLen} karakter.`;
            }
        }

        // 8. MaxLength (String length)
        if (rule.maxLength !== undefined) {
            const maxLen = Number(rule.maxLength);
            if (String(val).length > maxLen) {
                return `${label} maksimal ${maxLen} karakter.`;
            }
        }

        // 9. Regex Pattern
        if (rule.pattern) {
            const regex = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern);
            if (!regex.test(String(val))) {
                return rule.patternMessage || `Format ${label} tidak sesuai pola yang ditentukan.`;
            }
        }

        // 10. Confirmed (Sama dengan field lain, misal password_confirmation)
        if (rule.confirmed) {
            const otherVal = getFieldValue(rule.confirmed);
            if (val !== otherVal) {
                const otherLabel = getFieldLabel(rule.confirmed, schemaRules[rule.confirmed]);
                return `${label} tidak cocok dengan ${otherLabel}.`;
            }
        }

        // 11. Custom Function Validator
        if (typeof rule.custom === 'function') {
            const allData = isRef(formData) ? formData.value : formData;
            const customResult = rule.custom(val, allData);
            if (customResult && typeof customResult === 'string') {
                return customResult;
            }
        }

        return null;
    };

    /**
     * Validasi satu field secara spesifik dan update reaktif state errors
     * @param {string} field
     * @returns {boolean} true jika field valid
     */
    const validateField = (field) => {
        const errorMsg = validateFieldRule(field);
        if (errorMsg) {
            errors[field] = errorMsg;
            return false;
        } else {
            delete errors[field];
            return true;
        }
    };

    /**
     * Menandai field telah disentuh (touch/blur)
     * @param {string} field
     */
    const touch = (field) => {
        touched[field] = true;
        if (mode !== 'lazy') {
            validateField(field);
        }
    };

    /**
     * Validasi seluruh form
     * @returns {boolean} true jika seluruh field valid
     */
    const validate = () => {
        let isAllValid = true;
        Object.keys(schemaRules).forEach((field) => {
            touched[field] = true;
            const valid = validateField(field);
            if (!valid) {
                isAllValid = false;
            }
        });
        return isAllValid;
    };

    /**
     * Bersihkan error satu field atau seluruh field
     * @param {string|null} field
     */
    const clearErrors = (field = null) => {
        if (field) {
            delete errors[field];
        } else {
            Object.keys(errors).forEach((key) => delete errors[key]);
        }
    };

    /**
     * Set pesan error manual untuk satu field
     * @param {string} field
     * @param {string} message
     */
    const setFieldError = (field, message) => {
        errors[field] = message;
    };

    /**
     * Set batch error dari response backend (misal Laravel Validation 422)
     * @param {Object} errorsObj
     */
    const setErrors = (errorsObj) => {
        if (!errorsObj || typeof errorsObj !== 'object') return;
        Object.keys(errorsObj).forEach((field) => {
            const val = errorsObj[field];
            errors[field] = Array.isArray(val) ? val[0] : String(val);
        });
    };

    /**
     * Reset seluruh state error dan status touched
     */
    const reset = () => {
        clearErrors();
        Object.keys(touched).forEach((key) => delete touched[key]);
    };

    // Pasang watcher jika mode eager atau touched
    if (mode === 'eager' || mode === 'touched') {
        const watchTarget = isRef(formData) ? formData : () => ({ ...formData });
        watch(
            watchTarget,
            () => {
                Object.keys(schemaRules).forEach((field) => {
                    if (mode === 'eager' || touched[field]) {
                        validateField(field);
                    }
                });
            },
            { deep: true }
        );
    }

    const isValid = computed(() => Object.keys(errors).length === 0);
    const isDirty = computed(() => Object.keys(touched).some((key) => touched[key]));

    return {
        errors,
        touched,
        isValid,
        isDirty,
        validate,
        validateField,
        touch,
        clearErrors,
        setFieldError,
        setErrors,
        reset,
    };
}
