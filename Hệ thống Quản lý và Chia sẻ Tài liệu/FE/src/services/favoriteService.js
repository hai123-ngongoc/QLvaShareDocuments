import { apiFetch } from './api'

export function getFavorites() {
  return apiFetch('/v1/favorites') // trả về mảng, mỗi phần tử đã kèm sẵn object `document` (+ `uploader` bên trong document)
}

export function checkFavorite(documentId) {
  return apiFetch(`/v1/favorites/check/${documentId}`) // { favorite: boolean }
}

export function addFavorite(documentId) {
  return apiFetch('/v1/favorites', {
    method: 'POST',
    body: { document_id: documentId },
  })
}

export function removeFavorite(documentId) {
  return apiFetch(`/v1/favorites/${documentId}`, { method: 'DELETE' })
}
