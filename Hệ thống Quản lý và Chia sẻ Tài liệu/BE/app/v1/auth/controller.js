const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../../model/auth');
const { Op } = require('sequelize');
const { readLogs, writeLog } = require('../middleware/adminLogs');

// Register a new user
const register = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin.' });
        }

        const checkUser = await User.findOne({
            where: { username }
        });

        if (checkUser) {
            return res.status(400).json({ message: 'Tên người dùng đã tồn tại.' });
        }

        const checkEmail = await User.findOne({
            where: { email }
        });

        if (checkEmail) {
            return res.status(400).json({ message: 'Email đã tồn tại.' });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        await User.create({
            username,
            password: hashPassword,
            email,
            avatar: null,
            role: 'user'
        });

        return res.status(201).json({ message: 'Đăng ký người dùng thành công.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Có lỗi xảy ra khi đăng ký người dùng.' });
    }
}

//login user
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({
            where: {
                [Op.or]: [{ username }, { email: username }]
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Tên đăng nhập không tồn tại.' });
        }

        if (user.status === 'locked') {
            return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa.' });
        }

        const check = await bcrypt.compare(
            password,
            user.password
        );

        if (!check) {
            return res.status(400).json({ message: 'Mật khẩu không đúng.' });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '7d'
            }
        );

        res.json({
            success: true,
            message: 'Đăng nhập thành công.',
            token,
            // Thông tin cơ bản để hiển thị lên màn hình
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Có lỗi xảy ra khi đăng nhập.' });
    }
}

//thông tin user
const profile = async (req, res) => {
    try {
        const user = await User.findByPk(
            req.user.id,
            {
                attributes: {
                    exclude: ['password']
                }
            });

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Có lỗi xảy ra khi lấy thông tin người dùng.' });
    }
}

// change password
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin.' });
        }

        if (oldPassword === newPassword) {
            return res.status(400).json({ message: 'Mật khẩu mới không được trùng với mật khẩu cũ.' });
        }

        const user = await User.findByPk(req.user.id);

        const check = await bcrypt.compare(oldPassword, user.password);

        if (!check) {
            return res.status(400).json({ message: 'Mật khẩu cũ không đúng.' });
        }

        const hash = await bcrypt.hash(newPassword, 10);

        await user.update({ password: hash });

        res.json({
            success: true,
            message: 'Đổi mật khẩu thành công.'
        });
    } catch (error) {
        res.status(500).json({ message: 'Có lỗi xảy ra khi đổi mật khẩu.' });
    }
}

//admin lấy danh sách user
const getAllUsers = async (req, res) => {
    try {
        const list = await User.findAll({
            attributes: {
                exclude: ['password']
            }
        });

        res.json({
            success: true,
            total: list.length,
            data: list
        });

    } catch (error) {
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách người dùng.' });
    }
}

// delete user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }

        // req.user.id lấy từ JWT là số, còn req.params.id lấy từ URL luôn là chuỗi
        // -> phải ép kiểu trước khi so sánh, nếu không điều kiện chặn tự-xoá sẽ luôn sai (bug đã xác nhận qua test).
        if (Number(req.user.id) === Number(req.params.id)) {
            return res.status(400).json({ message: 'Bạn không thể tự xóa tài khoản của mình.' });
        }

        await user.destroy();

        res.json({
            success: true,
            message: 'Xóa thành công.'
        });
    } catch (error) {
        res.status(500).json({ message: 'Có lỗi xảy ra khi xóa người dùng.' });
    }
}

// update profile (username, email, avatar)
const updateProfile = async (req, res, next) => {
    try {
        const { username, email } = req.body;
        const userId = req.user.id;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }

        // Nếu thay đổi username, kiểm tra xem username mới đã tồn tại chưa
        if (username && username !== user.username) {
            const checkUser = await User.findOne({
                where: { username }
            });
            if (checkUser) {
                return res.status(400).json({ message: 'Tên người dùng đã tồn tại.' });
            }
            user.username = username;
        }

        // Nếu thay đổi email, kiểm tra xem email mới đã tồn tại chưa
        if (email && email !== user.email) {
            const checkEmail = await User.findOne({
                where: { email }
            });
            if (checkEmail) {
                return res.status(400).json({ message: 'Email đã tồn tại.' });
            }
            user.email = email;
        }

        if (req.file) {
            // Lưu đường dẫn tương đối để FE có thể tải tĩnh
            user.avatar = `/uploads/avatars/${req.file.filename}`;
        }

        await user.save();

        // Trả về thông tin user mới cập nhật (loại bỏ mật khẩu)
        const updatedUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            role: user.role
        };

        return res.json({
            success: true,
            message: 'Cập nhật thông tin tài khoản thành công.',
            user: updatedUser
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Có lỗi xảy ra khi cập nhật thông tin.' });
    }
}

// Admin lấy danh sách nhật ký logs
const getAdminLogs = async (req, res, next) => {
    try {
        const logs = readLogs();
        return res.status(200).json(logs);
    } catch (error) {
        next(error);
    }
}

// Admin viết nhật ký log
const writeAdminLog = async (req, res, next) => {
    try {
        const { targetUserId, action, before, after, reason } = req.body;
        const adminLog = {
            admin_id: req.user.id,
            target_user_id: targetUserId ? Number(targetUserId) : null,
            action,
            before,
            after,
            reason
        };
        const newLog = writeLog(adminLog);
        return res.status(201).json(newLog);
    } catch (error) {
        next(error);
    }
}

// Admin tạo người dùng mới
const adminCreateUser = async (req, res, next) => {
    try {
        const { username, email, password, role, status } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin (tên, email, mật khẩu).' });
        }

        const checkUser = await User.findOne({ where: { username } });
        if (checkUser) {
            return res.status(400).json({ message: 'Tên người dùng đã tồn tại.' });
        }

        const checkEmail = await User.findOne({ where: { email } });
        if (checkEmail) {
            return res.status(400).json({ message: 'Email đã tồn tại.' });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashPassword,
            role: role || 'user',
            status: status || 'active',
            avatar: null
        });

        return res.status(201).json({
            success: true,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                status: newUser.status,
                created_at: newUser.created_at
            }
        });
    } catch (error) {
        next(error);
    }
}

// Admin cập nhật thông tin người dùng
const adminUpdateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { username, role, status } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }

        if (username && username !== user.username) {
            const checkUser = await User.findOne({ where: { username } });
            if (checkUser) {
                return res.status(400).json({ message: 'Tên người dùng đã tồn tại.' });
            }
            user.username = username;
        }

        user.role = role ?? user.role;
        user.status = status ?? user.status;

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Cập nhật tài khoản thành công.',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        next(error);
    }
}

// Admin đặt lại mật khẩu của người dùng
const adminResetPassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { tempPassword } = req.body;

        if (!tempPassword) {
            return res.status(400).json({ message: 'Mật khẩu tạm thời không được để trống.' });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }

        const hash = await bcrypt.hash(tempPassword, 10);
        user.password = hash;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Đặt lại mật khẩu thành công.'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    register,
    login,
    profile,
    changePassword,
    getAllUsers,
    deleteUser,
    updateProfile,
    getAdminLogs,
    writeAdminLog,
    adminCreateUser,
    adminUpdateUser,
    adminResetPassword
};