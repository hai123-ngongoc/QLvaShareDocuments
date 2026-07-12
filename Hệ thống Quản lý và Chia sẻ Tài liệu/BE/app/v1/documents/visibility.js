const { Op } = require('sequelize');

// Quy tắc hiển thị tài liệu:
// - Khách (chưa đăng nhập)      -> chỉ thấy tài liệu đã 'approved'
// - Người dùng thường đã login  -> thấy tài liệu 'approved' + tài liệu do CHÍNH mình upload (mọi status)
// - Admin                       -> thấy tất cả (admin đã có route riêng /admin/pending để quản lý)
function buildVisibilityWhere(user, extraWhere = {}) {
    if (user && user.role === 'admin') {
        return { ...extraWhere };
    }

    if (user) {
        return {
            ...extraWhere,
            [Op.and]: [
                {
                    [Op.or]: [
                        { status: 'approved' },
                        { user_id: user.id }
                    ]
                }
            ]
        };
    }

    return { ...extraWhere, status: 'approved' };
}

module.exports = { buildVisibilityWhere };
