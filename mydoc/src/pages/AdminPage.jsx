import { useMemo, useRef, useState } from 'react'
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  FileText,
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
  courses,
  documents as seedDocuments,
  ratings as seedRatings,
  users as seedUsers,
} from '../data/mockDatabase'

const DOCUMENTS_PER_PAGE = 6
const USERS_PER_PAGE = 6
const RATINGS_PER_PAGE = 6

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
  return new Intl.DateTimeFormat('vi-VN').format(new Date(value))
}

function getCourseById(courseId) {
  return courses.find((course) => course.id === courseId)
}

function normalizeFileType(document) {
  const extension = document.file_url?.split('.').pop()?.toLowerCase()
  if (extension === 'doc') return 'docx'
  if (extension === 'pptx') return 'ppt'
  if (['pdf', 'docx', 'ppt', 'zip'].includes(extension)) return extension
  return document.file_type
}

function getFileNameFromUrl(fileUrl) {
  if (!fileUrl) return 'Chưa có file'
  return decodeURIComponent(fileUrl.split('/').pop() || fileUrl)
}

function AdminPage() {
  const { currentUser } = useAuthModal()
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
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [documentDeleteReason, setDocumentDeleteReason] = useState('')
  const [pendingRoleChange, setPendingRoleChange] = useState(null)
  const [isDeleteAllRatingsOpen, setIsDeleteAllRatingsOpen] = useState(false)
  const [deleteAllRatingsText, setDeleteAllRatingsText] = useState('')
  const [documentEditor, setDocumentEditor] = useState(null)
  const [documentRejectRequest, setDocumentRejectRequest] = useState(null)
  const [documentRejectReason, setDocumentRejectReason] = useState('')
  const [previewDocument, setPreviewDocument] = useState(null)
  const [userEditor, setUserEditor] = useState(null)
  const [userDetail, setUserDetail] = useState(null)
  const [userDeleteRequest, setUserDeleteRequest] = useState(null)
  const [userDeleteReason, setUserDeleteReason] = useState('')
  const [resetPasswordRequest, setResetPasswordRequest] = useState(null)
  const [resetPasswordMethod, setResetPasswordMethod] = useState('email')
  const [resetPasswordResult, setResetPasswordResult] = useState('')
  const [ratingDeleteRequest, setRatingDeleteRequest] = useState(null)
  const [ratingDeleteReason, setRatingDeleteReason] = useState('')
  const [processingAction, setProcessingAction] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [adminLogs, setAdminLogs] = useState([])
  const [adminDocuments, setAdminDocuments] = useState(() =>
    seedDocuments.map((document) => ({
      ...document,
      file_type: normalizeFileType(document),
    })),
  )
  const [adminUsers, setAdminUsers] = useState(() =>
    seedUsers.map((user) => ({
      ...user,
      status: 'active',
      deleted_at: null,
    })),
  )
  const [adminRatings, setAdminRatings] = useState(seedRatings)

  const enrichedDocuments = useMemo(() => {
    return adminDocuments.map((document) => {
      const course = getCourseById(document.course_id)
      const owner = adminUsers.find((user) => user.id === document.user_id)

      return {
        ...document,
        courseName: course?.course_name ?? 'Chưa có học phần',
        ownerName: owner?.username ?? 'Ẩn danh',
      }
    })
  }, [adminDocuments, adminUsers])

  const pendingDocuments = enrichedDocuments.filter((document) => document.status === 'pending')

  const enrichedRatings = useMemo(() => {
    return adminRatings.map((rating) => {
      const document = enrichedDocuments.find((item) => item.id === rating.document_id)
      const user = adminUsers.find((item) => item.id === rating.user_id)

      return {
        ...rating,
        documentTitle: document?.title ?? 'Tài liệu không còn tồn tại',
        username: user?.username ?? 'Người dùng đã xoá',
        email: user?.email ?? 'Không có email',
      }
    })
  }, [adminRatings, adminUsers, enrichedDocuments])

  const monthDownloads = enrichedDocuments.reduce(
    (sum, document) => sum + document.download_count,
    0,
  )
  const monthViews = enrichedDocuments.reduce((sum, document) => sum + document.view_count, 0)
  const pendingCount = enrichedDocuments.filter((document) => document.status === 'pending').length

  const dashboardStats = [
    {
      label: 'Tổng tài liệu',
      value: enrichedDocuments.length.toLocaleString(),
      helper: 'toàn hệ thống',
      icon: FileText,
      view: 'documents',
    },
    {
      label: 'Tổng người dùng',
      value: adminUsers.length.toLocaleString(),
      helper: 'tài khoản',
      icon: Users,
      view: 'users',
    },
    {
      label: 'Lượt xem',
      value: monthViews.toLocaleString(),
      helper: 'tổng lượt xem',
      icon: Eye,
      view: 'documents',
    },
    {
      label: 'Lượt tải',
      value: monthDownloads.toLocaleString(),
      helper: 'tổng lượt tải',
      icon: Download,
      view: 'documents',
    },
    {
      label: 'Chờ duyệt',
      value: pendingCount.toLocaleString(),
      helper: 'tài liệu đang chờ',
      icon: CheckCircle,
      view: 'pending',
    },
    {
      label: 'Đánh giá',
      value: adminRatings.length.toLocaleString(),
      helper: 'tổng đánh giá',
      icon: MessageSquare,
      view: 'ratings',
    },
  ]

  const topCourses = useMemo(() => {
    return courses
      .map((course) => ({
        ...course,
        count: enrichedDocuments.filter((document) => document.course_id === course.id).length,
      }))
      .sort((first, second) => second.count - first.count)
      .slice(0, 5)
  }, [enrichedDocuments])
  const maxCourseCount = Math.max(1, ...topCourses.map((course) => course.count))

  const recentActivities = [
    ...enrichedDocuments.map((document) => ({
      id: `document-${document.id}`,
      type: 'upload',
      title: `${document.ownerName} upload tài liệu`,
      description: document.title,
      created_at: document.created_at,
      icon: FileText,
    })),
    ...adminLogs.map((log) => ({
      id: `admin-log-${log.id}`,
      type: 'admin',
      title: 'Admin thực hiện thao tác',
      description: `${log.action}${log.reason ? ` · ${log.reason}` : ''}`,
      created_at: log.created_at,
      icon: Shield,
    })),
  ]
    .sort((first, second) => new Date(second.created_at) - new Date(first.created_at))
    .slice(0, 6)

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = documentSearch.trim().toLowerCase()

    return enrichedDocuments.filter((document) => {
      const matchesSearch = `${document.title} ${document.ownerName} ${document.courseName}`
        .toLowerCase()
        .includes(normalizedSearch)
      const matchesCourse =
        courseFilter === 'all' || document.course_id === Number(courseFilter)
      const matchesStatus = statusFilter === 'all' || document.status === statusFilter
      const matchesFileType =
        fileTypeFilter === fileTypeOptions[0] || document.file_type === fileTypeFilter

      return matchesSearch && matchesCourse && matchesStatus && matchesFileType
    })
  }, [courseFilter, documentSearch, enrichedDocuments, fileTypeFilter, statusFilter])

  const documentPageCount = Math.max(1, Math.ceil(filteredDocuments.length / DOCUMENTS_PER_PAGE))
  const activeDocumentPage = Math.min(documentPage, documentPageCount - 1)
  const paginatedDocuments = filteredDocuments.slice(
    activeDocumentPage * DOCUMENTS_PER_PAGE,
    activeDocumentPage * DOCUMENTS_PER_PAGE + DOCUMENTS_PER_PAGE,
  )

  const filteredUsers = useMemo(() => {
    const normalizedSearch = userSearch.trim().toLowerCase()

    return adminUsers.filter((user) => {
      return `${user.username} ${user.email}`.toLowerCase().includes(normalizedSearch)
    })
  }, [adminUsers, userSearch])

  const filteredRatings = useMemo(() => {
    const normalizedSearch = ratingSearch.trim().toLowerCase()

    return enrichedRatings.filter((rating) => {
      return `${rating.username} ${rating.email} ${rating.documentTitle} ${rating.comment ?? ''}`
        .toLowerCase()
        .includes(normalizedSearch)
    })
  }, [enrichedRatings, ratingSearch])

  const userPageCount = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE))
  const activeUserPage = Math.min(userPage, userPageCount - 1)
  const paginatedUsers = filteredUsers.slice(
    activeUserPage * USERS_PER_PAGE,
    activeUserPage * USERS_PER_PAGE + USERS_PER_PAGE,
  )

  const ratingPageCount = Math.max(1, Math.ceil(filteredRatings.length / RATINGS_PER_PAGE))
  const activeRatingPage = Math.min(ratingPage, ratingPageCount - 1)
  const paginatedRatings = filteredRatings.slice(
    activeRatingPage * RATINGS_PER_PAGE,
    activeRatingPage * RATINGS_PER_PAGE + RATINGS_PER_PAGE,
  )
  const currentAdminId = currentUser?.id ?? adminUsers.find((user) => user.role === 'admin')?.id

  const showToast = (message) => {
    setToastMessage(message)
    window.setTimeout(() => setToastMessage(''), 2600)
  }

  const writeAdminLog = ({ targetUserId, action, before, after, reason = '' }) => {
    setAdminLogs((currentLogs) => [
      {
        id: currentLogs.length + 1,
        admin_id: currentAdminId,
        target_user_id: targetUserId,
        action,
        before,
        after,
        reason,
        created_at: new Date().toISOString(),
      },
      ...currentLogs,
    ])
  }

  const runAdminAction = (actionKey, callback, successMessage) => {
    setProcessingAction(actionKey)
    window.setTimeout(() => {
      callback()
      setProcessingAction('')
      showToast(successMessage)
    }, 360)
  }

  const generateTemporaryPassword = () => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'
    const values = new Uint32Array(14)
    window.crypto?.getRandomValues(values)
    return Array.from(values, (value) => alphabet[value % alphabet.length]).join('')
  }

  const openCreateDocumentForm = () => {
    setDocumentEditor({
      mode: 'create',
      values: {
        title: '',
        description: '',
        file_url: '',
        file_type: 'pdf',
        course_id: String(courses[0]?.id ?? ''),
        user_id: String(adminUsers.find((user) => user.role === 'user')?.id ?? adminUsers[0]?.id ?? ''),
        status: 'pending',
        reason: '',
      },
    })
  }

  const openEditDocumentForm = (document) => {
    setDocumentEditor({
      mode: 'edit',
      id: document.id,
      originalStatus: document.status,
      values: {
        title: document.title,
        description: document.description ?? '',
        file_url: document.file_url ?? '',
        file_type: document.file_type ?? 'pdf',
        course_id: String(document.course_id ?? ''),
        user_id: String(document.user_id ?? ''),
        status: document.status,
        reason: '',
      },
    })
  }

  const saveDocument = (event) => {
    event.preventDefault()
    if (!documentEditor) return

    const values = documentEditor.values
    const submitAction = event.nativeEvent.submitter?.dataset.action
    const shouldApproveAfterSave =
      documentEditor.mode === 'edit' &&
      documentEditor.originalStatus === 'pending' &&
      submitAction === 'save-approve'
    const reason = values.reason?.trim() ?? ''
    if (documentEditor.mode === 'edit' && !reason) {
      showToast('Cần nhập lý do khi sửa thông tin tài liệu của user.')
      return
    }

    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      file_url: values.file_url.trim(),
      file_type: values.file_type,
      course_id: Number(values.course_id),
      user_id: Number(values.user_id),
      status: shouldApproveAfterSave ? 'approved' : values.status,
    }

    if (documentEditor.mode === 'create') {
      const nextId = Math.max(0, ...adminDocuments.map((document) => document.id)) + 1
      setAdminDocuments((currentDocuments) => [
        {
          id: nextId,
          ...payload,
          ai_summary: '',
          download_count: 0,
          view_count: 0,
          created_at: new Date().toISOString(),
        },
        ...currentDocuments,
      ])
    } else {
      const beforeDocument = adminDocuments.find((document) => document.id === documentEditor.id)
      setAdminDocuments((currentDocuments) =>
        currentDocuments.map((document) =>
          document.id === documentEditor.id ? { ...document, ...payload } : document,
        ),
      )
      writeAdminLog({
        targetUserId: beforeDocument?.user_id,
        action: 'update_user_document_metadata',
        before: beforeDocument
          ? {
              title: beforeDocument.title,
              description: beforeDocument.description,
              file_url: beforeDocument.file_url,
              file_type: beforeDocument.file_type,
              course_id: beforeDocument.course_id,
              status: beforeDocument.status,
            }
          : null,
        after: payload,
        reason,
      })
    }

    setDocumentEditor(null)
  }

  const openCreateUserForm = () => {
    setUserEditor({
      mode: 'create',
      values: {
        username: '',
        email: '',
        status: 'active',
        role: 'user',
      },
    })
  }

  const openEditUserForm = (user) => {
    setUserEditor({
      mode: 'edit',
      id: user.id,
      original: user,
      values: {
        username: user.username,
        status: user.status,
        role: user.role,
      },
    })
  }

  const saveUser = (event) => {
    event.preventDefault()
    if (!userEditor) return

    const values = userEditor.values
    const payload = {
      username: values.username.trim(),
      status: values.status,
      role: values.role,
    }

    if (userEditor.mode === 'create') {
      const nextId = Math.max(0, ...adminUsers.map((user) => user.id)) + 1
      const newUser = {
          id: nextId,
          ...payload,
          email: values.email.trim(),
          password: 'backend-generated-hash',
          avatar: null,
          deleted_at: null,
          created_at: new Date().toISOString(),
        }

      runAdminAction(
        'create-user',
        () => {
          setAdminUsers((currentUsers) => [newUser, ...currentUsers])
          writeAdminLog({
            targetUserId: nextId,
            action: 'create_user',
            before: null,
            after: {
              username: newUser.username,
              email: newUser.email,
              role: newUser.role,
              status: newUser.status,
            },
            reason: 'Tạo tài khoản từ trang admin',
          })
          setUserEditor(null)
        },
        'Đã tạo tài khoản. Backend cần gửi link đặt mật khẩu qua email.',
      )
    } else {
      if (userEditor.original.role !== payload.role) {
        setPendingRoleChange({
          userId: userEditor.id,
          username: userEditor.original.username,
          currentRole: userEditor.original.role,
          nextRole: payload.role,
          pendingUserPayload: payload,
          beforeUser: userEditor.original,
        })
        return
      }

      runAdminAction(
        'edit-user',
        () => {
          setAdminUsers((currentUsers) =>
            currentUsers.map((user) => (user.id === userEditor.id ? { ...user, ...payload } : user)),
          )
          writeAdminLog({
            targetUserId: userEditor.id,
            action: 'update_user_profile',
            before: {
              username: userEditor.original.username,
              role: userEditor.original.role,
              status: userEditor.original.status,
            },
            after: payload,
            reason: 'Cập nhật thông tin tài khoản từ admin',
          })
          setUserEditor(null)
        },
        'Đã cập nhật tài khoản.',
      )
    }
  }

  const approveDocument = (documentId) => {
    setAdminDocuments((currentDocuments) =>
      currentDocuments.map((document) =>
        document.id === documentId ? { ...document, status: 'approved' } : document,
      ),
    )
    setPreviewDocument(null)
  }

  const openRejectDocumentConfirm = (document, action = 'reject') => {
    setDocumentRejectRequest({
      document,
      action,
    })
    setDocumentRejectReason('')
  }

  const toggleDocumentVisibility = (documentId) => {
    const beforeDocument = adminDocuments.find((document) => document.id === documentId)
    const nextStatus = beforeDocument?.status === 'rejected' ? 'approved' : 'rejected'

    setAdminDocuments((currentDocuments) =>
      currentDocuments.map((document) =>
        document.id === documentId ? { ...document, status: nextStatus } : document,
      ),
    )

    writeAdminLog({
      targetUserId: beforeDocument?.user_id,
      action: nextStatus === 'approved' ? 'restore_document_approval' : 'revoke_document_approval',
      before: { status: beforeDocument?.status },
      after: { status: nextStatus },
      reason:
        nextStatus === 'approved'
          ? 'Duyệt lại tài liệu đã bị từ chối'
          : documentRejectReason.trim(),
    })
  }

  const confirmRejectDocument = () => {
    if (!documentRejectRequest || !documentRejectReason.trim()) return

    const { document, action } = documentRejectRequest

    runAdminAction(
      `reject-document-${document.id}`,
      () => {
        if (action === 'revoke') {
          toggleDocumentVisibility(document.id)
        } else {
          setAdminDocuments((currentDocuments) =>
            currentDocuments.map((item) =>
              item.id === document.id ? { ...item, status: 'rejected' } : item,
            ),
          )
          writeAdminLog({
            targetUserId: document.user_id,
            action: 'reject_document',
            before: { status: document.status },
            after: { status: 'rejected' },
            reason: documentRejectReason.trim(),
          })
        }

        setDocumentRejectRequest(null)
        setDocumentRejectReason('')
        setPreviewDocument(null)
      },
      action === 'revoke' ? 'Đã thu hồi duyệt tài liệu.' : 'Đã từ chối tài liệu.',
    )
  }

  const deleteDocument = () => {
    if (!documentDeleteReason.trim()) return

    const beforeDocument = adminDocuments.find((document) => document.id === confirmDeleteId)

    runAdminAction(
      `delete-document-${confirmDeleteId}`,
      () => {
        setAdminDocuments((currentDocuments) =>
          currentDocuments.filter((document) => document.id !== confirmDeleteId),
        )
        writeAdminLog({
          targetUserId: beforeDocument?.user_id,
          action: 'delete_document',
          before: beforeDocument
            ? {
                title: beforeDocument.title,
                course_id: beforeDocument.course_id,
                status: beforeDocument.status,
                file_type: beforeDocument.file_type,
              }
            : null,
          after: null,
          reason: documentDeleteReason.trim(),
        })
        setConfirmDeleteId(null)
        setDocumentDeleteReason('')
      },
      'Đã xoá tài liệu.',
    )
  }

  const updateUserRole = (userId, role) => {
    setAdminUsers((currentUsers) =>
      currentUsers.map((user) => (user.id === userId ? { ...user, role } : user)),
    )
  }

  const confirmUserRoleChange = () => {
    if (!pendingRoleChange) return
    const beforeUser = adminUsers.find((user) => user.id === pendingRoleChange.userId)

    runAdminAction(
      'change-role',
      () => {
        if (pendingRoleChange.pendingUserPayload) {
          setAdminUsers((currentUsers) =>
            currentUsers.map((user) =>
              user.id === pendingRoleChange.userId
                ? { ...user, ...pendingRoleChange.pendingUserPayload }
                : user,
            ),
          )
          writeAdminLog({
            targetUserId: pendingRoleChange.userId,
            action: 'update_user_profile_and_role',
            before: {
              username: pendingRoleChange.beforeUser.username,
              role: pendingRoleChange.beforeUser.role,
              status: pendingRoleChange.beforeUser.status,
            },
            after: pendingRoleChange.pendingUserPayload,
            reason: 'Cập nhật thông tin và đổi vai trò tài khoản từ admin',
          })
          setUserEditor(null)
        } else {
          updateUserRole(pendingRoleChange.userId, pendingRoleChange.nextRole)
          writeAdminLog({
            targetUserId: pendingRoleChange.userId,
            action: 'change_role',
            before: { role: beforeUser?.role },
            after: { role: pendingRoleChange.nextRole },
            reason: 'Đổi vai trò tài khoản',
          })
        }
        setPendingRoleChange(null)
      },
      'Đã đổi vai trò tài khoản.',
    )
  }

  const toggleUserStatus = (userId) => {
    const beforeUser = adminUsers.find((user) => user.id === userId)
    const nextStatus = beforeUser?.status === 'locked' ? 'active' : 'locked'

    runAdminAction(
      `toggle-user-${userId}`,
      () => {
        setAdminUsers((currentUsers) =>
          currentUsers.map((user) => {
            if (user.id !== userId) return user
            return {
              ...user,
              status: nextStatus,
            }
          }),
        )
        writeAdminLog({
          targetUserId: userId,
          action: nextStatus === 'locked' ? 'lock_user' : 'unlock_user',
          before: { status: beforeUser?.status },
          after: { status: nextStatus },
          reason: nextStatus === 'locked' ? 'Khoá tài khoản vi phạm' : 'Mở khoá tài khoản',
        })
      },
      nextStatus === 'locked' ? 'Đã khoá tài khoản.' : 'Đã mở khoá tài khoản.',
    )
  }

  const openDeleteUserConfirm = (user) => {
    setUserDeleteRequest(user)
    setUserDeleteReason('')
  }

  const confirmDeleteUser = () => {
    if (!userDeleteRequest || !userDeleteReason.trim()) return
    if (userDeleteRequest.id === currentAdminId) {
      showToast('Admin không thể tự xoá tài khoản đang đăng nhập.')
      return
    }

    const beforeUser = userDeleteRequest

    runAdminAction(
      'delete-user',
      () => {
        setAdminUsers((currentUsers) =>
          currentUsers.map((user) =>
            user.id === beforeUser.id
              ? { ...user, status: 'deleted', deleted_at: new Date().toISOString() }
              : user,
          ),
        )
        writeAdminLog({
          targetUserId: beforeUser.id,
          action: 'soft_delete_user',
          before: {
            username: beforeUser.username,
            role: beforeUser.role,
            status: beforeUser.status,
          },
          after: { status: 'deleted' },
          reason: userDeleteReason.trim(),
        })
        setUserDeleteRequest(null)
        setUserDeleteReason('')
      },
      'Đã soft delete tài khoản.',
    )
  }

  const openResetPassword = (user) => {
    setResetPasswordRequest(user)
    setResetPasswordMethod('email')
    setResetPasswordResult('')
  }

  const confirmResetPassword = () => {
    if (!resetPasswordRequest) return

    runAdminAction(
      'reset-password',
      () => {
        const generatedPassword =
          resetPasswordMethod === 'temporary' ? generateTemporaryPassword() : ''
        setResetPasswordResult(generatedPassword)
        writeAdminLog({
          targetUserId: resetPasswordRequest.id,
          action:
            resetPasswordMethod === 'temporary'
              ? 'generate_temporary_password'
              : 'send_password_reset_link',
          before: null,
          after: { method: resetPasswordMethod },
          reason: 'Đặt lại mật khẩu theo yêu cầu quản trị',
        })
        if (resetPasswordMethod === 'email') {
          setResetPasswordRequest(null)
        }
      },
      resetPasswordMethod === 'temporary'
        ? 'Đã tạo mật khẩu tạm thời. Backend phải hash trước khi lưu.'
        : 'Đã gửi link đặt lại mật khẩu qua email.',
    )
  }

  const openDeleteRatingConfirm = (rating) => {
    setRatingDeleteRequest(rating)
    setRatingDeleteReason('')
  }

  const deleteRating = () => {
    if (!ratingDeleteRequest || !ratingDeleteReason.trim()) return

    runAdminAction(
      'delete-rating',
      () => {
        setAdminRatings((currentRatings) =>
          currentRatings.filter((rating) => rating.id !== ratingDeleteRequest.id),
        )
        writeAdminLog({
          targetUserId: ratingDeleteRequest.user_id,
          action: 'delete_user_rating',
          before: {
            document_id: ratingDeleteRequest.document_id,
            rating: ratingDeleteRequest.rating,
            comment: ratingDeleteRequest.comment,
          },
          after: null,
          reason: ratingDeleteReason.trim(),
        })
        setRatingDeleteRequest(null)
        setRatingDeleteReason('')
      },
      'Đã xoá đánh giá.',
    )
  }

  const openDeleteAllRatingsConfirm = () => {
    setDeleteAllRatingsText('')
    setIsDeleteAllRatingsOpen(true)
  }

  const confirmDeleteAllRatings = () => {
    if (deleteAllRatingsText !== 'XOÁ') return

    runAdminAction(
      'delete-all-ratings',
      () => {
        writeAdminLog({
          targetUserId: null,
          action: 'delete_all_ratings',
          before: { rating_count: adminRatings.length },
          after: { rating_count: 0 },
          reason: 'Xác nhận xoá toàn bộ đánh giá bằng từ khoá XOÁ',
        })
        setAdminRatings([])
        setIsDeleteAllRatingsOpen(false)
        setDeleteAllRatingsText('')
      },
      'Đã xoá tất cả đánh giá.',
    )
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pending', label: 'Chờ duyệt', icon: CheckCircle },
    { id: 'documents', label: 'Tài liệu', icon: FileText },
    { id: 'users', label: 'Người dùng', icon: Users },
    { id: 'ratings', label: 'Đánh giá', icon: MessageSquare },
  ]

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

          {activeView === 'users' && (
            <section className="admin-panel admin-panel--table" aria-labelledby="admin-users-title">
              <div className="admin-panel__heading admin-panel__heading--split">
                <div>
                  <h2 id="admin-users-title">Danh sách người dùng</h2>
                  <p>Xem chi tiết, chỉnh sửa trạng thái/role, reset mật khẩu và xoá tài khoản vi phạm.</p>
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
                            className={`status-badge ${
                              user.status === 'locked' || user.status === 'deleted'
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
              <div className="admin-preview-dialog__fallback">
                <FileText size={44} strokeWidth={1.8} />
                <strong>Chưa có dữ liệu</strong>
                <p>File xem trước sẽ hiển thị khi backend cung cấp file_url thật.</p>
              </div>
            </div>

            <div className="admin-preview-dialog__description">
              <strong>Mô tả đầy đủ</strong>
              <p>{previewDocument.description || 'Chưa có mô tả'}</p>
            </div>

            <div className="admin-preview-dialog__actions">
              <a
                className="button button--outline"
                href={previewDocument.file_url}
                download
              >
                <Download size={16} strokeWidth={2} />
                Tải file
              </a>
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
            <p>
              Form chỉnh sửa không cho xem hoặc nhập mật khẩu. Họ tên hiển thị hiện tạm dùng
              username vì DB chưa có cột full_name.
            </p>

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

              {userEditor.mode === 'create' && (
                <p className="admin-form-note">
                  Khi tạo user, backend nên gửi link đặt mật khẩu qua email hoặc tạo mật khẩu tạm
                  thời đã hash. Không ghi mật khẩu/token vào log.
                </p>
              )}

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
            <p>Không hiển thị mật khẩu hiện tại. Email chỉ xem, không sửa qua endpoint cập nhật chung.</p>

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
                    className={`status-badge ${
                      userDetail.status === 'locked' || userDetail.status === 'deleted'
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
            <p>
              Hệ thống sẽ ưu tiên soft delete. Admin không thể tự xoá tài khoản đang đăng nhập.
              Vui lòng nhập lý do để lưu vào admin_logs.
            </p>
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
