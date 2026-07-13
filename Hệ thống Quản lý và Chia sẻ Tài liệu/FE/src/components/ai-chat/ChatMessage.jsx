import { AlertTriangle, Bot, SearchX } from 'lucide-react'
import RelatedDocumentCard from './RelatedDocumentCard'

function ChatMessage({ message, onRetry }) {
  const isUser = message.role === 'user'

  return (
    <div className={`ai-chat-message ai-chat-message--${message.role}`}>
      {!isUser && <span className="ai-chat-message__avatar" aria-hidden="true"><Bot size={16} /></span>}
      <div className="ai-chat-message__body">
        <div className={`ai-chat-bubble ${message.state ? `ai-chat-bubble--${message.state}` : ''}`}>
          {message.state === 'empty' && <SearchX size={17} aria-hidden="true" />}
          {message.state === 'error' && <AlertTriangle size={17} aria-hidden="true" />}
          <p>{message.text}</p>
          {message.state === 'error' && (
            <button type="button" onClick={() => onRetry(message)}>Thử lại</button>
          )}
        </div>

        {message.documents?.length > 0 && (
          <div className="ai-related-documents">
            {message.documents.slice(0, 5).map((document) => (
              <RelatedDocumentCard document={document} key={document.id} />
            ))}
          </div>
        )}

        {isUser && message.status === 'sending' && <small>Đang gửi...</small>}
      </div>
    </div>
  )
}

export default ChatMessage
