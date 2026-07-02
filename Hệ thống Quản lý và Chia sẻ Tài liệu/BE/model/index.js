const {Sequelize} = require('sequelize');
const {database, username, password, host, port} = require('../config/database');

const db = new Sequelize({
    dialect: 'mysql',
    database,
    username,
    password,
    host,
    port
});

module.exports = db;