import { apiFetch } from './api'

export function register({ username, password, email }) {
    return apiFetch('/v1/auth/register', {
        method: 'POST',
        body: { username, password, email },
    })
}

export function login({ username, password }) {
    return apiFetch('/v1/auth/login', {
        method: 'POST',
        body: { username, password },
    })
}

export function getProfile() {
    return apiFetch('/v1/auth/profile')
}

export function changePassword({ oldPassword, newPassword }) {
    return apiFetch('/v1/auth/change-password', {
        method: 'PUT',
        body: { oldPassword, newPassword },
    })
}