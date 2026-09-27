import { GoogleGenerativeAI } from '@google/generative-ai';

const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { resultsSummary } = req.body || {};

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      success: true,
      advice: {
        strengths: ['Nắm chắc các mốc niên đại lớn của lịch sử Việt Nam và thế giới'],
        weaknesses: ['Cần chú ý so sánh các chiến lược chiến tranh và bối cảnh quốc tế'],
        studyPlan: [
          'Vẽ sơ đồ tư duy liên kết các sự kiện từ năm 1945 đến 1975',
          'Luyện thêm 20 câu trắc nghiệm dạng Đúng - Sai mỗi ngày',
        ],
        recommendedTopics: [
          'Chiến tranh giải phóng dân tộc (1945 - 1975)',
          'Trật tự thế giới hai cực I-an-ta',
        ],
        encouragement: 'Bạn đang có nền tảng rất vững chắc. Chỉ cần kiên trì rèn luyện phương pháp loại trừ phương án nhiễu, điểm 9-10 chắc chắn nằm trong tầm tay!',
      },
    });
  }

  const prompt = `Dựa trên kết quả luyện tập Lịch sử của học sinh:
${JSON.stringify(resultsSummary || [])}

Hãy đưa ra lời khuyên ôn tập chiến lược. Trả về đúng định dạng JSON:
{
  "strengths": ["thế mạnh 1", "thế mạnh 2"],
  "weaknesses": ["điểm yếu 1", "điểm yếu 2"],
  "studyPlan": ["bước 1", "bước 2", "bước 3"],
  "recommendedTopics": ["chủ đề 1", "chủ đề 2"],
  "encouragement": "lời động viên"
}`;

  const genAI = new GoogleGenerativeAI(apiKey);
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      if (text) {
        const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(clean);
        return res.status(200).json({ success: true, advice: parsed });
      }
    } catch (e) {
      console.warn(`[Smart Advice] ${modelName} fail:`, e?.message);
    }
  }

  return res.status(200).json({
    success: true,
    advice: {
      strengths: ['Khả năng ghi nhớ dữ liệu lịch sử tốt'],
      weaknesses: ['Cần lưu ý các bẫy câu hỏi dạng đoạn tư liệu'],
      studyPlan: ['Ôn tập theo chuyên đề', 'Làm đề thi thử bấm giờ'],
      recommendedTopics: ['Lịch sử Việt Nam 1954 - 1975'],
      encouragement: 'Cố gắng lên nhé, bạn đang tiến bộ qua từng bài luyện tập!',
    },
  });
}
