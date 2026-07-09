const {Sequelize, DataTypes} = require('sequelize');
const db = require('./index');

const Favorite = db.define(
    'Favorite', 
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        document_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        created_at: {
            type: DataTypes.DATE,
        }
    },

    {
        tableName: 'favorites',
        timestamps: false
    }
);

module.exports = Favorite;