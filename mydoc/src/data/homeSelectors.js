import {
  ai_related_documents,
  courses,
  currentUserId,
  documents,
  favorites,
  ratings,
  users,
} from './mockDatabase'

// TODO: cần backend bổ sung metadata màu/icon nếu muốn quản trị từ DB.
// courses table has no color/icon fields, so FE owns this stable course_code mapping.
export const courseIconMap = {
  WEB101: 'WEB',
  DB101: 'DB',
  AI101: 'AI',
  LTW: '{}',
  CSDL: 'DB',
  MMT: 'NW',
  AI: 'AI',
  GT: '∫',
  ATTT: '🔒',
  OOP: 'OOP',
  CTDL: 'DS',
  KTPM: 'SE',
}

// TODO: cần backend bổ sung metadata màu nếu muốn API điều khiển giao diện học phần.
// courses table has no color field. API responses can omit color; FE derives it here.
export const courseColorMap = {
  WEB101: 'blue',
  DB101: 'green',
  AI101: 'orange',
  LTW: 'blue',
  CSDL: 'green',
  MMT: 'purple',
  AI: 'orange',
  GT: 'blue',
  ATTT: 'green',
  OOP: 'purple',
  CTDL: 'orange',
  KTPM: 'blue',
}

const statusLabels = {
  approved: 'Đã duyệt',
  pending: 'Đang duyệt',
  rejected: 'Bị từ chối',
}

function buildMockApiRatingStats(documentId) {
  const documentRatings = ratings.filter((rating) => rating.document_id === documentId)

  if (!documentRatings.length) {
    return {
      avg_rating: 0,
      rating_count: 0,
    }
  }

  const total = documentRatings.reduce((sum, rating) => sum + rating.rating, 0)

  return {
    avg_rating: Number((total / documentRatings.length).toFixed(1)),
    rating_count: documentRatings.length,
  }
}

function getCourseById(courseId) {
  return courses.find((course) => course.id === courseId)
}

function getUserById(userId) {
  return users.find((user) => user.id === userId)
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateValue))
}

function getDocumentType(document) {
  const fileUrlExtension = document.file_url?.split('.').pop()?.toLowerCase()
  const fileType = fileUrlExtension || document.file_type?.toLowerCase()

  if (fileType === 'doc') {
    return 'docx'
  }

  if (fileType === 'pptx') {
    return 'ppt'
  }

  return ['pdf', 'docx', 'ppt', 'zip'].includes(fileType) ? fileType : 'pdf'
}

// Mock for a separate favorites status API:
// GET /favorites/status?document_id=:id -> { is_favorite: boolean }
function getMockFavoriteStatusFromApi(documentId, userId = currentUserId) {
  return favorites.some(
    (favorite) => favorite.document_id === documentId && favorite.user_id === userId,
  )
}

// Mock-only adapter. Real backend should return:
// { avg_rating, rating_count } from ratings AVG(rating), COUNT(*) GROUP BY document_id.
// { is_favorite } must come from the separate current-user favorites status API.
const apiDocuments = documents.map((document) => ({
  ...document,
  ...buildMockApiRatingStats(document.id),
  is_favorite: getMockFavoriteStatusFromApi(document.id),
}))

const approvedDocuments = apiDocuments.filter((document) => document.status === 'approved')

function getRatingValue(document) {
  return Number(document.avg_rating ?? 0)
}

function getRatingCount(document) {
  return Number(document.rating_count ?? 0)
}

function getFavoriteState(document) {
  return Boolean(document.is_favorite)
}

