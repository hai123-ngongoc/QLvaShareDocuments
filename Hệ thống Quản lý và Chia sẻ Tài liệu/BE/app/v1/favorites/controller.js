const Favorite = require('../../../model/favorites');
const Document = require('../../../model/documents');
const createError = require('http-errors');

//thêm yêu thích
const create = async (req, res, next) => {
    try {
        const { document_id } = req.body;

        const exist = await Favorite.findOne({
            where: {
                user_id: req.user.id,
                document_id
            }
        });

        if (exist) {
            throw createError(400, 'Tài liệu đã nằm vào danh sách yêu thích.');
        }

        const favorite = await Favorite.create({ 
            user_id: req.user.id ,
            document_id
        });

        return res.status(201).json(favorite);

    } catch (error) {
        next(error);
    }
}

//danh sách yêu thích
const list = async (req, res, next) => {
    try {
        const favorites = await Favorite.findAll({
            where: {
                user_id: req.user.id
            },
            include: [{
                model: Document,
                as: 'document'
            }]
        });

        return res.status(200).json(favorites);

    } catch (error) {
        next(error);
    }
}

//bỏ yêu thích
const remove = async (req, res, next) => {
    try {
        const { document_id } = req.params;

        const favorite = await Favorite.findOne({
            where: {
                user_id: req.user.id,
                document_id
            }
        });

        if (!favorite) {
            throw createError(404, 'Không tìm thấy tài liệu trong danh sách yêu thích.');
        }

        await favorite.destroy();

        return res.status(204).json({message: 'Bỏ yêu thích thành công'});

    } catch (error) {
        next(error);
    }
}

//ktra yêu thích
const check = async (req, res, next) => {
    try {
        const { document_id } = req.params;

        const favorite = await Favorite.findOne({
            where: {
                user_id: req.user.id,
                document_id
            }
        });

        res.json({
            favorite: !!favorite
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    create,
    list,
    remove,
    check
}