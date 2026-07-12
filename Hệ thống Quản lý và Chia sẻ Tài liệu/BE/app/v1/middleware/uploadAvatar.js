const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Middleware upload dành riêng cho ảnh đại diện (khác với middleware upload tài liệu
// ở app/v1/middleware/upload.js vốn chỉ cho phép pdf/doc/docx/ppt/pptx/zip).
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Khớp với thông báo hiển thị ở FE (ProfileForm.jsx: "PNG, JPG tối đa 2 MB").
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

const AVATAR_DIR = path.join(__dirname, '..', '..', '..', 'uploads', 'avatars');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Tự tạo thư mục nếu chưa có, tránh lỗi ENOENT khi máy mới setup lần đầu.
        fs.mkdirSync(AVATAR_DIR, { recursive: true });
        cb(null, AVATAR_DIR);
    },

    filename: (req, file, cb) => {
        // req.user được gán bởi verifyToken (chạy trước middleware này trong route).
        const userId = req.user?.id ?? 'unknown';
        cb(null, `user-${userId}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

function fileFilter(req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        const error = new Error('Chỉ chấp nhận ảnh định dạng PNG hoặc JPG.');
        error.status = 400;
        return cb(error);
    }

    cb(null, true);
}

const uploadAvatar = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
    },
});

module.exports = uploadAvatar;