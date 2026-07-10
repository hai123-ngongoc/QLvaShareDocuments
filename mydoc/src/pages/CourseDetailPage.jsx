import { useMemo, useState } from 'react'
import {
  BookOpen,
  CalendarDays,
  Download,
  Eye,
  FileArchive,
  FileText,
  FileType,
  GraduationCap,
  Presentation,
  Search,
} from 'lucide-react'
import Footer from '../components/layout/Footer'
import Header from '../components/layout/Header'
import SuggestedDocuments from '../components/home/SuggestedDocuments'
import useAuthModal from '../hooks/useAuthModal'
import { getCourseDetail, getSuggestedDocumentsForCourse } from '../data/homeSelectors'

const documentFilters = [
  { id: 'trending', label: 'Thịnh hành' },
  { id: 'highest-rated', label: 'Đánh giá cao nhất' },
  { id: 'newest', label: 'Mới nhất' },
]

function getCourseIdFromPath() {
  if (typeof window === 'undefined') return 8

  const [, section, courseId] = window.location.pathname.split('/')

  if (section === 'courses' && courseId && /^\d+$/.test(courseId)) {
    return Number(courseId)
  }

  return 8
}

function renderDocumentIcon(type) {
  if (type === 'ppt') return <Presentation size={18} strokeWidth={2} />
  if (type === 'docx') return <FileType size={18} strokeWidth={2} />
  if (type === 'zip') return <FileArchive size={18} strokeWidth={2} />
  return <FileText size={18} strokeWidth={2} />
}

function CourseDetailPage() {
  const { requireAuth } = useAuthModal()
  const course = getCourseDetail(getCourseIdFromPath())
  const suggestedDocuments = useMemo(() => {
    if (!course) return []

    return getSuggestedDocumentsForCourse(course.id)
  }, [course])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('trending')
  const requestDownload = (document) => {
    requireAuth({
      label: `Đăng nhập để tải "${document.title}".`,
      onSuccess: () => {
        window.location.assign(`/documents/${document.id}`)
      },
    })
  }
  const filteredDocuments = useMemo(() => {
    if (!course) return []

    const normalizedSearch = searchTerm.trim().toLowerCase()
    const matchingDocuments = normalizedSearch
      ? course.documents.filter((document) => {
          return `${document.title} ${document.uploader}`.toLowerCase().includes(normalizedSearch)
        })
      : course.documents

    return [...matchingDocuments].sort((firstDocument, secondDocument) => {
      if (activeFilter === 'highest-rated') {
        return secondDocument.avg_rating - firstDocument.avg_rating
      }

      if (activeFilter === 'newest') {
        return (
          new Date(secondDocument.uploadedAtValue).getTime() -
          new Date(firstDocument.uploadedAtValue).getTime()
        )
      }

      const firstTrendScore = firstDocument.view_count + firstDocument.download_count * 2
      const secondTrendScore = secondDocument.view_count + secondDocument.download_count * 2

      return secondTrendScore - firstTrendScore
    })
  }, [activeFilter, course, searchTerm])

  if (!course) {
    return (
      <>
        <Header />

        <main className="home-page course-detail-page">
          <nav className="course-breadcrumb" aria-label="Breadcrumb">
            <a href="/courses">Học phần</a>
            <span aria-hidden="true">›</span>
            <span>Không tìm thấy</span>
          </nav>

          <section className="course-detail-hero" aria-labelledby="course-detail-title">
            <span className="course-detail-hero__icon" aria-hidden="true">
              <BookOpen size={24} strokeWidth={2.2} />
            </span>

            <div className="course-detail-hero__content">
              <span className="course-detail-hero__code">404</span>
              <h1 id="course-detail-title">Không tìm thấy học phần</h1>
              <p>Học phần này không tồn tại hoặc đã bị thay đổi.</p>
            </div>
          </section>
        </main>

        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />

      <main className="home-page course-detail-page">
        <nav className="course-breadcrumb" aria-label="Breadcrumb">
          <a href="/courses">Học phần</a>
          <span aria-hidden="true">›</span>
          <span>{course.name}</span>
        </nav>

        <section className="course-detail-hero" aria-labelledby="course-detail-title">
          <span className="course-detail-hero__icon" aria-hidden="true">
            <BookOpen size={24} strokeWidth={2.2} />
          </span>

          <div className="course-detail-hero__content">
            <span className="course-detail-hero__code">{course.code}</span>
            <h1 id="course-detail-title">{course.name}</h1>

            <div className="course-detail-hero__meta">
              <span>
                <GraduationCap size={14} strokeWidth={2} />
                {course.faculty}
              </span>
              <span>
                <CalendarDays size={14} strokeWidth={2} />
                Tạo ngày {course.createdAt}
              </span>
            </div>

            <p>{course.description}</p>
          </div>
        </section>

        <section className="course-documents" aria-labelledby="course-documents-title">
          <div className="course-documents__toolbar">
            <h2 id="course-documents-title">Tài liệu học phần</h2>

            <div className="course-documents__controls">
              <div className="course-document-filters" aria-label="Lọc tài liệu">
                {documentFilters.map((filter) => (
                  <button
                    className={`chip ${activeFilter === filter.id ? 'chip--active' : ''}`}
                    type="button"
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <label className="course-document-search">
                <Search size={16} strokeWidth={2} aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Tìm tài liệu..."
                  aria-label="Tìm tài liệu"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="course-document-list">
            {filteredDocuments.length === 0 && (
              <p className="course-document-empty">Chưa có tài liệu phù hợp.</p>
            )}

            {filteredDocuments.map((document) => {
              return (
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
                    {document.summary && (
                      <p className="course-document-item__summary">{document.summary}</p>
                    )}
                    <div className="course-document-item__meta">
                      <span>{document.uploader}</span>
                      <span>{document.uploadedAt}</span>
                    </div>
                  </div>

                  <div className="course-document-item__stats" aria-label="Thống kê tài liệu">
                    <span>
                      <Eye size={15} strokeWidth={2} aria-hidden="true" />
                      {document.view_count.toLocaleString()} lượt xem
                    </span>
                    <span>
                      <Download size={15} strokeWidth={2} aria-hidden="true" />
                      {document.download_count.toLocaleString()} lượt tải
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
              )
            })}
          </div>
        </section>

        {suggestedDocuments.length > 0 && (
          <SuggestedDocuments
            documents={suggestedDocuments}
            headingId="course-suggestions-title"
            showFilters={false}
            showFooterControls={false}
            getDocumentHref={(document) => `/documents/${document.id}`}
            variant="compact"
          />
        )}
      </main>

      <Footer />
    </>
  )
}

export default CourseDetailPage
