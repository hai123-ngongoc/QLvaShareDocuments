import { useState } from 'react'
import { Bookmark, Download, Eye, FileText } from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import useAuthModal from '../hooks/useAuthModal'
import {
  getCurrentUserProfile,
  getMyLibraryDocuments,
  getMyLibraryStats,
  getSavedDocuments,
} from '../data/homeSelectors'

const tabs = ['Tài liệu của tôi', 'Đã lưu', 'Hoạt động', 'Cài đặt']

function getInitials(name = '') {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'
  )
}

function createSessionProfile(user) {
  if (!user) return null

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    created_at: user.created_at,
    initials: getInitials(user.username),
    displayName: user.username,
    joinedYear: new Date(user.created_at).getFullYear().toString(),
    school: 'Chưa có dữ liệu',
    faculty: 'Chưa có dữ liệu',
    studentId: 'Chưa có dữ liệu',
  }
}

function formatRating(value) {
  return Number(value || 0).toFixed(1)
}

const activities = [
  {
    id: 1,
    icon: '⬆',
    content: 'Bạn đã upload React Hooks - Hướng dẫn sử dụng useState & useEffect',
    time: '2 giờ trước',
  },
  {
    id: 2,
    icon: '♥',
    content: 'Bạn đã lưu Cơ sở dữ liệu - Đề cương ôn tập cuối kỳ',
    time: 'Hôm qua, 14:32',
  },
  {
    id: 3,
    icon: '★',
    content: 'Bạn đã đánh giá Mạng máy tính - Slide TCP/IP',
    time: '2 ngày trước',
  },
  {
    id: 4,
    iconComponent: Download,
    content: 'Bạn đã tải Giải tích - Công thức ôn tập cuối kỳ',
    time: '3 ngày trước',
  },
]

const settings = [
  { label: 'Hồ sơ công khai', value: 'Đang bật' },
  { label: 'Thông báo tài liệu', value: 'Email hằng ngày' },
  { label: 'Ngôn ngữ', value: 'Tiếng Việt' },
  { label: 'Dung lượng đã dùng', value: '1.8 GB / 5 GB' },
]

function MyLibraryPage() {
  const { currentUser } = useAuthModal()
  const [activeTab, setActiveTab] = useState(tabs[0])
  const profile = getCurrentUserProfile(currentUser?.id) ?? createSessionProfile(currentUser)
  const libraryStats = getMyLibraryStats(currentUser?.id)
  const myDocuments = getMyLibraryDocuments(currentUser?.id)
  const savedDocuments = getSavedDocuments(currentUser?.id)
  const profileStats = [
    {
      label: 'Tài liệu đã upload',
      value: libraryStats.uploadedCount.toLocaleString(),
      icon: FileText,
      tone: 'amber',
    },
    {
      label: 'Đã lưu',
      value: libraryStats.savedCount.toLocaleString(),
      icon: Bookmark,
      tone: 'rose',
    },
    {
      label: 'Lượt xem',
      value: libraryStats.totalViews.toLocaleString(),
      icon: Eye,
      tone: 'emerald',
    },
    {
      label: 'Lượt tải',
      value: libraryStats.totalDownloads.toLocaleString(),
      icon: Download,
      tone: 'indigo',
    },
  ]
  const shownDocuments = activeTab === 'Đã lưu' ? savedDocuments : myDocuments
  const showDocuments = activeTab === 'Tài liệu của tôi' || activeTab === 'Đã lưu'
  const showActivity = activeTab === 'Tài liệu của tôi' || activeTab === 'Hoạt động'
  const isSavedTab = activeTab === 'Đã lưu'

  if (!profile) return null

  return (
    <>
      <Header isAuthenticated />

      <main className="home-page library-page">
        <section className="library-profile" aria-labelledby="library-profile-title">
          <div className="library-profile__summary">
            <span className="library-profile__avatar" aria-hidden="true">
              {profile.initials}
            </span>
            <div>
              <h1 id="library-profile-title">{profile.displayName}</h1>
              <p>{profile.email}</p>
              <div className="library-profile__meta">
                <span>{profile.school}</span>
                <span>{profile.faculty}</span>
              </div>
            </div>
          </div>

          <div className="library-stats-grid">
            {profileStats.map((stat) => (
              <article className="stat-card library-stat-card" key={stat.label}>
                <span
                  className={`stat-card__icon library-stat-card__icon library-stat-card__icon--${stat.tone}`}
                  aria-hidden="true"
                >
                  <stat.icon size={20} strokeWidth={2} />
                </span>
                <div>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <nav className="library-tabs" aria-label="Thư viện cá nhân">
          {tabs.map((tab) => (
            <button
              className={`library-tab ${activeTab === tab ? 'library-tab--active' : ''}`}
              type="button"
              onClick={() => setActiveTab(tab)}
              key={tab}
            >
              {tab}
            </button>
          ))}
        </nav>

        {showDocuments && (
          <section className="library-document-grid" aria-label={activeTab}>
            {shownDocuments.map((document) => (
              <article className="document-card library-document-card" key={document.id}>
                <div className="document-card__top">
                  <div>
                    <h2>
                      <a href={`/documents/${document.id}`}>{document.title}</a>
                    </h2>
                    <p>
                      {document.course} ·{' '}
                      {isSavedTab
                        ? `Người đăng ${document.uploader}`
                        : `Upload ${document.uploadedAt}`}
                    </p>
                  </div>
                  {!isSavedTab && (
                    <span className={`status-badge status-badge--${document.status}`}>
                      {document.statusLabel}
                    </span>
                  )}
                  {isSavedTab && (
                    <button
                      className="bookmark is-active"
                      type="button"
                      aria-label={`Bỏ lưu ${document.title}`}
                    >
                      ♥
                    </button>
                  )}
                </div>

                <div className="document-card__meta library-document-card__meta">
                  <span className="library-document-card__rating">
                    {document.rating_count
                      ? `★★★★★ ${formatRating(document.avg_rating)} (${document.rating_count})`
                      : 'Chưa có đánh giá'}
                  </span>
                  <span>
                    <Eye className="meta-icon" size={15} strokeWidth={2} aria-hidden="true" />
                    {document.view_count.toLocaleString()} lượt xem
                  </span>
                  <span>
                    <Download className="meta-icon" size={15} strokeWidth={2} aria-hidden="true" />
                    {document.download_count.toLocaleString()} lượt tải
                  </span>
                </div>
              </article>
            ))}
          </section>
        )}

        {showActivity && (
          <section className="library-activity" aria-labelledby="library-activity-title">
            <h2 id="library-activity-title">Hoạt động gần đây</h2>
            <div className="library-activity-list">
              {activities.map((activity) => (
                <article className="library-activity-item" key={activity.id}>
                  <span className="library-activity-item__icon" aria-hidden="true">
                    {activity.iconComponent ? (
                      <activity.iconComponent size={16} strokeWidth={2.2} />
                    ) : (
                      activity.icon
                    )}
                  </span>
                  <div>
                    <p>{activity.content}</p>
                    <span>{activity.time}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'Cài đặt' && (
          <section className="library-settings" aria-label="Cài đặt thư viện">
            {settings.map((setting) => (
              <article className="document-card library-setting-card" key={setting.label}>
                <span>{setting.label}</span>
                <strong>{setting.value}</strong>
              </article>
            ))}
          </section>
        )}
      </main>

      <Footer />
    </>
  )
}

export default MyLibraryPage
