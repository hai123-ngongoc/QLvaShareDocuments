const viewList = (documents) => ({
    items: (documents || []).map((document) => ({
        id: document.id,
        title: document.title,
        description: document.description,
        file_url: document.file_url,
        file_type: document.file_type,
        course_id: document.course_id,
        user_id: document.user_id,
        ai_summary: document.ai_summary,
        download_count: document.download_count,
        view_count: document.view_count,
        status: document.status,
        created_at: document.created_at,
        // Chỉ có giá trị khi controller include Course/User (GET /v1/documents, GET /v1/documents/:id).
        // Nếu controller không include, Sequelize instance sẽ không có 2 field này -> mặc định null, FE tự fallback.
        course: document.course
            ? { id: document.course.id, course_name: document.course.course_name }
            : null,
        uploader: document.uploader
            ? { id: document.uploader.id, username: document.uploader.username }
            : null,
    })),
});

const viewItem = (document) => ({
    id: document.id,
    title: document.title,
    description: document.description,
    file_url: document.file_url,
    file_type: document.file_type,
    course_id: document.course_id,
    user_id: document.user_id,
    ai_summary: document.ai_summary,
    download_count: document.download_count,
    view_count: document.view_count,
    status: document.status,
    created_at: document.created_at,
    course: document.course
        ? { id: document.course.id, course_name: document.course.course_name }
        : null,
    uploader: document.uploader
        ? { id: document.uploader.id, username: document.uploader.username }
        : null,
});

module.exports = {
    viewList,
    viewItem,
};