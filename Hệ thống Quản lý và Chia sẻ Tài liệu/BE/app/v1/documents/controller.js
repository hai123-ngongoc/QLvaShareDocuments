const Document = require('../../../model/documents');
const { viewList, viewItem } = require('./view');
const createError = require('http-errors');
const path = require('path');
const { Op } = require('sequelize');
// console.log(Op.like);
const Course = require('../../../model/courses');
const Download = require('../../../model/downloads');
const Rating = require('../../../model/rating');
const User = require('../../../model/auth');
const { fn, col } = require('sequelize');
const { buildVisibilityWhere } = require('./visibility');
const { resolveUploadedFilePath } = require('./fileStorage');

// Tài liệu có được phép xem bởi req.user hay không (áp dụng cho get/viewFile/download)
function canViewDocument(document, user) {
    if (document.status === 'approved') return true;
    if (!user) return false;
    if (user.role === 'admin') return true;
    return document.user_id === user.id;
}

//danh sách tài liệu
const list = async (req, res, next) => {
    try {
        const documents = await Document.findAll({
            where: buildVisibilityWhere(req.user),
            include: [
                { model: Course, as: 'course', attributes: ['id', 'course_name'] },
                { model: User, as: 'uploader', attributes: { exclude: ['password'] } },
            ],
        });
        return res.status(200).json(viewList(documents));
    } catch (error) {
        next(error);
    }
};

//chi tiết tài liệu
const get = async (req, res, next) => {
    try {
        const { id } = req.params;
        const document = await Document.findOne({
            where: buildVisibilityWhere(req.user, { id }),
            include: [
                { model: Course, as: 'course', attributes: ['id', 'course_name'] },
                { model: User, as: 'uploader', attributes: { exclude: ['password'] } },
            ],
        });

        if (!document) {
            // Không phân biệt "không tồn tại" và "tồn tại nhưng chưa được duyệt" để tránh dò tài liệu chờ duyệt
            throw createError(404, 'Document not found');
        }

        document.view_count += 1;
        await document.save();

        return res.status(200).json(viewItem(document));
    } catch (error) {
        next(error);
    }
};

//thêm tài liệu
const create = async (req, res, next) => {
    try {
        // console.log("Request body:", req.body);
        // console.log("Request file:", req.file);

        if (!req.file) {
            return res.status(400).json({ message: 'Vui lý chọn file' });
        }

        const { title, description, course_id } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Vui lòng nhập tiêu đề tài liệu.' });
        }

        const user_id = req.user.id;

        const file_url = req.file ? `/uploads/${req.file.filename}` : null;

        const path = require('path');

        const file_type = req.file
            ? path.extname(req.file.originalname).replace('.', '').toLowerCase()
            : null;

        const document = await Document.create({
            title,
            description,
            file_url,
            file_type,
            course_id,
            user_id,
            status: "pending"
        });

        return res.status(201).json({
            message: 'Đã gửi tài liệu, vui lòng chờ Admin duyệt.',
            document: {
                id: document.id,
                status: document.status
            }
        });

    } catch (error) {
        // console.log("=================");
        // console.log(error.parent);
        // console.log("MESSAGE:", error.parent?.sqlMessage);
        // console.log("CODE:", error.parent?.code);
        // console.log("SQL:", error.parent?.sql);
        // console.log("=================");

        next(error);
    }
}

//xóa tài liệu
const remove = async (req, res, next) => {
    try {
        let document;
        const { id } = req.params;

        if (req.user.role === 'admin') {
            document = await Document.findByPk(id);
        } else {
            document = await Document.findOne({
                where: {
                    id,
                    user_id: req.user.id
                }
            });
        }

        console.log("Document ID:", id);
        console.log("JWT User:", req.user);
        console.log("Document:", document);

        if (!document) {
            return res.status(404).json({ message: 'Tài liệu không tồn tại' });
        }

        await document.destroy();

        return res.status(200).json({ message: 'Xóa tài liệu thành công' });
    } catch (error) {
        next(error);
    }
}

//cập nhật tài liệu
const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        // CHÚ Ý BẢO MẬT: KHÔNG cho phép client tự đặt file_url/file_type qua request body.
        // Hai trường này chỉ được server sinh ra khi có file upload thật qua multer
        // (xem hàm create()). Nếu cho phép set tuỳ ý ở đây, client có thể trỏ file_url
        // ra ngoài thư mục uploads/ (path traversal) rồi tải/xem được file bất kỳ trên server
        // qua route download/view.
        const { title, description, course_id, status } = req.body;

        let document;

        if (req.user.role === 'admin') {
            document = await Document.findByPk(id);
        } else {
            document = await Document.findOne({
                where: {
                    id,
                    user_id: req.user.id
                }
            });
        }

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        document.title = title ?? document.title;
        document.description = description ?? document.description;
        document.course_id = course_id ?? document.course_id;

        // Chỉ admin được phép đổi status qua route này (người dùng thường dùng route
        // approve/reject riêng của admin để duyệt, tránh tự set status = 'approved').
        if (req.user.role === 'admin') {
            document.status = status ?? document.status;
        }

        await document.save();
        return res.status(200).json({ message: 'Cập nhật tài liệu thành công' });
    } catch (error) {
        console.error("Error updating document:", error);
        return res.status(500).json({ message: 'Có lỗi xảy ra khi cập nhật tài liệu' });
    }
}

