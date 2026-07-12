import { useEffect, useMemo, useState } from 'react'
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
import useAuthModal from '../hooks/useAuthModal'
import { getCourse } from '../services/courseService'
import { getDocuments } from '../services/documentService'
import { getAverageRating } from '../services/ratingService'

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
  if (type === 'ppt' || type === 'pptx') return <Presentation size={18} strokeWidth={2} />
  if (type === 'docx' || type === 'doc') return <FileType size={18} strokeWidth={2} />
  if (type === 'zip') return <FileArchive size={18} strokeWidth={2} />
  return <FileText size={18} strokeWidth={2} />
}

function formatDate(dateValue) {
  if (!dateValue) return ''
  return new Intl.DateTimeFormat('vi-VN').format(new Date(dateValue))
}

function CourseDetailPage() {
  const { requireAuth } = useAuthModal()
  const courseId = getCourseIdFromPath()

  const [course, setCourse] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [documents, setDocuments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('trending')

  useEffect(() => {
    setCourse(null)
    setNotFound(false)

    getCourse(courseId)
      .then(setCourse)
      .catch(() => setNotFound(true))
  }, [courseId])

  useEffect(() => {
    // BE không có API "tài liệu theo học phần" riêng -> lấy toàn bộ rồi lọc theo course_id,
    // chỉ giữ tài liệu đã duyệt vì đây là trang công khai cho mọi người xem.
    getDocuments()
      .then((allDocuments) => {
        const courseDocuments = allDocuments.filter(
          (document) => document.course_id === courseId && document.status === 'approved',
        )

        // BE chưa join User vào GET /v1/documents nên chỉ có user_id thô -> tạm hiển thị "Người dùng #id".
        // Điểm đánh giá trung bình cũng không có sẵn trong danh sách -> gọi riêng cho từng tài liệu
        // (giống cách MyLibraryPage.jsx đã làm) để phục vụ sort "Đánh giá cao nhất".
        return Promise.all(
          courseDocuments.map((document) =>
            getAverageRating(document.id)
              .then((avg) => ({ ...document, avg_rating: Number(avg.average_rating) || 0 }))
              .catch(() => ({ ...document, avg_rating: 0 })),
          ),
        )
      })
      .then(setDocuments)
      .catch(console.error)
  }, [courseId])

  const requestDownload = (document) => {
    requireAuth({
      label: `Đăng nhập để tải "${document.title}".`,
      onSuccess: () => {
        window.location.assign(`/documents/${document.id}`)
      },
    })
  }

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const matchingDocuments = normalizedSearch
      ? documents.filter((document) => `${document.title}`.toLowerCase().includes(normalizedSearch))
      : documents

    return [...matchingDocuments].sort((firstDocument, secondDocument) => {
      if (activeFilter === 'highest-rated') {
        return secondDocument.avg_rating - firstDocument.avg_rating
      }

      if (activeFilter === 'newest') {
        return new Date(secondDocument.created_at).getTime() - new Date(firstDocument.created_at).getTime()
      }

      const firstTrendScore = (firstDocument.view_count || 0) + (firstDocument.download_count || 0) * 2
      const secondTrendScore = (secondDocument.view_count || 0) + (secondDocument.download_count || 0) * 2

      return secondTrendScore - firstTrendScore
    })
  }, [activeFilter, documents, searchTerm])

  if (notFound) {
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

  if (!course) {
    return (
      <>
        <Header />
        <main className="home-page course-detail-page" />
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
          <span>{course.course_name}</span>
        </nav>

        <section className="course-detail-hero" aria-labelledby="course-detail-title">
          <span className="course-detail-hero__icon" aria-hidden="true">
            <BookOpen size={24} strokeWidth={2.2} />
          </span>

          <div className="course-detail-hero__content">
            <span className="course-detail-hero__code">{course.course_code}</span>
            <h1 id="course-detail-title">{course.course_name}</h1>

            <div className="course-detail-hero__meta">
              <span>
                <GraduationCap size={14} strokeWidth={2} />
                {course.faculty}
              </span>
              <span>
                <CalendarDays size={14} strokeWidth={2} />
                Tạo ngày {formatDate(course.created_at)}
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
                    {document.description && (
                      <p className="course-document-item__summary">{document.description}</p>
                    )}
                    <div className="course-document-item__meta">
                      <span>{document.uploader?.username ?? `Người dùng #${document.user_id}`}</span>
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
              )
            })}
          </div>
        </section>

        {/* TODO: BE không có API cho tài liệu gợi ý AI theo học phần -> ẩn phần này cho tới khi có endpoint. */}
      </main>

      <Footer />
    </>
  )
}

export default CourseDetailPage
