import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  Info,
  KeyRound,
  LayoutDashboard,
  Lock,
  Menu,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  Shield,
  Sparkles,
  Circle,
  Trash2,
  Unlock,
  Users,
  X,
} from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import ActionMenu from '../components/common/ActionMenu'
import useAuthModal from '../hooks/useAuthModal'
import {
  fetchAllDocuments,
  fetchAllUsers,
  fetchAllRatings,
  fetchAllCourses,
  fetchAdminLogs,
  approveDocumentApi,
  rejectDocumentApi,
  updateDocumentApi,
  deleteDocumentApi,
  adminCreateDocumentApi,
  adminCreateUserApi,
  adminUpdateUserApi,
  adminResetPasswordApi,
  adminDeleteUserApi,
  adminDeleteRatingApi,
  adminDeleteAllRatingsApi,
  adminCreateCourseApi,
  adminUpdateCourseApi,
  adminDeleteCourseApi,
  postAdminLog,
} from '../services/adminService'
import { fetchPreviewBlob, downloadDocumentFile, summarizeDocument as summarizeDocumentApi } from '../services/documentService'

const DOCUMENTS_PER_PAGE = 6
const USERS_PER_PAGE = 6
const RATINGS_PER_PAGE = 6
const COURSES_PER_PAGE = 6

const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'rejected', label: 'Từ chối' },
]

const fileTypeOptions = ['Tất cả loại file', 'pdf', 'docx', 'ppt', 'zip']
const userRoleOptions = ['user', 'admin']
const userStatusOptions = ['active', 'locked']

const userStatusLabels = {
  active: 'Hoạt động',
  locked: 'Bị khoá',
  deleted: 'Đã xoá',
}

const documentRejectReasonOptions = [
  'Tài liệu sai học phần',
  'Nội dung không phù hợp',
  'File không mở được hoặc sai định dạng',
  'Tài liệu trùng lặp',
  'Thiếu mô tả hoặc thông tin cần thiết',
]

const statusLabels = {
  approved: 'Đã duyệt',
  pending: 'Chờ duyệt',
  rejected: 'Từ chối',
}

const statusClassNames = {
  approved: 'status-badge--approved',
  pending: 'status-badge--pending',
  rejected: 'status-badge--rejected',
}

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('vi-VN').format(new Date(value))
}

function normalizeFileType(document) {
  const extension = document.file_url?.split('.').pop()?.toLowerCase()
  if (extension === 'doc') return 'docx'
  if (extension === 'pptx') return 'ppt'
  if (['pdf', 'docx', 'ppt', 'zip'].includes(extension)) return extension
  return document.file_type || 'pdf'
}

function getFileNameFromUrl(fileUrl) {
  if (!fileUrl) return 'Chưa có file'
  return decodeURIComponent(fileUrl.split('/').pop() || fileUrl)
}

