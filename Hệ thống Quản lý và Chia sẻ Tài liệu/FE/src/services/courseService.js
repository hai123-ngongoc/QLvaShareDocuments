import { apiFetch } from './api'

export async function getCourses() {
    const data = await apiFetch('/v1/courses')
    return data.items
}

export function getCourse(id) {
    return apiFetch(`/v1/courses/${id}`)
}