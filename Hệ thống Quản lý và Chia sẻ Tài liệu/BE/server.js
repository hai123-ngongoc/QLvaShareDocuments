require('./bootstrap');
require('./model/associations');

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const v1 = require('./app/v1/route')
const bodyParser = require('body-parser');

const router = require('./app/route');

const app = express();
const port = 8000;

const path = require('path');

app.use(cors());
app.use(bodyParser.json());
app.use('/v1', v1);

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(router);

// Không có route nào khớp -> trả JSON 404 thay vì trang HTML mặc định của Express
app.use((req, res) => {
    res.status(404).json({ message: 'Không tìm thấy route.' });
});

// ĐIỂM SỬA LỖI (bug #1): trước đây không có middleware xử lý lỗi tập trung nào,
// nên mọi lỗi được truyền qua next(error) (SequelizeValidationError,
// SequelizeForeignKeyConstraintError, lỗi multer, v.v.) sẽ rơi vào error handler
// mặc định của Express -> trả về HTML kèm FULL STACK TRACE (lộ đường dẫn file server)
// thay vì JSON gọn gàng. Middleware dưới đây bắt tất cả các lỗi đó và luôn trả JSON.
// Middleware xử lý lỗi PHẢI có đủ 4 tham số (err, req, res, next) và được đặt SAU CÙNG.
app.use((err, req, res, next) => {
    console.error(err);

    // Lỗi validate của Sequelize (vd: thiếu title, thiếu field NOT NULL, unique trùng,...)
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        const message = err.errors?.[0]?.message || 'Dữ liệu không hợp lệ.';
        return res.status(400).json({ message });
    }

    // Lỗi khoá ngoại (vd: course_id/document_id/user_id gửi lên không tồn tại trong DB)
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ message: 'Dữ liệu tham chiếu không tồn tại (kiểm tra lại course_id/document_id).' });
    }

    // Lỗi từ multer (vượt quá dung lượng cho phép, sai loại file,...)
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File vượt quá dung lượng cho phép (tối đa 50MB).' });
        }
        return res.status(400).json({ message: 'Lỗi tải file lên: ' + err.message });
    }

    // Lỗi tự tạo có sẵn status/statusCode (vd: http-errors dùng ở các controller,
    // hoặc Error tự gán .status như trong middleware/upload.js)
    const status = err.status || err.statusCode || 500;
    const message = status < 500 ? (err.message || 'Có lỗi xảy ra.') : 'Có lỗi xảy ra trên server.';

    return res.status(status).json({ message });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})