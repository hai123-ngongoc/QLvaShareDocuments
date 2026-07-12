import { apiFetch, API_URL } from './api'

export async function getDocuments() {
    const data = await apiFetch('/v1/documents')
    return data.items
}

export function searchDocuments(keyword) {
    return apiFetch(`/v1/documents/search?keyword=${encodeURIComponent(keyword)}`)
}

export function getDocument(id) {
    return apiFetch(`/v1/documents/${id}`)
}

export function uploadDocument(formData) {
    return apiFetch('/v1/documents', { method: 'POST', body: formData })
}

// GET /v1/documents/:id/view không yêu cầu token, trả về PDF stream (Content-Disposition: inline)
// -> dùng thẳng URL này cho <iframe>/window.open, không cần qua apiFetch.
export function getPreviewUrl(id) {
    return `${API_URL}/v1/documents/${id}/view`
}

// GET /v1/documents/download/:id YÊU CẦU token qua header Authorization.
// Link/window.open không tự gửi header, nên phải tự fetch kèm token rồi trả Blob để tải.
export async function downloadDocumentFile(id) {
    const token = localStorage.getItem('token')

    const res = await fetch(`${API_URL}/v1/documents/download/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    })

    if (!res.ok) {
        const contentType = res.headers.get('content-type') || ''
        const data = contentType.includes('application/json') ? await res.json() : null
        throw new Error((data && data.message) || `Lỗi ${res.status}`)
    }

    return res.blob()
}