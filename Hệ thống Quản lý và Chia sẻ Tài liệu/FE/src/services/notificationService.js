import { apiFetch } from './api'

export function fetchNotifications() {
    return apiFetch('/v1/notifications')
}

export function fetchUnreadCount() {
    return apiFetch('/v1/notifications/unread-count')
}

export function markNotificationRead(id) {
    return apiFetch(`/v1/notifications/${id}/read`, { method: 'PUT' })
}

export function markAllNotificationsRead() {
    return apiFetch('/v1/notifications/read-all', { method: 'PUT' })
}
