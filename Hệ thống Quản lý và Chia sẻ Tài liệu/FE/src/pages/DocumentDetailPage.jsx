import { useEffect, useState } from 'react'
import {
  Download,
  Eye,
  FileArchive,
  FileText,
  FileType,
  Heart,
  Presentation,
  Share2,
  Star,
} from 'lucide-react'
import Footer from '../components/layout/Footer'
import Header from '../components/layout/Header'
import useAuthModal from '../hooks/useAuthModal'
import { getDocument, getPreviewUrl, downloadDocumentFile, summarizeDocument } from '../services/documentService'
import { getCourse } from '../services/courseService'
import { getRatingsForDocument, getAverageRating, addRating } from '../services/ratingService'
import { checkFavorite, addFavorite, removeFavorite } from '../services/favoriteService'
import { API_URL } from '../services/api'
import { getInitials } from '../utils/userDisplay'

const statusLabels = {
  approved: 'Đã duyệt',
  pending: 'Đang duyệt',
  rejected: 'Bị từ chối',
}

function getDocumentIdFromPath() {
  if (typeof window === 'undefined') return 1

  const [, section, documentId] = window.location.pathname.split('/')

  if (section === 'documents' && documentId && /^\d+$/.test(documentId)) {
    return Number(documentId)
  }

  return 1
}

function renderFileIcon(fileType, size = 18) {
  if (fileType === 'ppt' || fileType === 'pptx') return <Presentation size={size} strokeWidth={2} />
  if (fileType === 'docx' || fileType === 'doc') return <FileType size={size} strokeWidth={2} />
  if (fileType === 'zip') return <FileArchive size={size} strokeWidth={2} />
  return <FileText size={size} strokeWidth={2} />
}

function renderStars(value) {
  const rating = Math.round(Number(value) || 0)

  return Array.from({ length: 5 }, (_, index) => (
    <Star
      fill={index < rating ? 'currentColor' : 'none'}
      key={index}
      size={15}
      strokeWidth={2}
    />
  ))
}

function formatRating(value) {
  return Number(value || 0).toFixed(1)
}

function formatDate(dateValue) {
  if (!dateValue) return ''
  return new Intl.DateTimeFormat('vi-VN').format(new Date(dateValue))
}

