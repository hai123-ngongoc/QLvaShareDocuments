import { Bell, Check, CheckCheck, FileCheck, FileX, MessageSquare, Trash2, EyeOff } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead
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

function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)
  const bellRef = useRef(null)

  // Fetch unread count
  const loadUnreadCount = useCallback(async () => {
    try {
      const data = await fetchUnreadCount()
      setUnreadCount(data.count || 0)
    } catch {
      // Silently fail - user might not be logged in
    }
  }, [])

  // Fetch full notification list
  const loadNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchNotifications()
      setNotifications(Array.isArray(data) ? data : [])
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Poll unread count every 30s
  useEffect(() => {
    loadUnreadCount()
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [loadUnreadCount])

  // Load full list when dropdown opens
  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen, loadNotifications])

  // Close on outside click or Escape
  useEffect(() => {
    if (!isOpen) return undefined

    const handlePointerDown = (e) => {
      if (
        !dropdownRef.current?.contains(e.target) &&
        !bellRef.current?.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleMarkAsRead = async (notification) => {
    if (notification.is_read) return

    try {
      await markNotificationRead(notification.id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: 1 } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // fail silently
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })))
      setUnreadCount(0)
    } catch {
      // fail silently
    }
  }

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification)

    // Navigate to document if it exists
    if (notification.document_id) {
      window.location.href = `/documents/${notification.document_id}`
    }
  }

  return (
    <div className="notification-bell-wrapper">
      <button
        ref={bellRef}
        className="notification-bell-btn"
        type="button"
        aria-label="Thông báo"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Bell size={20} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown" ref={dropdownRef}>
          <div className="notification-dropdown__header">
            <h3>Thông báo</h3>
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

          <div className="notification-dropdown__list">
            {loading && (
              <div className="notification-empty">
                <div className="notification-loading-spinner" />
                Đang tải...
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="notification-empty">
                <Bell size={32} strokeWidth={1.5} />
                <span>Chưa có thông báo nào</span>
              </div>
            )}

            {!loading &&
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
                    {!n.is_read && (
                      <div className="notification-item__dot" />
                    )}
                  </button>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
