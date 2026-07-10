import { useMemo, useRef, useState } from 'react'
import {
  ChevronDown,
  FileArchive,
  FileText,
  FileType,
  Presentation,
  Upload,
  X,
} from 'lucide-react'
import Footer from '../components/layout/Footer'
import Header from '../components/layout/Header'
import {
  getCurrentUserProfile,
  getUploadCourseOptions,
} from '../data/homeSelectors'

const { faculties, courses } = getUploadCourseOptions()
const currentUser = getCurrentUserProfile()
const supportedTypes = ['PDF', 'DOCX', 'PPTX', 'ZIP']
const maxFileSizeMb = 50

function getFileType(fileName) {
  const extension = fileName.split('.').pop()?.toLowerCase()

  if (extension === 'doc') return 'docx'
  if (extension === 'pptx') return 'ppt'

  return ['pdf', 'docx', 'ppt', 'zip'].includes(extension) ? extension : 'pdf'
}

function getFileIcon(fileType) {
  if (fileType === 'ppt') return <Presentation size={20} strokeWidth={2} />
  if (fileType === 'docx') return <FileType size={20} strokeWidth={2} />
  if (fileType === 'zip') return <FileArchive size={20} strokeWidth={2} />
  return <FileText size={20} strokeWidth={2} />
}

