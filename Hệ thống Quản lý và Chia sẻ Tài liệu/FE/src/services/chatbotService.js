import { apiFetch } from './api'

/**
 * Gửi câu hỏi tới chatbot AI (backend sẽ tự truy vấn dữ liệu liên quan
 * và gọi Gemini API để sinh câu trả lời).
 * @param {string} message - Câu hỏi của người dùng
 * @returns {Promise<{ text: string, documents: Array }>}
 */
export function sendChatMessage(message) {
  return apiFetch('/v1/chatbot', {
    method: 'POST',
    body: { message },
  })
}
