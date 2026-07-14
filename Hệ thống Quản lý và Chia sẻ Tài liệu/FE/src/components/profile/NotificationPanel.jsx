import { useCallback, useEffect, useState } from 'react'
import { Bell, CheckCheck, FileCheck, FileX, MessageSquare, Trash2, EyeOff } from 'lucide-react'
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../services/notificationService'

const TYPE_CONFIG = {
  approved: { icon: FileCheck, color: '#22c55e', label: 'Đã duyệt' },
  rejected: { icon: FileX, color: '#ef4444', label: 'Từ chối' },
  commented: { icon: MessageSquare, color: '#3b82f6', label: 'Bình luận' },
  deleted: { icon: Trash2, color: '#f97316', label: 'Đã xóa' },
  hidden: { icon: EyeOff, color: '#a855f7', label: 'Ẩn' },
}

function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return 'Vừa xong'
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`
  return date.toLocaleDateString('vi-VN')
}

function NotificationPanel() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await fetchNotifications()
      setNotifications(Array.isArray(data) ? data : [])
    } catch {
      setNotifications([])
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const handleMarkAsRead = async (notification) => {
    if (notification.is_read) return
    try {
      await markNotificationRead(notification.id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: 1 } : n))
      )
    } catch {
      // fail silently
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })))
    } catch {
      // fail silently
    }
  }

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification)
    if (notification.document_id) {
      window.location.href = `/documents/${notification.document_id}`
    }
  }

  return (
    <section className="profile-panel" aria-labelledby="notification-title">
      <div className="profile-panel__heading">
        <h2 id="notification-title">Thông báo</h2>
        {unreadCount > 0 && (
          <button
            className="notification-mark-all-btn"
            type="button"
            onClick={handleMarkAllRead}
          >
            <CheckCheck size={14} />
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      <div className="notification-panel__list">
        {loading && (
          <div className="notification-empty">
            <div className="notification-loading-spinner" />
            Đang tải...
          </div>
        )}

        {!loading && error && (
          <div className="notification-empty">
            <Bell size={32} strokeWidth={1.5} />
            <span>Không thể tải thông báo. Vui lòng thử lại.</span>
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="notification-empty">
            <Bell size={32} strokeWidth={1.5} />
            <span>Không có thông báo mới nào.</span>
          </div>
        )}

        {!loading &&
          !error &&
          notifications.map((n) => {
            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.approved
            const Icon = config.icon

            return (
              <button
                key={n.id}
                className={`notification-item ${n.is_read ? '' : 'notification-item--unread'}`}
                type="button"
                onClick={() => handleNotificationClick(n)}
              >
                <div
                  className="notification-item__icon"
                  style={{ backgroundColor: `${config.color}20`, color: config.color }}
                >
                  <Icon size={18} />
                </div>
                <div className="notification-item__content">
                  <p className="notification-item__message">{n.message}</p>
                  <span className="notification-item__time">{timeAgo(n.created_at)}</span>
                </div>
                {!n.is_read && <div className="notification-item__dot" />}
              </button>
            )
          })}
      </div>
    </section>
  )
}

export default NotificationPanel
