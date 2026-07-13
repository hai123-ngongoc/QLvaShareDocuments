const { Router } = require('express');
const { list, get, create, update, remove } = require('./controller');
const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');

const route = new Router();
route.get('/', list);
route.get('/:id', get);

//thêm học phần (chỉ admin)
route.post('/', verifyToken, isAdmin, create);

//sửa học phần (chỉ admin) - chỉ đổi được tên, không đổi ID
route.put('/:id', verifyToken, isAdmin, update);

//xóa học phần (chỉ admin) - chặn nếu còn tài liệu pending/approved
route.delete('/:id', verifyToken, isAdmin, remove);

module.exports = route;