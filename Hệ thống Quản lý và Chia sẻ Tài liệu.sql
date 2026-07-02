USE QLvaShareDocuments;

-- ===========================
-- USERS
-- ===========================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    avatar TEXT COMMENT 'Link ảnh avatar',
    role ENUM('admin', 'user') DEFAULT 'user' COMMENT 'Quyền truy cập hệ thống',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password, email, avatar, role)
VALUES
('admin', '123456', 'admin@gmail.com', NULL, 'admin'),
('hai', '123456', 'hai@gmail.com', NULL, 'user'),
('ngoc', '123456', 'ngoc@gmail.com', NULL, 'user');

-- ===========================
-- COURSES
-- ===========================
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã học phần',
    course_name VARCHAR(255) NOT NULL COMMENT 'Tên khóa học',
    faculty VARCHAR(255) COMMENT 'Khoa/Ngành phụ trách',
    description TEXT COMMENT 'Mô tả chi tiết khóa học',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO courses (course_code, course_name, faculty, description)
VALUES
('WEB101', 'Lập trình Web', 'CNTT', 'HTML CSS JS'),
('DB101', 'Cơ sở dữ liệu', 'CNTT', 'MySQL'),
('AI101', 'Trí tuệ nhân tạo', 'CNTT', 'Machine Learning');

-- ===========================
-- DOCUMENTS
-- ===========================
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL COMMENT 'Tiêu đề tài liệu',
    description TEXT COMMENT 'Mô tả',
    file_url TEXT NOT NULL COMMENT 'Đường dẫn file',
    file_type VARCHAR(20) COMMENT 'pdf, docx, ppt, zip',

    course_id INT,
    user_id INT,

    ai_summary TEXT COMMENT 'Tóm tắt bằng AI',

    download_count INT DEFAULT 0,
    view_count INT DEFAULT 0,

    status ENUM('pending','approved','rejected')
        DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_document_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_document_course
        FOREIGN KEY(course_id)
        REFERENCES courses(id)
        ON DELETE SET NULL
);

INSERT INTO documents
(title, description, file_url, file_type, course_id, user_id, ai_summary, download_count, view_count, status)
VALUES
(
'NodeJS cơ bản',
'Tài liệu học NodeJS',
'https://example.com/nodejs.pdf',
'pdf',
1,
1,
'AI tóm tắt NodeJS',
10,
25,
'approved'
),

(
'MySQL nâng cao',
'Tài liệu SQL',
'https://example.com/mysql.pdf',
'pdf',
2,
2,
'AI tóm tắt MySQL',
5,
18,
'approved'
),

(
'AI Fundamentals',
'Tài liệu AI',
'https://example.com/ai.pdf',
'pdf',
3,
3,
'AI tóm tắt AI',
0,
4,
'pending'
);

-- ===========================
-- RATINGS
-- ===========================
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,
    document_id INT NOT NULL,

    rating TINYINT NOT NULL,
    comment TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_rating_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_rating_document
        FOREIGN KEY(document_id)
        REFERENCES documents(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_rating
        UNIQUE(user_id, document_id)
);

-- ===========================
-- FAVORITES
-- ===========================
CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,
    document_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_favorite_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_favorite_document
        FOREIGN KEY(document_id)
        REFERENCES documents(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_favorite
        UNIQUE(user_id, document_id)
);

-- ===========================
-- DOWNLOADS
-- ===========================
CREATE TABLE downloads (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT,
    document_id INT NOT NULL,

    download_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_download_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_download_document
        FOREIGN KEY(document_id)
        REFERENCES documents(id)
        ON DELETE CASCADE
);

-- ===========================
-- AI RELATED DOCUMENTS
-- ===========================
CREATE TABLE ai_related_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,

    document_id INT NOT NULL,
    related_document_id INT NOT NULL,

    similarity_score FLOAT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ai_document
        FOREIGN KEY(document_id)
        REFERENCES documents(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ai_related_document
        FOREIGN KEY(related_document_id)
        REFERENCES documents(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_ai_related
        UNIQUE(document_id, related_document_id)
);
