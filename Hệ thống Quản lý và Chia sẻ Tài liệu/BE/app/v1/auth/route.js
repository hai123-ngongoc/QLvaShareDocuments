const { Router } = require('express');
const {
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
} = require('./controller');

const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');
const uploadAvatar = require('../middleware/uploadAvatar');

const router = Router();

router.post('/register', register);

router.post('/login', login);

router.get('/profile', verifyToken, profile);

router.put('/profile', verifyToken, uploadAvatar.single('avatar'), updateProfile);

router.put('/change-password', verifyToken, changePassword);

router.get('/users', verifyToken, isAdmin, getAllUsers);

router.post('/users', verifyToken, isAdmin, adminCreateUser);

router.put('/users/:id', verifyToken, isAdmin, adminUpdateUser);

router.post('/users/:id/reset-password', verifyToken, isAdmin, adminResetPassword);

router.delete('/users/:id', verifyToken, isAdmin, deleteUser);

router.get('/admin/logs', verifyToken, isAdmin, getAdminLogs);

router.post('/admin/logs', verifyToken, isAdmin, writeAdminLog);

module.exports = router;