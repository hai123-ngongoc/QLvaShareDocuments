const Course = require('../../../model/courses');
const Document = require('../../../model/documents');
const { fn, col } = require('sequelize');

const list = async (req, res, next) => {
    try {
        const courses = await Course.findAll({
            attributes: { include: [[fn('COUNT', col('documents.id')), 'documents_count']] },
            include: [{ model: Document, as: 'documents', attributes: [] }],
            group: ['Course.id'],
        });
        return res.status(200).json({ items: courses });
    } catch (error) {
        next(error);
    }
};

const get = async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await Course.findByPk(id);
        if (!course) return res.status(404).json({ message: 'Học phần không tồn tại' });
        return res.status(200).json(course);
    } catch (error) {
        next(error);
    }
};

module.exports = { list, get };