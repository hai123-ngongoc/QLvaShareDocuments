const {Sequelize, DataTypes} = require('sequelize');
const db = require('./index');

const Document = db.define(
    'Document', 
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        title: {
            type: DataTypes.STRING,
            allowNull: false
        },

        description: {
            type: DataTypes.TEXT
        },

        file_url: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        file_type: {
            type: DataTypes.STRING,
            allowNull: false
        },

        course_id: {
            type: DataTypes.INTEGER,
        },

        user_id: {
            type: DataTypes.INTEGER,
        },

        ai_summary: {
            type: DataTypes.TEXT
        },

        download_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },

        view_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },

        status:{
            type:DataTypes.ENUM(
                'pending',
                'approved',
                'rejected'
            ),
            defaultValue:'pending'
        },

        created_at: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW
        }
    },

    {
        tableName: 'documents',
        timestamps: false,
        undefined: true,
    }
);

module.exports = Document;