const viewList = (res, documents) => {
    res.status(200).json({
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
        })),
    });
};

const viewItem = (res, document) => {
    res.json({
        id: document.id,
        title: document.title,
        description: document.description,
        course_id: document.course_id,
        user_id: document.user_id,
        ai_summary: document.ai_summary,
        download_count: document.download_count,
        view_count: document.view_count,
        status: document.status,
        created_at: document.created_at,
    });
};

module.exports = {
    viewList,
    viewItem,
};