export class CustomFieldsValidation {
    static validate(fieldName: string, fieldValue: string) {
        let result = true;
        switch (fieldName) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (typeof fieldValue !== 'string' || !emailRegex.test(fieldValue)) {
                    result = false;
                }
                break;

            case 'mobile':
                if (fieldValue.length !== 10) {
                    result = false;
                }
                break;

            case 'dob':
                const regex = /^\d{4}-\d{2}-\d{2}$/;

                if (!regex.test(fieldValue)) {
                    result = false;
                }

            default:
                break;
        }

        return result;
    }

}

