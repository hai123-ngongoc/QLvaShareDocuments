const { Router } = require('express');
const verifyToken = require('../middleware/verifyToken');

const { list, create, update, remove } = require('./controller');

const route = new Router();

//danh sách đánh giá
route.get('/document/:document_id', list,);

//thêm đánh giá
route.post('/', verifyToken, create,);

//cập nhật đánh giá
route.put('/:id', verifyToken, update,);

//xóa đánh giá
route.delete('/:id', verifyToken, remove,);

module.exports = route;