import { apiFetch } from './api'

// ─── Documents ───────────────────────────────────────────────────────
export async function fetchAllDocuments() {
    const data = await apiFetch('/v1/documents')
    // API returns { items: [...] }
    return data.items || data || []
}

export function fetchPendingDocuments() {
    return apiFetch('/v1/documents/admin/pending')
}

export function approveDocumentApi(id) {
    return apiFetch(`/v1/documents/admin/${id}/approve`, { method: 'PUT' })
}

export function rejectDocumentApi(id) {
    return apiFetch(`/v1/documents/admin/${id}/reject`, { method: 'PUT' })
}

export function updateDocumentApi(id, payload) {
    return apiFetch(`/v1/documents/${id}`, { method: 'PUT', body: payload })
}

export function deleteDocumentApi(id) {
    return apiFetch(`/v1/documents/${id}`, { method: 'DELETE' })
}

export function adminCreateDocumentApi(payload) {
    return apiFetch('/v1/documents/admin/create', { method: 'POST', body: payload })
}

// ─── Users ───────────────────────────────────────────────────────────
export async function fetchAllUsers() {
    const data = await apiFetch('/v1/auth/users')
    // API returns { success: true, total: N, data: [...] }
    return data.data || data || []
}

export function adminCreateUserApi(payload) {
    return apiFetch('/v1/auth/users', { method: 'POST', body: payload })
}

export function adminUpdateUserApi(id, payload) {
    return apiFetch(`/v1/auth/users/${id}`, { method: 'PUT', body: payload })
}

export function adminResetPasswordApi(id, tempPassword) {
    return apiFetch(`/v1/auth/users/${id}/reset-password`, {
        method: 'POST',
        body: { tempPassword },
    })
}

export function adminDeleteUserApi(id) {
    return apiFetch(`/v1/auth/users/${id}`, { method: 'DELETE' })
}

// ─── Ratings ─────────────────────────────────────────────────────────
export function fetchAllRatings() {
    return apiFetch('/v1/ratings')
}

export function adminDeleteRatingApi(id) {
    return apiFetch(`/v1/ratings/admin/${id}`, { method: 'DELETE' })
}

export function adminDeleteAllRatingsApi() {
    return apiFetch('/v1/ratings/admin', { method: 'DELETE' })
}

// ─── Courses ─────────────────────────────────────────────────────────
export async function fetchAllCourses() {
    const data = await apiFetch('/v1/courses')
    // API returns { items: [...] }
    return data.items || data || []
}

// ─── Admin Logs ──────────────────────────────────────────────────────
export function fetchAdminLogs() {
    return apiFetch('/v1/auth/admin/logs')
}

export function postAdminLog(logData) {
    return apiFetch('/v1/auth/admin/logs', { method: 'POST', body: logData })
}
