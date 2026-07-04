const Document = require('../../../model/documents');
const {viewList, viewItem} = require('./view');
const createError = require('http-errors');
const path = require('path');

//danh sách tài liệu
const list = async (req, res, next) => {
    try {
        const documents = await Document.findAll();
        return res.status(200).json(viewList(res, documents));
    } catch (error) {
        next(error);
    }
};

//chi tiết tài liệu
const get = async (req, res, next) => {
    try {
        const { id } = req.params;
        const document = await Document.findByPk(id);

        if (!document) {
            throw createError(404, 'Document not found');
        }
        return res.status(200).json(viewItem(res, document));
    } catch (error) {
        next(error);
    }
};

//thêm tài liệu
const create = async (req, res, next) => {
    try {
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);

        const { title, description, course_id, user_id, status } = req.body;

        const file_url = req.file ? `/uploads/${req.file.filename}` : null;

        const file_type = req.file ? req.file.mimetype : null;

        const document = await Document.create({
            title,
            description,
            file_url,
            file_type,
            course_id,
            user_id,
            status
        });
        return res.status(201).json({id: document.id});
    } catch (error) {
        console.log("=================");
        console.log(error.parent);
        console.log("MESSAGE:", error.parent?.sqlMessage);
        console.log("CODE:", error.parent?.code);
        console.log("SQL:", error.parent?.sql);
        console.log("=================");
        
        next(error);
    }
}

//xóa tài liệu
const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const document = await Document.findByPk(id);

        if (!document) {
            throw createError(404, 'Document not found');
        }

        await document.destroy();
        return res.status(204).json({message: 'Xóa tài liệu thành công'});
    } catch (error) {
        next(error);
    }
}

//cập nhật tài liệu
const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, file_url, file_type, course_id, user_id, status } = req.body;

        const document = await Document.findByPk(id);

        if (!document) {
            return res.status(404).json({message: 'Document not found'});
        }

        document.title = title ?? document.title;
        document.description = description ?? document.description;
        document.file_url = file_url ?? document.file_url;
        document.file_type = file_type ?? document.file_type;
        document.course_id = course_id ?? document.course_id;
        document.user_id = user_id ?? document.user_id;
        document.status = status ?? document.status;

        await document.save();
        return res.status(200).json({message: 'Cập nhật tài liệu thành công'});
    } catch (error) {
        console.error("Error updating document:", error);
        return res.status(500).json({message: 'Có lỗi xảy ra khi cập nhật tài liệu'});
    }
}

const download = async (req, res, next) => {
    try {
        const { id } = req.params;

        const document = await Document.findByPk(id);

        if (!document) {
            return res.status(404).json({ message: 'Tài liệu không tồn tại' });
        }

        const filePath = path.join(
            __dirname, 
            '../../../uploads', 
            document.file_url.replace('/uploads/', '')
        );

        res.download(filePath);

    } catch (error) {
        next(error);
    }
}

module.exports = {
    list,
    get,
    create,
    remove,
    update,
    download
};