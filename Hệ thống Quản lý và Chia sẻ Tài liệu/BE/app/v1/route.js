const {Router} = require('express');

const router = new Router();

router.use('/documents', require('./documents/route'));

router.use('/auth', require('./auth/route'));

module.exports = router;