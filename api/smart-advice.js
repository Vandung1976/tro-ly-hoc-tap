import { getGeminiApiKey, generateGeminiContent } from './_utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-gemini-key, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { resultsSummary } = req.body || {};

  const apiKey = getGeminiApiKey(req);

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
      isOfflineFallback: true,
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

  try {
    const text = await generateGeminiContent({ apiKey, prompt });
    if (text) {
      const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);
      return res.status(200).json({ success: true, advice: parsed, isOfflineFallback: false });
    }
  } catch (e) {
    console.warn(`[Smart Advice] Gemini API fail:`, e?.message);
  }

  return res.status(200).json({
    success: true,
    advice: {
      strengths: ['Chăm chỉ luyện tập các dạng câu hỏi cơ bản'],
      weaknesses: ['Cần củng cố thêm các sự kiện giai đoạn 1945 - 1954'],
      studyPlan: ['Học theo từ khóa sự kiện', 'Luyện thêm bài tập tự luận'],
      recommendedTopics: ['Lịch sử Việt Nam 1945 - 1975'],
      encouragement: 'Tiếp tục cố gắng mỗi ngày nhé!',
    },
    isOfflineFallback: true,
  });
}
