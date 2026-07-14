import { useEffect, useMemo, useState } from 'react'
import { Bookmark, Download, Eye, FileText } from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { getProfile } from '../services/authService'
import { getDocuments } from '../services/documentService'
import { getFavorites } from '../services/favoriteService'
import { getCourses } from '../services/courseService'
import { getAverageRating } from '../services/ratingService'
import { getInitials } from '../utils/userDisplay'
import { API_URL } from '../services/api'

const tabs = ['Tài liệu của tôi', 'Đã lưu']

const statusLabels = {
  approved: 'Đã duyệt',
  pending: 'Đang duyệt',
  rejected: 'Bị từ chối',
}

function formatRating(value) {
  return Number(value || 0).toFixed(1)
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateValue))
}

// Gọi average-rating thật cho từng document rồi gộp kết quả vào (id -> {avg_rating, rating_count}).
async function attachRealRatings(documents) {
  const ratingEntries = await Promise.all(
    documents.map(async (document) => {
      try {
        const stats = await getAverageRating(document.id)
        return [document.id, {
          avg_rating: Number(stats.average_rating) || 0,
          rating_count: Number(stats.total_ratings) || 0,
        }]
      } catch (error) {
        console.error(error)
        return [document.id, { avg_rating: 0, rating_count: 0 }]
      }
    }),
  )

  const ratingsById = Object.fromEntries(ratingEntries)

  return documents.map((document) => ({
    ...document,
    ...ratingsById[document.id],
  }))
}

function MyLibraryPage() {
  const [activeTab, setActiveTab] = useState(tabs[0])
  const [profile, setProfile] = useState(null)
  const [myDocuments, setMyDocuments] = useState([])
  const [savedDocuments, setSavedDocuments] = useState([])
  const [coursesById, setCoursesById] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let currentUserId = null

    getProfile()
      .then((res) => {
        setProfile(res.user)
        currentUserId = res.user.id

        return getDocuments()
      })
      .then((documents) => documents.filter((doc) => doc.user_id === currentUserId))
      .then(attachRealRatings)
      .then(setMyDocuments)
      .catch(console.error)

    getFavorites()
      .then((favorites) => favorites.map((favorite) => favorite.document).filter(Boolean))
      .then(attachRealRatings)
      .then(setSavedDocuments)
      .catch(console.error)

    getCourses()
      .then((courses) => {
        const map = {}
        courses.forEach((course) => { map[course.id] = course })
        setCoursesById(map)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const libraryStats = useMemo(() => ({
    uploadedCount: myDocuments.length,
    savedCount: savedDocuments.length,
    totalViews: myDocuments.reduce((sum, d) => sum + (d.view_count || 0), 0),
    totalDownloads: myDocuments.reduce((sum, d) => sum + (d.download_count || 0), 0),
  }), [myDocuments, savedDocuments])

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

  const shownDocuments = useMemo(() => {
    const source = activeTab === 'Đã lưu' ? savedDocuments : myDocuments

    return source.map((document) => ({
      ...document,
      course: coursesById[document.course_id]?.course_name ?? 'Chưa phân loại',
      statusLabel: statusLabels[document.status] ?? document.status,
      uploadedAt: formatDate(document.created_at),
      // document.uploader chỉ tồn tại ở tab "Đã lưu" (favorites API đã join uploader thật);
      // tab "Tài liệu của tôi" không cần vì luôn là chính mình.
      uploader: document.uploader?.username ?? 'Ẩn danh',
    }))
  }, [activeTab, myDocuments, savedDocuments, coursesById])

  const showDocuments = activeTab === 'Tài liệu của tôi' || activeTab === 'Đã lưu'
  const isSavedTab = activeTab === 'Đã lưu'

  if (loading || !profile) return null // TODO: thay bằng skeleton/loading UI nếu muốn

  return (
    <>
      <Header isAuthenticated />

      <main className="home-page library-page">
        <section className="library-profile" aria-labelledby="library-profile-title">
          <div className="library-profile__summary">
            <span className="library-profile__avatar" aria-hidden="true">
              {profile.avatar ? (
                <img src={`${API_URL}${profile.avatar}`} alt="Avatar" />
              ) : (
                getInitials(profile)
              )}
            </span>
            <div>
              <h1 id="library-profile-title">{profile.username}</h1>
              <p>{profile.email}</p>
              <div className="library-profile__meta">
                <span>Chưa có dữ liệu</span>
                <span>Chưa có dữ liệu</span>
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
                    {(document.view_count ?? 0).toLocaleString()} lượt xem
                  </span>
                  <span>
                    <Download className="meta-icon" size={15} strokeWidth={2} aria-hidden="true" />
                    {(document.download_count ?? 0).toLocaleString()} lượt tải
                  </span>
                </div>
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
