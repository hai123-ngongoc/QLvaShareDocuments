const {Router} = require('express');
const { register, login, profile } = require('./controller');

const verifyToken = require('../middleware/verifyToken');

const router = Router();

router.post('/register', register);

router.post('/login', login);

router.get('/profile', verifyToken, profile);

module.exports = router;