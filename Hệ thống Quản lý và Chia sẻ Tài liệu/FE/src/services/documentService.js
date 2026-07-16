import { apiFetch, API_URL } from './api'

export async function getDocuments() {
    const data = await apiFetch('/v1/documents')
    return data.items
}

export async function getPublicNewDocuments(page, pageSize = 8, sortBy = 'newest') {
    try {
        return await apiFetch(
            `/v1/documents/public/new?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}`
        )
    } catch {
        // Tương thích với backend đang chạy phiên bản cũ chưa có route /public/new.
        // Admin có thể nhận cả pending/rejected từ route chung nên phải lọc approved tại đây.
        const data = await apiFetch('/v1/documents')
        const publicDocuments = (data.items || [])
            .filter((document) => document.status === 'approved')
            .sort((first, second) => {
                if (sortBy === 'popular') {
                    const viewDifference = (second.view_count || 0) - (first.view_count || 0)
                    return viewDifference || second.id - first.id
                }
                const dateDifference = new Date(second.created_at) - new Date(first.created_at)
                return dateDifference || second.id - first.id
            })
        const totalItems = publicDocuments.length
        const offset = (page - 1) * pageSize

        return {
            items: publicDocuments.slice(offset, offset + pageSize),
            totalItems,
            page,
            pageSize,
            totalPages: Math.ceil(totalItems / pageSize),
        }
    }
}

export function searchDocuments(keyword) {
    return apiFetch(`/v1/documents/search?keyword=${encodeURIComponent(keyword)}`)
}

export function getDocument(id) {
    return apiFetch(`/v1/documents/${id}`)
}

// Upload có theo dõi tiến độ thật (fetch không hỗ trợ progress khi upload nên phải dùng XMLHttpRequest).
export function uploadDocument(formData, onProgress) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        const token = localStorage.getItem('token')

        xhr.open('POST', `${API_URL}/v1/documents`)
        if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        }

        xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable || !onProgress) return
            onProgress(Math.round((event.loaded / event.total) * 100))
        }

        xhr.onload = () => {
            let data = null
            try {
                data = xhr.responseText ? JSON.parse(xhr.responseText) : null
            } catch {
                data = null
            }

            if (xhr.status >= 200 && xhr.status < 300) {
                onProgress?.(100)
                resolve(data)
            } else {
                reject(new Error((data && data.message) || `Lỗi ${xhr.status}`))
            }
        }

        xhr.onerror = () => reject(new Error('Không thể kết nối tới máy chủ.'))

        xhr.send(formData)
    })
}

// Yêu cầu backend gọi AI tạo tóm tắt cho tài liệu (chủ tài liệu hoặc admin).
// Trả về { ai_summary } khi thành công.
export function summarizeDocument(id) {
    return apiFetch(`/v1/documents/${id}/summarize`, { method: 'POST' })
}

// GET /v1/documents/:id/view không yêu cầu token, trả về PDF stream (Content-Disposition: inline)
// -> dùng thẳng URL này cho <iframe>/window.open, không cần qua apiFetch.
export function getPreviewUrl(id) {
    return `${API_URL}/v1/documents/${id}/view`
}

// Giống getPreviewUrl nhưng dùng cho tài liệu CHƯA approved (vd admin xem trước tài liệu
// đang chờ duyệt). Route /:id/view cho phép xem không cần token với tài liệu đã approved,
// nhưng với tài liệu pending/rejected thì canViewDocument() ở BE yêu cầu req.user (chủ tài
// liệu hoặc admin) -> phải tự fetch kèm Authorization header rồi trả về Blob để gán vào
// <iframe src> qua URL.createObjectURL, vì thẻ <iframe>/<a> không tự gửi header này.
export async function fetchPreviewBlob(id) {
    const token = localStorage.getItem('token')

    const res = await fetch(`${API_URL}/v1/documents/${id}/view`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    })

    if (!res.ok) {
        const contentType = res.headers.get('content-type') || ''
        const data = contentType.includes('application/json') ? await res.json() : null
        throw new Error((data && data.message) || `Lỗi ${res.status}`)
    }

    return res.blob()
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
