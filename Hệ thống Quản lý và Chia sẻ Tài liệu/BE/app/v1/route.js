const {Router} = require('express');

const router = new Router();

router.use('/documents', require('./documents/route'));
router.use('/ratings', require('./rating/route'));
router.use("/favorites", require("./favorites/route"));

router.use('/auth', require('./auth/route'));

module.exports = router;