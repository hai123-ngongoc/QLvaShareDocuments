const path = require('path');

const UPLOAD_DIR = path.resolve(__dirname, '../../../uploads');

// Nhận file_url lưu trong DB (dạng "/uploads/xxx.pdf") và trả về đường dẫn tuyệt đối
// thật sự nằm bên trong thư mục uploads/. Nếu sau khi chuẩn hoá mà đường dẫn "thoát"
// ra khỏi uploads/ (ví dụ do file_url chứa "../"), trả về null để controller từ chối.
//
// Đây là lớp bảo vệ THỨ HAI (defense in depth): lớp bảo vệ CHÍNH là không bao giờ cho phép
// client tự đặt file_url tuỳ ý (xem app/v1/documents/controller.js#update - đã loại bỏ
// khả năng client set file_url/file_type qua request body).
function resolveUploadedFilePath(fileUrl) {
    if (!fileUrl || typeof fileUrl !== 'string') return null;

    // chỉ chấp nhận file thuộc thư mục uploads do server tự sinh ra (không hỗ trợ URL ngoài)
    if (!fileUrl.startsWith('/uploads/')) return null;

    const relative = fileUrl.slice('/uploads/'.length);
    const resolved = path.resolve(UPLOAD_DIR, relative);

    if (resolved !== UPLOAD_DIR && !resolved.startsWith(UPLOAD_DIR + path.sep)) {
        // path traversal bị phát hiện (vd "../../../etc/passwd")
        return null;
    }

    return resolved;
}

module.exports = { resolveUploadedFilePath, UPLOAD_DIR };
