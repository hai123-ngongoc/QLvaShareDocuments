const multer = require('multer');
const path = require('path');

// Danh sách loại file được phép upload (khớp với danh sách hiển thị ở FE - UploadPage.jsx)
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip'];

// Giới hạn dung lượng file (50MB) - khớp với giới hạn hiển thị ở FE (UploadPage.jsx: maxFileSizeMb = 50).
// Trước đây multer() không có "limits" nên FE chỉ chặn được ở giao diện, còn gọi thẳng API
// (Postman/curl/…) thì có thể upload file dung lượng bất kỳ -> rủi ro DoS do đầy ổ đĩa.
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Trước đây không có fileFilter nên có thể upload bất kỳ loại file nào (kể cả .html, .exe, .php,...)
// và bị express.static("/uploads") phục vụ trực tiếp -> rủi ro stored XSS / phát tán file độc hại.
function fileFilter(req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        const error = new Error('Loại file không được hỗ trợ. Chỉ chấp nhận: PDF, DOC, DOCX, PPT, PPTX, ZIP.');
        error.status = 400;
        return cb(error);
    }

    cb(null, true);
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES
    }
});

module.exports = upload;