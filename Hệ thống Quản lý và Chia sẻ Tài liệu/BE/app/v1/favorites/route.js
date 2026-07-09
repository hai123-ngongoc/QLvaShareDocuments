const { Router } = require('express');
const verifyToken = require('../middleware/verifyToken');

const { list, create, remove, check } = require('./controller');

const route = new Router();

route.use(verifyToken);

//danh sách yêu thích
route.get('/', list,);

//thêm yêu thích
route.get('/check/:document_id', check,);

route.post('/', create,);

route.delete('/:document_id', remove,);

module.exports = route;