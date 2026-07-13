import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, Sparkles, X } from 'lucide-react'
import ChatHeader from './ChatHeader'
import ChatInput from './ChatInput'
import MessageList from './MessageList'
import { CHAT_SUGGESTIONS, createMockResponse } from './mockData'
import './AIChatWidget.css'

function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isFooterVisible, setIsFooterVisible] = useState(false)
  const [hasFloatingConflict, setHasFloatingConflict] = useState(
    () => typeof document !== 'undefined' && Boolean(document.querySelector('.admin-toast')),
  )
  const [unreadCount, setUnreadCount] = useState(1)
  const [messages, setMessages] = useState([])
  const messageIdRef = useRef(0)
  const isOpenRef = useRef(false)
  const timersRef = useRef(new Set())

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

  const appendMockResponse = (query, forceSuccess = false) => {
    const response = createMockResponse(query, forceSuccess)
    setMessages((current) => [
      ...current,
      {
        id: nextMessageId(),
        role: 'assistant',
        query,
        ...response,
      },
    ])
    setIsTyping(false)
    if (!isOpenRef.current) setUnreadCount((count) => count + 1)
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
      schedule(() => appendMockResponse(text), 850)
    }, 320)
  }

  const retryMessage = (message) => {
    setMessages((current) => current.filter((item) => item.id !== message.id))
    setIsTyping(true)
    schedule(() => appendMockResponse(message.query || 'Gợi ý tài liệu', true), 850)
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
