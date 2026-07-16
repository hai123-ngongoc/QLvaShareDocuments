import { Download, Eye, FileArchive, FileText, FileType, Presentation } from 'lucide-react'
import useRevealOnce from '../../hooks/useRevealOnce'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Xem nhiều nhất' },
]

function renderDocumentIcon(fileType) {
  if (fileType === 'ppt') return <Presentation size={18} strokeWidth={2} />
  if (fileType === 'docx') return <FileType size={18} strokeWidth={2} />
  if (fileType === 'zip') return <FileArchive size={18} strokeWidth={2} />
  return <FileText size={18} strokeWidth={2} />
}

function formatRating(value) {
  return Number(value || 0).toFixed(1)
}

function SuggestedDocuments({
  documents,
  currentPage = 1,
  headingId = 'suggested-title',
  onPageChange,
  pageSize = 8,
  showFilters = true,
  showFooterControls = true,
  totalItems = 0,
  getDocumentHref,
  variant = 'default',
  title = '✦ Gợi ý cho bạn',
  sortBy = 'newest',
  onSortChange,
}) {
  const [sectionRef, isVisible] = useRevealOnce()
  const isCompact = variant === 'compact'
  const totalPages = Math.ceil(totalItems / pageSize)

  const handlePageChange = (page) => {
    if (page === currentPage || page < 1 || page > totalPages) return
    onPageChange?.(page)
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section
      className={`content-section suggested-documents suggested-documents--${variant} reveal-section ${isVisible ? 'is-visible' : ''
        }`}
      aria-labelledby={headingId}
      ref={sectionRef}
    >
      <div className="section-heading">
        <h2 id={headingId}>{title}</h2>
        {showFilters && (
          <div className="filter-chips" aria-label="Bộ lọc tài liệu">
            {SORT_OPTIONS.map((option) => (
              <button
                className={`chip ${option.value === sortBy ? 'chip--active' : ''}`}
                type="button"
                key={option.value}
                aria-pressed={option.value === sortBy}
                onClick={() => onSortChange?.(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`document-grid ${isCompact ? 'document-grid--compact' : ''}`}>
        {documents.map((document) => {
          const href = getDocumentHref?.(document)
          const CardElement = href ? 'a' : 'article'

          return (
            <CardElement
              className={`document-card ${isCompact ? 'document-card--compact' : ''}`}
              href={href}
              key={document.id}
            >
              <div className="document-card__top">
                <span
                  className={`course-document-item__icon course-document-item__icon--${document.file_type}`}
                  aria-hidden="true"
                >
                  {renderDocumentIcon(document.file_type)}
                </span>
                <div>
                  <h3>{document.title}</h3>
                  <p>
                    {document.course?.course_name || 'Chưa phân loại'}
                    {' · '}
                    {document.uploader?.username || 'Ẩn danh'}
                    {' · '}
                    {document.rating_count || 0} đánh giá
                  </p>
                </div>

                <div className="document-card__side">
                  <div className="rating" aria-label={`Đánh giá ${formatRating(document.avg_rating)}`}>
                    <span>★★★★★</span>
                    <strong>{formatRating(document.avg_rating)}</strong>
                  </div>
                  {href ? (
                    <span
                      className={`bookmark bookmark--static ${document.is_favorite ? 'is-active' : ''
                        }`}
                      aria-hidden="true"
                    >
                      ♥
                    </span>
                  ) : (
                    <button
                      className={`bookmark ${document.is_favorite ? 'is-active' : ''}`}
                      type="button"
                      aria-label={
                        document.is_favorite ? 'Tài liệu đã được lưu' : 'Lưu tài liệu'
                      }
                    >
                      ♥
                    </button>
                  )}
                </div>
              </div>

              <div className="ai-summary">
                <strong>✦ Tóm tắt AI</strong>
                <p>{document.summary || document.ai_summary || 'Chưa có tóm tắt AI.'}</p>
              </div>

              <div className="document-card__meta">
                <span>
                  <Eye className="meta-icon" size={15} strokeWidth={2} aria-hidden="true" />
                  {document.view_count.toLocaleString()} lượt xem
                </span>
                <span>
                  <Download className="meta-icon" size={15} strokeWidth={2} aria-hidden="true" />
                  {document.download_count.toLocaleString()} lượt tải
                </span>
              </div>
            </CardElement>
          )
        })}
      </div>

      {showFooterControls && totalItems > pageSize && (
        <nav className="pagination" aria-label="Phân trang tài liệu">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              className={`pagination__item ${page === currentPage ? 'pagination__item--active' : ''}`}
              type="button"
              aria-current={page === currentPage ? 'page' : undefined}
              onClick={() => handlePageChange(page)}
              key={page}
            >
              {page}
            </button>
          ))}
          <button
            className="pagination__item"
            type="button"
            aria-label="Trang tiếp theo"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            ›
          </button>
        </nav>
      )}
    </section>
  )
}

export default SuggestedDocuments
