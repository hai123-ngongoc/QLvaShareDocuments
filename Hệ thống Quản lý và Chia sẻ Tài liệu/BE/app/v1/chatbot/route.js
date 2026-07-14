const { Router } = require('express');
const controller = require('./controller');

const router = new Router();

router.post('/', controller.chat);

module.exports = router;
