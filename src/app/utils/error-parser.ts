// Función para parsear los errores del backend mientras mientras no lo hagamos desde el backend xd
export function parseBackendErrors(errorObj: any): string {
    if (!errorObj || typeof errorObj !== 'object') return 'Error desconocido';

    let messages: string[] = [];

    for (const field in errorObj) {
        if (Array.isArray(errorObj[field])) {
            messages.push(`${field}: ${errorObj[field].join(', ')}`);
        } else if (typeof errorObj[field] === 'string') {
            messages.push(`${field}: ${errorObj[field]}`);
        }
    }

    return messages.join('\n');
}
