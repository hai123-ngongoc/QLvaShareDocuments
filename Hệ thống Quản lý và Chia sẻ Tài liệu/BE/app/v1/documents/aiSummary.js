const fs = require('fs');
const { resolveUploadedFilePath } = require('./fileStorage');
const mammoth = require('mammoth');

// Dùng lại đúng cấu hình Gemini như app/v1/chatbot/controller.js
// (đọc GEMINI_API_KEY / GEMINI_MODEL từ .env)
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Giới hạn số ký tự gửi cho AI khi tài liệu là text thuần (docx) để tránh
// tốn quota / vượt giới hạn token của free tier.
const MAX_TEXT_CHARS = 15000;

const SUMMARY_PROMPT = `Bạn là trợ lý tóm tắt tài liệu học tập. Đọc nội dung bên dưới/đính kèm và viết một đoạn tóm tắt 5-8 câu bằng tiếng Việt: chủ đề chính, các khái niệm quan trọng, tài liệu phù hợp với ai. Chỉ trả về đoạn tóm tắt, không lời chào, không giải thích thêm.`;

/**
 * Chuẩn bị "parts" gửi cho Gemini tuỳ theo loại file:
 * - PDF: gửi thẳng file (base64) cho Gemini tự đọc, kể cả PDF scan/ảnh.
 * - DOCX: tách chữ bằng mammoth rồi gửi dạng text (Gemini không đọc trực tiếp .docx).
 * - Các định dạng khác (doc, ppt, pptx, zip): chưa hỗ trợ, báo lỗi rõ ràng.
 */
async function buildParts(document) {
    const filePath = resolveUploadedFilePath(document.file_url);

    if (!filePath || !fs.existsSync(filePath)) {
        throw Object.assign(new Error('Không tìm thấy file trên server'), { status: 404 });
    }

    const ext = (document.file_type || '').toLowerCase();

    if (ext.includes('pdf')) {
        const base64 = fs.readFileSync(filePath).toString('base64');
        return [
            { text: `${SUMMARY_PROMPT}\n\nTiêu đề tài liệu: "${document.title}"` },
            { inline_data: { mime_type: 'application/pdf', data: base64 } },
        ];
    }

    if (ext.includes('docx')) {
        const { value: text } = await mammoth.extractRawText({ path: filePath });
        const trimmed = (text || '').slice(0, MAX_TEXT_CHARS);

        if (!trimmed.trim()) {
            throw Object.assign(new Error('Không trích xuất được nội dung từ file DOCX này'), { status: 400 });
        }

        return [
            { text: `${SUMMARY_PROMPT}\n\nTiêu đề tài liệu: "${document.title}"\n\nNội dung tài liệu:\n${trimmed}` },
        ];
    }

    throw Object.assign(
        new Error(`Chưa hỗ trợ tóm tắt tự động cho định dạng "${ext}". Hiện chỉ hỗ trợ PDF và DOCX.`),
        { status: 400 }
    );
}

/**
 * Gọi Gemini để sinh tóm tắt cho 1 document (Sequelize instance có
 * title / file_url / file_type). Trả về chuỗi tóm tắt, KHÔNG tự lưu DB
 * (việc lưu do controller đảm nhiệm).
 */
async function generateSummary(document) {
    if (!process.env.GEMINI_API_KEY) {
        throw Object.assign(new Error('Server chưa cấu hình GEMINI_API_KEY'), { status: 500 });
    }

    const parts = await buildParts(document);

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 400,
            },
        }),
    });

    if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        console.error('Gemini API error:', errText);
        throw Object.assign(new Error('Lỗi khi gọi AI, thử lại sau'), { status: 502 });
    }

    const data = await geminiRes.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!summary) {
        throw Object.assign(new Error('AI không trả về nội dung tóm tắt'), { status: 502 });
    }

    return summary;
}

module.exports = { generateSummary };
