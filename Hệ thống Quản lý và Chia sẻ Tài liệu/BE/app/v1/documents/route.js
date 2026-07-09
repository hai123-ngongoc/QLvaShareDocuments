const {Router} = require('express');
const {list, get, create, remove, update, download, search, viewFile, getAverageRating} = require('./controller');
const upload = require('../middleware/upload');
const verifyToken = require('../middleware/verifyToken');

const route = new Router();

//lấy danh sách tài liệu
route.get('/', list,);

route.get("/:id/average-rating", getAverageRating);

//tìm kiếm tài liệu
route.get('/search', search);

//lấy chi tiết tài liệu
route.get('/:id', get,);

//thêm tài liệu mới
// route.post('/', create,);
route.post('/', verifyToken, upload.single("file"), create);

//xóa tài liệu
route.delete('/:id', verifyToken, remove,);

//cập nhật tài liệu
route.put('/:id', verifyToken, update,);

//xem tài liệu
route.get("/:id/view", viewFile);

route.get('/download/:id', verifyToken, download);

module.exports = route;