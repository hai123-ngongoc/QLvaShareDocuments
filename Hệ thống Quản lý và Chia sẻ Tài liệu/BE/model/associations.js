const Document = require('./documents');
const Course = require('./courses');
const Rating = require('./rating');
const Download = require('./downloads');
const User = require('./auth');
const Favorite = require('./favorites');

Document.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
});

Document.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'uploader'
});

Document.hasMany(Rating, {
    foreignKey: 'document_id',
    as: 'ratings'
});

Course.hasMany(Document, {
    foreignKey: 'course_id',
    as: 'documents'
});

Document.hasMany(Download, {
    foreignKey: 'document_id',
    as: 'downloads'
});

Download.belongsTo(Document, {
    foreignKey: 'document_id',
    as: 'document'
});

User.hasMany(Download, {
    foreignKey: 'user_id',
    as: 'downloads'
});

Download.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

Document.hasMany(Favorite, {
    foreignKey: 'document_id',
    as: 'favorites'
});

Favorite.belongsTo(Document, {
    foreignKey: 'document_id',
    as: 'document'
});

User.hasMany(Favorite, {
    foreignKey: 'user_id',
    as: 'favorites'
});

Favorite.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

Rating.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

module.exports = {
    Document,
    Course,
    Rating,
    User,
    Download,
    Favorite
};