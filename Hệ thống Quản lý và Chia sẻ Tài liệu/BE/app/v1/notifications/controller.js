const Notification = require('../../../model/notification');
const Document = require('../../../model/documents');

// Lấy danh sách thông báo của user hiện tại
const list = async (req, res, next) => {
    try {
        const notifications = await Notification.findAll({
            where: { user_id: req.user.id },
            include: [{
                model: Document,
                as: 'document',
                attributes: ['id', 'title', 'status']
            }],
            order: [['created_at', 'DESC']],
            limit: 50
        });

        return res.status(200).json(notifications);
    } catch (error) {
        next(error);
    }
};

// Đếm số thông báo chưa đọc
const getUnreadCount = async (req, res, next) => {
    try {
        const count = await Notification.count({
            where: {
                user_id: req.user.id,
                is_read: 0
            }
        });

        return res.status(200).json({ count });
    } catch (error) {
        next(error);
    }
};

// Đánh dấu 1 thông báo đã đọc
const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOne({
            where: {
                id,
                user_id: req.user.id
            }
        });

        if (!notification) {
            return res.status(404).json({ message: 'Thông báo không tồn tại.' });
        }

        notification.is_read = 1;
        await notification.save();

        return res.status(200).json({ message: 'Đã đánh dấu đã đọc.' });
    } catch (error) {
        next(error);
    }
};

// Đánh dấu tất cả thông báo đã đọc
const markAllAsRead = async (req, res, next) => {
    try {
        await Notification.update(
            { is_read: 1 },
            { where: { user_id: req.user.id, is_read: 0 } }
        );

        return res.status(200).json({ message: 'Đã đánh dấu tất cả đã đọc.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    list,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};
