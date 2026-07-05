const { Sequelize, DataTypes } = require('sequelize');
const db = require('./index');

const Course = db.define(
    'Course', 
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        course_code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },

        course_name: {
            type: DataTypes.STRING,
        },

        faculty: {
            type: DataTypes.STRING,
        },

        description: {
            type: DataTypes.TEXT,
        },

        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },

    {
        tableName: 'courses',
        timestamps: false,
        underscored: true,
    }
)

module.exports = Course;