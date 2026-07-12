const { Router } = require('express');
const { list, get } = require('./controller');

const route = new Router();
route.get('/', list);
route.get('/:id', get);

module.exports = route;