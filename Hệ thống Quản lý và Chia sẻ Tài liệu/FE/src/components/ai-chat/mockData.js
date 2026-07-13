export const CHAT_SUGGESTIONS = [
  'Tài liệu mới nhất về CSDL',
  'Tóm tắt chương 1 Lập trình Web',
  'Tìm đề thi Cấu trúc dữ liệu',
  'Gợi ý tài liệu học Java',
]

const documents = {
  database: [
    { id: 1, title: 'Cơ sở dữ liệu - Tổng quan và mô hình quan hệ', course: 'Cơ sở dữ liệu', fileType: 'PDF' },
    { id: 2, title: 'Bài tập SQL từ cơ bản đến nâng cao', course: 'Cơ sở dữ liệu', fileType: 'PDF' },
    { id: 3, title: 'Chuẩn hóa dữ liệu và phụ thuộc hàm', course: 'Cơ sở dữ liệu', fileType: 'DOCX' },
  ],
  web: [
    { id: 4, title: 'Chương 1 - Tổng quan Lập trình Web', course: 'Lập trình Web', fileType: 'PDF' },
    { id: 5, title: 'HTML, CSS và cấu trúc trang web', course: 'Lập trình Web', fileType: 'PPTX' },
  ],
  dataStructures: [
    { id: 6, title: 'Đề thi Cấu trúc dữ liệu có đáp án', course: 'Cấu trúc dữ liệu', fileType: 'PDF' },
    { id: 7, title: 'Ôn tập danh sách liên kết, stack và queue', course: 'Cấu trúc dữ liệu', fileType: 'DOCX' },
    { id: 8, title: 'Bài tập cây nhị phân', course: 'Cấu trúc dữ liệu', fileType: 'PDF' },
  ],
  java: [
    { id: 9, title: 'Java Core cho người mới bắt đầu', course: 'Lập trình Java', fileType: 'PDF' },
    { id: 10, title: 'Lập trình hướng đối tượng với Java', course: 'Lập trình Java', fileType: 'PPTX' },
    { id: 11, title: 'Bài tập Java thực hành', course: 'Lập trình Java', fileType: 'ZIP' },
  ],
}

export function createMockResponse(query, forceSuccess = false) {
  const normalizedQuery = query.toLocaleLowerCase('vi-VN')

  if (!forceSuccess && normalizedQuery.includes('lỗi')) {
    return {
      state: 'error',
      text: 'Không thể kết nối với trợ lý mô phỏng. Bạn có thể thử gửi lại yêu cầu.',
      documents: [],
    }
  }

  if (normalizedQuery.includes('không tìm thấy') || normalizedQuery.includes('không tồn tại')) {
    return {
      state: 'empty',
      text: 'Mình chưa tìm thấy tài liệu phù hợp với yêu cầu này. Hãy thử từ khóa ngắn hoặc tên học phần khác.',
      documents: [],
    }
  }

  if (normalizedQuery.includes('csdl') || normalizedQuery.includes('cơ sở dữ liệu')) {
    return {
      text: 'Mình tìm thấy một số tài liệu Cơ sở dữ liệu mới và phù hợp với yêu cầu của bạn.',
      documents: documents.database,
    }
  }

  if (normalizedQuery.includes('web') || normalizedQuery.includes('chương 1')) {
    return {
      text: 'Chương 1 giới thiệu kiến trúc web, mô hình client–server, HTTP và vai trò của HTML, CSS, JavaScript. Bạn có thể xem các tài liệu liên quan bên dưới.',
      documents: documents.web,
    }
  }

  if (normalizedQuery.includes('cấu trúc') || normalizedQuery.includes('đề thi')) {
    return {
      text: 'Đây là các tài liệu ôn tập và đề thi Cấu trúc dữ liệu đang có trong dữ liệu mô phỏng.',
      documents: documents.dataStructures,
    }
  }

  if (normalizedQuery.includes('java')) {
    return {
      text: 'Mình gợi ý lộ trình bắt đầu với Java Core, sau đó học OOP và luyện tập qua bài tập thực hành.',
      documents: documents.java,
    }
  }

  return {
    text: 'Mình đã ghi nhận câu hỏi. Trong bản giao diện mô phỏng này, bạn có thể thử hỏi về CSDL, Lập trình Web, Cấu trúc dữ liệu hoặc Java.',
    documents: documents.database.slice(0, 2),
  }
}
