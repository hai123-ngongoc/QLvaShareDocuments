const Course = require('../../../model/courses');
const Document = require('../../../model/documents');
const User = require('../../../model/auth');

// Thống kê công khai cho trang chủ: số học phần, số tài liệu (đã duyệt), số người dùng.
// Chỉ trả về số đếm (không có dữ liệu nhạy cảm) nên không yêu cầu đăng nhập.
const getStats = async (req, res, next) => {
    try {
        const [courseCount, documentCount, userCount] = await Promise.all([
            Course.count(),
            Document.count({ where: { status: 'approved' } }),
            User.count(),
        ]);

        return res.status(200).json({
            courses: courseCount,
            documents: documentCount,
            users: userCount,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getStats };