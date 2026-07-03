const {sequelize, DataTypes} = require('sequelize');
const db = require('./index');

const User = db.define(
    'User', 
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },

        avatar: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        role: {
            type: DataTypes.ENUM('admin', 'user'),
            defaultValue: 'user'
        },

        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },

    {
        tableName: 'users',
        timestamps: false,
        underscored: true,
    }
);

module.exports = User;