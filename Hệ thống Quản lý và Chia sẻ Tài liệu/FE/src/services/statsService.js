import { apiFetch } from './api'

export function getStats() {
    return apiFetch('/v1/stats')
}