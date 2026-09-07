// Murni membaca URL endpoint dari file .env (tanpa fallback hardcoded)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const SERVER_BASE_URL = (API_BASE_URL || '').replace(/\/api$/, '');

/**
 * Helper function untuk mendapatkan URL lengkap berkas yang diunggah di server uploads
 */
export const getFileUrl = (filePath) => {
    if (!filePath) return '#';
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
    const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    return `${SERVER_BASE_URL}${cleanPath}`;
};

/**
 * Helper function untuk memanggil REST API Backend Express
 * Otomatis menyertakan Header Authorization Token JWT jika tersedia
 */
export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    const headers = {
        ...(options.headers || {}),
    };

    // Jika data yang dikirim bukan FormData (bukan file upload), set Content-Type JSON
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    // Tempelkan Header Authorization JWT jika token ada
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Terjadi kesalahan pada server.');
    }

    return data;
};
