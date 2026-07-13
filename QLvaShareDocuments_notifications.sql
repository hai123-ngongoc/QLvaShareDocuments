USE QLvaShareDocuments;

-- ===========================
-- NOTIFICATIONS
-- ===========================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'Người nhận thông báo (chủ tài liệu)',
    document_id INT COMMENT 'Tài liệu liên quan',
    type ENUM('approved','rejected','commented','hidden','deleted') NOT NULL COMMENT 'Loại thông báo',
    message TEXT NOT NULL COMMENT 'Nội dung thông báo',
    is_read TINYINT(1) DEFAULT 0 COMMENT '0: chưa đọc, 1: đã đọc',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notification_document
        FOREIGN KEY(document_id)
        REFERENCES documents(id)
        ON DELETE SET NULL
);
