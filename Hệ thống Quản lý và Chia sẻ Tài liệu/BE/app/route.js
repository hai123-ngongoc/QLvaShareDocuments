const {Router} = require('express');

const router = new Router();

router.use('/v1', require('./v1/route'));

router.get('/health-check', async(req, res, next) => res.status(200).send());

module.exports = router;