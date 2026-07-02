const {Router} = require('express');

const router = new Router();

router.use('/documents', require('./documents/route'));

module.exports = router;