function getInitials(username) {
  return username
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function mapDocumentCard(document) {
  const course = getCourseById(document.course_id)
  const owner = getUserById(document.user_id)
  const normalizedFileType = getDocumentType(document)

  return {
    id: document.id,
    title: document.title,
    description: document.description,
    file_url: document.file_url,
    file_type: normalizedFileType,
    course_id: document.course_id,
    user_id: document.user_id,
    ai_summary: document.ai_summary,
    download_count: Number(document.download_count ?? 0),
    view_count: Number(document.view_count ?? 0),
    status: document.status,
    created_at: document.created_at,
    avg_rating: getRatingValue(document),
    rating_count: getRatingCount(document),
    is_favorite: getFavoriteState(document),
    courseId: course?.id,
    course: course?.course_name ?? 'Chưa phân loại',
    courseCode: course?.course_code ?? '',
    faculty: course?.faculty ?? 'Chưa phân loại',
    // users table only has username. TODO: cần backend bổ sung full_name nếu UI cần tên đầy đủ.
    uploader: owner?.username ?? 'Ẩn danh',
    summary: document.ai_summary ?? document.description ?? '',
    statusLabel: statusLabels[document.status] ?? document.status,
  }
}

export function getHomeDocuments() {
  return approvedDocuments.map(mapDocumentCard)
}

export function getPopularCourses() {
  return courses.map((course) => {
    const courseDocuments = approvedDocuments.filter((document) => document.course_id === course.id)

    const viewTotal = courseDocuments.reduce(
      (sum, document) => sum + document.view_count,
      0,
    )

    return {
      id: course.id,
      name: course.course_name,
      shortName: courseIconMap[course.course_code] ?? course.course_code.slice(0, 2),
      documents: courseDocuments.length,
      views: viewTotal,
      color: courseColorMap[course.course_code] ?? 'blue',
    }
  })
}

export function getCourseList() {
  return getPopularCourses().map((course) => {
    const sourceCourse = getCourseById(course.id)

    return {
      ...course,
      code: sourceCourse?.course_code ?? course.shortName,
      faculty: sourceCourse?.faculty ?? 'Chưa phân loại',
      description: sourceCourse?.description ?? '',
    }
  })
}

export function getUploadCourseOptions() {
  const faculties = [...new Set(courses.map((course) => course.faculty).filter(Boolean))]

  return {
    faculties,
    courses: courses.map((course) => ({
      id: course.id,
      course_name: course.course_name,
      course_code: course.course_code,
      faculty: course.faculty,
    })),
  }
}

export function getCourseDetail(courseId) {
  const sourceCourse = getCourseById(Number(courseId))

  if (!sourceCourse) {
    return null
  }

  const courseDocuments = approvedDocuments
    .filter((document) => document.course_id === sourceCourse.id)
    .map((document) => ({
      ...mapDocumentCard(document),
      uploadedAt: formatDate(document.created_at),
      uploadedAtValue: document.created_at,
    }))

  const views = courseDocuments.reduce((total, document) => total + document.view_count, 0)

  return {
    id: sourceCourse.id,
    code: sourceCourse.course_code,
    name: sourceCourse.course_name,
    faculty: sourceCourse.faculty,
    createdAt: formatDate(sourceCourse.created_at),
    description: sourceCourse.description,
    documents: courseDocuments,
    views,
  }
}

export function getSuggestedDocumentsForDocument(documentId, limit = 3) {
  const sourceDocumentId = Number(documentId)

  if (!sourceDocumentId) {
    return []
  }

  const approvedDocumentById = new Map(
    approvedDocuments.map((document) => [document.id, document]),
  )
  const seenRelatedIds = new Set()

  return ai_related_documents
    .filter((relation) => relation.document_id === sourceDocumentId)
    .sort((firstRelation, secondRelation) => {
      return secondRelation.similarity_score - firstRelation.similarity_score
    })
    .flatMap((relation) => {
      const relatedDocument = approvedDocumentById.get(relation.related_document_id)

      if (!relatedDocument || seenRelatedIds.has(relatedDocument.id)) {
        return []
      }

      seenRelatedIds.add(relatedDocument.id)

      return [
        {
          ...mapDocumentCard(relatedDocument),
          similarityScore: relation.similarity_score,
        },
      ]
    })
    .slice(0, limit)
}

export function getSuggestedDocumentsForCourse(courseId, limit = 3) {
  const currentCourse = getCourseById(Number(courseId))

  if (!currentCourse) {
    return []
  }

  const firstApprovedDocument = approvedDocuments.find(
    (document) => document.course_id === currentCourse.id,
  )

  return getSuggestedDocumentsForDocument(firstApprovedDocument?.id, limit)
}

export function getDocumentDetail(documentId, userId = currentUserId) {
  const sourceDocument = apiDocuments.find((document) => document.id === Number(documentId))

  if (!sourceDocument) {
    return null
  }

  const course = getCourseById(sourceDocument.course_id)
  const owner = getUserById(sourceDocument.user_id)
  const mappedDocument = mapDocumentCard(sourceDocument)
  const documentRatings = ratings
    .filter((rating) => rating.document_id === sourceDocument.id)
    .map((rating) => {
      const ratingUser = getUserById(rating.user_id)

      return {
        id: rating.id,
        username: ratingUser?.username ?? 'Người dùng',
        avatar: ratingUser?.avatar,
        initials: getInitials(ratingUser?.username ?? 'Người dùng'),
        rating: rating.rating,
        comment: rating.comment,
        createdAt: formatDate(rating.created_at),
      }
    })

  return {
    ...mappedDocument,
    courseName: course?.course_name ?? 'Chưa phân loại',
    author: {
      username: owner?.username ?? 'Ẩn danh',
      avatar: owner?.avatar,
      initials: getInitials(owner?.username ?? 'Ẩn danh'),
    },
    reviews: documentRatings,
    canReview: Boolean(userId) && !ratings.some(
      (rating) => rating.document_id === sourceDocument.id && rating.user_id === userId,
    ),
  }
}

export function getCurrentUserProfile(userId = currentUserId) {
  const user = getUserById(userId)

  if (!user) {
    return null
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    created_at: user.created_at,
    initials: getInitials(user.username),
    displayName: user.username,
    joinedYear: new Date(user.created_at).getFullYear().toString(),
    // TODO: cần backend bổ sung các cột profile như full_name, school, faculty, student_id.
    school: 'Chưa có dữ liệu',
    faculty: 'Chưa có dữ liệu',
    studentId: 'Chưa có dữ liệu',
  }
}

export function getMyLibraryDocuments(userId = currentUserId) {
  return apiDocuments
    .filter((document) => document.user_id === userId)
    .map((document) => ({
      ...mapDocumentCard(document),
      uploadedAt: formatDate(document.created_at),
      uploadedAtValue: document.created_at,
    }))
}

export function getSavedDocuments(userId = currentUserId) {
  const savedDocumentIds = new Set(
    favorites
      .filter((favorite) => favorite.user_id === userId)
      .map((favorite) => favorite.document_id),
  )

  return approvedDocuments
    .filter((document) => savedDocumentIds.has(document.id))
    .map((document) => ({
      ...mapDocumentCard(document),
      uploadedAt: formatDate(document.created_at),
      uploadedAtValue: document.created_at,
    }))
}

export function getMyLibraryStats(userId = currentUserId) {
  const ownedDocuments = getMyLibraryDocuments(userId)

  return {
    uploadedCount: ownedDocuments.length,
    savedCount: getSavedDocuments(userId).length,
    totalViews: ownedDocuments.reduce((total, document) => total + document.view_count, 0),
    totalDownloads: ownedDocuments.reduce(
      (total, document) => total + document.download_count,
      0,
    ),
  }
}
