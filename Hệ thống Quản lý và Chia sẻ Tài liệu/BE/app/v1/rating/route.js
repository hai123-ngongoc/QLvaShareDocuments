const { Router } = require('express');

const { list, create, update, remove } = require('./controller');

const route = new Router();

//danh sách đánh giá
route.get('/document/:document_id', list,);

//thêm đánh giá
route.post('/', create,);

//cập nhật đánh giá
route.put('/:id', update,);

//xóa đánh giá
route.delete('/:id', remove,);

module.exports = route;