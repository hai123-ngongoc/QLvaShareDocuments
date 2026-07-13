import { useEffect, useRef } from 'react'
import { Bot, Sparkles } from 'lucide-react'
import ChatMessage from './ChatMessage'
import TypingIndicator from './TypingIndicator'

function MessageList({ messages, suggestions, isTyping, onRetry, onSuggestion }) {
  const listRef = useRef(null)

  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div className="ai-chat-messages" ref={listRef} aria-live="polite">
      {messages.length === 0 && !isTyping && (
        <div className="ai-chat-welcome">
          <span className="ai-chat-welcome__icon" aria-hidden="true"><Bot size={28} /></span>
          <h2>Xin chào! Mình là Trợ lý DOC</h2>
          <p>Hãy chọn một câu hỏi gợi ý hoặc nhập nội dung bạn muốn tìm hiểu.</p>
          <div className="ai-chat-suggestions">
            {suggestions.map((suggestion) => (
              <button type="button" onClick={() => onSuggestion(suggestion)} key={suggestion}>
                <Sparkles size={14} aria-hidden="true" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.map((message) => (
        <ChatMessage message={message} onRetry={onRetry} key={message.id} />
      ))}

      {isTyping && (
        <div className="ai-chat-message ai-chat-message--assistant">
          <span className="ai-chat-message__avatar" aria-hidden="true"><Bot size={16} /></span>
          <TypingIndicator />
        </div>
      )}
    </div>
  )
}

export default MessageList
