import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, Sparkles, X } from 'lucide-react'
import ChatHeader from './ChatHeader'
import ChatInput from './ChatInput'
import MessageList from './MessageList'
import { CHAT_SUGGESTIONS } from './mockData'
import { sendChatMessage } from '../../services/chatbotService'
import './AIChatWidget.css'

// Dự án hiện điều hướng bằng thẻ <a href> (không dùng React Router) nên mỗi lần
// chuyển trang là 1 lần reload toàn bộ trang -> toàn bộ state React (kể cả chat)
// bị mất. Lưu tạm vào sessionStorage để khôi phục lại sau khi trang reload,
// tự xóa khi đóng tab/trình duyệt (đúng nghĩa "lịch sử trong phiên làm việc").
const SESSION_STORAGE_KEY = 'ai-chat-session-v1'

function loadSession() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSession(data) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data))
  } catch {
    // sessionStorage có thể bị chặn (chế độ ẩn danh, hết dung lượng...) -> bỏ qua, không chặn UI
  }
}

function AIChatWidget() {
  const savedSession = loadSession()
  const [isOpen, setIsOpen] = useState(savedSession?.isOpen ?? false)
  const [isTyping, setIsTyping] = useState(false)
  const [isFooterVisible, setIsFooterVisible] = useState(false)
  const [hasFloatingConflict, setHasFloatingConflict] = useState(
    () => typeof document !== 'undefined' && Boolean(document.querySelector('.admin-toast')),
  )
  const [unreadCount, setUnreadCount] = useState(savedSession?.unreadCount ?? 1)
  const [messages, setMessages] = useState(savedSession?.messages ?? [])
  const messageIdRef = useRef(
    savedSession?.messages?.length
      ? Math.max(...savedSession.messages.map((m) => m.id))
      : 0,
  )
  const isOpenRef = useRef(savedSession?.isOpen ?? false)
  const timersRef = useRef(new Set())

  // Lưu lại session mỗi khi tin nhắn/trạng thái mở/số tin chưa đọc thay đổi
  useEffect(() => {
    saveSession({ messages, isOpen, unreadCount })
  }, [messages, isOpen, unreadCount])

  const nextMessageId = () => {
    messageIdRef.current += 1
    return messageIdRef.current
  }

  const schedule = (callback, delay) => {
    const timer = window.setTimeout(() => {
      timersRef.current.delete(timer)
      callback()
    }, delay)
    timersRef.current.add(timer)
  }

  useEffect(() => () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current.clear()
  }, [])

  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])

  useEffect(() => {
    const footer = document.querySelector('.site-footer')
    if (!footer) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => setIsFooterVisible(entry.isIntersecting),
      { threshold: 0.08 },
    )
    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setHasFloatingConflict(Boolean(document.querySelector('.admin-toast')))
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isOpen) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        isOpenRef.current = false
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isOpen])

  // Gọi API chatbot thật (BE -> Gemini) thay vì dữ liệu mock
  const appendAIResponse = async (query) => {
    try {
      const response = await sendChatMessage(query)
      setMessages((current) => [
        ...current,
        {
          id: nextMessageId(),
          role: 'assistant',
          query,
          ...response, // { text, documents }
        },
      ])
    } catch (err) {
      setMessages((current) => [
        ...current,
        {
          id: nextMessageId(),
          role: 'assistant',
          query,
          state: 'error',
          text: 'Không thể kết nối với trợ lý AI. Bạn có thể thử gửi lại yêu cầu.',
          documents: [],
        },
      ])
    } finally {
      setIsTyping(false)
      if (!isOpenRef.current) setUnreadCount((count) => count + 1)
    }
  }

  const sendMessage = (text) => {
    const userMessageId = nextMessageId()
    setMessages((current) => [
      ...current,
      { id: userMessageId, role: 'user', text, status: 'sending' },
    ])

    schedule(() => {
      setMessages((current) => current.map((message) => (
        message.id === userMessageId ? { ...message, status: 'sent' } : message
      )))
      setIsTyping(true)
      appendAIResponse(text)
    }, 320)
  }

  const retryMessage = (message) => {
    setMessages((current) => current.filter((item) => item.id !== message.id))
    setIsTyping(true)
    appendAIResponse(message.query || 'Gợi ý tài liệu')
  }

  const openChat = () => {
    isOpenRef.current = true
    setIsOpen(true)
    setUnreadCount(0)
  }

  const closeChat = () => {
    isOpenRef.current = false
    setIsOpen(false)
  }

  const toggleChat = () => {
    if (isOpen) closeChat()
    else openChat()
  }

  const isBusy = isTyping || messages.some((message) => message.status === 'sending')

  return (
    <div className={`ai-chat-widget ${isOpen ? 'ai-chat-widget--open' : ''} ${isFooterVisible ? 'ai-chat-widget--footer-visible' : ''} ${hasFloatingConflict ? 'ai-chat-widget--floating-conflict' : ''}`}>
      <motion.button
        className={`ai-chat-launcher ${isOpen ? 'ai-chat-launcher--open' : ''}`}
        type="button"
        aria-label={isOpen ? 'Đóng Trợ lý DOC' : 'Mở Trợ lý DOC'}
        aria-describedby="ai-chat-launcher-tooltip"
        initial={{ opacity: 0, scale: 0.72, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={toggleChat}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            className="ai-chat-launcher__main-icon"
            key={isOpen ? 'close' : 'bot'}
            initial={{ opacity: 0, rotate: -70, scale: 0.65 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 70, scale: 0.65 }}
            transition={{ duration: 0.18 }}
          >
            {isOpen ? <X size={25} aria-hidden="true" /> : <Bot size={25} aria-hidden="true" />}
          </motion.span>
        </AnimatePresence>
        {!isOpen && <Sparkles className="ai-chat-launcher__sparkle" size={13} aria-hidden="true" />}
        {!isOpen && unreadCount > 0 && (
          <span className="ai-chat-launcher__badge" aria-label={`${unreadCount} tin nhắn chưa đọc`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <span className="ai-chat-launcher__tooltip" id="ai-chat-launcher-tooltip" role="tooltip">
          {isOpen ? 'Đóng chat' : 'Chat với AI'}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            className="ai-chat-panel"
            role="dialog"
            aria-modal="false"
            aria-label="Trợ lý DOC"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <ChatHeader />

            <div className="ai-chat-panel__content">
              <MessageList
                messages={messages}
                suggestions={CHAT_SUGGESTIONS}
                isTyping={isTyping}
                onRetry={retryMessage}
                onSuggestion={sendMessage}
              />
              <ChatInput disabled={isBusy} onSend={sendMessage} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AIChatWidget