function AdminPage() {
  const { user } = useAuthModal()
  const adminShellRef = useRef(null)
  const [activeView, setActiveView] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [documentSearch, setDocumentSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [fileTypeFilter, setFileTypeFilter] = useState(fileTypeOptions[0])
  const [documentPage, setDocumentPage] = useState(0)
  const [userSearch, setUserSearch] = useState('')
  const [userPage, setUserPage] = useState(0)
  const [ratingSearch, setRatingSearch] = useState('')
  const [ratingPage, setRatingPage] = useState(0)
  const [courseSearch, setCourseSearch] = useState('')
  const [coursePage, setCoursePage] = useState(0)
  const [courseEditor, setCourseEditor] = useState(null)
  const [courseDeleteRequest, setCourseDeleteRequest] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [documentDeleteReason, setDocumentDeleteReason] = useState('')
  const [pendingRoleChange, setPendingRoleChange] = useState(null)
  const [isDeleteAllRatingsOpen, setIsDeleteAllRatingsOpen] = useState(false)
  const [deleteAllRatingsText, setDeleteAllRatingsText] = useState('')
  const [documentEditor, setDocumentEditor] = useState(null)
  const [documentRejectRequest, setDocumentRejectRequest] = useState(null)
  const [documentRejectReason, setDocumentRejectReason] = useState('')
  const [previewDocument, setPreviewDocument] = useState(null)
  const [previewFileUrl, setPreviewFileUrl] = useState(null)
  const [previewFileError, setPreviewFileError] = useState('')
  const [isPreviewFileLoading, setIsPreviewFileLoading] = useState(false)
  const [userEditor, setUserEditor] = useState(null)
  const [userDetail, setUserDetail] = useState(null)
  const [userDeleteRequest, setUserDeleteRequest] = useState(null)
  const [userDeleteReason, setUserDeleteReason] = useState('')
  const [resetPasswordRequest, setResetPasswordRequest] = useState(null)
  const [resetPasswordMethod, setResetPasswordMethod] = useState('temporary')
  const [resetPasswordResult, setResetPasswordResult] = useState('')
  const [ratingDeleteRequest, setRatingDeleteRequest] = useState(null)
  const [ratingDeleteReason, setRatingDeleteReason] = useState('')
  const [processingAction, setProcessingAction] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [adminLogs, setAdminLogs] = useState([])
  const [adminDocuments, setAdminDocuments] = useState([])
  const [adminUsers, setAdminUsers] = useState([])
  const [adminRatings, setAdminRatings] = useState([])
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // ── Guard: chỉ admin mới xem được ──────────────────────────────
  if (!user || user.role !== 'admin') {
    return (
      <>
        <Header />
        <main style={{ padding: '6rem 2rem', textAlign: 'center' }}>
          <h1>⛔ Truy cập bị từ chối</h1>
          <p>Bạn cần đăng nhập với tài khoản Admin để sử dụng trang này.</p>
          <a className="button button--primary" href="/" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Về trang chủ
          </a>
        </main>
        <Footer />
      </>
    )
  }

  // ── Load data from API ────────────────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [docs, users, ratings, coursesData, logs] = await Promise.all([
        fetchAllDocuments(),
        fetchAllUsers(),
        fetchAllRatings().catch(() => []),
        fetchAllCourses(),
        fetchAdminLogs().catch(() => []),
      ])
      setAdminDocuments(
        (Array.isArray(docs) ? docs : []).map((d) => ({
          ...d,
          file_type: normalizeFileType(d),
          status: d.status || 'pending',
        }))
      )
      setAdminUsers(
        (Array.isArray(users) ? users : []).map((u) => ({
          ...u,
          status: u.status || 'active',
        }))
      )
      setAdminRatings(Array.isArray(ratings) ? ratings : [])
      setCourses(Array.isArray(coursesData) ? coursesData : [])
      setAdminLogs(Array.isArray(logs) ? logs : [])
    } catch (err) {
      console.error('Lỗi tải dữ liệu admin:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    if (!previewDocument || !previewDocument.file_type?.toLowerCase().includes('pdf')) {
      setPreviewFileUrl(null)
      setPreviewFileError('')
      return
    }

    let objectUrl = null
    let cancelled = false

    setPreviewFileUrl(null)
    setPreviewFileError('')
    setIsPreviewFileLoading(true)

    fetchPreviewBlob(previewDocument.id)
      .then((blob) => {
        if (cancelled) return
        objectUrl = window.URL.createObjectURL(blob)
        setPreviewFileUrl(objectUrl)
      })
      .catch((err) => {
        if (cancelled) return
        setPreviewFileError(err.message || 'Không thể tải file xem trước.')
      })
      .finally(() => {
        if (!cancelled) setIsPreviewFileLoading(false)
      })

    return () => {
      cancelled = true
      if (objectUrl) window.URL.revokeObjectURL(objectUrl)
    }
  }, [previewDocument])

  // ── Derived data ──────────────────────────────────────────────
  function getCourseById(courseId) {
    return courses.find((c) => c.id === courseId)
  }

  const enrichedDocuments = useMemo(() => {
    return adminDocuments.map((document) => {
      const course = getCourseById(document.course_id)
      const owner = adminUsers.find((u) => u.id === document.user_id)
      return {
        ...document,
        courseName: course?.course_name ?? 'Chưa có học phần',
        ownerName: owner?.username ?? 'Ẩn danh',
      }
    })
  }, [adminDocuments, adminUsers, courses])

  const pendingDocuments = enrichedDocuments.filter((d) => d.status === 'pending')

  const enrichedRatings = useMemo(() => {
    return adminRatings.map((rating) => {
      const document = enrichedDocuments.find((d) => d.id === rating.document_id)
      const ratingUser = rating.user || adminUsers.find((u) => u.id === rating.user_id)
      return {
        ...rating,
        documentTitle: document?.title ?? 'Tài liệu không còn tồn tại',
        username: ratingUser?.username ?? 'Người dùng đã xoá',
        email: ratingUser?.email ?? 'Không có email',
      }
    })
  }, [adminRatings, adminUsers, enrichedDocuments])

  const monthDownloads = enrichedDocuments.reduce((s, d) => s + (d.download_count || 0), 0)
  const monthViews = enrichedDocuments.reduce((s, d) => s + (d.view_count || 0), 0)
  const pendingCount = pendingDocuments.length

  const dashboardStats = [
    { label: 'Tổng tài liệu', value: enrichedDocuments.length.toLocaleString(), helper: 'toàn hệ thống', icon: FileText, view: 'documents' },
    { label: 'Tổng người dùng', value: adminUsers.length.toLocaleString(), helper: 'tài khoản', icon: Users, view: 'users' },
    { label: 'Lượt xem', value: monthViews.toLocaleString(), helper: 'tổng lượt xem', icon: Eye, view: 'documents' },
    { label: 'Lượt tải', value: monthDownloads.toLocaleString(), helper: 'tổng lượt tải', icon: Download, view: 'documents' },
    { label: 'Chờ duyệt', value: pendingCount.toLocaleString(), helper: 'tài liệu đang chờ', icon: CheckCircle, view: 'pending' },
    { label: 'Đánh giá', value: adminRatings.length.toLocaleString(), helper: 'tổng đánh giá', icon: MessageSquare, view: 'ratings' },
  ]

  const topCourses = useMemo(() => {
    return courses
      .map((c) => ({ ...c, count: enrichedDocuments.filter((d) => d.course_id === c.id).length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [enrichedDocuments, courses])
  const maxCourseCount = Math.max(1, ...topCourses.map((c) => c.count))

  const recentActivities = [
    ...enrichedDocuments.map((d) => ({
      id: `document-${d.id}`, type: 'upload', title: `${d.ownerName} upload tài liệu`,
      description: d.title, created_at: d.created_at, icon: FileText,
    })),
    ...adminLogs.map((log) => ({
      id: `admin-log-${log.id}`, type: 'admin', title: 'Admin thực hiện thao tác',
      description: `${log.action}${log.reason ? ` · ${log.reason}` : ''}`,
      created_at: log.created_at, icon: Shield,
    })),
  ]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6)

  // ── Filters ───────────────────────────────────────────────────
  const filteredDocuments = useMemo(() => {
    const s = documentSearch.trim().toLowerCase()
    return enrichedDocuments.filter((d) => {
      const matchS = `${d.title} ${d.ownerName} ${d.courseName}`.toLowerCase().includes(s)
      const matchC = courseFilter === 'all' || d.course_id === Number(courseFilter)
      const matchSt = statusFilter === 'all' || d.status === statusFilter
      const matchFt = fileTypeFilter === fileTypeOptions[0] || d.file_type === fileTypeFilter
      return matchS && matchC && matchSt && matchFt
    })
  }, [courseFilter, documentSearch, enrichedDocuments, fileTypeFilter, statusFilter])

  const documentPageCount = Math.max(1, Math.ceil(filteredDocuments.length / DOCUMENTS_PER_PAGE))
  const activeDocumentPage = Math.min(documentPage, documentPageCount - 1)
  const paginatedDocuments = filteredDocuments.slice(
    activeDocumentPage * DOCUMENTS_PER_PAGE,
    activeDocumentPage * DOCUMENTS_PER_PAGE + DOCUMENTS_PER_PAGE,
  )

  const filteredUsers = useMemo(() => {
    const s = userSearch.trim().toLowerCase()
    return adminUsers.filter((u) => `${u.username} ${u.email}`.toLowerCase().includes(s))
  }, [adminUsers, userSearch])

  const filteredRatings = useMemo(() => {
    const s = ratingSearch.trim().toLowerCase()
    return enrichedRatings.filter((r) =>
      `${r.username} ${r.email} ${r.documentTitle} ${r.comment ?? ''}`.toLowerCase().includes(s)
    )
  }, [enrichedRatings, ratingSearch])

  const userPageCount = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE))
  const activeUserPage = Math.min(userPage, userPageCount - 1)
  const paginatedUsers = filteredUsers.slice(activeUserPage * USERS_PER_PAGE, activeUserPage * USERS_PER_PAGE + USERS_PER_PAGE)

  const ratingPageCount = Math.max(1, Math.ceil(filteredRatings.length / RATINGS_PER_PAGE))
  const activeRatingPage = Math.min(ratingPage, ratingPageCount - 1)
  const paginatedRatings = filteredRatings.slice(activeRatingPage * RATINGS_PER_PAGE, activeRatingPage * RATINGS_PER_PAGE + RATINGS_PER_PAGE)

  // Số tài liệu đang chờ duyệt/đã duyệt theo từng học phần — dùng để chặn xoá học phần ở FE
  // trước khi gọi API (server vẫn là nơi kiểm tra thật sự).
  const enrichedCourses = useMemo(() => {
    return courses.map((course) => {
      const courseDocuments = enrichedDocuments.filter((d) => d.course_id === course.id)
      const activeDocumentsCount = courseDocuments.filter(
        (d) => d.status === 'approved' || d.status === 'pending'
      ).length
      return { ...course, documentsCount: courseDocuments.length, activeDocumentsCount }
    })
  }, [courses, enrichedDocuments])

  const filteredCourses = useMemo(() => {
    const s = courseSearch.trim().toLowerCase()
    return enrichedCourses.filter((c) =>
      `${c.course_code} ${c.course_name} ${c.faculty ?? ''}`.toLowerCase().includes(s)
    )
  }, [enrichedCourses, courseSearch])

  const coursePageCount = Math.max(1, Math.ceil(filteredCourses.length / COURSES_PER_PAGE))
  const activeCoursePage = Math.min(coursePage, coursePageCount - 1)
  const paginatedCourses = filteredCourses.slice(
    activeCoursePage * COURSES_PER_PAGE,
    activeCoursePage * COURSES_PER_PAGE + COURSES_PER_PAGE,
  )

  const currentAdminId = user?.id

  // ── Helpers ───────────────────────────────────────────────────
  const showToast = (message) => {
    setToastMessage(message)
    window.setTimeout(() => setToastMessage(''), 2600)
  }

  const writeAdminLog = async ({ targetUserId, action, before, after, reason = '' }) => {
    try {
      const newLog = await postAdminLog({ targetUserId, action, before, after, reason })
      setAdminLogs((prev) => [newLog, ...prev])
    } catch (e) {
      console.error('Lỗi ghi log:', e)
    }
  }

  const runAdminAction = (actionKey, callback, successMessage) => {
    setProcessingAction(actionKey)
    window.setTimeout(async () => {
      try {
        await callback()
        showToast(successMessage)
      } catch (err) {
        showToast(`Lỗi: ${err.message}`)
      } finally {
        setProcessingAction('')
      }
    }, 360)
  }

  const generateTemporaryPassword = () => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'
    const values = new Uint32Array(14)
    window.crypto?.getRandomValues(values)
    return Array.from(values, (v) => alphabet[v % alphabet.length]).join('')
  }

  // ── Document actions ──────────────────────────────────────────
  const openCreateDocumentForm = () => {
    setDocumentEditor({
      mode: 'create',
      values: {
        title: '', description: '', file_url: '', file_type: 'pdf',
        course_id: String(courses[0]?.id ?? ''),
        user_id: String(adminUsers.find((u) => u.role === 'user')?.id ?? adminUsers[0]?.id ?? ''),
        status: 'pending', reason: '',
      },
    })
  }

  const openEditDocumentForm = (document) => {
    setDocumentEditor({
      mode: 'edit', id: document.id, originalStatus: document.status,
      values: {
        title: document.title, description: document.description ?? '',
        file_url: document.file_url ?? '', file_type: document.file_type ?? 'pdf',
        course_id: String(document.course_id ?? ''), user_id: String(document.user_id ?? ''),
        status: document.status, reason: '',
      },
    })
  }

  const saveDocument = async (event) => {
    event.preventDefault()
    if (!documentEditor) return

    const values = documentEditor.values
    const submitAction = event.nativeEvent.submitter?.dataset.action
    const shouldApproveAfterSave =
      documentEditor.mode === 'edit' && documentEditor.originalStatus === 'pending' && submitAction === 'save-approve'
    const reason = values.reason?.trim() ?? ''
    if (documentEditor.mode === 'edit' && !reason) {
      showToast('Cần nhập lý do khi sửa thông tin tài liệu của user.')
      return
    }

    const payload = {
      title: values.title.trim(), description: values.description.trim(),
      file_url: values.file_url.trim(), file_type: values.file_type,
      course_id: Number(values.course_id), user_id: Number(values.user_id),
      status: shouldApproveAfterSave ? 'approved' : values.status,
    }

    try {
      if (documentEditor.mode === 'create') {
        await adminCreateDocumentApi(payload)
        showToast('Đã thêm tài liệu.')
      } else {
        const beforeDocument = adminDocuments.find((d) => d.id === documentEditor.id)
        await updateDocumentApi(documentEditor.id, payload)
        if (shouldApproveAfterSave) {
          await approveDocumentApi(documentEditor.id).catch(() => { })
        }
        await writeAdminLog({
          targetUserId: beforeDocument?.user_id, action: 'update_user_document_metadata',
          before: beforeDocument ? {
            title: beforeDocument.title, description: beforeDocument.description,
            file_url: beforeDocument.file_url, file_type: beforeDocument.file_type,
            course_id: beforeDocument.course_id, status: beforeDocument.status,
          } : null,
          after: payload, reason,
        })
        showToast('Đã cập nhật tài liệu.')
      }
      setDocumentEditor(null)
      loadData()
    } catch (err) {
      showToast(`Lỗi: ${err.message}`)
    }
  }

  const approveDocument = async (documentId) => {
    try {
      await approveDocumentApi(documentId)
      setAdminDocuments((prev) => prev.map((d) => d.id === documentId ? { ...d, status: 'approved' } : d))
      setPreviewDocument(null)
      showToast('Đã duyệt tài liệu.')
    } catch (err) {
      showToast(`Lỗi: ${err.message}`)
    }
  }

  // Gọi AI tạo (hoặc tạo lại) tóm tắt cho tài liệu, đồng bộ cả bảng danh sách
  // lẫn dialog xem chi tiết đang mở (nếu có).
  const summarizeDocument = (document) => {
    runAdminAction(
      `summarize-document-${document.id}`,
      async () => {
        const { ai_summary } = await summarizeDocumentApi(document.id)
        setAdminDocuments((prev) => prev.map((d) => d.id === document.id ? { ...d, ai_summary } : d))
        setPreviewDocument((prev) => (prev && prev.id === document.id ? { ...prev, ai_summary } : prev))
        await writeAdminLog({
          targetUserId: document.user_id,
          action: 'generate_document_summary',
          before: { ai_summary: document.ai_summary || null },
          after: { ai_summary },
          reason: 'Tạo tóm tắt AI cho tài liệu',
        })
      },
      'Đã tạo tóm tắt AI.',
    )
  }

  // Tải file tài liệu đang xem trước. KHÔNG dùng thẳng <a href={file_url} download>:
  // file_url chỉ là đường dẫn tương đối trên server BE (vd /uploads/xxx.pdf) nên khi mở
  // trên origin của FE sẽ ra 404, và route download thật (/v1/documents/download/:id) yêu cầu
  // token qua header Authorization nên phải fetch thủ công rồi tạo Blob để tải, giống trang
  // chi tiết tài liệu (DocumentDetailPage) đang làm.
  const downloadPreviewFile = async (document) => {
    if (!document) return
    setProcessingAction(`download-document-${document.id}`)
    try {
      const blob = await downloadDocumentFile(document.id)
      const objectUrl = window.URL.createObjectURL(blob)
      const fileName = getFileNameFromUrl(document.file_url) || `tai-lieu-${document.id}`

      const link = window.document.createElement('a')
      link.href = objectUrl
      link.download = fileName
      window.document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(objectUrl)
    } catch (err) {
      showToast(`Lỗi tải file: ${err.message}`)
    } finally {
      setProcessingAction('')
    }
  }

  const openRejectDocumentConfirm = (document, action = 'reject') => {
    setDocumentRejectRequest({ document, action })
    setDocumentRejectReason('')
  }

  const toggleDocumentVisibility = async (documentId) => {
    const doc = adminDocuments.find((d) => d.id === documentId)
    try {
      if (doc?.status === 'rejected') {
        await approveDocumentApi(documentId)
        setAdminDocuments((prev) => prev.map((d) => d.id === documentId ? { ...d, status: 'approved' } : d))
        await writeAdminLog({
          targetUserId: doc.user_id, action: 'restore_document_approval',
          before: { status: 'rejected' }, after: { status: 'approved' },
          reason: 'Duyệt lại tài liệu đã bị từ chối',
        })
        showToast('Đã duyệt lại tài liệu.')
      } else {
        await rejectDocumentApi(documentId)
        setAdminDocuments((prev) => prev.map((d) => d.id === documentId ? { ...d, status: 'rejected' } : d))
        await writeAdminLog({
          targetUserId: doc.user_id, action: 'revoke_document_approval',
          before: { status: doc.status }, after: { status: 'rejected' },
          reason: 'Thu hồi duyệt tài liệu',
        })
        showToast('Đã thu hồi duyệt tài liệu.')
      }
    } catch (err) {
      showToast(`Lỗi: ${err.message}`)
    }
  }

  const confirmRejectDocument = () => {
    if (!documentRejectRequest || !documentRejectReason.trim()) return
    const { document, action } = documentRejectRequest

    runAdminAction(
      `reject-document-${document.id}`,
      async () => {
        if (action === 'revoke') {
          await rejectDocumentApi(document.id)
          await writeAdminLog({
            targetUserId: document.user_id, action: 'revoke_document_approval',
            before: { status: document.status }, after: { status: 'rejected' },
            reason: documentRejectReason.trim(),
          })
        } else {
          await rejectDocumentApi(document.id)
          await writeAdminLog({
            targetUserId: document.user_id, action: 'reject_document',
            before: { status: document.status }, after: { status: 'rejected' },
            reason: documentRejectReason.trim(),
          })
        }
        setAdminDocuments((prev) => prev.map((d) => d.id === document.id ? { ...d, status: 'rejected' } : d))
        setDocumentRejectRequest(null)
        setDocumentRejectReason('')
        setPreviewDocument(null)
      },
      action === 'revoke' ? 'Đã thu hồi duyệt tài liệu.' : 'Đã từ chối tài liệu.',
    )
  }

  const deleteDocument = () => {
    if (!documentDeleteReason.trim()) return
    const beforeDocument = adminDocuments.find((d) => d.id === confirmDeleteId)

    runAdminAction(
      `delete-document-${confirmDeleteId}`,
      async () => {
        await deleteDocumentApi(confirmDeleteId)
        await writeAdminLog({
          targetUserId: beforeDocument?.user_id, action: 'delete_document',
          before: beforeDocument ? {
            title: beforeDocument.title, course_id: beforeDocument.course_id,
            status: beforeDocument.status, file_type: beforeDocument.file_type,
          } : null,
          after: null, reason: documentDeleteReason.trim(),
        })
        setAdminDocuments((prev) => prev.filter((d) => d.id !== confirmDeleteId))
        setConfirmDeleteId(null)
        setDocumentDeleteReason('')
      },
      'Đã xoá tài liệu.',
    )
  }

  // ── User actions ──────────────────────────────────────────────
  const openCreateUserForm = () => {
    setUserEditor({
      mode: 'create',
      values: { username: '', email: '', password: '', status: 'active', role: 'user' },
    })
  }

  const openEditUserForm = (targetUser) => {
    setUserEditor({
      mode: 'edit', id: targetUser.id, original: targetUser,
      values: { username: targetUser.username, status: targetUser.status || 'active', role: targetUser.role },
    })
  }

  const saveUser = (event) => {
    event.preventDefault()
    if (!userEditor) return

    const values = userEditor.values
    const payload = { username: values.username.trim(), status: values.status, role: values.role }

    if (userEditor.mode === 'create') {
      if (!values.password || values.password.length < 6) {
        showToast('Mật khẩu phải có ít nhất 6 ký tự.')
        return
      }
      runAdminAction('create-user', async () => {
        await adminCreateUserApi({
          username: values.username.trim(), email: values.email.trim(),
          password: values.password, role: values.role, status: values.status,
        })
        await writeAdminLog({
          targetUserId: null, action: 'create_user',
          before: null,
          after: { username: values.username.trim(), email: values.email.trim(), role: values.role, status: values.status },
          reason: 'Tạo tài khoản từ trang admin',
        })
        setUserEditor(null)
        loadData()
      }, 'Đã tạo tài khoản.')
    } else {
      if (userEditor.original.role !== payload.role) {
        setPendingRoleChange({
          userId: userEditor.id, username: userEditor.original.username,
          currentRole: userEditor.original.role, nextRole: payload.role,
          pendingUserPayload: payload, beforeUser: userEditor.original,
        })
        return
      }
      runAdminAction('edit-user', async () => {
        await adminUpdateUserApi(userEditor.id, payload)
        await writeAdminLog({
          targetUserId: userEditor.id, action: 'update_user_profile',
          before: { username: userEditor.original.username, role: userEditor.original.role, status: userEditor.original.status },
          after: payload, reason: 'Cập nhật thông tin tài khoản từ admin',
        })
        setUserEditor(null)
        loadData()
      }, 'Đã cập nhật tài khoản.')
    }
  }

  const confirmUserRoleChange = () => {
    if (!pendingRoleChange) return

    runAdminAction('change-role', async () => {
      const payload = pendingRoleChange.pendingUserPayload || { role: pendingRoleChange.nextRole }
      await adminUpdateUserApi(pendingRoleChange.userId, payload)
      await writeAdminLog({
        targetUserId: pendingRoleChange.userId,
        action: pendingRoleChange.pendingUserPayload ? 'update_user_profile_and_role' : 'change_role',
        before: { role: pendingRoleChange.currentRole },
        after: payload,
        reason: 'Đổi vai trò tài khoản từ admin',
      })
      setPendingRoleChange(null)
      setUserEditor(null)
      loadData()
    }, 'Đã đổi vai trò tài khoản.')
  }

  const toggleUserStatus = (userId) => {
    const beforeUser = adminUsers.find((u) => u.id === userId)
    const nextStatus = beforeUser?.status === 'locked' ? 'active' : 'locked'

    runAdminAction(`toggle-user-${userId}`, async () => {
      await adminUpdateUserApi(userId, { status: nextStatus })
      await writeAdminLog({
        targetUserId: userId,
        action: nextStatus === 'locked' ? 'lock_user' : 'unlock_user',
        before: { status: beforeUser?.status }, after: { status: nextStatus },
        reason: nextStatus === 'locked' ? 'Khoá tài khoản vi phạm' : 'Mở khoá tài khoản',
      })
      setAdminUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: nextStatus } : u))
    }, nextStatus === 'locked' ? 'Đã khoá tài khoản.' : 'Đã mở khoá tài khoản.')
  }

  const openDeleteUserConfirm = (targetUser) => {
    setUserDeleteRequest(targetUser)
    setUserDeleteReason('')
  }

  const confirmDeleteUser = () => {
    if (!userDeleteRequest || !userDeleteReason.trim()) return
    if (userDeleteRequest.id === currentAdminId) {
      showToast('Admin không thể tự xoá tài khoản đang đăng nhập.')
      return
    }

    runAdminAction('delete-user', async () => {
      await adminUpdateUserApi(userDeleteRequest.id, { status: 'locked' })
      await writeAdminLog({
        targetUserId: userDeleteRequest.id, action: 'soft_delete_user',
        before: { username: userDeleteRequest.username, role: userDeleteRequest.role, status: userDeleteRequest.status },
        after: { status: 'locked' }, reason: userDeleteReason.trim(),
      })
      setUserDeleteRequest(null)
      setUserDeleteReason('')
      loadData()
    }, 'Đã khoá tài khoản vi phạm.')
  }

  const openResetPassword = (targetUser) => {
    setResetPasswordRequest(targetUser)
    setResetPasswordMethod('temporary')
    setResetPasswordResult('')
  }

  const confirmResetPassword = () => {
    if (!resetPasswordRequest) return

    if (resetPasswordMethod === 'email') {
      showToast('Chức năng gửi email reset chưa được Backend hỗ trợ. Vui lòng chọn tạo mật khẩu tạm thời.')
      return
    }

    runAdminAction('reset-password', async () => {
      const tempPassword = generateTemporaryPassword()
      await adminResetPasswordApi(resetPasswordRequest.id, tempPassword)
      setResetPasswordResult(tempPassword)
      await writeAdminLog({
        targetUserId: resetPasswordRequest.id, action: 'generate_temporary_password',
        before: null, after: { method: 'temporary' },
        reason: 'Đặt lại mật khẩu theo yêu cầu quản trị',
      })
    }, 'Đã tạo mật khẩu tạm thời.')
  }

  // ── Course actions ────────────────────────────────────────────
  // Thêm học phần mới: học phần vừa tạo luôn chưa có tài liệu nào gắn vào.
  const openCreateCourseForm = () => {
    setCourseEditor({
      mode: 'create',
      values: { course_code: '', course_name: '', faculty: '', description: '' },
    })
  }

  // Sửa học phần: hiển thị ID (không sửa được), tên học phần và khoa/ngành (sửa được).
  const openEditCourseForm = (course) => {
    setCourseEditor({
      mode: 'edit',
      id: course.id,
      original: course,
      values: { course_name: course.course_name, faculty: course.faculty || '' },
    })
  }

  // Nhảy sang mục "Tài liệu" ở sidebar, đồng thời chọn sẵn học phần này trong dropdown lọc.
  const viewCourseDocuments = (course) => {
    setCourseFilter(String(course.id))
    setDocumentPage(0)
    setActiveView('documents')
  }

  const saveCourse = (event) => {
    event.preventDefault()
    if (!courseEditor) return

    const values = courseEditor.values

    if (courseEditor.mode === 'create') {
      if (!values.course_code.trim() || !values.course_name.trim()) {
        showToast('Vui lòng nhập đầy đủ mã và tên học phần.')
        return
      }
      runAdminAction('create-course', async () => {
        const created = await adminCreateCourseApi({
          course_code: values.course_code.trim(),
          course_name: values.course_name.trim(),
          faculty: values.faculty.trim() || null,
          description: values.description.trim() || null,
        })
        await writeAdminLog({
          targetUserId: null, action: 'create_course',
          before: null, after: { course_code: created.course_code, course_name: created.course_name },
          reason: 'Tạo học phần mới từ trang admin',
        })
        setCourseEditor(null)
        loadData()
      }, 'Đã tạo học phần.')
    } else {
      if (!values.course_name.trim()) {
        showToast('Vui lòng nhập tên học phần.')
        return
      }
      runAdminAction('edit-course', async () => {
        await adminUpdateCourseApi(courseEditor.id, {
          course_name: values.course_name.trim(),
          faculty: values.faculty.trim() || null,
        })
        await writeAdminLog({
          targetUserId: null, action: 'update_course',
          before: { course_name: courseEditor.original.course_name, faculty: courseEditor.original.faculty },
          after: { course_name: values.course_name.trim(), faculty: values.faculty.trim() || null },
          reason: 'Cập nhật tên học phần và khoa/ngành từ admin',
        })
        setCourseEditor(null)
        loadData()
      }, 'Đã cập nhật học phần.')
    }
  }

  const openDeleteCourseConfirm = (course) => {
    setCourseDeleteRequest(course)
  }

  // Chỉ xoá được nếu học phần không còn tài liệu đang chờ duyệt/đã duyệt.
  // FE chặn trước để tránh gọi API thừa, nhưng quyết định cuối cùng vẫn ở BE.
  const confirmDeleteCourse = () => {
    if (!courseDeleteRequest) return

    if (courseDeleteRequest.activeDocumentsCount > 0) {
      showToast('Không thể xoá: học phần vẫn còn tài liệu chờ duyệt hoặc đã duyệt.')
      return
    }

    runAdminAction('delete-course', async () => {
      await adminDeleteCourseApi(courseDeleteRequest.id)
      await writeAdminLog({
        targetUserId: null, action: 'delete_course',
        before: { course_code: courseDeleteRequest.course_code, course_name: courseDeleteRequest.course_name },
        after: null, reason: 'Xoá học phần không còn tài liệu hiệu lực',
      })
      setCourseDeleteRequest(null)
      loadData()
    }, 'Đã xoá học phần.')
  }

  // ── Rating actions ────────────────────────────────────────────
  const openDeleteRatingConfirm = (rating) => {
    setRatingDeleteRequest(rating)
    setRatingDeleteReason('')
  }

  const deleteRating = () => {
    if (!ratingDeleteRequest || !ratingDeleteReason.trim()) return

    runAdminAction('delete-rating', async () => {
      await adminDeleteRatingApi(ratingDeleteRequest.id)
      await writeAdminLog({
        targetUserId: ratingDeleteRequest.user_id, action: 'delete_user_rating',
        before: { document_id: ratingDeleteRequest.document_id, rating: ratingDeleteRequest.rating, comment: ratingDeleteRequest.comment },
        after: null, reason: ratingDeleteReason.trim(),
      })
      setAdminRatings((prev) => prev.filter((r) => r.id !== ratingDeleteRequest.id))
      setRatingDeleteRequest(null)
      setRatingDeleteReason('')
    }, 'Đã xoá đánh giá.')
  }

  const openDeleteAllRatingsConfirm = () => {
    setDeleteAllRatingsText('')
    setIsDeleteAllRatingsOpen(true)
  }

  const confirmDeleteAllRatings = () => {
    if (deleteAllRatingsText !== 'XOÁ') return

    runAdminAction('delete-all-ratings', async () => {
      await adminDeleteAllRatingsApi()
      await writeAdminLog({
        targetUserId: null, action: 'delete_all_ratings',
        before: { rating_count: adminRatings.length }, after: { rating_count: 0 },
        reason: 'Xác nhận xoá toàn bộ đánh giá bằng từ khoá XOÁ',
      })
      setAdminRatings([])
      setIsDeleteAllRatingsOpen(false)
      setDeleteAllRatingsText('')
    }, 'Đã xoá tất cả đánh giá.')
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pending', label: 'Chờ duyệt', icon: CheckCircle },
    { id: 'documents', label: 'Tài liệu', icon: FileText },
    { id: 'courses', label: 'Học phần', icon: GraduationCap },
    { id: 'users', label: 'Người dùng', icon: Users },
    { id: 'ratings', label: 'Đánh giá', icon: MessageSquare },
  ]

  if (isLoading) {
    return (
      <>
        <Header />
        <main style={{ padding: '6rem 2rem', textAlign: 'center' }}>
          <p>Đang tải dữ liệu admin...</p>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />

      <main className="admin-shell" ref={adminShellRef}>
        <aside className={`admin-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
          <div className="admin-sidebar__top">
            <span className="admin-sidebar__mark" aria-hidden="true">
              <Shield size={22} strokeWidth={2.2} />
            </span>
            <div>
              <strong>Admin</strong>
              <small>DocHub Control</small>
            </div>
          </div>

          <nav className="admin-sidebar__nav" aria-label="Admin">
            {navItems.map((item) => (
              <button
                className={activeView === item.id ? 'is-active' : ''}
                type="button"
                key={item.id}
                onClick={() => {
                  setActiveView(item.id)
                  setIsSidebarOpen(false)
                }}
              >
                <item.icon size={18} strokeWidth={2} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {isSidebarOpen && (
          <button
            className="admin-sidebar-backdrop"
            type="button"
            aria-label="Đóng menu admin"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <section className="admin-main">
          <div className={`admin-toolbar ${activeView === 'documents' ? 'admin-toolbar--compact' : ''}`}>
            <button
              className="admin-menu-button"
              type="button"
              aria-label="Mở menu admin"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} strokeWidth={2} />
            </button>
            <div>
              <span>Admin</span>
              <h1>
                {activeView === 'dashboard' && 'Dashboard tổng quan'}
                {activeView === 'pending' && 'Tài liệu chờ duyệt'}
                {activeView === 'documents' && 'Quản lý tài liệu'}
                {activeView === 'courses' && 'Quản lý học phần'}
                {activeView === 'users' && 'Quản lý người dùng'}
                {activeView === 'ratings' && 'Quản lý đánh giá'}
              </h1>
            </div>
          </div>

          {activeView === 'dashboard' && (
            <div className="admin-view">
              <section className="admin-stats" aria-label="Thống kê quản trị">
                {dashboardStats.map((stat) => (
                  <button
                    className="admin-stat-card"
                    type="button"
                    key={stat.label}
                    onClick={() => setActiveView(stat.view)}
                  >
                    <span aria-hidden="true">
                      <stat.icon size={20} strokeWidth={2} />
                    </span>
                    <div>
                      <strong>{stat.value}</strong>
                      <p>{stat.label}</p>
                      <small>{stat.helper}</small>
                    </div>
                  </button>
                ))}
              </section>

              <div className="admin-dashboard-grid">
                <section className="admin-panel" aria-labelledby="admin-chart-title">
                  <div className="admin-panel__heading">
                    <h2 id="admin-chart-title">Top học phần nhiều tài liệu</h2>
                    <p>Biểu đồ đơn giản theo số tài liệu công khai/mock.</p>
                  </div>

                  <div className="admin-chart">
                    {topCourses.map((course) => (
                      <div className="admin-chart__row" key={course.id}>
                        <span>{course.course_name}</span>
                        <div aria-hidden="true">
                          <i style={{ width: `${(course.count / maxCourseCount) * 100}%` }} />
                        </div>
                        <strong>{course.count}</strong>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="admin-panel" aria-labelledby="admin-activity-title">
                  <div className="admin-panel__heading">
                    <h2 id="admin-activity-title">Hoạt động gần đây</h2>
                    <p>Upload mới và thao tác quản trị được trộn theo thời gian.</p>
                  </div>

                  <div className="admin-activity-list">
                    {recentActivities.map((activity) => (
                      <article
                        className={`admin-activity-item admin-activity-item--${activity.type}`}
                        key={activity.id}
                      >
                        <span aria-hidden="true">
                          <activity.icon size={16} strokeWidth={2} />
                        </span>
                        <div>
                          <strong>{activity.title}</strong>
                          <p>{activity.description}</p>
                        </div>
                        <time>{formatDate(activity.created_at)}</time>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}

          {activeView === 'pending' && (
            <section className="admin-panel admin-panel--table" aria-labelledby="admin-pending-title">
              <div className="admin-panel__heading admin-panel__heading--split">
                <div>
                  <h2 id="admin-pending-title">Danh sách tài liệu đang đợi duyệt</h2>
                  <p>Admin duyệt để tài liệu hiển thị công khai hoặc từ chối nếu chưa phù hợp.</p>
                </div>
                <span>{pendingDocuments.length.toLocaleString()} tài liệu</span>
              </div>

              <div className="admin-table-wrap admin-table-wrap--pending-documents">
                <table className="admin-table admin-table--documents admin-table--pending-documents">
                  <thead>
                    <tr>
                      <th>Tên tài liệu</th>
                      <th>Người đăng</th>
                      <th>Học phần</th>
                      <th>Loại file</th>
                      <th>Ngày gửi</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDocuments.length === 0 && (
                      <tr>
                        <td colSpan="6">Chưa có tài liệu nào đang chờ duyệt.</td>
                      </tr>
                    )}

                    {pendingDocuments.map((document) => (
                      <tr key={document.id}>
                        <td className="admin-document-title-cell" title={document.title}>
                          <button
                            className="admin-document-preview-link"
                            type="button"
                            onClick={() => setPreviewDocument(document)}
                          >
                            <Eye size={14} strokeWidth={2} />
                            <strong>{document.title}</strong>
                          </button>
                          <small>{document.description || 'Chưa có mô tả'}</small>
                        </td>
                        <td>{document.ownerName}</td>
                        <td>{document.courseName}</td>
                        <td>{document.file_type.toUpperCase()}</td>
                        <td>{formatDate(document.created_at)}</td>
                        <td>
                          <div className="admin-row-actions admin-row-actions--pending">
                            <button type="button" onClick={() => approveDocument(document.id)}>
                              <CheckCircle size={15} strokeWidth={2} />
                              Duyệt
                            </button>
                            <ActionMenu ariaLabel={`Mở thao tác cho ${document.title}`}>
                              <button
                                type="button"
                                title="Sửa thông tin/metadata trước khi duyệt"
                                onClick={() => openEditDocumentForm(document)}
                              >
                                <Pencil size={15} strokeWidth={2} />
                                Sửa
                              </button>
                              <button
                                type="button"
                                onClick={() => openRejectDocumentConfirm(document, 'reject')}
                              >
                                <X size={15} strokeWidth={2} />
                                Từ chối
                              </button>
                              <button type="button" onClick={() => setPreviewDocument(document)}>
                                <Eye size={15} strokeWidth={2} />
                                Xem chi tiết
                              </button>
                              <button
                                className="is-danger"
                                type="button"
                                onClick={() => {
                                  setConfirmDeleteId(document.id)
                                  setDocumentDeleteReason('')
                                }}
                              >
                                <Trash2 size={15} strokeWidth={2} />
                                Xoá
                              </button>
                            </ActionMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeView === 'documents' && (
            <section className="admin-panel admin-panel--table" aria-labelledby="admin-documents-title">
              <div className="admin-panel__heading admin-panel__heading--split">
                <div>
                  <h2 id="admin-documents-title">Danh sách tài liệu</h2>
                  <p>CRUD tất cả tài liệu, duyệt, ẩn/hiện và xoá tài liệu.</p>
                </div>
                <div className="admin-heading-actions">
                  <span>{filteredDocuments.length.toLocaleString()} kết quả</span>
                  <button className="button button--primary" type="button" onClick={openCreateDocumentForm}>
                    <Plus size={16} strokeWidth={2} />
                    Thêm tài liệu
                  </button>
                </div>
              </div>

              <div className="admin-filters">
                <label className="admin-search">
                  <Search size={16} strokeWidth={2} aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Tìm tên tài liệu..."
                    value={documentSearch}
                    onChange={(event) => {
                      setDocumentSearch(event.target.value)
                      setDocumentPage(0)
                    }}
                  />
                </label>

                <select
                  value={courseFilter}
                  onChange={(event) => {
                    setCourseFilter(event.target.value)
                    setDocumentPage(0)
                  }}
                >
                  <option value="all">Tất cả học phần</option>
                  {courses.map((course) => (
                    <option value={course.id} key={course.id}>
                      {course.course_name}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value)
                    setDocumentPage(0)
                  }}
                >
                  {statusOptions.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={fileTypeFilter}
                  onChange={(event) => {
                    setFileTypeFilter(event.target.value)
                    setDocumentPage(0)
                  }}
                >
                  {fileTypeOptions.map((option) => (
                    <option value={option} key={option}>
                      {option === fileTypeOptions[0] ? option : option.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-table-wrap admin-table-wrap--documents">
                <table className="admin-table admin-table--documents">
                  <thead>
                    <tr>
                      <th>Tên tài liệu</th>
                      <th>Người đăng</th>
                      <th>Học phần</th>
                      <th>Ngày đăng</th>
                      <th>Lượt xem/tải</th>
                      <th>Trạng thái</th>
                      <th>Tóm tắt AI</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDocuments.map((document) => (
                      <tr key={document.id}>
                        <td className="admin-document-title-cell" title={document.title}>
                          <button
                            className="admin-document-preview-link"
                            type="button"
                            onClick={() => setPreviewDocument(document)}
                          >
                            <Eye size={14} strokeWidth={2} />
                            <strong>{document.title}</strong>
                          </button>
                          <small>{document.file_type.toUpperCase()}</small>
                        </td>
                        <td>{document.ownerName}</td>
                        <td>{document.courseName}</td>
                        <td>{formatDate(document.created_at)}</td>
                        <td>
                          <div className="admin-metric-stack">
                            <span>
                              <Eye size={14} strokeWidth={2} />
                              {document.view_count.toLocaleString()} lượt xem
                            </span>
                            <span>
                              <Download size={14} strokeWidth={2} />
                              {document.download_count.toLocaleString()} lượt tải
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${statusClassNames[document.status]}`}
                          >
                            {statusLabels[document.status]}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`admin-ai-summary-indicator ${document.ai_summary?.trim() ? 'is-done' : 'is-empty'}`}
                            title={document.ai_summary?.trim() ? 'Đã có tóm tắt AI' : 'Chưa có tóm tắt AI'}
                          >
                            {document.ai_summary?.trim() ? (
                              <CheckCircle size={18} strokeWidth={2} />
                            ) : (
                              <Circle size={18} strokeWidth={2} />
                            )}
                          </span>
                        </td>
                        <td>
                          <div className="admin-row-actions admin-row-actions--compact">
                            {document.status === 'pending' ? (
                              <button type="button" onClick={() => approveDocument(document.id)}>
                                <CheckCircle size={15} strokeWidth={2} />
                                Duyệt
                              </button>
                            ) : (
                              <button type="button" onClick={() => openEditDocumentForm(document)}>
                                <Pencil size={15} strokeWidth={2} />
                                Sửa
                              </button>
                            )}

                            <ActionMenu ariaLabel={`Mở thao tác cho ${document.title}`}>
                              {document.status === 'pending' ? (
                                <>
                                  <button
                                    type="button"
                                    title="Sửa thông tin/metadata trước khi duyệt"
                                    onClick={() => openEditDocumentForm(document)}
                                  >
                                    <Pencil size={15} strokeWidth={2} />
                                    Sửa
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openRejectDocumentConfirm(document, 'reject')}
                                  >
                                    <X size={15} strokeWidth={2} />
                                    Từ chối
                                  </button>
                                  <button type="button" onClick={() => setPreviewDocument(document)}>
                                    <Eye size={15} strokeWidth={2} />
                                    Xem chi tiết
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button type="button" onClick={() => setPreviewDocument(document)}>
                                    <Eye size={15} strokeWidth={2} />
                                    Xem chi tiết
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      document.status === 'rejected'
                                        ? toggleDocumentVisibility(document.id)
                                        : openRejectDocumentConfirm(document, 'revoke')
                                    }
                                  >
                                    {document.status === 'rejected' ? (
                                      <Eye size={15} strokeWidth={2} />
                                    ) : (
                                      <EyeOff size={15} strokeWidth={2} />
                                    )}
                                    {document.status === 'rejected' ? 'Duyệt lại' : 'Thu hồi duyệt'}
                                  </button>
                                </>
                              )}
                              <button
                                className="is-danger"
                                type="button"
                                onClick={() => {
                                  setConfirmDeleteId(document.id)
                                  setDocumentDeleteReason('')
                                }}
                              >
                                <Trash2 size={15} strokeWidth={2} />
                                Xoá
                              </button>
                            </ActionMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-pagination">
                <button
                  type="button"
                  disabled={activeDocumentPage === 0}
                  onClick={() => setDocumentPage((page) => Math.max(0, page - 1))}
                >
                  <ChevronLeft size={16} strokeWidth={2} />
                </button>
                <span>
                  Trang {activeDocumentPage + 1}/{documentPageCount}
                </span>
                <button
                  type="button"
                  disabled={activeDocumentPage >= documentPageCount - 1}
                  onClick={() =>
                    setDocumentPage((page) => Math.min(documentPageCount - 1, page + 1))
                  }
                >
                  <ChevronRight size={16} strokeWidth={2} />
                </button>
              </div>
            </section>
          )}

          {activeView === 'courses' && (
            <section className="admin-panel admin-panel--table" aria-labelledby="admin-courses-title">
              <div className="admin-panel__heading admin-panel__heading--split">
                <div>
                  <h2 id="admin-courses-title">Danh sách học phần</h2>
                  <p>Thêm, sửa tên, và xoá học phần. Học phần mới sẽ chưa có tài liệu nào.</p>
                </div>
                <div className="admin-heading-actions">
                  <span>{filteredCourses.length.toLocaleString()} kết quả</span>
                  <button className="button button--primary" type="button" onClick={openCreateCourseForm}>
                    <Plus size={16} strokeWidth={2} />
                    Thêm học phần
                  </button>
                </div>
              </div>

              <div className="admin-filters admin-filters--single">
                <label className="admin-search">
                  <Search size={16} strokeWidth={2} aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Tìm mã, tên học phần hoặc khoa..."
                    value={courseSearch}
                    onChange={(event) => {
                      setCourseSearch(event.target.value)
                      setCoursePage(0)
                    }}
                  />
                </label>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Mã học phần</th>
                      <th>Tên học phần</th>
                      <th>Khoa/Ngành</th>
                      <th>Số tài liệu</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCourses.map((course) => (
                      <tr key={course.id}>
                        <td>#{course.id}</td>
                        <td>{course.course_code}</td>
                        <td>
                          <strong>{course.course_name}</strong>
                        </td>
                        <td>{course.faculty || '—'}</td>
                        <td>
                          <span className="status-badge status-badge--pending">
                            {course.documentsCount.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <div className="admin-row-actions admin-row-actions--courses">
                            <button type="button" onClick={() => viewCourseDocuments(course)}>
                              <Eye size={15} strokeWidth={2} />
                              Xem
                            </button>
                            <ActionMenu
                              ariaLabel={`Mở thao tác cho ${course.course_name}`}
                              menuWidth={160}
                              menuHeight={104}
                            >
                              <button type="button" onClick={() => openEditCourseForm(course)}>
                                <Pencil size={15} strokeWidth={2} />
                                Sửa
                              </button>
                              <button
                                className="is-danger"
                                type="button"
                                disabled={course.activeDocumentsCount > 0}
                                title={
                                  course.activeDocumentsCount > 0
                                    ? 'Không thể xoá vì còn tài liệu chờ duyệt/đã duyệt'
                                    : undefined
                                }
                                onClick={() => openDeleteCourseConfirm(course)}
                              >
                                <Trash2 size={15} strokeWidth={2} />
                                Xoá
                              </button>
                            </ActionMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginatedCourses.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem 0' }}>
                          Không tìm thấy học phần nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="admin-pagination">
                <button
                  type="button"
                  disabled={activeCoursePage === 0}
                  onClick={() => setCoursePage((page) => Math.max(0, page - 1))}
                >
                  <ChevronLeft size={16} strokeWidth={2} />
                </button>
                <span>
                  Trang {activeCoursePage + 1}/{coursePageCount}
                </span>
                <button
                  type="button"
                  disabled={activeCoursePage >= coursePageCount - 1}
                  onClick={() => setCoursePage((page) => Math.min(coursePageCount - 1, page + 1))}
                >
                  <ChevronRight size={16} strokeWidth={2} />
                </button>
              </div>
            </section>
          )}

          {activeView === 'users' && (
            <section className="admin-panel admin-panel--table" aria-labelledby="admin-users-title">
              <div className="admin-panel__heading admin-panel__heading--split">
                <div>
                  <h2 id="admin-users-title">Danh sách người dùng</h2>
                </div>
                <div className="admin-heading-actions">
                  <span>{filteredUsers.length.toLocaleString()} kết quả</span>
                  <button className="button button--primary" type="button" onClick={openCreateUserForm}>
                    <Plus size={16} strokeWidth={2} />
                    Thêm user
                  </button>
                </div>
              </div>

              <div className="admin-filters admin-filters--single">
                <label className="admin-search">
                  <Search size={16} strokeWidth={2} aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Tìm tên hoặc email..."
                    value={userSearch}
                    onChange={(event) => {
                      setUserSearch(event.target.value)
                      setUserPage(0)
                    }}
                  />
                </label>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Tên</th>
                      <th>Email</th>
                      <th>Vai trò</th>
                      <th>Ngày tham gia</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <strong>{user.username}</strong>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className="status-badge status-badge--pending">
                            {user.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td>{formatDate(user.created_at)}</td>
                        <td>
                          <span
                            className={`status-badge ${user.status === 'locked' || user.status === 'deleted'
                              ? 'status-badge--rejected'
                              : 'status-badge--approved'
                              }`}
                          >
                            {userStatusLabels[user.status] ?? 'Hoạt động'}
                          </span>
                        </td>
                        <td>
                          <div className="admin-row-actions admin-row-actions--compact">
                            <button type="button" onClick={() => setUserDetail(user)}>
                              <Info size={15} strokeWidth={2} />
                              Xem chi tiết
                            </button>
                            <ActionMenu
                              ariaLabel={`Mở thao tác cho ${user.username}`}
                              menuClassName="admin-row-menu__panel--user"
                              menuWidth={198}
                              menuHeight={172}
                            >
                              <button type="button" onClick={() => openEditUserForm(user)}>
                                <Pencil size={15} strokeWidth={2} />
                                Chỉnh sửa
                              </button>
                              <button
                                type="button"
                                disabled={
                                  user.status === 'deleted' ||
                                  processingAction === `toggle-user-${user.id}`
                                }
                                onClick={() => toggleUserStatus(user.id)}
                              >
                                {user.status === 'locked' ? (
                                  <Unlock size={15} strokeWidth={2} />
                                ) : (
                                  <Lock size={15} strokeWidth={2} />
                                )}
                                {user.status === 'locked' ? 'Mở khoá' : 'Khoá'}
                              </button>
                              <button
                                type="button"
                                disabled={
                                  user.status === 'deleted' || processingAction === 'reset-password'
                                }
                                onClick={() => openResetPassword(user)}
                              >
                                <KeyRound size={15} strokeWidth={2} />
                                Đặt lại mật khẩu
                              </button>
                              <button
                                className="is-danger admin-row-menu__danger"
                                type="button"
                                disabled={user.status === 'deleted' || user.id === currentAdminId}
                                onClick={() => openDeleteUserConfirm(user)}
                              >
                                <Trash2 size={15} strokeWidth={2} />
                                Xoá
                              </button>
                            </ActionMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-pagination">
                <button
                  type="button"
                  disabled={activeUserPage === 0}
                  onClick={() => setUserPage((page) => Math.max(0, page - 1))}
                >
                  <ChevronLeft size={16} strokeWidth={2} />
                </button>
                <span>
                  Trang {activeUserPage + 1}/{userPageCount}
                </span>
                <button
                  type="button"
                  disabled={activeUserPage >= userPageCount - 1}
                  onClick={() => setUserPage((page) => Math.min(userPageCount - 1, page + 1))}
                >
                  <ChevronRight size={16} strokeWidth={2} />
                </button>
              </div>
            </section>
          )}

          {activeView === 'ratings' && (
            <section className="admin-panel admin-panel--table" aria-labelledby="admin-ratings-title">
              <div className="admin-panel__heading admin-panel__heading--split">
                <div>
                  <h2 id="admin-ratings-title">Danh sách đánh giá</h2>
                  <p>Admin có quyền xoá bất kỳ đánh giá nào trong bảng ratings.</p>
                </div>
                <div className="admin-heading-actions">
                  <span>{filteredRatings.length.toLocaleString()} kết quả</span>
                </div>
              </div>

              <div className="admin-filters admin-filters--single">
                <label className="admin-search">
                  <Search size={16} strokeWidth={2} aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Tìm theo user, email, tài liệu hoặc nội dung..."
                    value={ratingSearch}
                    onChange={(event) => {
                      setRatingSearch(event.target.value)
                      setRatingPage(0)
                    }}
                  />
                </label>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Người đánh giá</th>
                      <th>Tài liệu</th>
                      <th>Số sao</th>
                      <th>Bình luận</th>
                      <th>Ngày đánh giá</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRatings.length === 0 && (
                      <tr>
                        <td colSpan="6">Chưa có đánh giá nào.</td>
                      </tr>
                    )}

                    {paginatedRatings.map((rating) => (
                      <tr key={rating.id}>
                        <td>
                          <strong>{rating.username}</strong>
                          <small>{rating.email}</small>
                        </td>
                        <td>{rating.documentTitle}</td>
                        <td>{Number(rating.rating).toFixed(1)}</td>
                        <td>{rating.comment || 'Không có bình luận'}</td>
                        <td>{formatDate(rating.created_at)}</td>
                        <td>
                          <div className="admin-row-actions">
                            <button
                              className="is-danger"
                              type="button"
                              onClick={() => openDeleteRatingConfirm(rating)}
                            >
                              <Trash2 size={15} strokeWidth={2} />
                              Xoá
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-pagination">
                <button
                  type="button"
                  disabled={activeRatingPage === 0}
                  onClick={() => setRatingPage((page) => Math.max(0, page - 1))}
                >
                  <ChevronLeft size={16} strokeWidth={2} />
                </button>
                <span>
                  Trang {activeRatingPage + 1}/{ratingPageCount}
                </span>
                <button
                  type="button"
                  disabled={activeRatingPage >= ratingPageCount - 1}
                  onClick={() =>
                    setRatingPage((page) => Math.min(ratingPageCount - 1, page + 1))
                  }
                >
                  <ChevronRight size={16} strokeWidth={2} />
                </button>
              </div>

              <div className="admin-danger-zone">
                <div>
                  <strong>Xoá tất cả đánh giá</strong>
                  <p>Hành động này xoá toàn bộ dữ liệu trong bảng ratings trên giao diện mock.</p>
                </div>
                <button
                  className="button button--outline"
                  type="button"
                  onClick={openDeleteAllRatingsConfirm}
                  disabled={adminRatings.length === 0}
                >
                  Xoá tất cả đánh giá
                </button>
              </div>
            </section>
          )}
        </section>
      </main>

      {previewDocument && (
        <div
          className="admin-confirm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPreviewDocument(null)
            }
          }}
        >
          <section
            className="admin-preview-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-document-preview-title"
          >
            <button
              className="admin-confirm__close"
              type="button"
              aria-label="Đóng"
              onClick={() => setPreviewDocument(null)}
            >
              <X size={18} strokeWidth={2} />
            </button>

            <div className="admin-preview-dialog__header">
              <span className="document-preview-card__type">
                {previewDocument.file_type.toUpperCase()}
              </span>
              <div>
                <h2 id="admin-document-preview-title">{previewDocument.title}</h2>
                <p>{getFileNameFromUrl(previewDocument.file_url)}</p>
              </div>
            </div>

            <div className="admin-preview-dialog__meta">
              <span>
                Người đăng <strong>{previewDocument.ownerName}</strong>
              </span>
              <span>
                Học phần <strong>{previewDocument.courseName}</strong>
              </span>
              <span>
                Ngày gửi <strong>{formatDate(previewDocument.created_at)}</strong>
              </span>
            </div>

            <div className="admin-preview-dialog__body">
              {!previewDocument.file_type?.toLowerCase().includes('pdf') ? (
                <div className="admin-preview-dialog__fallback">
                  <FileText size={44} strokeWidth={1.8} />
                  <strong>Không hỗ trợ xem trực tiếp</strong>
                  <p>Chỉ xem trước được file PDF. Vui lòng tải file để xem định dạng này.</p>
                </div>
              ) : isPreviewFileLoading ? (
                <div className="admin-preview-dialog__fallback">
                  <FileText size={44} strokeWidth={1.8} />
                  <strong>Đang tải file xem trước…</strong>
                </div>
              ) : previewFileError ? (
                <div className="admin-preview-dialog__fallback">
                  <FileText size={44} strokeWidth={1.8} />
                  <strong>Không tải được file xem trước</strong>
                  <p>{previewFileError}</p>
                </div>
              ) : previewFileUrl ? (
                <iframe
                  className="admin-preview-dialog__frame"
                  title={`Xem trước ${previewDocument.title}`}
                  src={previewFileUrl}
                />
              ) : null}
            </div>

            <div className="admin-preview-dialog__description">
              <strong>Mô tả đầy đủ</strong>
              <p>{previewDocument.description || 'Chưa có mô tả'}</p>
            </div>

            <div className="admin-preview-dialog__description admin-preview-dialog__summary">
              <strong>Tóm tắt AI</strong>
              <p>{previewDocument.ai_summary?.trim() || 'Chưa có tóm tắt AI cho tài liệu này.'}</p>
              <button
                className="button button--outline"
                type="button"
                disabled={processingAction === `summarize-document-${previewDocument.id}`}
                onClick={() => summarizeDocument(previewDocument)}
              >
                <Sparkles size={16} strokeWidth={2} />
                {processingAction === `summarize-document-${previewDocument.id}`
                  ? 'Đang tạo tóm tắt...'
                  : previewDocument.ai_summary?.trim()
                    ? 'Tạo lại tóm tắt AI'
                    : 'Tạo tóm tắt AI'}
              </button>
            </div>

            <div className="admin-preview-dialog__actions">
              <button
                className="button button--outline"
                type="button"
                disabled={processingAction === `download-document-${previewDocument.id}`}
                onClick={() => downloadPreviewFile(previewDocument)}
              >
                <Download size={16} strokeWidth={2} />
                Tải file
              </button>
              <button
                className="button button--outline"
                type="button"
                onClick={() => openRejectDocumentConfirm(previewDocument, 'reject')}
              >
                <X size={16} strokeWidth={2} />
                Từ chối
              </button>
              <button
                className="button button--primary"
                type="button"
                onClick={() => approveDocument(previewDocument.id)}
              >
                <CheckCircle size={16} strokeWidth={2} />
                Duyệt
              </button>
            </div>
          </section>
        </div>
      )}

      {documentRejectRequest && (
        <div className="admin-confirm" role="presentation">
          <section
            className="admin-danger-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-reject-document-title"
          >
            <button
              className="admin-confirm__close"
              type="button"
              aria-label="Đóng"
              onClick={() => setDocumentRejectRequest(null)}
            >
              <X size={18} strokeWidth={2} />
            </button>
            <h2 id="admin-reject-document-title">
              {documentRejectRequest.action === 'revoke'
                ? 'Thu hồi duyệt tài liệu?'
                : 'Từ chối tài liệu?'}
            </h2>
            <p>
              Cần nhập lý do để lưu vào admin_logs và làm căn cứ phản hồi cho người đăng tài liệu.
            </p>
            <div className="admin-reason-presets" aria-label="Lý do mặc định">
              {documentRejectReasonOptions.map((reason) => (
                <button
                  type="button"
                  key={reason}
                  onClick={() => setDocumentRejectReason(reason)}
                >
                  {reason}
                </button>
              ))}
            </div>
            <label className="admin-danger-confirm">
              Lý do
              <textarea
                value={documentRejectReason}
                onChange={(event) => setDocumentRejectReason(event.target.value)}
                placeholder="Ví dụ: file sai học phần, nội dung không phù hợp, thiếu thông tin..."
                autoFocus
              />
            </label>
            <div>
              <button
                className="button button--outline"
                type="button"
                onClick={() => setDocumentRejectRequest(null)}
              >
                Huỷ
              </button>
              <button
                className="button button--primary"
                type="button"
                disabled={
                  !documentRejectReason.trim() ||
                  processingAction === `reject-document-${documentRejectRequest.document.id}`
                }
                onClick={confirmRejectDocument}
              >
                Xác nhận
              </button>
            </div>
          </section>
        </div>
      )}

      {documentEditor && (
        <div className="admin-confirm" role="presentation">
          <section
            className="admin-form-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-document-form-title"
          >
            <button
              className="admin-confirm__close"
              type="button"
              aria-label="Đóng"
              onClick={() => setDocumentEditor(null)}
            >
              <X size={18} strokeWidth={2} />
            </button>
            <h2 id="admin-document-form-title">
              {documentEditor.mode === 'create' ? 'Thêm tài liệu' : 'Sửa tài liệu'}
            </h2>
            <p>
              Form mock theo bảng documents. Khi nối backend, action này gọi API tạo hoặc cập nhật
              tài liệu.
            </p>

            <form className="admin-form" onSubmit={saveDocument}>
              <label>
                Tên tài liệu
                <input
                  required
                  value={documentEditor.values.title}
                  onChange={(event) =>
                    setDocumentEditor((current) => ({
                      ...current,
                      values: { ...current.values, title: event.target.value },
                    }))
                  }
                />
              </label>

              <label>
                Mô tả
                <textarea
                  value={documentEditor.values.description}
                  onChange={(event) =>
                    setDocumentEditor((current) => ({
                      ...current,
                      values: { ...current.values, description: event.target.value },
                    }))
                  }
                />
              </label>

              <label>
                Đường dẫn file
                <input
                  required
                  value={documentEditor.values.file_url}
                  onChange={(event) =>
                    setDocumentEditor((current) => ({
                      ...current,
                      values: { ...current.values, file_url: event.target.value },
                    }))
                  }
                />
              </label>

              <div className="admin-form__grid">
                <label>
                  Loại file
                  <select
                    value={documentEditor.values.file_type}
                    onChange={(event) =>
                      setDocumentEditor((current) => ({
                        ...current,
                        values: { ...current.values, file_type: event.target.value },
                      }))
                    }
                  >
                    {fileTypeOptions.slice(1).map((fileType) => (
                      <option value={fileType} key={fileType}>
                        {fileType.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Trạng thái
                  <select
                    value={documentEditor.values.status}
                    onChange={(event) =>
                      setDocumentEditor((current) => ({
                        ...current,
                        values: { ...current.values, status: event.target.value },
                      }))
                    }
                  >
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Từ chối</option>
                  </select>
                </label>
              </div>

              <div className="admin-form__grid">
                <label>
                  Học phần
                  <select
                    value={documentEditor.values.course_id}
                    onChange={(event) =>
                      setDocumentEditor((current) => ({
                        ...current,
                        values: { ...current.values, course_id: event.target.value },
                      }))
                    }
                  >
                    {courses.map((course) => (
                      <option value={course.id} key={course.id}>
                        {course.course_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Người đăng
                  <select
                    value={documentEditor.values.user_id}
                    onChange={(event) =>
                      setDocumentEditor((current) => ({
                        ...current,
                        values: { ...current.values, user_id: event.target.value },
                      }))
                    }
                  >
                    {adminUsers.map((user) => (
                      <option value={user.id} key={user.id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {documentEditor.mode === 'edit' && (
                <label>
                  Lý do chỉnh sửa metadata
                  <textarea
                    required
                    value={documentEditor.values.reason}
                    onChange={(event) =>
                      setDocumentEditor((current) => ({
                        ...current,
                        values: { ...current.values, reason: event.target.value },
                      }))
                    }
                    placeholder="Ví dụ: sửa sai học phần, chuẩn hóa tiêu đề trước khi duyệt..."
                  />
                </label>
              )}

              {documentEditor.mode === 'edit' && documentEditor.originalStatus === 'pending' && (
                <p className="admin-form__note">
                  Tài liệu này đang chờ duyệt. Bạn có thể lưu thay đổi và duyệt luôn.
                </p>
              )}

              <div className="admin-form__actions">
                <button className="button button--outline" type="button" onClick={() => setDocumentEditor(null)}>
                  Huỷ
                </button>
                {documentEditor.mode === 'edit' && documentEditor.originalStatus === 'pending' && (
                  <button
                    className="button button--outline"
                    type="submit"
                    data-action="save-approve"
                  >
                    Lưu & Duyệt
                  </button>
                )}
                <button className="button button--primary" type="submit">
                  Lưu tài liệu
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {courseEditor && (
        <div className="admin-confirm" role="presentation">
          <section
            className="admin-form-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-course-form-title"
          >
            <button
              className="admin-confirm__close"
              type="button"
              aria-label="Đóng"
              onClick={() => setCourseEditor(null)}
            >
              <X size={18} strokeWidth={2} />
            </button>
            <h2 id="admin-course-form-title">
              {courseEditor.mode === 'create' ? 'Thêm học phần' : 'Sửa học phần'}
            </h2>
            {courseEditor.mode === 'create' ? (
              <p>Học phần mới sẽ được tạo và chưa có tài liệu nào gắn vào.</p>
            ) : (
              <p>Có thể đổi tên học phần và khoa/ngành phụ trách. ID và mã học phần là cố định, không thể chỉnh sửa.</p>
            )}

            <form className="admin-form" onSubmit={saveCourse}>
              {courseEditor.mode === 'edit' && (
                <label>
                  ID học phần
                  <input value={courseEditor.id} disabled readOnly />
                </label>
              )}

              {courseEditor.mode === 'create' && (
                <label>
                  Mã học phần
                  <input
                    required
                    placeholder="Ví dụ: WEB101"
                    value={courseEditor.values.course_code}
                    onChange={(event) =>
                      setCourseEditor((current) => ({
                        ...current,
                        values: { ...current.values, course_code: event.target.value },
                      }))
                    }
                  />
                </label>
              )}

              <label>
                Tên học phần
                <input
                  required
                  autoFocus={courseEditor.mode === 'edit'}
                  value={courseEditor.values.course_name}
                  onChange={(event) =>
                    setCourseEditor((current) => ({
                      ...current,
                      values: { ...current.values, course_name: event.target.value },
                    }))
                  }
                />
              </label>

              <label>
                Khoa/Ngành phụ trách
                <input
                  value={courseEditor.values.faculty}
                  onChange={(event) =>
                    setCourseEditor((current) => ({
                      ...current,
                      values: { ...current.values, faculty: event.target.value },
                    }))
                  }
                />
              </label>

              {courseEditor.mode === 'create' && (
                <label>
                  Mô tả
                  <textarea
                    value={courseEditor.values.description}
                    onChange={(event) =>
                      setCourseEditor((current) => ({
                        ...current,
                        values: { ...current.values, description: event.target.value },
                      }))
                    }
                  />
                </label>
              )}

              <div className="admin-form__actions">
                <button className="button button--outline" type="button" onClick={() => setCourseEditor(null)}>
                  Huỷ
                </button>
                <button
                  className="button button--primary"
                  type="submit"
                  disabled={processingAction === 'create-course' || processingAction === 'edit-course'}
                >
                  Lưu học phần
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {courseDeleteRequest && (
        <div className="admin-confirm" role="presentation">
          <section
            className="admin-danger-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-delete-course-title"
          >
            <button
              className="admin-confirm__close"
              type="button"
              aria-label="Đóng"
              onClick={() => setCourseDeleteRequest(null)}
            >
              <X size={18} strokeWidth={2} />
            </button>
            <h2 id="admin-delete-course-title">Xoá học phần?</h2>
            {courseDeleteRequest.activeDocumentsCount > 0 ? (
              <p>
                Không thể xoá học phần <strong>{courseDeleteRequest.course_name}</strong> vì vẫn còn{' '}
                {courseDeleteRequest.activeDocumentsCount} tài liệu đang chờ duyệt hoặc đã được duyệt.
                Vui lòng chuyển/xoá các tài liệu đó trước.
              </p>
            ) : (
              <p>
                Bạn có chắc muốn xoá học phần <strong>{courseDeleteRequest.course_name}</strong>? Thao
                tác này không thể hoàn tác.
              </p>
            )}
            <div>
              <button
                className="button button--outline"
                type="button"
                onClick={() => setCourseDeleteRequest(null)}
              >
                Huỷ
              </button>
              <button
                className="button button--primary"
                type="button"
                disabled={
                  courseDeleteRequest.activeDocumentsCount > 0 || processingAction === 'delete-course'
                }
                onClick={confirmDeleteCourse}
              >
                Xoá học phần
              </button>
            </div>
          </section>
        </div>
      )}

      {userEditor && (
        <div className="admin-confirm" role="presentation">
          <section
            className="admin-form-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-user-form-title"
          >
            <button
              className="admin-confirm__close"
              type="button"
              aria-label="Đóng"
              onClick={() => setUserEditor(null)}
            >
              <X size={18} strokeWidth={2} />
            </button>
            <h2 id="admin-user-form-title">
              {userEditor.mode === 'create' ? 'Thêm tài khoản user' : 'Sửa tài khoản user'}
            </h2>

            <form className="admin-form" onSubmit={saveUser}>
              <label>
                Họ tên hiển thị
                <input
                  required
                  value={userEditor.values.username}
                  onChange={(event) =>
                    setUserEditor((current) => ({
                      ...current,
                      values: { ...current.values, username: event.target.value },
                    }))
                  }
                />
              </label>

              {userEditor.mode === 'create' && (
                <label>
                  Email
                  <input
                    required
                    type="email"
                    value={userEditor.values.email}
                    onChange={(event) =>
                      setUserEditor((current) => ({
                        ...current,
                        values: { ...current.values, email: event.target.value },
                      }))
                    }
                  />
                </label>
              )}

              <div className="admin-form__grid">
                <label>
                  Trạng thái
                  <select
                    value={userEditor.values.status}
                    onChange={(event) =>
                      setUserEditor((current) => ({
                        ...current,
                        values: { ...current.values, status: event.target.value },
                      }))
                    }
                  >
                    {userStatusOptions.map((status) => (
                      <option value={status} key={status}>
                        {userStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Vai trò
                  <select
                    value={userEditor.values.role}
                    onChange={(event) =>
                      setUserEditor((current) => ({
                        ...current,
                        values: { ...current.values, role: event.target.value },
                      }))
                    }
                  >
                    {userRoleOptions.map((role) => (
                      <option value={role} key={role}>
                        {role === 'admin' ? 'Admin' : 'User'}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="admin-form__actions">
                <button className="button button--outline" type="button" onClick={() => setUserEditor(null)}>
                  Huỷ
                </button>
                <button
                  className="button button--primary"
                  type="submit"
                  disabled={processingAction === 'create-user' || processingAction === 'edit-user'}
                >
                  Lưu user
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {userDetail && (
        <div className="admin-confirm" role="presentation">
          <section
            className="admin-form-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-user-detail-title"
          >
            <button
              className="admin-confirm__close"
              type="button"
              aria-label="Đóng"
              onClick={() => setUserDetail(null)}
            >
              <X size={18} strokeWidth={2} />
            </button>
            <h2 id="admin-user-detail-title">Chi tiết tài khoản</h2>

            <div className="admin-detail-grid">
              <div className="admin-detail-row">
                <span>Họ tên hiển thị</span>
                <strong>{userDetail.username}</strong>
              </div>
              <div className="admin-detail-row">
                <span>Email</span>
                <strong>{userDetail.email}</strong>
              </div>
              <div className="admin-detail-row">
                <span>Vai trò</span>
                <strong>
                  <span className="status-badge status-badge--pending">
                    {userDetail.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                </strong>
              </div>
              <div className="admin-detail-row">
                <span>Trạng thái</span>
                <strong>
                  <span
                    className={`status-badge ${userDetail.status === 'locked' || userDetail.status === 'deleted'
                      ? 'status-badge--rejected'
                      : 'status-badge--approved'
                      }`}
                  >
                    {userStatusLabels[userDetail.status] ?? 'Hoạt động'}
                  </span>
                </strong>
              </div>
              <div className="admin-detail-row">
                <span>Ngày tham gia</span>
                <strong>{formatDate(userDetail.created_at)}</strong>
              </div>
            </div>

            <div className="admin-form__actions">
              <button
                className="button button--outline"
                type="button"
                onClick={() => setUserDetail(null)}
              >
                Đóng
              </button>
              <button
                className="button button--primary"
                type="button"
                onClick={() => {
                  openEditUserForm(userDetail)
                  setUserDetail(null)
                }}
              >
                <Pencil size={16} strokeWidth={2} />
                Chỉnh sửa
              </button>
            </div>
          </section>
        </div>
      )}

      {resetPasswordRequest && (
        <div className="admin-confirm" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="admin-reset-password-title">
            <button
              className="admin-confirm__close"
              type="button"
              aria-label="Đóng"
              onClick={() => setResetPasswordRequest(null)}
            >
              <X size={18} strokeWidth={2} />
            </button>
            <h2 id="admin-reset-password-title">Đặt lại mật khẩu</h2>
            <p>
              Không nhập mật khẩu thủ công. Chỉ gửi link reset qua email hoặc tạo mật khẩu tạm thời
              ngẫu nhiên. Backend phải hash trước khi lưu và không ghi token/mật khẩu vào log.
            </p>

            <div className="admin-radio-group">
              <label>
                <input
                  type="radio"
                  name="reset-method"
                  checked={resetPasswordMethod === 'email'}
                  onChange={() => setResetPasswordMethod('email')}
                />
                Gửi link reset qua email
              </label>
              <label>
                <input
                  type="radio"
                  name="reset-method"
                  checked={resetPasswordMethod === 'temporary'}
                  onChange={() => setResetPasswordMethod('temporary')}
                />
                Tạo mật khẩu tạm thời ngẫu nhiên
              </label>
            </div>

            {resetPasswordResult && (
              <div className="admin-temp-password">
                <span>Mật khẩu tạm thời chỉ hiển thị một lần</span>
                <strong>{resetPasswordResult}</strong>
              </div>
            )}

            <div>
              <button
                className="button button--outline"
                type="button"
                onClick={() => setResetPasswordRequest(null)}
              >
                Đóng
              </button>
              <button
                className="button button--primary"
                type="button"
                disabled={processingAction === 'reset-password'}
                onClick={confirmResetPassword}
              >
                Xác nhận reset
              </button>
            </div>
          </section>
        </div>
      )}

      {userDeleteRequest && (
        <div className="admin-confirm" role="presentation">
          <section
            className="admin-danger-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-delete-user-title"
          >
            <button
              className="admin-confirm__close"
              type="button"
              aria-label="Đóng"
              onClick={() => setUserDeleteRequest(null)}
            >
              <X size={18} strokeWidth={2} />
            </button>
            <h2 id="admin-delete-user-title">Xoá tài khoản vi phạm?</h2>
            <label className="admin-danger-confirm">
              Lý do xoá tài khoản
              <textarea
                value={userDeleteReason}
                onChange={(event) => setUserDeleteReason(event.target.value)}
                placeholder="Ví dụ: spam tài liệu, vi phạm quy định..."
                autoFocus
              />
            </label>
            <div>
              <button
                className="button button--outline"
                type="button"
                onClick={() => setUserDeleteRequest(null)}
              >
                Huỷ
              </button>
              <button
                className="button button--primary"
                type="button"
                disabled={!userDeleteReason.trim() || processingAction === 'delete-user'}
                onClick={confirmDeleteUser}
              >
                Soft delete
              </button>
            </div>
          </section>
        </div>
      )}

      {ratingDeleteRequest && (
        <div className="admin-confirm" role="presentation">
          <section
            className="admin-danger-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-delete-rating-title"
          >
            <button
              className="admin-confirm__close"
              type="button"
              aria-label="Đóng"
              onClick={() => setRatingDeleteRequest(null)}
            >
              <X size={18} strokeWidth={2} />
            </button>
            <h2 id="admin-delete-rating-title">Xoá đánh giá?</h2>
            <p>
              Đây là nội dung do user tạo. Cần nhập lý do để lưu vào admin_logs trước khi xoá.
            </p>
            <label className="admin-danger-confirm">
              Lý do xoá đánh giá
              <textarea
                value={ratingDeleteReason}
                onChange={(event) => setRatingDeleteReason(event.target.value)}
                placeholder="Ví dụ: spam, ngôn từ không phù hợp..."
                autoFocus
              />
            </label>
            <div>
              <button
                className="button button--outline"
                type="button"
                onClick={() => setRatingDeleteRequest(null)}
              >
                Huỷ
              </button>
              <button
                className="button button--primary"
                type="button"
                disabled={!ratingDeleteReason.trim() || processingAction === 'delete-rating'}
                onClick={deleteRating}
              >
                Xoá đánh giá
              </button>
            </div>
          </section>
        </div>
      )}

      {pendingRoleChange && (
        <div className="admin-confirm" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="admin-role-confirm-title">
            <button
              className="admin-confirm__close"
              type="button"
              aria-label="Đóng"
              onClick={() => setPendingRoleChange(null)}
            >
              <X size={18} strokeWidth={2} />
            </button>
            <h2 id="admin-role-confirm-title">Xác nhận đổi vai trò?</h2>
            <p>
              Bạn sắp đổi vai trò của {pendingRoleChange.username} từ{' '}
              <strong>{pendingRoleChange.currentRole}</strong> sang{' '}
              <strong>{pendingRoleChange.nextRole}</strong>. Nếu nâng lên admin, tài khoản này sẽ có
              quyền quản trị hệ thống.
            </p>
            <div>
              <button
                className="button button--outline"
                type="button"
                onClick={() => setPendingRoleChange(null)}
              >
                Huỷ
              </button>
              <button
                className="button button--primary"
                type="button"
                disabled={processingAction === 'change-role'}
                onClick={confirmUserRoleChange}
              >
                Xác nhận
              </button>
            </div>
          </section>
        </div>
      )}

      {isDeleteAllRatingsOpen && (
        <div className="admin-confirm" role="presentation">
          <section
            className="admin-danger-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-delete-ratings-title"
          >
            <button
              className="admin-confirm__close"
              type="button"
              aria-label="Đóng"
              onClick={() => setIsDeleteAllRatingsOpen(false)}
            >
              <X size={18} strokeWidth={2} />
            </button>
            <h2 id="admin-delete-ratings-title">Xoá tất cả đánh giá?</h2>
            <p>
              Đây là hành động không thể hoàn tác. Để xác nhận, hãy nhập chính xác chữ{' '}
              <strong>XOÁ</strong>.
            </p>
            <label className="admin-danger-confirm">
              Nhập XOÁ để xác nhận
              <input
                value={deleteAllRatingsText}
                onChange={(event) => setDeleteAllRatingsText(event.target.value)}
                autoFocus
              />
            </label>
            <div>
              <button
                className="button button--outline"
                type="button"
                onClick={() => setIsDeleteAllRatingsOpen(false)}
              >
                Huỷ
              </button>
              <button
                className="button button--primary"
                type="button"
                onClick={confirmDeleteAllRatings}
                disabled={deleteAllRatingsText !== 'XOÁ' || processingAction === 'delete-all-ratings'}
              >
                Xoá tất cả
              </button>
            </div>
          </section>
        </div>
      )}

      {confirmDeleteId && (
        <div className="admin-confirm" role="presentation">
          <section
            className="admin-danger-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-confirm-title"
          >
            <button
              className="admin-confirm__close"
              type="button"
              aria-label="Đóng"
              onClick={() => {
                setConfirmDeleteId(null)
                setDocumentDeleteReason('')
              }}
            >
              <X size={18} strokeWidth={2} />
            </button>
            <h2 id="admin-confirm-title">Xoá tài liệu?</h2>
            <p>
              Cần nhập lý do để lưu vào admin_logs trước khi xoá tài liệu. Khi nối API thật,
              backend phải kiểm tra quyền ADMIN và validate dữ liệu đầu vào.
            </p>
            <label className="admin-danger-confirm">
              Lý do xoá tài liệu
              <textarea
                value={documentDeleteReason}
                onChange={(event) => setDocumentDeleteReason(event.target.value)}
                placeholder="Ví dụ: tài liệu vi phạm bản quyền, spam, sai nội dung..."
                autoFocus
              />
            </label>
            <div>
              <button
                className="button button--outline"
                type="button"
                onClick={() => {
                  setConfirmDeleteId(null)
                  setDocumentDeleteReason('')
                }}
              >
                Huỷ
              </button>
              <button
                className="button button--danger"
                type="button"
                disabled={
                  !documentDeleteReason.trim() ||
                  processingAction === `delete-document-${confirmDeleteId}`
                }
                onClick={deleteDocument}
              >
                Xoá
              </button>
            </div>
          </section>
        </div>
      )}

      {toastMessage && (
        <div className="admin-toast" role="status" aria-live="polite">
          <CheckCircle size={16} strokeWidth={2} />
          {toastMessage}
        </div>
      )}

      <Footer />
    </>
  )
}

export default AdminPage