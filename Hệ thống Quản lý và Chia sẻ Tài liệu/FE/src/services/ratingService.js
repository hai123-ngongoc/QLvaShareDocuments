import { apiFetch } from './api'

export function getRatingsForDocument(documentId) {
  return apiFetch(`/v1/ratings/document/${documentId}`) // mỗi item giờ kèm sẵn object `user` (đã join, mục C.2 checklist v6)
}

export function getAverageRating(documentId) {
  return apiFetch(`/v1/documents/${documentId}/average-rating`)
  // { document_id, average_rating: "4.0", total_ratings: 1 }
}

export function addRating({ documentId, rating, comment }) {
  return apiFetch('/v1/ratings', {
    method: 'POST',
    body: { document_id: documentId, rating, comment },
  })
}

export function updateRating(id, { rating, comment }) {
  return apiFetch(`/v1/ratings/${id}`, { method: 'PUT', body: { rating, comment } })
}

export function deleteRating(id) {
  return apiFetch(`/v1/ratings/${id}`, { method: 'DELETE' })
}
