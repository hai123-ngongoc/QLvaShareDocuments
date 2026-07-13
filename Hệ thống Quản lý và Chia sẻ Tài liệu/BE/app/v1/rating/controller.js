const Rating = require('../../../model/rating');
const User = require('../../../model/auth');
const Document = require('../../../model/documents');
const Notification = require('../../../model/notification');
const createError = require('http-errors');

//danh sách đánh giá của 1 document
const list = async (req, res, next) => {
    try {
        const { document_id } = req.params;

        const ratings = await Rating.findAll({
            where: {
                document_id
            },
            include: [{
                model: User,
                as: 'user',
                attributes: { exclude: ['password'] }
            }]
        });

        res.status(200).json(ratings);

    } catch (error) {
        next(error);
    }
}

//thêm đánh giá
const create = async (req, res, next) => {
    try {
        const { document_id, rating, comment } = req.body;
        const user_id = req.user.id;

        if (!document_id) {
            return res.status(400).json({ message: 'Thiếu document_id.' });
        }

        if (rating === undefined || rating === null) {
            return res.status(400).json({ message: 'Vui lòng chọn số sao đánh giá.' });
        }

        //ktra và đánh giá chưa
        const exist = await Rating.findOne({
            where: {
                user_id,
                document_id
            }
        });

        if (exist) {
            return res.status(400).json({ message: 'Bạn đã đánh giá tài liệu này.' });
        }

        //ktr số sao
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Số sao phải trong khoáng 1-5.' });
        }

        const newRating = await Rating.create({
            user_id,
            document_id,
            rating,
            comment
        });

        // Tạo thông báo cho chủ tài liệu khi có bình luận mới
        try {
            const document = await Document.findByPk(document_id);
            if (document && document.user_id && document.user_id !== user_id) {
                const commenter = await User.findByPk(user_id, { attributes: ['username'] });
                const commenterName = commenter ? commenter.username : 'Ai đó';
                await Notification.create({
                    user_id: document.user_id,
                    document_id: document.id,
                    type: 'commented',
                    message: `${commenterName} đã bình luận trên tài liệu "${document.title}" của bạn.`
                });
            }
        } catch (notifError) {
            // Không để lỗi thông báo ảnh hưởng tới response chính
            console.error('Lỗi tạo thông báo bình luận:', notifError);
        }

        return res.status(201).json(newRating);
    } catch (error) {
        next(error);
    }
}

//cập nhật đánh giá
const update = async (req, res, next) => {
    try {

        const { id } = req.params;
        const { rating, comment } = req.body;

        const item = await Rating.findOne({
            where: {
                id,
                user_id: req.user.id
            }
        });

        if (!item) {
            throw createError(404, 'Rating not found');
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Số sao phải trong khoáng 1-5.' });
        }

        item.rating = rating ?? item.rating;
        item.comment = comment ?? item.comment;

        await item.save();

        return res.status(200).json({ message: "Cập nhật đánh giá thành công." });

    } catch (error) {
        next(error);
    }
}

//Xóa đánh giá
const remove = async (req, res, next) => {
    try {
        const { id } = req.params;

        console.log("Rating ID:", req.params.id);
        console.log("User ID:", req.user.id);

        const item = await Rating.findOne({
            where: {
                id,
                user_id: req.user.id
            }
        });

        console.log(item);

        if (!item) {
            throw createError(404, 'Rating not found');
        }

        await item.destroy();

        return res.status(200).json({ message: "Xóa đánh giá thành công." });

    } catch (error) {
        next(error);
    }
}

// Admin lấy toàn bộ danh sách đánh giá
const listAllRatings = async (req, res, next) => {
    try {
        const ratings = await Rating.findAll({
            include: [{
                model: User,
                as: 'user',
                attributes: { exclude: ['password'] }
            }],
            order: [['created_at', 'DESC']]
        });
        return res.status(200).json(ratings);
    } catch (error) {
        next(error);
    }
}

// Admin xóa 1 đánh giá bất kỳ
const adminDeleteRating = async (req, res, next) => {
    try {
        const { id } = req.params;
        const rating = await Rating.findByPk(id);
        if (!rating) {
            return res.status(404).json({ message: 'Đánh giá không tồn tại.' });
        }
        await rating.destroy();
        return res.status(200).json({ success: true, message: 'Xóa đánh giá thành công.' });
    } catch (error) {
        next(error);
    }
}

// Admin xóa toàn bộ đánh giá
const adminDeleteAllRatings = async (req, res, next) => {
    try {
        await Rating.destroy({
            where: {},
            truncate: false
        });
        return res.status(200).json({ success: true, message: 'Đã xóa toàn bộ đánh giá trên hệ thống.' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    list,
    create,
    update,
    remove,
    listAllRatings,
    adminDeleteRating,
    adminDeleteAllRatings
}