import {
  CheckCircle,
  FileArchive,
  FileText,
  FileType,
  Presentation,
} from 'lucide-react'
import Footer from '../components/layout/Footer'
import Header from '../components/layout/Header'

function getQueryPayload() {
  if (typeof window === 'undefined') {
    return {}
  }

  const params = new URLSearchParams(window.location.search)

  return {
    title: params.get('title') ?? 'Tài liệu mới',
    course_name: params.get('course_name') ?? 'Chưa chọn học phần',
    file_type: params.get('file_type') ?? 'pdf',
    created_at: params.get('created_at') ?? new Date().toISOString(),
  }
}

function renderFileIcon(fileType) {
  if (fileType === 'ppt') return <Presentation size={24} strokeWidth={2} />
  if (fileType === 'docx') return <FileType size={24} strokeWidth={2} />
  if (fileType === 'zip') return <FileArchive size={24} strokeWidth={2} />
  return <FileText size={24} strokeWidth={2} />
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateValue))
}

function UploadSuccessPage(props) {
  const queryPayload = getQueryPayload()
  const document = {
    ...queryPayload,
    ...props,
  }

  return (
    <>
      <Header isAuthenticated />

      <main className="upload-success-page">
        <section className="upload-success-card" aria-labelledby="upload-success-title">
          <span className="upload-success-card__icon" aria-hidden="true">
            <CheckCircle size={54} strokeWidth={2.2} />
          </span>

          <h2 id="upload-success-title">Tài liệu đã được gửi duyệt</h2>
          <p>
            &quot;{document.title}&quot; đã được tải lên thành công. Tài liệu sẽ
            hiển thị công khai sau khi admin duyệt.
          </p>

          <article className="upload-success-summary" aria-label="Tóm tắt tài liệu">
            <span
              className={`upload-success-summary__file upload-success-summary__file--${document.file_type}`}
              aria-hidden="true"
            >
              {renderFileIcon(document.file_type)}
            </span>

            <div className="upload-success-summary__main">
              <strong>{document.title}</strong>
              <span>{document.course_name}</span>
              <time dateTime={document.created_at}>{formatDate(document.created_at)}</time>
            </div>

            <span className="upload-success-summary__badge">Đang duyệt</span>
          </article>
        </section>
      </main>

      <Footer />
    </>
  )
}

export default UploadSuccessPage
