const {Router} = require('express');
const {list, get, create, remove, update} = require('./controller');

const route = new Router();

//lấy danh sách tài liệu
route.get('/', list,);

//lấy chi tiết tài liệu
route.get('/:id', get,);

//lấy danh sách tài liệu theo tên
// route.get('/:name', get,);

//thêm tài liệu mới
route.post('/', create,);

//xóa tài liệu
route.delete('/:id', remove,);

//cập nhật tài liệu
route.put('/:id', update,);

module.exports = route;