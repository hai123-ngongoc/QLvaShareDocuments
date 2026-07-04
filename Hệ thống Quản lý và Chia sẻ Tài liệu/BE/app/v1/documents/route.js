const {Router} = require('express');
const {list, get, create, remove, update, download} = require('./controller');
const upload = require('../middleware/upload');

const route = new Router();

//lấy danh sách tài liệu
route.get('/', list,);

//lấy chi tiết tài liệu
route.get('/:id', get,);

//thêm tài liệu mới
// route.post('/', create,);
route.post("/", upload.single("file"), create);

//xóa tài liệu
route.delete('/:id', remove,);

//cập nhật tài liệu
route.put('/:id', update,);

route.get("/download/:id", download);

module.exports = route;