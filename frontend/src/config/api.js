// Configuración centralizada del API
// Prioriza VITE_API_URL si está definida; si no, usa el hostname actual con el puerto del backend

export function getApiBase() {
    const envUrl =
        import.meta &&
        import.meta.env &&
        import.meta.env.VITE_API_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
        return envUrl.replace(/\/$/, '');
    }
    const protocol = window.location.protocol || 'http:';
    const host = window.location.hostname || 'localhost';
    const port = 5000; // Puerto de backend en desarrollo
    return `${protocol}//${host}:${port}/api`;
}

export function getAssetBaseUrl() {
    const envUrl =
        import.meta &&
        import.meta.env &&
        import.meta.env.VITE_ASSETS_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
        return envUrl.replace(/\/$/, '');
    }
    const protocol = window.location.protocol || 'http:';
    const host = window.location.hostname || 'localhost';
    const port = 5000; // Puerto de backend en desarrollo
    return `${protocol}//${host}:${port}`; // No añadimos /uploads aquí
}