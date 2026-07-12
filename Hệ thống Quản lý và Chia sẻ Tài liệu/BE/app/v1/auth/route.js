const { Router } = require('express');
const { register, login, profile, changePassword, getAllUsers, deleteUser } = require('./controller');

const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');

const router = Router();

router.post('/register', register);

router.post('/login', login);

router.get('/profile', verifyToken, profile);

router.put('/change-password', verifyToken, changePassword);

router.get('/users', verifyToken, isAdmin, getAllUsers);

router.delete('/users/:id', verifyToken, isAdmin, deleteUser);

module.exports = router;