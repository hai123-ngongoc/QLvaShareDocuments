const Document = require('./documents');
const Course = require('./courses');
const Rating = require('./rating');

Document.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
});

Document.hasMany(Rating, { 
    foreignKey: 'document_id',
    as: 'ratings'
});

Course.hasMany(Document, { 
    foreignKey: 'course_id',
    as: 'documents'
});

module.exports = { 
    Document, 
    Course,
    Rating
};