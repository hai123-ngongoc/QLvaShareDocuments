export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getToken() {
    return localStorage.getItem('token')
}

export async function apiFetch(path, options = {}) {
    const token = getToken()
    const isFormData = options.body instanceof FormData

    const headers = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    }

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        body: isFormData || !options.body ? options.body : JSON.stringify(options.body),
    })

    const contentType = res.headers.get('content-type') || ''
    const data = contentType.includes('application/json') ? await res.json() : await res.text()

    if (!res.ok) {
        const message = (data && data.message) || `Lỗi ${res.status}`
        throw new Error(message)
    }

    return data
}