const { Router } = require('express');
const { list, get, create, remove, update, download, search, viewFile, getAverageRating, getPendingDocuments, approveDocument, rejectDocument } = require('./controller');
const upload = require('../middleware/upload');
const verifyToken = require('../middleware/verifyToken');
const optionalAuth = require('../middleware/optionalAuth');
const isAdmin = require('../middleware/isAdmin');

const route = new Router();

//lấy danh sách tài liệu (công khai, nhưng optionalAuth để chủ tài liệu thấy thêm bài pending/rejected của chính mình)
route.get('/', optionalAuth, list,);

//điểm đánh giá
route.get("/:id/average-rating", getAverageRating);

//tìm kiếm tài liệu
route.get('/search', optionalAuth, search);

//lấy chi tiết tài liệu
route.get('/:id', optionalAuth, get,);

//thêm tài liệu mới
// route.post('/', create,);
route.post('/', verifyToken, upload.single("file"), create);

//xóa tài liệu
route.delete('/:id', verifyToken, remove,);

//cập nhật tài liệu
route.put('/:id', verifyToken, update,);

//xem tài liệu
route.get("/:id/view", optionalAuth, viewFile);

//download tài liệu
route.get('/download/:id', verifyToken, download);

//danh sách tài liệu chờ duyet
route.get('/admin/pending', verifyToken, isAdmin, getPendingDocuments);

//duyệt
route.put('/admin/:id/approve', verifyToken, isAdmin, approveDocument);

//từ chối
route.put('/admin/:id/reject', verifyToken, isAdmin, rejectDocument);

module.exports = route;