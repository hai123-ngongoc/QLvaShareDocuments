import { useState } from 'react'
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
import SuggestedDocuments from '../components/home/SuggestedDocuments'
import useAuthModal from '../hooks/useAuthModal'
import {
  getDocumentDetail,
  getSuggestedDocumentsForDocument,
} from '../data/homeSelectors'

function getDocumentIdFromPath() {
  if (typeof window === 'undefined') return 1

  const [, section, documentId] = window.location.pathname.split('/')

  if (section === 'documents' && documentId && /^\d+$/.test(documentId)) {
    return Number(documentId)
  }

  return 1
}

function renderFileIcon(fileType, size = 18) {
  if (fileType === 'ppt') return <Presentation size={size} strokeWidth={2} />
  if (fileType === 'docx') return <FileType size={size} strokeWidth={2} />
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

function isMockFileUrl(fileUrl) {
  return fileUrl?.startsWith('/documents/')
}

function DocumentDetailPage() {
  const { isAuthenticated, requireAuth } = useAuthModal()
  const document = getDocumentDetail(getDocumentIdFromPath(), isAuthenticated ? undefined : null)
  const [selectedRating, setSelectedRating] = useState(5)
  const [comment, setComment] = useState('')
  const suggestions = document ? getSuggestedDocumentsForDocument(document.id) : []

  if (!document) {
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

  const isPdf = document.file_type === 'pdf'
  const fileName = document.file_url.split('/').pop()
  // TODO: cần backend trả file_url trỏ tới file thật/public storage để bật preview PDF.
  const hasUsableFileUrl = Boolean(document.file_url) && !isMockFileUrl(document.file_url)
  const canPreviewPdf = isPdf && hasUsableFileUrl
  const aiSummaryText =
    document.ai_summary?.trim() || 'Chưa có tóm tắt AI cho tài liệu này.'
  const openFile = () => {
    if (!hasUsableFileUrl) return
    window.open(document.file_url, '_blank', 'noopener,noreferrer')
  }
  const downloadFile = () => {
    if (!hasUsableFileUrl) return

    const link = window.document.createElement('a')
    link.href = document.file_url
    link.download = fileName
    window.document.body.appendChild(link)
    link.click()
    link.remove()
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
      onSuccess: () => {
        // TODO: gọi API favorites để lưu document_id cho user hiện tại.
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

  return (
    <>
      <Header />

      <main className="document-detail-page">
        <nav className="document-detail-breadcrumb" aria-label="Breadcrumb">
          <a href="/courses">Học phần</a>
          <span aria-hidden="true">›</span>
          <a href={`/courses/${document.courseId}`}>{document.courseName}</a>
          <span aria-hidden="true">›</span>
          <span>{document.title}</span>
        </nav>

        <div className="document-detail-layout">
          <section className="document-preview-card" aria-labelledby="document-preview-title">
            <div className="document-preview-card__bar">
              <span className={`document-preview-card__type document-preview-card__type--${document.file_type}`}>
                {document.file_type.toUpperCase()}
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
                  <iframe src={document.file_url} title="Xem trước tài liệu" />
                  <p>
                    Nếu bản xem trước chưa hiển thị, hãy mở tài liệu trong tab mới hoặc tải
                    xuống.
                  </p>
                </div>
              ) : (
                <div className="document-preview-card__placeholder">
                  {renderFileIcon(document.file_type, 46)}
                  <strong>Chưa có dữ liệu</strong>
                  <span>File xem trước sẽ hiển thị khi backend cung cấp file_url thật.</span>
                </div>
              )}
            </div>

            <h2 id="document-preview-title">Xem trước tài liệu</h2>
          </section>

          <aside className="document-detail-sidebar" aria-label="Thông tin tài liệu">
            <section className="document-info-card">
              {document.status !== 'approved' && (
                <span className={`status-badge status-badge--${document.status}`}>
                  {document.statusLabel}
                </span>
              )}
              <h1>{document.title}</h1>
              <p>{document.description}</p>

              <div className="document-detail-rating" aria-label="Đánh giá trung bình">
                <span>{renderStars(document.avg_rating)}</span>
                <strong>{formatRating(document.avg_rating)}</strong>
                <small>({document.rating_count} đánh giá)</small>
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
                  className="icon-button"
                  type="button"
                  aria-label="Yêu thích tài liệu"
                  onClick={requestFavorite}
                >
                  <Heart size={18} strokeWidth={2} />
                </button>
                <button className="icon-button" type="button" aria-label="Chia sẻ tài liệu">
                  <Share2 size={18} strokeWidth={2} />
                </button>
              </div>

              <dl className="document-detail-facts">
                <div>
                  <dt>Ngày đăng</dt>
                  <dd>{new Intl.DateTimeFormat('vi-VN').format(new Date(document.created_at))}</dd>
                </div>
                <div>
                  <dt>Loại file</dt>
                  <dd>{document.file_type.toUpperCase()}</dd>
                </div>
                <div>
                  <dt>Học phần</dt>
                  <dd>{document.courseName}</dd>
                </div>
              </dl>

              <div className="document-detail-counters">
                <div>
                  <strong>{document.view_count.toLocaleString()}</strong>
                  <span>Lượt xem</span>
                </div>
                <div>
                  <strong>{document.download_count.toLocaleString()}</strong>
                  <span>Lượt tải</span>
                </div>
              </div>
            </section>

            <section className="document-author-card" aria-labelledby="document-author-title">
              <h2 id="document-author-title">Người đăng</h2>
              <div className="document-author-card__profile">
                <span aria-hidden="true">{document.author.initials}</span>
                <strong>{document.author.username}</strong>
              </div>
            </section>
          </aside>
        </div>

        <section className="document-ai-summary" aria-labelledby="document-summary-title">
          <h2 id="document-summary-title">Tóm tắt AI</h2>
          <p>{aiSummaryText}</p>
        </section>

        <section className="document-reviews" aria-labelledby="document-reviews-title">
          <div className="document-section-heading">
            <h2 id="document-reviews-title">Đánh giá</h2>
            <span>{document.rating_count} lượt đánh giá</span>
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

          {document.canReview && (
            <form
              className="document-review-form"
              onSubmit={(event) => event.preventDefault()}
            >
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
              <button className="button button--primary" type="submit">
                Gửi đánh giá
              </button>
              <p className="document-review-form__note">
                TODO: cần backend nối API ratings để lưu đánh giá thật.
              </p>
            </form>
          )}

          <div className="document-review-list">
            {document.reviews.map((review) => (
              <article className="document-review-row" key={review.id}>
                <span className="document-review-row__avatar" aria-hidden="true">
                  {review.initials}
                </span>
                <div>
                  <div className="document-review-row__top">
                    <strong>{review.username}</strong>
                    <span>{renderStars(review.rating)}</span>
                    <time>{review.createdAt}</time>
                  </div>
                  <p>{review.comment ?? 'Người dùng đã đánh giá tài liệu này.'}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {suggestions.length > 0 && (
          <SuggestedDocuments
            documents={suggestions}
            headingId="document-suggestions-title"
            showFilters={false}
            showFooterControls={false}
            getDocumentHref={(suggestedDocument) => `/documents/${suggestedDocument.id}`}
            variant="compact"
          />
        )}
      </main>

      <Footer />
    </>
  )
}

export default DocumentDetailPage
