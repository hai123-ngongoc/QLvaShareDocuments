const Course = require('../../../model/courses');
const Document = require('../../../model/documents');
const { fn, col, Op } = require('sequelize');

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

//thêm học phần (admin) - học phần mới luôn chưa có tài liệu nào
const create = async (req, res, next) => {
    try {
        const { course_code, course_name, faculty, description } = req.body;

        if (!course_code || !course_code.trim()) {
            return res.status(400).json({ message: 'Vui lòng nhập mã học phần.' });
        }

        if (!course_name || !course_name.trim()) {
            return res.status(400).json({ message: 'Vui lòng nhập tên học phần.' });
        }

        const existed = await Course.findOne({ where: { course_code: course_code.trim() } });
        if (existed) {
            return res.status(400).json({ message: 'Mã học phần đã tồn tại.' });
        }

        const course = await Course.create({
            course_code: course_code.trim(),
            course_name: course_name.trim(),
            faculty: faculty ? faculty.trim() : null,
            description: description ? description.trim() : null,
        });

        return res.status(201).json(course);
    } catch (error) {
        next(error);
    }
};

//sửa học phần (admin) - chỉ cho phép đổi tên, KHÔNG cho đổi ID/mã học phần
const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { course_name } = req.body;

        const course = await Course.findByPk(id);
        if (!course) return res.status(404).json({ message: 'Học phần không tồn tại' });

        if (!course_name || !course_name.trim()) {
            return res.status(400).json({ message: 'Vui lòng nhập tên học phần.' });
        }

        // Chú ý: chỉ cho phép sửa course_name. Không nhận course_code/id từ client
        // để tránh đổi mã định danh của học phần đã có tài liệu gắn vào.
        course.course_name = course_name.trim();
        await course.save();

        return res.status(200).json(course);
    } catch (error) {
        next(error);
    }
};

//xóa học phần (admin) - chỉ xóa được nếu không còn tài liệu đang chờ duyệt/đã duyệt
const remove = async (req, res, next) => {
    try {
        const { id } = req.params;

        const course = await Course.findByPk(id);
        if (!course) return res.status(404).json({ message: 'Học phần không tồn tại' });

        const blockingDocumentsCount = await Document.count({
            where: {
                course_id: id,
                status: { [Op.in]: ['pending', 'approved'] },
            },
        });

        if (blockingDocumentsCount > 0) {
            return res.status(400).json({
                message: 'Không thể xoá học phần vì vẫn còn tài liệu đang chờ duyệt hoặc đã được duyệt.',
            });
        }

        await course.destroy();

        return res.status(200).json({ message: 'Xoá học phần thành công' });
    } catch (error) {
        next(error);
    }
};

module.exports = { list, get, create, update, remove };