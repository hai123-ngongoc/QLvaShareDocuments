const { Op } = require('sequelize');
const Document = require('../../../model/documents');
const Course = require('../../../model/courses');
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Bước Retrieval: tìm tài liệu/khóa học liên quan bằng SQL LIKE
 * (Không cần vector DB vì số lượng bản ghi trong hệ thống còn nhỏ)
 */
async function retrieveContext(question) {
  const keywords = question
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (keywords.length === 0) {
    return { documents: [], courses: [] };
  }

  const documents = await Document.findAll({
    where: {
      status: 'approved',
      [Op.or]: keywords.map((kw) => ({
        [Op.or]: [
          { title: { [Op.like]: `%${kw}%` } },
          { description: { [Op.like]: `%${kw}%` } },
        ],
      })),
    },
    limit: 5,
  });

  const courses = await Course.findAll({
    where: {
      [Op.or]: keywords.map((kw) => ({
        [Op.or]: [
          { course_name: { [Op.like]: `%${kw}%` } },
          { description: { [Op.like]: `%${kw}%` } },
        ],
      })),
    },
    limit: 3,
  });

  return { documents, courses };
}

function buildPrompt(question, context) {
  const docText = context.documents
    .map((d) => `- [id:${d.id}] "${d.title}" (${d.file_type}) - ${d.description || 'không có mô tả'}`)
    .join('\n');
  const courseText = context.courses
    .map((c) => `- "${c.course_name}" (${c.course_code}) - ${c.description || ''}`)
    .join('\n');

  return `Bạn là trợ lý AI của website chia sẻ tài liệu học tập. Chỉ trả lời dựa trên dữ liệu bên dưới, không bịa thông tin. Nếu không có dữ liệu phù hợp, hãy nói rõ là chưa tìm thấy. Trả lời ngắn gọn, thân thiện, bằng tiếng Việt.

Tài liệu liên quan:
${docText || '(không tìm thấy tài liệu phù hợp)'}

Khóa học liên quan:
${courseText || '(không tìm thấy khóa học phù hợp)'}

Câu hỏi của người dùng: "${question}"`;
}

exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Thiếu nội dung câu hỏi' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'Server chưa cấu hình GEMINI_API_KEY' });
    }

    const context = await retrieveContext(message);
    const prompt = buildPrompt(message, context);

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API error:', errText);
      return res.status(502).json({ message: 'Lỗi khi gọi AI, thử lại sau' });
    }

    const data = await geminiRes.json();
    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Xin lỗi, mình chưa có câu trả lời cho câu hỏi này.';

    res.status(200).json({
      text: answer,
      documents: context.documents.map((d) => ({
        id: d.id,
        title: d.title,
        fileType: d.file_type,
      })),
    });
  } catch (err) {
    next(err);
  }
};
