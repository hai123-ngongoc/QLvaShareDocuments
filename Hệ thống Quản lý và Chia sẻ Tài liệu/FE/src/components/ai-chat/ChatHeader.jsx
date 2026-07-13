import { Bot } from 'lucide-react'

function ChatHeader() {
  return (
    <header className="ai-chat-header">
      <div className="ai-chat-header__identity">
        <span className="ai-chat-header__icon" aria-hidden="true">
          <Bot size={20} />
        </span>
        <div className="ai-chat-header__copy">
          <strong>Trợ lý DOC</strong>
          <span>Giao diện AI mô phỏng</span>
        </div>
      </div>

      <div className="ai-chat-header__status" role="status">
        <i aria-hidden="true" />
        <span>Đang hoạt động</span>
      </div>
    </header>
  )
}

export default ChatHeader
