const Rating = require('../../../model/rating');
const createError = require('http-errors');

//danh sách đánh giá của 1 document
const list = async (req, res, next) => {
    try {
        const { document_id } = req.params;

        const ratings = await Rating.findAll({
            where: {
                document_id
            }
        });

        res.status(200).json(ratings);

    } catch (error) {
        next(error);
    }
}

//thêm đánh giá
const create = async (req, res, next) => {
   try {
        const { user_id, document_id, rating, comment } = req.body;

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

        const newRating = await Rating.create({
            user_id,
            document_id,
            rating,
            comment
        });

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

        const item = await Rating.findByPk(id);

        if (!item) {
            throw createError(404, 'Rating not found');
        }

        item.rating = rating ?? item.rating;
        item.comment = comment ?? item.comment;

        await item.save();

        return res.status(200).json({message: "Cập nhật đánh giá thành công."});

    } catch (error) {
        next(error);
    }
}

//Xóa đánh giá
const remove = async (req, res, next) => {
    try {
        const { id } = req.params;

        const item = await Rating.findByPk(id);

        if (!item) {
            throw createError(404, 'Rating not found');
        }

        await item.destroy();

        return res.status(200).json({message: "Xóa đánh giá thông."});

    } catch (error) {
        next(error);
    }
}

module.exports = {
    list,
    create,
    update,
    remove
}