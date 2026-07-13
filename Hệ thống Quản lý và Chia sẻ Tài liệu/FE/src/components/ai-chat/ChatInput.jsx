import { useRef, useState } from 'react'
import { Send } from 'lucide-react'

function ChatInput({ disabled, onSend }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  const resizeTextarea = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 96)}px`
  }

  const submit = () => {
    const message = value.trim()
    if (!message || disabled) return
    onSend(message)
    setValue('')
    window.requestAnimationFrame(() => {
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    })
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <div className="ai-chat-input-wrap">
      <div className="ai-chat-input">
        <textarea
          ref={textareaRef}
          rows="1"
          value={value}
          disabled={disabled}
          placeholder="Hỏi Trợ lý DOC..."
          aria-label="Nhập tin nhắn"
          onChange={(event) => {
            setValue(event.target.value)
            resizeTextarea()
          }}
          onKeyDown={handleKeyDown}
        />
        <button type="button" onClick={submit} disabled={disabled || !value.trim()} aria-label="Gửi tin nhắn">
          <Send size={18} />
        </button>
      </div>
      <small>Enter để gửi · Shift+Enter để xuống dòng</small>
    </div>
  )
}

export default ChatInput