function formatFileSize(size) {
  if (!size) return '0 KB'

  const sizeInMb = size / 1024 / 1024

  if (sizeInMb >= 1) {
    return `${sizeInMb.toFixed(1)} MB`
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`
}

function UploadPage() {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [faculty, setFaculty] = useState(faculties[0] ?? '')
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => course.faculty === faculty)
  }, [faculty])
  const [courseId, setCourseId] = useState(filteredCourses[0]?.id ?? '')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])

  const activeCourseId = filteredCourses.some((course) => course.id === Number(courseId))
    ? courseId
    : filteredCourses[0]?.id ?? ''
  const selectedCourse = courses.find((course) => course.id === Number(activeCourseId))
  const selectedFileType = selectedFile ? getFileType(selectedFile.name) : null

  function openFilePicker() {
    fileInputRef.current?.click()
  }

  function handleFiles(fileList) {
    const [file] = Array.from(fileList ?? [])

    if (!file) return

    setSelectedFile(file)
    if (!title) {
      setTitle(file.name.replace(/\.[^.]+$/, ''))
    }
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  function handleFacultyChange(event) {
    const nextFaculty = event.target.value
    const nextCourses = courses.filter((course) => course.faculty === nextFaculty)

    setFaculty(nextFaculty)
    setCourseId(nextCourses[0]?.id ?? '')
  }

  function addTag() {
    const nextTag = tagInput.trim()

    if (!nextTag || tags.includes(nextTag)) return

    setTags((currentTags) => [...currentTags, nextTag])
    setTagInput('')
  }

  function handleTagKeyDown(event) {
    if (event.key !== 'Enter') return

    event.preventDefault()
    addTag()
  }

  function removeTag(tagToRemove) {
    setTags((currentTags) => currentTags.filter((tag) => tag !== tagToRemove))
  }

  function resetForm() {
    setSelectedFile(null)
    setTitle('')
    setDescription('')
    setFaculty(faculties[0] ?? '')
    setCourseId(courses.find((course) => course.faculty === faculties[0])?.id ?? '')
    setTagInput('')
    setTags([])
  }

  function handleSubmit(event) {
    event.preventDefault()
    const createdAt = new Date().toISOString()

    const payload = {
      title,
      description,
      file_url: selectedFile ? `/documents/${selectedFile.name}` : '',
      file_type: selectedFileType,
      course_id: Number(activeCourseId),
      user_id: currentUser.id,
      status: 'pending',
      created_at: createdAt,
      // TODO: cần backend bổ sung file_type 'xlsx' nếu muốn upload Excel như một loại riêng.
      // TODO: cần backend bổ sung bảng tags nếu muốn chuẩn hóa thay vì lưu chuỗi.
      tags: tags.join(','),
    }

    console.info('Mock documents insert payload:', payload)

    const params = new URLSearchParams({
      title: payload.title || 'Tài liệu mới',
      course_name: selectedCourse?.course_name ?? 'Chưa chọn học phần',
      file_type: payload.file_type ?? 'pdf',
      created_at: payload.created_at,
    })

    window.location.assign(`/upload/success?${params.toString()}`)
  }

  return (
    <>
      <Header isAuthenticated />

      <main className="upload-page">
        <section className="upload-page__hero" aria-labelledby="upload-page-title">
          <h1 id="upload-page-title">Tải tài liệu lên</h1>
          <p>Chia sẻ tài liệu học tập của bạn với cộng đồng DocHub.</p>
        </section>

        <form className="upload-page__content" onSubmit={handleSubmit}>
          <section
            className="upload-page__drop-card"
            aria-labelledby="upload-file-title"
          >
            <div
              className={`upload-page__dropzone ${
                isDragging ? 'upload-page__dropzone--active' : ''
              }`}
              onDragEnter={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                className="upload-page__file-input"
                onChange={(event) => handleFiles(event.target.files)}
                ref={fileInputRef}
                type="file"
              />
              <span className="upload-page__drop-icon" aria-hidden="true">
                <Upload size={28} strokeWidth={2.2} />
              </span>
              <h2 id="upload-file-title">Kéo thả file vào đây</h2>
              <p>hoặc chọn file từ thiết bị của bạn</p>
              <button className="button button--primary" type="button" onClick={openFilePicker}>
                Chọn file
              </button>
              <span className="upload-page__hint">
                Hỗ trợ {supportedTypes.join(', ')} · tối đa {maxFileSizeMb}MB
              </span>
            </div>

            {selectedFile && (
              <article className="upload-page__file-card" aria-label="File đã chọn">
                <span
                  className={`upload-page__file-icon upload-page__file-icon--${selectedFileType}`}
                  aria-hidden="true"
                >
                  {getFileIcon(selectedFileType)}
                </span>
                <div className="upload-page__file-main">
                  <strong>{selectedFile.name}</strong>
                  <span>{formatFileSize(selectedFile.size)}</span>
                  <div className="upload-page__progress" aria-hidden="true">
                    <span />
                  </div>
                </div>
                <button
                  className="upload-page__remove"
                  type="button"
                  aria-label={`Xóa ${selectedFile.name}`}
                  onClick={() => setSelectedFile(null)}
                >
                  <X size={16} strokeWidth={2.2} />
                </button>
              </article>
            )}
          </section>

          <section className="upload-page__form-card" aria-label="Thông tin tài liệu">
            <label className="upload-field">
              <span>Tên tài liệu</span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Nhập tên tài liệu"
              />
            </label>

            <label className="upload-field">
              <span>Mô tả</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Tóm tắt nội dung, phạm vi và cách tài liệu hỗ trợ học tập"
                rows={5}
              />
            </label>

            <div className="upload-page__grid">
              <label className="upload-field">
                <span>Khoa</span>
                <span className="upload-select">
                  <select value={faculty} onChange={handleFacultyChange}>
                    {faculties.map((facultyName) => (
                      <option value={facultyName} key={facultyName}>
                        {facultyName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
                </span>
              </label>

              <label className="upload-field">
                <span>Học phần</span>
                <span className="upload-select">
                  <select
                    value={activeCourseId}
                    onChange={(event) => setCourseId(event.target.value)}
                  >
                    {filteredCourses.map((course) => (
                      <option value={course.id} key={course.id}>
                        {course.course_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
                </span>
              </label>
            </div>

            <label className="upload-field">
              <span>Thẻ (tags)</span>
              <input
                type="text"
                value={tagInput}
                onBlur={addTag}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Nhập thẻ và nhấn Enter..."
              />
            </label>

            {tags.length > 0 && (
              <div className="upload-page__tags" aria-label="Danh sách thẻ">
                {tags.map((tag) => (
                  <button
                    className="upload-page__tag"
                    type="button"
                    key={tag}
                    onClick={() => removeTag(tag)}
                  >
                    <span>{tag}</span>
                    <X size={13} strokeWidth={2.2} aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}

            <p className="upload-page__tag-note">
              Thêm thẻ giúp người khác tìm tài liệu của bạn dễ hơn. Ví dụ:
              React, SQL, Ôn thi cuối kỳ, Bài tập có lời giải.
              Hiện schema chưa có bảng lưu tags, phần này đang là UI tạm.
            </p>

            <input type="hidden" name="course_id" value={selectedCourse?.id ?? ''} />
          </section>

          <div className="upload-page__actions">
            <button className="button upload-page__secondary" type="button" onClick={resetForm}>
              Hủy
            </button>
            <button className="button button--primary" type="submit">
              Đăng tài liệu
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </>
  )
}

export default UploadPage
