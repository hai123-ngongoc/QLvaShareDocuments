const { DataTypes } = require('sequelize');
const db = require('./index');
const { raw } = require('express');

const Rating = db.define(
    'Rating', 
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

        rating: {
            type: DataTypes.INTEGER
        },

        comment: {
            type: DataTypes.TEXT
        },

        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },

    {
        tableName: 'ratings',
        timestamps: false,
        underscored: true,
    }
)

module.exports = Rating;