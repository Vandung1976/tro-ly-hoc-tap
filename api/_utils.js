import { GoogleGenAI } from '@google/genai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

/**
 * Trích xuất và chuẩn hóa Gemini API Key từ mọi nguồn có thể:
 * - Request headers (x-gemini-key, x-api-key, authorization)
 * - Request body (apiKey)
 * - Các biến môi trường Vercel phổ biến (GEMINI_API_KEY, GOOGLE_API_KEY, VITE_GEMINI_API_KEY,...)
 */
export function getGeminiApiKey(req) {
  const sources = [
    req?.headers?.['x-gemini-key'],
    req?.headers?.['x-api-key'],
    req?.headers?.authorization?.replace(/^Bearer\s+/i, ''),
    req?.body?.apiKey,
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.GOOGLE_GENAI_API_KEY,
    process.env.VITE_GEMINI_API_KEY,
    process.env.VITE_GOOGLE_API_KEY,
    process.env.API_KEY,
    process.env.VITE_API_KEY,
    process.env.GEMINI_KEY,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  ];

  for (const item of sources) {
    if (typeof item === 'string') {
      const clean = item.trim().replace(/^["']|["']$/g, '');
      if (
        clean.length > 5 &&
        clean !== 'MY_GEMINI_API_KEY' &&
        clean !== 'undefined' &&
        clean !== 'null'
      ) {
        return clean;
      }
    }
  }

  return null;
}

/**
 * Gọi Gemini bằng @google/genai (chuẩn hiện hành) kèm cơ chế dự phòng @google/generative-ai
 */
export async function generateGeminiContent({
  apiKey,
  prompt,
  parts,
  systemInstruction,
  responseSchema,
  responseMimeType,
}) {
  if (!apiKey) {
    throw new Error('Chưa cung cấp GEMINI_API_KEY.');
  }

  let lastError = null;

  // 1. Thử dùng @google/genai SDK chính thức
  try {
    const ai = new GoogleGenAI({ apiKey });

    for (const model of CANDIDATE_MODELS) {
      try {
        const config = {};
        if (systemInstruction) config.systemInstruction = systemInstruction;
        if (responseMimeType) config.responseMimeType = responseMimeType;
        if (responseSchema) config.responseSchema = responseSchema;

        let contents;
        if (parts && Array.isArray(parts)) {
          contents = [{ role: 'user', parts }];
        } else {
          contents = prompt;
        }

        const response = await ai.models.generateContent({
          model,
          contents,
          config: Object.keys(config).length > 0 ? config : undefined,
        });

        if (response && response.text) {
          return response.text;
        }
      } catch (modelErr) {
        lastError = modelErr;
        console.warn(`[@google/genai - ${model}] Lỗi:`, modelErr?.message || modelErr);
      }
    }
  } catch (sdkErr) {
    lastError = sdkErr;
    console.warn('[@google/genai SDK Khởi tạo lỗi]:', sdkErr?.message || sdkErr);
  }

  // 2. Dự phòng bằng @google/generative-ai SDK nếu SDK 1 gặp lỗi
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const legacyModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

    for (const modelName of legacyModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        });

        let payload;
        if (parts && Array.isArray(parts)) {
          payload = parts.map((p) => {
            if (p.inlineData) {
              return {
                inlineData: {
                  data: p.inlineData.data,
                  mimeType: p.inlineData.mimeType,
                },
              };
            }
            return p.text || p;
          });
        } else {
          payload = prompt;
        }

        const result = await model.generateContent(payload);
        const res = await result.response;
        const text = res.text();
        if (text && text.trim().length > 0) {
          return text;
        }
      } catch (legacyErr) {
        lastError = legacyErr;
        console.warn(`[@google/generative-ai - ${modelName}] Lỗi:`, legacyErr?.message || legacyErr);
      }
    }
  } catch (legacySdkErr) {
    lastError = legacySdkErr;
  }

  throw lastError || new Error('Không thể kết nối tới các mô hình AI Gemini.');
}
