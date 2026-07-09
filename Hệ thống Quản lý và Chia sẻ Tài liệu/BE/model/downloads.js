const { Sequelize, DataTypes } = require('sequelize');
const db = require('./index');

const Download = db.define(
    'Download', 
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        user_id: {
            type: DataTypes.INTEGER
        },

        document_id: {
            type: DataTypes.INTEGER
        },

        download_time: {
            type: DataTypes.DATE
        }
    },

    {
        tableName: 'downloads',
        timestamps: false
    }
);

module.exports = Download;