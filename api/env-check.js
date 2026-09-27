import { getGeminiApiKey } from './_utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-gemini-key, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const detectedKey = getGeminiApiKey(req);
  const isConfigured = Boolean(detectedKey);

  // Kiểm tra chi tiết từng biến môi trường
  const sources = {
    GEMINI_API_KEY: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    VITE_GEMINI_API_KEY: Boolean(process.env.VITE_GEMINI_API_KEY),
    GOOGLE_API_KEY: Boolean(process.env.GOOGLE_API_KEY),
    GOOGLE_GENAI_API_KEY: Boolean(process.env.GOOGLE_GENAI_API_KEY),
    API_KEY: Boolean(process.env.API_KEY),
    NEXT_PUBLIC_GEMINI_API_KEY: Boolean(process.env.NEXT_PUBLIC_GEMINI_API_KEY),
    CLIENT_HEADER: Boolean(req.headers['x-gemini-key'] || req.headers['x-api-key']),
  };

  const maskedKey = detectedKey
    ? `${detectedKey.slice(0, 6)}...${detectedKey.slice(-4)} (Độ dài: ${detectedKey.length} ký tự)`
    : null;

  return res.status(200).json({
    status: isConfigured ? 'success' : 'warning',
    geminiApiKeyDetected: isConfigured,
    maskedKey,
    sourcesCheck: sources,
    isVercel: Boolean(process.env.VERCEL),
    timestamp: new Date().toISOString(),
    message: isConfigured
      ? 'Đã nhận diện thành công GEMINI_API_KEY trên môi trường Vercel/Server. Bạn có thể sử dụng đầy đủ các tính năng AI trực tuyến!'
      : 'Vercel chưa nhận diện được GEMINI_API_KEY. Vui lòng thêm biến môi trường trong Vercel Settings -> Environment Variables, sau đó REDEPLOY lại dự án.',
    quickGuide: [
      '1. Truy cập Vercel Dashboard -> Chọn Project của bạn.',
      '2. Chuyển sang tab Settings -> Chọn mục Environment Variables.',
      '3. Thêm Key: GEMINI_API_KEY, Value: <Mã API Key bắt đầu bằng AIza...>',
      '4. Đánh dấu chọn cả 3 môi trường: Production, Preview, Development.',
      '5. QUAN TRỌNG: Chuyển sang tab Deployments -> Bấm vào dấu 3 chấm (...) ở bản deploy mới nhất -> Chọn Redeploy.',
    ],
  });
}
