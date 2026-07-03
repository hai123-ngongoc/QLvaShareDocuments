const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../../model/auth');

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
            where: { username }
        });

        if (!user) {
            return res.status(400).json({ message: 'Tên đăng nhập không tồn tại.' });
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

module.exports = {
    register,
    login,
    profile
};