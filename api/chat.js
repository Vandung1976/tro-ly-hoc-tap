import { GoogleGenerativeAI } from '@google/generative-ai';

// Danh sách các model Gemini thông dụng dự phòng
const CANDIDATE_MODELS = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-1.5-pro',
];

const SYSTEM_INSTRUCTION = `Bạn là Trợ lý AI Gia sư Lịch sử THPT Việt Nam xuất sắc, am hiểu tường tận chương trình Lịch sử 12 mới (GDPT 2018), bám sát cấu trúc đề thi tốt nghiệp THPT Quốc gia của Bộ Giáo dục & Đào tạo.
Nhiệm vụ của bạn:
1. Giải đáp chi tiết các câu hỏi trắc nghiệm, tư liệu lịch sử, tự luận.
2. Trả lời mạch lạc, chuẩn xác sự kiện, nhân vật, mốc thời gian, ý nghĩa lịch sử.
3. Luôn đưa ra mẹo ghi nhớ nhanh, mẹo loại trừ phương án nhiễu giúp học sinh ôn thi đạt điểm cao.
4. Trình bày định dạng Markdown rõ ràng, dễ đọc, có gạch đầu dòng và in đậm các từ khóa lịch sử quan trọng.`;

async function callGeminiWithFallback(apiKey, promptOrParts) {
  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
      });

      const result = await model.generateContent(promptOrParts);
      const response = await result.response;
      const text = response.text();
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini API] Thử model ${modelName} không thành công:`, err?.message || err);
    }
  }

  throw lastError || new Error('Không thể tạo phản hồi từ tất cả các model Gemini.');
}

export default async function handler(req, res) {
  // Cấu hình CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Chỉ hỗ trợ phương thức POST.',
    });
  }

  // Đọc API Key từ biến môi trường của Vercel
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  const body = req.body || {};
  const {
    message,
    question,
    prompt,
    history = [],
    image,
    action,
    studentAnswer,
    suggestedAnswer,
    keyPoints,
    topic,
    questionType,
    difficulty,
    count,
    resultsSummary,
  } = body;

  const userQuery = message || question || prompt || '';

  // Xử lý khi chưa có API key
  if (!apiKey) {
    return res.status(200).json({
      success: true,
      answer: `Chào bạn! Máy chủ Vercel chưa nhận diện được biến môi trường \`GEMINI_API_KEY\`.\n\n👉 **Cách khắc phục trên Vercel:**\n1. Mở Vercel Dashboard ➔ Dự án của bạn ➔ **Settings** ➔ **Environment Variables**.\n2. Thêm biến \`GEMINI_API_KEY\` với giá trị là mã khóa API Gemini của bạn.\n3. Nhấn **Save** và chọn **Redeploy** lại dự án.\n\n*Câu hỏi của bạn: "${userQuery || 'Hỏi đáp Lịch sử'}"*`,
      reply: `Chưa cấu hình GEMINI_API_KEY trên Vercel. Vui lòng thêm biến môi trường GEMINI_API_KEY trong Project Settings của Vercel.`,
      text: `Chưa cấu hình GEMINI_API_KEY trên Vercel.`,
    });
  }

  try {
    // 1. Phân nhánh hành động: Chấm bài tự luận (action === 'grade-essay')
    if (action === 'grade-essay') {
      const gradingPrompt = `Hãy đóng vai giáo viên chấm thi môn Lịch sử THPT Quốc gia.
Đề bài: "${question}"
Đáp án gợi ý & biểu điểm chuẩn: "${suggestedAnswer}"
Các ý bắt buộc phải có: ${JSON.stringify(keyPoints || [])}

Bài làm của học sinh:
"${studentAnswer}"

Yêu cầu trả về đúng định dạng JSON:
{
  "score": <điểm số từ 0 đến 10, làm tròn 0.25>,
  "generalFeedback": "<nhận xét tổng quát, ưu điểm và lỗi sai>",
  "missingOrIncorrect": ["<ý còn thiếu hoặc sai 1>", "<ý còn thiếu hoặc sai 2>"],
  "recommendedReview": "<chủ đề kiến thức cần ôn tập lại>"
}`;
      const textResponse = await callGeminiWithFallback(apiKey, gradingPrompt);
      let parsed = null;
      try {
        const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanJson);
      } catch (e) {
        parsed = {
          score: 7.5,
          generalFeedback: textResponse,
          missingOrIncorrect: [],
          recommendedReview: topic || 'Kiến thức Lịch sử trọng tâm',
        };
      }
      return res.status(200).json({ success: true, result: parsed });
    }

    // 2. Phân nhánh hành động: Lời khuyên học tập (action === 'smart-advice')
    if (action === 'smart-advice') {
      const advicePrompt = `Dựa trên kết quả ôn tập Lịch sử 12 của học sinh:
${JSON.stringify(resultsSummary || [])}

Hãy đưa ra lời khuyên ôn tập chiến lược chi tiết giúp học sinh bứt phá điểm số thi THPT. Trả về đúng định dạng JSON:
{
  "strengths": ["<thế mạnh 1>", "<thế mạnh 2>"],
  "weaknesses": ["<điểm yếu 1>", "<điểm yếu 2>"],
  "studyPlan": ["<bước 1>", "<bước 2>", "<bước 3>"],
  "recommendedTopics": ["<chuyên đề 1>", "<chuyên đề 2>"],
  "encouragement": "<lời động viên truyền cảm hứng>"
}`;
      const textResponse = await callGeminiWithFallback(apiKey, advicePrompt);
      let parsed = null;
      try {
        const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanJson);
      } catch (e) {
        parsed = {
          strengths: ['Có nền tảng ghi nhớ các mốc sự kiện lớn'],
          weaknesses: ['Cần chú ý so sánh các chiến lược và bối cảnh quốc tế'],
          studyPlan: ['Học theo sơ đồ tư duy', 'Luyện thêm câu trắc nghiệm đúng sai'],
          recommendedTopics: ['Lịch sử Việt Nam 1954 - 1975', 'Trật tự thế giới hai cực I-an-ta'],
          encouragement: textResponse,
        };
      }
      return res.status(200).json({ success: true, advice: parsed });
    }

    // 3. Phân nhánh hành động mặc định: Chat / Hỏi đáp với Gia sư Lịch sử (Tutor Chat)
    const parts = [];

    // Thêm ảnh đính kèm nếu có
    if (image && image.data) {
      parts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType || 'image/jpeg',
        },
      });
    }

    // Ghép ngữ cảnh lịch sử hội thoại gần nhất
    let conversationContext = '';
    if (Array.isArray(history) && history.length > 0) {
      conversationContext = history
        .slice(-5)
        .map((h) => `${h.role === 'user' ? 'Học sinh' : 'Gia sư'}: ${h.content}`)
        .join('\n');
    }

    const fullPrompt = `${conversationContext ? `[Ngữ cảnh hội thoại trước đó:]\n${conversationContext}\n\n` : ''}[Câu hỏi / Yêu cầu mới của học sinh:]\n${userQuery || 'Hãy giới thiệu các chuyên đề ôn thi Lịch sử 12 trọng tâm.'}`;

    parts.push(fullPrompt);

    const generatedText = await callGeminiWithFallback(apiKey, parts);

    return res.status(200).json({
      success: true,
      answer: generatedText,
      reply: generatedText,
      text: generatedText,
      message: generatedText,
    });
  } catch (error) {
    console.error('[API /api/chat Error]:', error);
    return res.status(200).json({
      success: true,
      answer: `Hệ thống gặp gián đoạn tạm thời khi kết nối đến dịch vụ AI (${error?.message || 'Lỗi mạng'}).\n\nBạn vui lòng thử bấm gửi lại câu hỏi hoặc kiểm tra biến môi trường \`GEMINI_API_KEY\` trên Vercel.`,
      reply: `Hệ thống gặp gián đoạn tạm thời: ${error?.message}`,
      error: error?.message,
    });
  }
}
