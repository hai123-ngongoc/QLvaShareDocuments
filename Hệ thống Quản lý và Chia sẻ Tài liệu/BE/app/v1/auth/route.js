const { Router } = require('express');
const { register, login, profile, changePassword, getAllUsers, deleteUser, updateProfile } = require('./controller');

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

router.delete('/users/:id', verifyToken, isAdmin, deleteUser);

module.exports = router;