function DocumentDetailPage() {
  const { isAuthenticated, requireAuth, user } = useAuthModal()
  const documentId = getDocumentIdFromPath()

  const [document, setDocument] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [course, setCourse] = useState(null)
  const [ratings, setRatings] = useState([])
  const [avgRating, setAvgRating] = useState({ average_rating: '0.0', total_ratings: 0 })
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedRating, setSelectedRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [summarizing, setSummarizing] = useState(false)
  const [summarizeError, setSummarizeError] = useState('')

  useEffect(() => {
    setDocument(null)
    setNotFound(false)

    getDocument(documentId)
      .then(setDocument)
      .catch(() => setNotFound(true))

    getRatingsForDocument(documentId).then(setRatings).catch(console.error)
    getAverageRating(documentId).then(setAvgRating).catch(console.error)

    if (isAuthenticated) {
      checkFavorite(documentId)
        .then((res) => setIsFavorite(res.favorite))
        .catch(console.error)
    }
  }, [documentId, isAuthenticated])

  useEffect(() => {
    if (!document?.course_id) {
      setCourse(null)
      return
    }

    getCourse(document.course_id).then(setCourse).catch(console.error)
  }, [document?.course_id])

  const refreshRatings = () => {
    getRatingsForDocument(documentId).then(setRatings).catch(console.error)
    getAverageRating(documentId).then(setAvgRating).catch(console.error)
  }

  if (notFound) {
    return (
      <>
        <Header />
        <main className="document-detail-page">
          <section className="document-detail-empty">
            <h1>Không tìm thấy tài liệu</h1>
            <p>Tài liệu này không tồn tại hoặc đã bị thay đổi.</p>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  if (!document) {
    return (
      <>
        <Header />
        <main className="document-detail-page" />
        <Footer />
      </>
    )
  }

  const normalizedFileType = (document.file_type || '').toLowerCase()
  const isPdf = normalizedFileType.includes('pdf')
  const fileName = document.file_url ? document.file_url.split('/').pop() : 'tai-lieu'
  const previewUrl = getPreviewUrl(documentId)
  const canPreviewPdf = isPdf && Boolean(document.file_url)
  const statusLabel = statusLabels[document.status] ?? document.status
  const aiSummaryText =
    document.ai_summary?.trim() || 'Chưa có tóm tắt AI cho tài liệu này.'
  const currentUserId = user?.id
  const canReview = isAuthenticated && !ratings.some((review) => review.user_id === currentUserId)
  const canSummarize =
    isAuthenticated && (user?.role === 'admin' || currentUserId === document.user_id)

  const handleSummarize = async () => {
    setSummarizing(true)
    setSummarizeError('')
    try {
      const { ai_summary } = await summarizeDocument(documentId)
      setDocument((prev) => (prev ? { ...prev, ai_summary } : prev))
    } catch (error) {
      setSummarizeError(error.message || 'Có lỗi xảy ra, thử lại sau.')
    } finally {
      setSummarizing(false)
    }
  }

  const openFile = () => {
    window.open(previewUrl, '_blank', 'noopener,noreferrer')
  }

  const downloadFile = async () => {
    try {
      const blob = await downloadDocumentFile(documentId)
      const objectUrl = window.URL.createObjectURL(blob)

      const link = window.document.createElement('a')
      link.href = objectUrl
      link.download = fileName
      window.document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(objectUrl)
    } catch (error) {
      console.error(error)
    }
  }

  const requestFileOpen = () => {
    requireAuth({
      label: `Đăng nhập để xem đầy đủ "${document.title}".`,
      onSuccess: openFile,
    })
  }
  const requestDownload = () => {
    requireAuth({
      label: `Đăng nhập để tải "${document.title}".`,
      onSuccess: downloadFile,
    })
  }
  const requestFavorite = () => {
    requireAuth({
      label: `Đăng nhập để lưu "${document.title}" vào yêu thích.`,
      onSuccess: async () => {
        try {
          if (isFavorite) {
            await removeFavorite(documentId)
            setIsFavorite(false)
          } else {
            await addFavorite(documentId)
            setIsFavorite(true)
          }
        } catch (error) {
          console.error(error)
        }
      },
    })
  }
  const requestComment = () => {
    requireAuth({
      label: `Đăng nhập để đánh giá "${document.title}".`,
      onSuccess: () => {
        window.document.getElementById('document-reviews-title')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      },
    })
  }

  const submitReview = async (event) => {
    event.preventDefault()
    setReviewError('')
    setIsSubmittingReview(true)

    try {
      await addRating({ documentId, rating: selectedRating, comment })
      setComment('')
      setSelectedRating(5)
      refreshRatings()
    } catch (error) {
      setReviewError(error.message || 'Có lỗi xảy ra khi gửi đánh giá.')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  return (
    <>
      <Header />

      <main className="document-detail-page">
        <nav className="document-detail-breadcrumb" aria-label="Breadcrumb">
          <a href="/courses">Học phần</a>
          <span aria-hidden="true">›</span>
          {course && (
            <>
              <a href={`/courses/${course.id}`}>{course.course_name}</a>
              <span aria-hidden="true">›</span>
            </>
          )}
          <span>{document.title}</span>
        </nav>

        <div className="document-detail-layout">
          <section className="document-preview-card" aria-labelledby="document-preview-title">
            <div className="document-preview-card__bar">
              <span className={`document-preview-card__type document-preview-card__type--${normalizedFileType}`}>
                {normalizedFileType ? normalizedFileType.toUpperCase() : 'FILE'}
              </span>
              <strong>{fileName}</strong>
              <div className="document-preview-card__actions">
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Mở tài liệu trong tab mới"
                  onClick={requestFileOpen}
                >
                  <Eye size={17} strokeWidth={2} />
                </button>
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Tải tài liệu"
                  onClick={requestDownload}
                >
                  <Download size={17} strokeWidth={2} />
                </button>
              </div>
            </div>

            <div className="document-preview-card__frame">
              {canPreviewPdf ? (
                <div className="document-preview-card__iframe-wrap">
                  <iframe src={previewUrl} title="Xem trước tài liệu" />
                  <p>
                    Nếu bản xem trước chưa hiển thị, hãy mở tài liệu trong tab mới hoặc tải
                    xuống.
                  </p>
                </div>
              ) : (
                <div className="document-preview-card__placeholder">
                  {renderFileIcon(normalizedFileType, 46)}
                  <strong>Chưa hỗ trợ xem trước</strong>
                  <span>Chỉ hỗ trợ xem trước trực tiếp file PDF. Hãy tải xuống để xem.</span>
                </div>
              )}
            </div>

            <h2 id="document-preview-title">Xem trước tài liệu</h2>
          </section>

          <aside className="document-detail-sidebar" aria-label="Thông tin tài liệu">
            <section className="document-info-card">
              {document.status !== 'approved' && (
                <span className={`status-badge status-badge--${document.status}`}>
                  {statusLabel}
                </span>
              )}
              <h1>{document.title}</h1>
              <p>{document.description}</p>

              <div className="document-detail-rating" aria-label="Đánh giá trung bình">
                <span>{renderStars(avgRating.average_rating)}</span>
                <strong>{formatRating(avgRating.average_rating)}</strong>
                <small>({avgRating.total_ratings ?? 0} đánh giá)</small>
              </div>

              <div className="document-detail-actions">
                <button
                  className="button button--primary"
                  type="button"
                  onClick={requestDownload}
                >
                  <Download size={16} strokeWidth={2} />
                  Tải xuống
                </button>
                <button
                  className={`icon-button ${isFavorite ? 'is-active' : ''}`}
                  type="button"
                  aria-label="Yêu thích tài liệu"
                  onClick={requestFavorite}
                >
                  <Heart size={18} strokeWidth={2} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button className="icon-button" type="button" aria-label="Chia sẻ tài liệu">
                  <Share2 size={18} strokeWidth={2} />
                </button>
              </div>

              <dl className="document-detail-facts">
                <div>
                  <dt>Ngày đăng</dt>
                  <dd>{formatDate(document.created_at)}</dd>
                </div>
                <div>
                  <dt>Loại file</dt>
                  <dd>{normalizedFileType ? normalizedFileType.toUpperCase() : 'Chưa rõ'}</dd>
                </div>
                <div>
                  <dt>Học phần</dt>
                  <dd>{course?.course_name ?? 'Chưa có dữ liệu'}</dd>
                </div>
              </dl>

              <div className="document-detail-counters">
                <div>
                  <strong>{(document.view_count ?? 0).toLocaleString()}</strong>
                  <span>Lượt xem</span>
                </div>
                <div>
                  <strong>{(document.download_count ?? 0).toLocaleString()}</strong>
                  <span>Lượt tải</span>
                </div>
              </div>
            </section>

            <section className="document-author-card" aria-labelledby="document-author-title">
              <h2 id="document-author-title">Người đăng</h2>
              <div className="document-author-card__profile">
                <span aria-hidden="true">
                  {document.uploader?.avatar ? (
                    <img src={`${API_URL}${document.uploader.avatar}`} alt="Avatar" />
                  ) : (
                    getInitials(document.uploader?.username)
                  )}
                </span>
                <strong>{document.uploader?.username ?? `Người dùng #${document.user_id}`}</strong>
              </div>
            </section>
          </aside>
        </div>

        <section className="document-ai-summary" aria-labelledby="document-summary-title">
          <h2 id="document-summary-title">Tóm tắt AI</h2>
          <p>{aiSummaryText}</p>
          {canSummarize && (
            <>
              <button
                className="button button--outline"
                type="button"
                onClick={handleSummarize}
                disabled={summarizing}
              >
                {summarizing ? 'Đang tạo tóm tắt...' : 'Tạo tóm tắt AI'}
              </button>
              {summarizeError && <p className="document-ai-summary__error">{summarizeError}</p>}
            </>
          )}
        </section>

        <section className="document-reviews" aria-labelledby="document-reviews-title">
          <div className="document-section-heading">
            <h2 id="document-reviews-title">Đánh giá</h2>
            <span>{avgRating.total_ratings ?? 0} lượt đánh giá</span>
          </div>

          {!isAuthenticated && (
            <button
              className="button button--outline document-review-login"
              type="button"
              onClick={requestComment}
            >
              Đăng nhập để viết đánh giá
            </button>
          )}

          {canReview && (
            <form className="document-review-form" onSubmit={submitReview}>
              <div className="document-review-form__stars" aria-label="Chọn số sao">
                {Array.from({ length: 5 }, (_, index) => {
                  const starValue = index + 1

                  return (
                    <button
                      className={starValue <= selectedRating ? 'is-active' : ''}
                      type="button"
                      key={starValue}
                      onClick={() => setSelectedRating(starValue)}
                      aria-label={`${starValue} sao`}
                    >
                      <Star size={20} strokeWidth={2} fill="currentColor" />
                    </button>
                  )
                })}
              </div>
              <label>
                <span>Nhận xét của bạn</span>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Chia sẻ cảm nhận hoặc góp ý về tài liệu..."
                  rows={4}
                />
              </label>
              {reviewError && (
                <p className="document-review-form__error" role="alert">{reviewError}</p>
              )}
              <button className="button button--primary" type="submit" disabled={isSubmittingReview}>
                {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          )}

          <div className="document-review-list">
            {ratings.map((review) => (
              <article className="document-review-row" key={review.id}>
                <span className="document-review-row__avatar" aria-hidden="true">
                  {review.user?.avatar ? (
                    <img src={`${API_URL}${review.user.avatar}`} alt="Avatar" />
                  ) : (
                    getInitials(review.user?.username)
                  )}
                </span>
                <div>
                  <div className="document-review-row__top">
                    <strong>{review.user?.username ?? `Người dùng #${review.user_id}`}</strong>
                    <span>{renderStars(review.rating)}</span>
                    <time>{formatDate(review.created_at)}</time>
                  </div>
                  <p>{review.comment ?? 'Người dùng đã đánh giá tài liệu này.'}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* TODO: BE không có API cho ai_related_documents -> ẩn tài liệu gợi ý cho tới khi có endpoint. */}
      </main>

      <Footer />
    </>
  )
}

export default DocumentDetailPage
