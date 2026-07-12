const jwt = require('jsonwebtoken');

// Khác với verifyToken: không bắt buộc phải có token.
// Nếu có token hợp lệ -> gắn req.user như bình thường.
// Nếu không có token, hoặc token không hợp lệ -> coi như khách (req.user = undefined), KHÔNG chặn request.
// Dùng cho các route công khai nhưng cần biết "ai đang xem" để quyết định hiển thị thêm dữ liệu riêng (vd: tài liệu pending của chính mình).
module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next();
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        // Token sai/hết hạn -> bỏ qua, vẫn cho đi tiếp như khách
    }

    next();
};
