const { Router } = require('express');
const { getStats } = require('./controller');

const route = new Router();

// GET /v1/stats - công khai, dùng cho các số liệu ở trang chủ
route.get('/', getStats);

module.exports = route;