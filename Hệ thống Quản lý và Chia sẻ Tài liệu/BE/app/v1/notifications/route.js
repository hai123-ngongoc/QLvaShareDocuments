const { Router } = require('express');
const { list, getUnreadCount, markAsRead, markAllAsRead } = require('./controller');
const verifyToken = require('../middleware/verifyToken');

const route = new Router();

// Tất cả route đều yêu cầu đăng nhập
route.use(verifyToken);

// Lấy danh sách thông báo
route.get('/', list);

// Đếm thông báo chưa đọc
route.get('/unread-count', getUnreadCount);

// Đánh dấu tất cả đã đọc (phải đặt trước /:id/read để tránh conflict)
route.put('/read-all', markAllAsRead);

// Đánh dấu 1 thông báo đã đọc
route.put('/:id/read', markAsRead);

module.exports = route;
