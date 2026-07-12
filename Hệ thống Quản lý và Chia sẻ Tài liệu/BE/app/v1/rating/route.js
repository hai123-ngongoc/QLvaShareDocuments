const { Router } = require('express');
const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');

const {
    list,
    create,
    update,
    remove,
    listAllRatings,
    adminDeleteRating,
    adminDeleteAllRatings
} = require('./controller');

const route = new Router();

// Lấy toàn bộ đánh giá (chỉ admin)
route.get('/', verifyToken, isAdmin, listAllRatings);

//danh sách đánh giá của 1 document
route.get('/document/:document_id', list);

//thêm đánh giá
route.post('/', verifyToken, create);

// Xóa toàn bộ đánh giá (chỉ admin)
route.delete('/admin', verifyToken, isAdmin, adminDeleteAllRatings);

// Xóa 1 đánh giá bất kỳ (chỉ admin)
route.delete('/admin/:id', verifyToken, isAdmin, adminDeleteRating);

//cập nhật đánh giá
route.put('/:id', verifyToken, update);

//xóa đánh giá
route.delete('/:id', verifyToken, remove);

module.exports = route;