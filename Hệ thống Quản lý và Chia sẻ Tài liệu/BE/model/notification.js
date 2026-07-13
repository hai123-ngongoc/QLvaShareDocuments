const { Sequelize, DataTypes } = require('sequelize');
const db = require('./index');

const Notification = db.define(
    'Notification',
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
            allowNull: true
        },

        type: {
            type: DataTypes.ENUM(
                'approved',
                'rejected',
                'commented',
                'hidden',
                'deleted'
            ),
            allowNull: false
        },

        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        is_read: {
            type: DataTypes.TINYINT,
            defaultValue: 0
        },

        created_at: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW
        }
    },

    {
        tableName: 'notifications',
        timestamps: false,
        underscored: true,
    }
);

module.exports = Notification;
