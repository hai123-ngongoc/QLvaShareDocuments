import { useEffect, useState } from 'react'
import { Download, Eye, FileArchive, FileText, FileType, Presentation, Search } from 'lucide-react'
import Footer from '../components/layout/Footer'
import Header from '../components/layout/Header'
import useAuthModal from '../hooks/useAuthModal'
import { searchDocuments } from '../services/documentService'

function getKeywordFromUrl() {
  if (typeof window === 'undefined') return ''
  return new URLSearchParams(window.location.search).get('keyword') || ''
}

function renderDocumentIcon(type) {
  if (type === 'ppt' || type === 'pptx') return <Presentation size={18} strokeWidth={2} />
  if (type === 'docx' || type === 'doc') return <FileType size={18} strokeWidth={2} />
  if (type === 'zip') return <FileArchive size={18} strokeWidth={2} />
  return <FileText size={18} strokeWidth={2} />
}

function formatDate(dateValue) {
  if (!dateValue) return ''
  return new Intl.DateTimeFormat('vi-VN').format(new Date(dateValue))
}

function SearchResultsPage() {
  const { requireAuth } = useAuthModal()
  const [keyword, setKeyword] = useState(getKeywordFromUrl)
  const [searchInput, setSearchInput] = useState(getKeywordFromUrl)
  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!keyword.trim()) {
      setDocuments([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setLoadError('')

    searchDocuments(keyword.trim())
      .then((results) => setDocuments(Array.isArray(results) ? results : []))
      .catch((error) => setLoadError(error.message || 'Không tìm kiếm được tài liệu.'))
      .finally(() => setIsLoading(false))
  }, [keyword])

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextKeyword = searchInput.trim()

    const params = new URLSearchParams(window.location.search)
    if (nextKeyword) {
      params.set('keyword', nextKeyword)
    } else {
      params.delete('keyword')
    }
    window.history.pushState({}, '', `/search?${params.toString()}`)

    setKeyword(nextKeyword)
  }

  const requestDownload = (document) => {
    requireAuth({
      label: `Đăng nhập để tải "${document.title}".`,
      onSuccess: () => {
        window.location.assign(`/documents/${document.id}`)
      },
    })
  }

  return (
    <>
      <Header />

      <main className="home-page course-detail-page">
        <nav className="course-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Trang chủ</a>
          <span aria-hidden="true">›</span>
          <span>Kết quả tìm kiếm</span>
        </nav>

        <section className="course-documents" aria-labelledby="search-results-title">
          <div className="course-documents__toolbar">
            <h2 id="search-results-title">
              {keyword.trim() ? `Kết quả cho "${keyword.trim()}"` : 'Tìm tài liệu'}
            </h2>

            <form className="course-documents__controls" onSubmit={handleSubmit}>
              <label className="course-document-search">
                <Search size={16} strokeWidth={2} aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Tìm theo môn học, tên tài liệu hoặc giảng viên"
                  aria-label="Tìm tài liệu"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </label>
              <button className="button button--primary" type="submit">
                Tìm kiếm
              </button>
            </form>
          </div>

          {loadError && (
            <p className="course-document-empty" role="alert">{loadError}</p>
          )}

          {isLoading && !loadError && (
            <p className="course-document-empty">Đang tìm kiếm...</p>
          )}

          {!isLoading && !loadError && !keyword.trim() && (
            <p className="course-document-empty">Nhập từ khóa để tìm tài liệu.</p>
          )}

          {!isLoading && !loadError && keyword.trim() && documents.length === 0 && (
            <p className="course-document-empty">
              Không tìm thấy tài liệu phù hợp với &quot;{keyword.trim()}&quot;.
            </p>
          )}

          {!isLoading && !loadError && documents.length > 0 && (
            <div className="course-document-list">
              {documents.map((document) => (
                <article className="course-document-item" key={document.id}>
                  <span
                    className={`course-document-item__icon course-document-item__icon--${document.file_type}`}
                    aria-hidden="true"
                  >
                    {renderDocumentIcon(document.file_type)}
                  </span>

                  <div className="course-document-item__main">
                    <h3>
                      <a href={`/documents/${document.id}`}>{document.title}</a>
                    </h3>
                    {document.description && (
                      <p className="course-document-item__summary">{document.description}</p>
                    )}
                    <div className="course-document-item__meta">
                      <span>{document.course?.course_name ?? 'Chưa phân loại'}</span>
                      <span>{formatDate(document.created_at)}</span>
                    </div>
                  </div>

                  <div className="course-document-item__stats" aria-label="Thống kê tài liệu">
                    <span>
                      <Eye size={15} strokeWidth={2} aria-hidden="true" />
                      {(document.view_count ?? 0).toLocaleString()} lượt xem
                    </span>
                    <span>
                      <Download size={15} strokeWidth={2} aria-hidden="true" />
                      {(document.download_count ?? 0).toLocaleString()} lượt tải
                    </span>
                  </div>

                  <div className="course-document-item__actions">
                    <a className="icon-button" href={`/documents/${document.id}`} aria-label={`Xem ${document.title}`}>
                      <Eye size={18} strokeWidth={2} />
                    </a>
                    <button
                      className="icon-button icon-button--download"
                      type="button"
                      aria-label={`Tải ${document.title}`}
                      onClick={() => requestDownload(document)}
                    >
                      <Download size={18} strokeWidth={2} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  )
}

export default SearchResultsPage