const download = async (req, res, next) => {
    try {
        const { id } = req.params;

        const document = await Document.findByPk(id);

        if (!document) {
            return res.status(404).json({ message: 'Tài liệu không tồn tại' });
        }

        if (!canViewDocument(document, req.user)) {
            return res.status(404).json({ message: 'Tài liệu không tồn tại' });
        }

        // Bảo mật: file_url được resolve an toàn, chỉ chấp nhận file thật sự nằm
        // trong thư mục uploads/ (chống path traversal, xem app/v1/documents/fileStorage.js)
        const filePath = resolveUploadedFilePath(document.file_url);

        if (!filePath) {
            return res.status(404).json({ message: 'File not found' });
        }

        //ktr file tài liệu co ton tai hay khong
        const fs = require('fs');
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }

        //tăng số lần tải
        document.download_count += 1;
        await document.save();

        //lưu lịch sử tải
        await Download.create({
            user_id: req.user.id,
            document_id: document.id
        });

        return res.download(filePath);

    } catch (error) {
        next(error);
    }
}

//danh sách tài liệu chờ
const getPendingDocuments = async (req, res, next) => {
    try {
        const documents = await Document.findAll({
            where: {
                status: "pending"
            },
            order: [["created_at", "DESC"]]
        });

        return res.status(200).json(documents);

    } catch (error) {
        next(error);
    }
}

//duyệt tài liệu
const approveDocument = async (req, res, next) => {
    try {
        const { id } = req.params;

        const document = await Document.findByPk(id);

        if (!document) {
            return res.status(404).json({ message: 'Tài liệu không tồn tại' });
        }

        document.status = "approved";
        await document.save();

        return res.status(200).json({ message: 'Đã duyệt tài liệu.' });

    } catch (error) {
        next(error);
    }
}

//từ chối
const rejectDocument = async (req, res, next) => {
    try {
        const { id } = req.params;

        const document = await Document.findByPk(id);

        if (!document) {
            return res.status(404).json({ message: 'Tài liệu không tồn tại' });
        }

        document.status = "rejected";
        await document.save();

        return res.status(200).json({ message: 'Đã từ chối tài liệu.' });

    } catch (error) {
        next(error);
    }
}

//tìm kiếm tài liệu
const search = async (req, res, next) => {
    try {
        const { keyword, course } = req.query;

        const where = buildVisibilityWhere(req.user);

        if (keyword) {
            where.title = {
                [Op.like]: `%${keyword}%`
            };
        }

        const include = [];

        include.push({
            model: Course,
            as: 'course',
            attributes: [
                'id',
                'course_code',
                'course_name'
            ],
            required: course ? true : false
        });

        if (course) {
            include[0].where = {
                [Op.or]: [
                    {
                        course_code: {
                            [Op.like]: `%${course}%`
                        }
                    },
                    {
                        course_name: {
                            [Op.like]: `%${course}%`
                        }
                    }
                ]
            };
        }

        const documents = await Document.findAll({
            where,
            include
        });

        return res.status(200).json(documents);

    } catch (error) {
        // console.log("========== SEARCH ERROR ==========");
        // console.log(error.parent?.sqlMessage);
        // console.log(error.parent?.sql);
        // console.log(error);
        // console.log("==================================");

        next(error);
    }
}

//xem tài liệu
const viewFile = async (req, res, next) => {
    try {
        const { id } = req.params;

        const document = await Document.findByPk(id);

        if (!document) {
            return res.status(404).json({ message: 'Tài liệu không tồn tại' });
        }

        if (!canViewDocument(document, req.user)) {
            return res.status(404).json({ message: 'Tài liệu không tồn tại' });
        }

        // Bảo mật: resolve an toàn, chỉ chấp nhận file thật sự nằm trong thư mục uploads/
        // (chống path traversal, xem app/v1/documents/fileStorage.js)
        const filePath = resolveUploadedFilePath(document.file_url);

        if (!filePath) {
            return res.status(404).json({ message: 'Tài liệu không tồn tại' });
        }

        const normalizedType = (document.file_type || '').toLowerCase();
        if (!normalizedType.includes('pdf')) {
            return res.status(400).json({
                message: "Chỉ hỗ trợ xem trực tiếp file PDF. Vui lòng tải xuống để xem."
            });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline`);

        //tăng số lần xem
        document.view_count += 1;
        await document.save();

        return res.sendFile(filePath);

    } catch (error) {
        next(error);
    }
}

const getAverageRating = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await Rating.findOne({
            attributes: [
                [fn("AVG", col("rating")), "averageRating"],
                [fn("COUNT", col("rating")), "totalRatings"]
            ],
            where: {
                document_id: id
            },
            raw: true
        });

        return res.status(200).json({
            document_id: Number(id),
            average_rating: Number(result?.averageRating || 0).toFixed(1),
            total_ratings: Number(result?.totalRatings || 0)
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    list,
    get,
    create,
    remove,
    update,
    download,
    viewFile,
    search,
    getAverageRating,
    getPendingDocuments,
    approveDocument,
    rejectDocument
};