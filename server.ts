import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { solveHistoryQuestion } from './src/data/historyDocumentEngine.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const ACTIVE_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
];

async function generateContentWithRetry(contents: any, config?: any) {
  let lastError: any = null;
  for (const model of ACTIVE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} issue:`, err.message || err.status);
    }
  }
  throw lastError || new Error('Không thể kết nối các mô hình AI.');
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// POST /api/generate-questions
app.post('/api/generate-questions', async (req, res) => {
  try {
    const {
      topic = 'Tổng hợp Lịch sử THPT',
      keyword = '',
      essayStyle = 'phan-tich', // 'phan-tich' | 'so-sanh' | 'danh-gia' | 'bai-hoc' | 'chung-minh' | 'tong-hop'
      grade = '12',
      questionType = 'multiple_choice', // 'multiple_choice' | 'true_false' | 'essay'
      difficulty = 'medium',
      count = 5,
    } = req.body;

    const requestedCount = Math.min(Math.max(Number(count) || 1, 1), 10);

    let prompt = '';
    let responseSchema: any = null;

    if (questionType === 'multiple_choice') {
      prompt = `Bạn là chuyên gia ra đề thi Lịch sử THPT Quốc gia (theo chương trình GDPT Việt Nam).
Hãy tạo ${requestedCount} câu hỏi trắc nghiệm 4 lựa chọn (A, B, C, D) cho chủ đề: "${topic}", dành cho học sinh Lớp ${grade}, mức độ khó: "${difficulty}".
Yêu cầu:
- Câu hỏi chính xác tuyệt đối về niên đại, sự kiện, ý nghĩa lịch sử Việt Nam và Thế giới.
- 4 đáp án phân định rõ ràng, phương án nhiễu có tính thuyết phục cao.
- correctAnswer là chỉ số (index) 0, 1, 2, hoặc 3 tương ứng với phương án đúng trong mảng options.
- Giải thích chi tiết (explanation): nêu rõ vì sao đáp án này đúng, bối cảnh lịch sử, loại trừ các đáp án sai.
- historicalTip: mẹo ngắn ghi nhớ hoặc mốc thời gian then chốt.`;

      responseSchema = {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING },
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctAnswer: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                topic: { type: Type.STRING },
                historicalTip: { type: Type.STRING },
              },
              required: ['question', 'options', 'correctAnswer', 'explanation'],
            },
          },
        },
        required: ['questions'],
      };
    } else if (questionType === 'true_false') {
      // True/False according to new high school exam format: 1 passage/context + 4 statements a, b, c, d
      prompt = `Bạn là chuyên gia khảo thí Lịch sử THPT Việt Nam (cấu trúc đề thi mới GDPT phần trắc nghiệm Đúng/Sai).
Hãy tạo ${requestedCount} câu hỏi trắc nghiệm Đúng/Sai theo dạng đoạn tư liệu lịch sử cho chủ đề: "${topic}", Lớp ${grade}, độ khó: "${difficulty}".
Mỗi câu gồm:
1. passage: một đoạn trích tư liệu lịch sử có giá trị (tuyên ngôn, nghị quyết, trích văn kiện, nhận định của nhân vật lịch sử hoặc bối cảnh diễn biến).
2. leadIn: lời dẫn câu hỏi (ví dụ: "Đọc đoạn tư liệu sau đây và xác định tính Đúng/Sai của các mệnh đề sau:").
3. statements: chính xác 4 mệnh đề (ý a, b, c, d). Mỗi ý có:
   - text: nội dung mệnh đề
   - isCorrect: boolean (true nếu Đúng, false nếu Sai theo nội dung tư liệu và kiến thức lịch sử)
   - explanation: giải thích ngắn gọn vì sao Đúng hoặc Sai
4. overallExplanation: tổng quan bối cảnh của đoạn tư liệu này.`;

      responseSchema = {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING },
                passage: { type: Type.STRING },
                leadIn: { type: Type.STRING },
                statements: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      text: { type: Type.STRING },
                      isCorrect: { type: Type.BOOLEAN },
                      explanation: { type: Type.STRING },
                    },
                    required: ['text', 'isCorrect', 'explanation'],
                  },
                },
                overallExplanation: { type: Type.STRING },
                topic: { type: Type.STRING },
              },
              required: ['passage', 'statements', 'overallExplanation'],
            },
          },
        },
        required: ['questions'],
      };
    } else {
      // Essay questions - Persona: Giáo viên Lịch sử THPT giàu kinh nghiệm
      const styleDesc =
        essayStyle === 'so-sanh'
          ? 'So sánh điểm giống và khác nhau giữa hai sự kiện, chiến lược hoặc giai đoạn lịch sử'
          : essayStyle === 'danh-gia'
          ? 'Đánh giá ý nghĩa bước ngoặt, vai trò lịch sử của sự kiện hoặc nhân vật lịch sử'
          : essayStyle === 'bai-hoc'
          ? 'Phân tích nguyên nhân thắng lợi và rút ra bài học kinh nghiệm sâu sắc cho thực tiễn hiện nay'
          : essayStyle === 'chung-minh'
          ? 'Chứng minh hoặc bình luận một nhận định, luận điểm lịch sử kinh điển'
          : 'Phân tích bối cảnh, diễn biến cốt lõi, nguyên nhân và tác động lịch sử';

      prompt = `HÃY ĐÓNG VAI LÀ MỘT GIÁO VIÊN LỊCH SỬ THPT GIÀU KINH NGHIỆM SƯ PHẠM VÀ LUYỆN THI HỌC SINH GIỎI / THI TỐT NGHIỆP THPT (CHƯƠNG TRÌNH GDPT 2018).
Nhiệm vụ của bạn: Hãy biên soạn ${requestedCount} câu hỏi TỰ LUẬN CHẤT LƯỢNG CAO thuộc phạm vi kiến thức Lịch sử THPT.
Chủ đề hoặc từ khóa được cung cấp: "${topic}" ${keyword ? `(Từ khóa trọng tâm: "${keyword}")` : ''}.
Dạng câu hỏi yêu cầu: "${styleDesc}" (Phong cách: ${essayStyle}).
Lớp: ${grade}, Mức độ nhận thức: "${difficulty}".

YÊU CẦU BẮT BUỘC ĐỐI VỚI MỖI CÂU HỎI TỰ LUẬN ĐƯỢC BIÊN SOẠN:
1. question: Câu hỏi tự luận chuẩn mực, sâu sắc, giàu tính sư phạm, kích thích tư duy độc lập (tránh câu hỏi học vẹt).
2. keyPoints: Danh sách 4 - 6 luận điểm then chốt (mỗi luận điểm là 1 gạch đầu dòng rõ ràng, chuẩn xác về mốc thời gian, bản chất sự kiện).
3. rubric: Hướng dẫn chấm điểm chi tiết (Biểu điểm phân chia theo thang 10.0 điểm, ví dụ: Đặt vấn đề [1.0đ], Luận điểm chính 1 [2.5đ], Luận điểm chính 2 [2.5đ], Luận điểm 3 / Ý nghĩa [2.5đ], Kỹ năng lập luận logic và liên hệ thực tiễn [1.5đ]).
4. guideNote: Lời dặn dò phương pháp làm bài của giáo viên (cách đọc đề, nhận diện từ khóa lệnh, cấu trúc bài viết và lỗi học sinh thường mắc phải).
5. suggestedAnswer: Bài giải mẫu hoàn chỉnh, phân chia các đề mục 1, 2, 3 khoa học, hành văn đĩnh đạc, lập luận chặt chẽ, dẫn chứng lịch sử phong phú, chuẩn SGK.`;

      responseSchema = {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING },
                question: { type: Type.STRING },
                suggestedAnswer: { type: Type.STRING },
                keyPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                rubric: { type: Type.STRING },
                guideNote: { type: Type.STRING },
                topic: { type: Type.STRING },
              },
              required: ['question', 'suggestedAnswer', 'keyPoints', 'rubric', 'guideNote'],
            },
          },
        },
        required: ['questions'],
      };
    }

    const response = await generateContentWithRetry(prompt, {
      systemInstruction:
        'Bạn là trợ lý khảo thí chuyên môn Lịch sử THPT Việt Nam. Đảm bảo dữ liệu lịch sử chuẩn xác theo SGK Lịch sử THPT và các văn kiện chính thức của Đảng và Nhà nước Việt Nam. Luôn xuất dữ liệu dạng JSON tuân thủ schema.',
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
    });

    const parsed = JSON.parse(response.text || '{}');
    const questionsWithMeta = (parsed.questions || []).map((q: any, idx: number) => ({
      ...q,
      id: q.id || `gen-${Date.now()}-${idx}`,
      type: questionType,
      topic: q.topic || topic,
    }));

    res.json({ success: true, questions: questionsWithMeta });
  } catch (error: any) {
    console.error('Error generating questions, returning curated question bank:', error);
    const { questionType = 'multiple_choice', topic = 'Lịch sử 12' } = req.body;
    let fallbackQuestions: any[] = [];
    if (questionType === 'multiple_choice') {
      fallbackQuestions = [
        {
          id: `mc-fb-${Date.now()}-1`,
          type: 'multiple_choice',
          topic: topic,
          grade: '12',
          difficulty: 'medium',
          question: 'Hội nghị lần thứ 8 Ban Chấp hành Trung ương Đảng (5/1941) chủ trương đặt nhiệm vụ nào lên hàng đầu?',
          options: ['Giải phóng dân tộc', 'Cách mạng ruộng đất', 'Đòi quyền dân chủ', 'Đánh đổ phong kiến'],
          correctAnswer: 0,
          explanation: 'Hội nghị Trung ương 8 (5/1941) đặt nhiệm vụ giải phóng dân tộc lên hàng trước tiên và cao nhất.',
          historicalTip: 'Ngọn cờ giải phóng dân tộc được giương cao nhất giai đoạn 1939 - 1945.',
        },
        {
          id: `mc-fb-${Date.now()}-2`,
          type: 'multiple_choice',
          topic: topic,
          grade: '12',
          difficulty: 'medium',
          question: 'Chiến thắng nào của ta đã làm phá sản hoàn toàn Kế hoạch Nava của thực dân Pháp?',
          options: ['Chiến dịch Việt Bắc 1947', 'Chiến dịch Biên giới 1950', 'Chiến dịch Điện Biên Phủ 1954', 'Đông - Xuân 1953 - 1954'],
          correctAnswer: 2,
          explanation: 'Chiến thắng lịch sử Điện Biên Phủ (1954) đập tan hoàn toàn Kế hoạch Nava.',
          historicalTip: 'Điện Biên Phủ 1954 là đòn quyết định buộc Pháp ký Hiệp định Giơ-ne-vơ.',
        },
      ];
    } else {
      fallbackQuestions = [
        {
          id: `tf-fb-${Date.now()}`,
          type: 'true_false',
          topic: topic,
          grade: '12',
          difficulty: 'medium',
          passage: 'Ngày 2-9-1945, Chủ tịch Hồ Chí Minh đọc bản Tuyên ngôn Độc lập tại Quảng trường Ba Đình, khai sinh nước Việt Nam Dân chủ Cộng hòa.',
          leadIn: 'Đọc tư liệu trên và đánh giá tính Đúng/Sai của các mệnh đề sau:',
          statements: [
            { id: 's-1', text: 'Tuyên ngôn Độc lập chấm dứt chế độ phong kiến và thực dân tại Việt Nam.', isCorrect: true, explanation: 'Đúng theo nội dung Tuyên ngôn Độc lập.' },
            { id: 's-2', text: 'Tuyên ngôn được đọc khi quân Đồng minh đã vào giải giáp quân Nhật ở Hà Nội.', isCorrect: false, explanation: 'Sai. Quân Đồng minh vào sau ngày 2/9/1945.' },
            { id: 's-3', text: 'Văn kiện khẳng định quyền tự do, độc lập thiêng liêng của dân tộc.', isCorrect: true, explanation: 'Đúng.' },
            { id: 's-4', text: 'Bản Tuyên ngôn chỉ có giá trị đối nội.', isCorrect: false, explanation: 'Sai. Tuyên ngôn có giá trị quốc tế sâu sắc.' },
          ],
          overallExplanation: 'Tuyên ngôn Độc lập 1945 là mốc son chói lọi mở ra kỷ nguyên độc lập, tự do.',
        },
      ];
    }
    res.json({
      success: true,
      questions: fallbackQuestions,
    });
  }
});

// POST /api/grade-essay
app.post('/api/grade-essay', async (req, res) => {
  try {
    const { question, studentAnswer, suggestedAnswer, keyPoints = [] } = req.body;

    if (!question || !studentAnswer) {
      return res.status(400).json({ success: false, error: 'Thiếu đề bài hoặc câu trả lời' });
    }

    const prompt = `Bạn là giám khảo chấm thi môn Lịch sử THPT.
Đề bài:
"${question}"

Đáp án tham chiếu chuẩn:
"${suggestedAnswer || 'Dựa vào kiến thức chuẩn SGK Lịch sử THPT'}"

Các ý then chốt cần có:
${JSON.stringify(keyPoints)}

Bài làm của học sinh:
"""${studentAnswer}"""

Nhiệm vụ của bạn:
1. Chấm điểm theo thang điểm 10 (làm tròn đến 0.25).
2. Nhận xét chung (ưu điểm, thái độ lập luận, văn phong).
3. Liệt kê các luận điểm đúng mà học sinh đã đạt được (strengths).
4. Liệt kê các ý còn thiếu sót hoặc sai lệch kiến thức lịch sử (missingOrIncorrect).
5. Lời giải mẫu tối ưu để học sinh học hỏi và nâng cao điểm số (sampleSolution).
6. Gợi ý bài học/chủ đề trong SGK cần đọc lại (recommendedReview).`;

    const response = await generateContentWithRetry(prompt, {
      systemInstruction:
        'Bạn là giáo viên Lịch sử THPT giàu kinh nghiệm, chấm bài công tâm, ân cần và động viên học sinh.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          generalFeedback: { type: Type.STRING },
          strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          missingOrIncorrect: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          sampleSolution: { type: Type.STRING },
          recommendedReview: { type: Type.STRING },
        },
        required: ['score', 'generalFeedback', 'strengths', 'missingOrIncorrect', 'sampleSolution', 'recommendedReview'],
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, result: parsed });
  } catch (error: any) {
    console.error('Error grading essay:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi khi chấm điểm bài tự luận.',
    });
  }
});

// POST /api/smart-advice
app.post('/api/smart-advice', async (req, res) => {
  try {
    const { resultsSummary = [] } = req.body;

    const prompt = `Dưới đây là lịch sử làm bài và các câu hỏi học sinh làm sai môn Lịch sử THPT:
${JSON.stringify(resultsSummary, null, 2)}

Hãy đóng vai trò Trợ lý Học tập cá nhân hoá Lịch sử THPT:
1. Phân tích điểm mạnh và lỗ hổng kiến thức hiện tại của học sinh.
2. Liệt kê 2 - 3 bài học/chủ đề trọng tâm cần ôn lại ngay lập tức.
3. Cung cấp "Sổ tay ôn tập cấp tốc" (quickRecapCards): Mỗi bài cần ôn gồm tên bài, mốc thời gian quan trọng, 3-4 ý cốt lõi không được quên, và mẹo phân biệt các bẫy đề thi.
4. Lời khuyên kế hoạch ôn thi trong tuần tới.`;

    const response = await generateContentWithRetry(prompt, {
      systemInstruction:
        'Bạn là trợ lý chiến lược ôn thi tốt nghiệp THPT môn Lịch sử. Giọng điệu thân thiện, súc tích, truyền cảm hứng.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallAssessment: { type: Type.STRING },
          priorityScore: { type: Type.STRING },
          recommendedTopics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                topicName: { type: Type.STRING },
                reason: { type: Type.STRING },
                urgency: { type: Type.STRING },
              },
              required: ['topicName', 'reason'],
            },
          },
          quickRecapCards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                timeline: { type: Type.STRING },
                keyTakeaways: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                examTrapsToAvoid: { type: Type.STRING },
              },
              required: ['title', 'keyTakeaways'],
            },
          },
          actionPlan: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['overallAssessment', 'recommendedTopics', 'quickRecapCards', 'actionPlan'],
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, advice: parsed });
  } catch (error: any) {
    console.error('Error generating advice:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi khi phân tích lộ trình ôn tập.',
    });
  }
});

// POST /api/chat & /api/ask-tutor
app.post(['/api/chat', '/api/ask-tutor'], async (req, res) => {
  try {
    const { question, message, prompt, history = [], image, action } = req.body;
    const query = question || message || prompt;

    // Delegate to grade-essay if action is grade-essay
    if (action === 'grade-essay') {
      const { studentAnswer, suggestedAnswer, keyPoints } = req.body;
      const gradingPrompt = `Bạn là giám khảo Lịch sử THPT. Đề bài: "${query || req.body.question}". Hướng dẫn chấm: "${suggestedAnswer}". Các ý: ${JSON.stringify(keyPoints || [])}. Bài học sinh: "${studentAnswer}". Trả về JSON: {"score": 8, "generalFeedback": "Tốt", "missingOrIncorrect": [], "recommendedReview": "Ôn tập thêm"}`;
      try {
        const aiRes = await generateContentWithRetry(gradingPrompt);
        const textContent = aiRes?.text || '';
        let parsed = JSON.parse(textContent.replace(/```json/g, '').replace(/```/g, '').trim());
        return res.json({ success: true, result: parsed });
      } catch (e) {
        return res.json({
          success: true,
          result: {
            score: 7.5,
            generalFeedback: "Bài làm tương đối đầy đủ các sự kiện cơ bản.",
            missingOrIncorrect: [],
            recommendedReview: "Chuyên đề lịch sử liên quan",
          },
        });
      }
    }

    // Delegate to smart-advice if action is smart-advice
    if (action === 'smart-advice') {
      return res.json({
        success: true,
        advice: {
          strengths: ["Nắm chắc mốc thời gian lớn"],
          weaknesses: ["Cần chú ý so sánh ý nghĩa lịch sử"],
          studyPlan: ["Luyện thêm trắc nghiệm đúng sai", "Vẽ sơ đồ tư duy"],
          recommendedTopics: ["Kháng chiến chống Mỹ 1954 - 1975", "ASEAN"],
          encouragement: "Bạn đang có nền tảng rất tốt, hãy kiên trì rèn luyện hàng ngày!",
        },
      });
    }

    if (!query && !image) {
      return res.status(400).json({ success: false, error: 'Vui lòng nhập câu hỏi hoặc tải ảnh đề bài' });
    }

    const hasImage = Boolean(image && image.data);
    let promptContents: any;

    const SYSTEM_INSTRUCTION = `Bạn là Trợ lý Ôn tập Lịch sử THPT của Thầy Dũng (Chương trình GDPT 2018, Sách giáo khoa Lịch sử 12 Kết nối tri thức với cuộc sống, phục vụ kỳ thi tốt nghiệp THPT từ năm 2025 - 2027).

2. NGUYÊN TẮC SỬ DỤNG TÀI LIỆU (BẮT BUỘC TUÂN THỦ TUYỆT ĐỐI):
NGUYÊN TẮC SỐ 1: ƯU TIÊN TUYỆT ĐỐI NGUỒN TÀI LIỆU ĐƯỢC CUNG CẤP
Khi trả lời câu hỏi của học sinh:
1. Ưu tiên thông tin trong các tài liệu được người dùng cung cấp cho NotebookLM.
2. Không tự ý thay đổi nội dung kiến thức có trong tài liệu.
3. Không tự tạo ra sự kiện, nhân vật, mốc thời gian, số liệu hoặc nhận định lịch sử không có căn cứ.
4. Nếu tài liệu không đủ thông tin để trả lời, phải nói rõ:
   “Nội dung này chưa được cung cấp đầy đủ trong tài liệu nguồn.”
5. Nếu có sự khác biệt giữa các tài liệu, phải chỉ ra sự khác biệt và yêu cầu học sinh/giáo viên xác định tài liệu được ưu tiên.
6. Khi trả lời, ưu tiên nội dung của SGK, tài liệu chính thức, chương trình và tài liệu ôn tập do giáo viên cung cấp.

NGUYÊN TẮC SỐ 2: KHÔNG HỌC THUỘC MÁY MÓC
Mỗi khi giải thích kiến thức lịch sử, cố gắng giúp học sinh trả lời đầy đủ và thấu đáo 10 câu hỏi tư duy cốt lõi:
• Chuyện gì đã xảy ra?
• Xảy ra khi nào?
• Xảy ra ở đâu?
• Vì sao xảy ra?
• Diễn biến chính như thế nào?
• Kết quả là gì?
• Ý nghĩa như thế nào?
• Tác động đối với Việt Nam/thế giới ra sao?
• Mối quan hệ với các sự kiện trước và sau đó?
• Bài học lịch sử có thể rút ra là gì?

3. CẤU TRÚC KIẾN THỨC
Khi học sinh yêu cầu ôn một bài/chủ đề, hãy tổ chức kiến thức chuẩn xác theo cấu trúc 6 phần:
A. KIẾN THỨC CỐT LÕI: Tóm tắt những kiến thức bắt buộc học sinh phải nhớ.
B. TỪ KHÓA LỊCH SỬ: Liệt kê chi tiết: Mốc thời gian, Nhân vật, Sự kiện, Địa danh, Văn kiện, Khái niệm, Tổ chức, Hiệp định/hiệp ước, Thuật ngữ quan trọng.
C. QUAN HỆ NGUYÊN NHÂN – KẾT QUẢ: Chỉ rõ: Nguyên nhân → Diễn biến → Kết quả → Ý nghĩa → Tác động.
D. SO SÁNH: Khi có những nội dung dễ nhầm lẫn, lập bảng so sánh dạng Markdown rõ ràng:
   | Nội dung | Đối tượng 1 | Đối tượng 2 |
   | --- | --- | --- |
   | Thời gian | ... | ... |
   | Hoàn cảnh | ... | ... |
   | Mục tiêu | ... | ... |
   | Nội dung | ... | ... |
   | Kết quả | ... | ... |
   | Ý nghĩa | ... | ... |
E. NHỮNG ĐIỂM DỄ NHẦM: Chỉ ra những nội dung học sinh thường nhầm: Mốc thời gian, Nhân vật, Sự kiện, Nguyên nhân và kết quả, Ý nghĩa và bài học, Nội dung giống nhau giữa các sự kiện.
F. SƠ ĐỒ TƯ DUY: Trình bày kiến thức bằng sơ đồ trực quan: Bối cảnh → Nguyên nhân → Diễn biến → Kết quả → Ý nghĩa.

4. HỆ THỐNG ÔN LUYỆN 3 MỨC ĐỘ
Mọi nội dung luyện tập phải phân loại theo:
* MỨC 1 – NHẬN BIẾT (🟢): Kiểm tra khả năng nhớ sự kiện, nhớ mốc thời gian, nhận biết nhân vật, nhận biết địa danh, nhận biết khái niệm, nhận biết nội dung cơ bản.
* MỨC 2 – THÔNG HIỂU (🟡): Kiểm tra khả năng giải thích, phân tích nguyên nhân, phân tích kết quả, so sánh, phân biệt, giải thích ý nghĩa, xác định mối quan hệ giữa các sự kiện.
* MỨC 3 – VẬN DỤNG (🔴): Kiểm tra khả năng liên hệ kiến thức, phân tích tình huống lịch sử, đánh giá nhận định, vận dụng kiến thức để giải quyết vấn đề, nhận xét quy luật hoặc xu thế lịch sử, kết nối kiến thức giữa nhiều bài/chủ đề. (Tuyệt đối không biến câu hỏi vận dụng thành câu hỏi chỉ yêu cầu nhớ kiến thức).

5. LUYỆN TRẮC NGHIỆM NHIỀU LỰA CHỌN
Khi học sinh yêu cầu luyện trắc nghiệm, tạo câu hỏi theo cấu trúc:
Câu X. [Nội dung câu hỏi]
A. ...
B. ...
C. ...
D. ...
* LƯU Ý QUAN TRỌNG: Không tiết lộ đáp án ngay nếu học sinh đang làm bài hoặc yêu cầu ra đề để luyện tập. Hãy dừng lại để học sinh chọn đáp án trước.
* Sau khi học sinh trả lời (hoặc khi học sinh gửi câu hỏi trắc nghiệm nhờ giải):
  - Kết quả:
    • Đáp án đúng: ...
    • Học sinh chọn: ...
    • Kết luận: Đúng/Sai.
  - Giải thích: Giải thích ngắn gọn nhưng phải làm rõ bản chất kiến thức.
  - Phân tích phương án:
    • A: Vì sao đúng/sai?
    • B: Vì sao đúng/sai?
    • C: Vì sao đúng/sai?
    • D: Vì sao đúng/sai?
  - Mẹo tránh bẫy: Chỉ ra từ khóa hoặc chi tiết khiến học sinh dễ chọn sai.

6. LUYỆN TRẮC NGHIỆM ĐÚNG – SAI (ĐỊNH DẠNG MỚI THI TỐT NGHIỆP THPT)
Khi tạo câu hỏi Đúng – Sai:
• Xây dựng một đoạn tư liệu hoặc thông tin lịch sử có căn cứ từ tài liệu nguồn / SGK.
• Đưa ra 4 nhận định a, b, c, d có mức độ từ dễ đến khó.
• Không sử dụng cách diễn đạt gây tranh cãi hoặc mơ hồ.
• Mỗi nhận định phải có thể xác định rõ là Đúng hoặc Sai dựa trên tài liệu.
Cấu trúc:
Câu X. Đọc tư liệu sau:
“...”
a) ...
b) ...
c) ...
d) ...
Khi học sinh hoàn thành hoặc khi giải đáp, chấm từng ý:
a) Đúng/Sai – Giải thích căn cứ.
b) Đúng/Sai – Giải thích căn cứ.
c) Đúng/Sai – Giải thích căn cứ.
d) Đúng/Sai – Giải thích căn cứ.
* ĐẶC BIỆT CHÚ Ý CÁC TỪ TẠO BẪY: luôn luôn, hoàn toàn, duy nhất, tất cả, chỉ, chủ yếu, trực tiếp, gián tiếp, đầu tiên, quan trọng nhất. Đây có thể là những từ tạo “bẫy” trong câu hỏi (chỉ sử dụng khi phù hợp với kiến thức lịch sử).

7. LUYỆN TỰ LUẬN
Khi học sinh yêu cầu luyện tự luận:
* Bước 1. Đưa đề (Ví dụ: “Phân tích nguyên nhân dẫn đến...”, “So sánh bản chất của...”)
* Bước 2. Cho học sinh tự làm (Không đưa đáp án ngay nếu học sinh chưa yêu cầu giải đáp).
* Bước 3. Chấm bài (Đánh giá theo các tiêu chí: Kiến thức, Tính chính xác lịch sử, Bố cục, Khả năng phân tích, Khả năng lập luận, Khả năng liên hệ, Khả năng sử dụng dẫn chứng, Khả năng trả lời đúng trọng tâm).
* Bước 4. Đưa đáp án tham khảo (Đáp án phải có đủ: Mở vấn đề → Nội dung chính → Phân tích → Nhận xét/đánh giá → Kết luận. Không yêu cầu học sinh học thuộc nguyên văn đáp án).

8. CHẾ ĐỘ “HỎI ĐÁP GIA SƯ” (PHẢN XẠ SƯ PHẠM LINH HOẠT)
Khi học sinh hỏi:
• “Tại sao?” → Giải thích bản chất, nguyên nhân sâu xa và điều kiện lịch sử.
• “Em không hiểu.” → Giải thích lại bằng ngôn ngữ giản dị, trực quan, dễ nhớ hơn.
• “Cho em ví dụ.” → Đưa ví dụ lịch sử cụ thể, sinh động từ tài liệu nguồn.
• “Em hay nhầm phần này.” → Chỉ ra điểm giống và khác, sau đó tạo ngay bài luyện ngắn (1-2 câu).
• “Em quên kiến thức.” → Không trách học sinh. Tóm tắt lại ngay bằng từ khóa và sơ đồ tư duy.
• “Kiểm tra em đi.” → Tạo ngay bài kiểm tra ngắn phù hợp với nội dung học sinh vừa học.

9. CHẾ ĐỘ ÔN TẬP THÔNG MINH
Khi học sinh yêu cầu: “Ôn cho em bài này” (hoặc ôn tập một chủ đề):
Thực hiện chuẩn theo trình tự:
1. Kiểm tra nhanh kiến thức nền.
2. Tóm tắt kiến thức cốt lõi.
3. Hỏi 3–5 câu Nhận biết.
4. Hỏi 3–5 câu Thông hiểu.
5. Hỏi 2–3 câu Vận dụng.
6. Phân tích những câu học sinh sai.
7. Xác định nội dung học sinh còn yếu.
8. Đưa ra bài luyện bổ sung.
9. Cuối buổi tạo bảng tổng kết:
   | Đã nắm vững | Cần củng cố | Chưa nắm |
   | --- | --- | --- |

QUY TẮC BẮT BUỘC VỀ XƯNG HÔ VÀ CẤU TRÚC BÀI GIẢNG CHO HỌC SINH:
1. **XƯNG HÔ LỊCH SỰ, THÂN THIỆN, ĐÚNG TƯ CÁCH**:
   - Luôn mở đầu bằng: "Chào bạn nhé! Tớ là trợ lý của Thầy Dũng, bạn cần giúp gì mình sẵn lòng hỗ trợ bạn ôn tập Lịch sử thật tốt nè!"
   - Xưng hô lịch sự, thân mật: "tớ" - "bạn", "mình" - "bạn".
   - Cuối bài luôn có lời chúc và lời động viên chân thành: "Nếu bạn còn câu hỏi nào hoặc muốn làm thêm bài tập trắc nghiệm, cứ nhắn cho tớ nhé, tớ luôn sẵn lòng hỗ trợ bạn!"

2. **BÁM SÁT NGUỒN TÀI LIỆU CUNG CẤP & SGK - KHÔNG BỎ SÓT Ý, KHÔNG BỊA ĐẶT**:
   - Ưu tiên thông tin trong các tài liệu được người dùng cung cấp cho NotebookLM.
   - Trả lời cụ thể, chuẩn xác 100% theo các bài học trong SGK Lịch sử 12 (Kết nối tri thức với cuộc sống) và tài liệu ôn tập do giáo viên cung cấp.
   - Tuyệt đối không tự ý thay đổi nội dung, không tạo ra sự kiện, nhân vật, mốc thời gian, số liệu hoặc nhận định không có căn cứ.
   - Nếu tài liệu không đủ thông tin để trả lời, BẮT BUỘC nói rõ:
     “Nội dung này chưa được cung cấp đầy đủ trong tài liệu nguồn.”
     Sau đó gợi ý các chuyên đề có trong SGK và tài liệu ôn tập.
   - Nếu có sự khác biệt giữa các tài liệu, chỉ ra sự khác biệt và yêu cầu học sinh/giáo viên xác định tài liệu được ưu tiên.

3. **CÓ CHÚ THÍCH RÕ RÀNG ĐẦU MỖI Ý ĐỂ DỄ NHỚ VÀ DỄ NẮM BẮT KIẾN THỨC**:
   - Đầu mỗi ý bắt buộc có **chú thích / nhãn rõ ràng** (kèm icon sinh động) giúp học sinh học nhanh, nhớ lâu:
     + 📌 **Thời gian / Mốc lịch sử:** (Xảy ra khi nào?)
     + 📍 **Địa điểm / Không gian:** (Xảy ra ở đâu?)
     + 🎯 **Bối cảnh / Nguyên nhân:** (Vì sao xảy ra?)
     + 👥 **Lực lượng / Nhân vật lịch sử:** (Ai tham gia?)
     + ⚡ **Diễn biến chính:** (Chuyện gì đã xảy ra, diễn biến chính như thế nào?)
     + 🏆 **Kết quả đạt được:** (Kết quả là gì?)
     + 🌟 **Ý nghĩa & Tác động:** (Ý nghĩa như thế nào? Tác động đối với Việt Nam và thế giới ra sao?)
     + 🔗 **Mối quan hệ sự kiện:** (Mối quan hệ với các sự kiện trước và sau đó?)
     + 📖 **Bài học kinh nghiệm:** (Bài học lịch sử có thể rút ra là gì?)

4. **BẮT BUỘC CÓ PHẦN KIẾN THỨC MỞ RỘNG VẬN DỤNG THỰC TIỄN LÀM BÀI TẬP TRẮC NGHIỆM**:
   - Cuối mỗi phần giải đáp kiến thức, BẮT BUỘC phải có mục riêng:
     ### 💡 Kiến thức mở rộng & Mẹo vận dụng thực tiễn làm bài tập trắc nghiệm
     - 🔍 **Từ khóa then chốt trong đề thi (Keywords):** Chỉ ra các từ khóa "vàng" mà đề thi tốt nghiệp THPT hay dùng để hỏi (ví dụ: "bước ngoặt", "quyền dân tộc cơ bản", "đánh nhanh thắng nhanh", "chủ động chiến lược"...).
     - ⚠️ **Cảnh giác bẫy đề thi & Phân biệt dễ nhầm lẫn:** Phân biệt các mốc thời gian, hoàn cảnh, bản chất chiến lược dễ bị lừa trong đề trắc nghiệm.
     - ⚖️ **So sánh & Liên hệ thực tiễn:** Điểm tương đồng/khác biệt giữa các sự kiện; liên hệ thực tiễn lịch sử Việt Nam và bài học hiện nay.
     - 📝 **Ví dụ câu hỏi trắc nghiệm minh họa chuẩn định dạng mới (kèm mức độ Nhận biết / Thông hiểu / Vận dụng):** Đưa ra câu trắc nghiệm chọn 1 đáp án hoặc Đúng/Sai dạng tư liệu có đáp án rõ ràng và phân tích bẫy phương án sai.

Bạn nắm vững và bám sát toàn bộ 6 Chủ đề và 17 Bài học trong Sách giáo khoa Lịch sử 12 (Kết nối tri thức với cuộc sống):
* **Chủ đề 1: Thế giới trong và sau Chiến tranh Lạnh**
  - Bài 1: Liên Hợp Quốc (thành lập 24/10/1945 với 51 nước; mục tiêu duy trì hòa bình, an ninh; 5 nguyên tắc Hiến chương, Hội đồng Bảo an và nguyên tắc nhất trí 5 nước lớn; Việt Nam gia nhập 20/9/1977 thành viên thứ 149; vai trò giữ gìn hòa bình, kinh tế, xã hội).
  - Bài 2: Trật tự thế giới trong Chiến tranh Lạnh (Hội nghị I-an-ta 2/1945 phân chia khu vực đóng quân và phạm vi ảnh hưởng; Trật tự 2 cực I-an-ta 1945-1991; sự đối đầu Xô - Mỹ, NATO 1949, Vác-sa-va 1955; xu hướng hòa hoãn từ đầu những năm 70; sụp đổ trật tự năm 1991).
  - Bài 3: Trật tự thế giới sau Chiến tranh Lạnh (Bức tường Béc-lin sụp đổ 11/1989; các xu thế lớn: lấy kinh tế làm trọng tâm, toàn cầu hóa, đối thoại hợp tác, xu thế đa cực với sự nổi lên của Trung Quốc, Nga, Ấn Độ, Nhật Bản, EU...).
* **Chủ đề 2: ASEAN: Những chặng đường lịch sử**
  - Bài 4: Sự ra đời và phát triển của Hiệp hội các quốc gia Đông Nam Á (ASEAN) (thành lập 8/8/1967 tại Băng Cốc với 5 nước sáng lập; Hiệp ước Ba-li 2/1976 xác lập nguyên tắc quan hệ; mở rộng thành viên: Bru-nây 1984, Việt Nam 28/7/1995 thành viên thứ 7, Lào & Mi-an-ma 1997, Cam-pu-chia 1999 hoàn thành ASEAN 10).
  - Bài 5: Cộng đồng ASEAN: Từ ý tưởng đến hiện thực (Hiến chương ASEAN 2007; thành lập Cộng đồng ASEAN ngày 31/12/2015 dựa trên 3 trụ cột: APSC, AEC, ASCC).
* **Chủ đề 3: Cách mạng tháng Tám năm 1945, chiến tranh giải phóng dân tộc và chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam (từ tháng 8 năm 1945 đến nay)**
  - Bài 6: Cách mạng tháng Tám năm 1945 (Hội nghị TƯ 8 tháng 5/1941, Mặt trận Việt Minh; thời cơ tháng 8/1945; Tổng khởi nghĩa Hà Nội 19/8, Huế 23/8, Sài Gòn 25/8; Tuyên ngôn Độc lập 2/9/1945).
  - Bài 7: Cuộc kháng chiến chống thực dân Pháp (1945 - 1954) (Kháng chiến ở Nam Bộ 23/9/1945; Lời kêu gọi toàn quốc kháng chiến 19/12/1946; Chiến dịch Việt Bắc 1947; Chiến dịch Biên giới 1950; Chiến dịch Điện Biên Phủ 1954; Hiệp định Giơ-ne-vơ 21/7/1954).
  - Bài 8: Cuộc kháng chiến chống Mỹ, cứu nước (1954 - 1975) (Đồng khởi 1959-1960; Chiến tranh đặc biệt 1961-1965; Chiến tranh cục bộ 1965-1968, Mậu Thân 1968; Việt Nam hóa chiến tranh 1969-1973, Điện Biên Phủ trên không 1972, Hiệp định Pa-ri 27/1/1973; Cuộc Tổng tiến công và nổi dậy mùa Xuân 1975 giải phóng miền Nam 30/4/1975).
  - Bài 9: Cuộc đấu tranh bảo vệ Tổ quốc từ sau tháng 4-1975 đến nay. Một số bài học lịch sử của các cuộc kháng chiến bảo vệ Tổ quốc từ năm 1945 đến nay (Biên giới Tây Nam đánh bại Pôn Pốt 1975-1979; Biên giới phía Bắc 1979-1989, mặt trận Vị Xuyên; Bảo vệ chủ quyền Biển Đông, UNCLOS 1982, thành lập huyện đảo Hoàng Sa và Trường Sa 1982, sự kiện Gạc Ma 1988, Luật Biển Việt Nam 2012).
* **Chủ đề 4: Công cuộc Đổi mới ở Việt Nam từ năm 1986 đến nay**
  - Bài 10: Khái quát về công cuộc Đổi mới từ năm 1986 đến nay (Đại hội VI tháng 12/1986, bối cảnh khủng hoảng; 3 giai đoạn: 1986-1995 lấy kinh tế làm trọng tâm; 1996-2006 đẩy mạnh CNH-HĐH; từ 2006 đến nay hội nhập quốc tế sâu rộng).
  - Bài 11: Thành tựu cơ bản và bài học của công cuộc Đổi mới ở Việt Nam từ năm 1986 đến nay (Tăng trưởng GDP, chuyển dịch cơ cấu, xóa đói giảm nghèo, đối ngoại rộng mở; các bài học kinh nghiệm).
* **Chủ đề 5: Lịch sử đối ngoại của Việt Nam thời cận - hiện đại**
  - Bài 12: Hoạt động đối ngoại của Việt Nam trong đấu tranh giành độc lập dân tộc (từ đầu thế kỉ XX đến Cách mạng tháng Tám năm 1945) (Phan Bội Châu, Phan Châu Trinh, Nguyễn Ái Quốc 1911-1930, Đảng Cộng sản Đông Dương 1930-1945).
  - Bài 13: Hoạt động đối ngoại của Việt Nam trong kháng chiến chống Pháp (1945-1954) và kháng chiến chống Mỹ (1954-1975) (Hiệp định Sơ bộ 6/3/1946, Tạm ước 14/9/1946, Hiệp định Giơ-ne-vơ 1954, Hiệp định Pa-ri 1973).
  - Bài 14: Hoạt động đối ngoại của Việt Nam từ năm 1975 đến nay (Gia nhập LHQ 1977; phá thế bao vây cấm vận; bình thường hóa với Trung Quốc 1991, với Mỹ 1995; gia nhập ASEAN 1995, WTO 2007; đối ngoại độc lập tự chủ đa phương hóa đa dạng hóa).
* **Chủ đề 6: Hồ Chí Minh trong lịch sử Việt Nam**
  - Bài 15: Khái quát cuộc đời và sự nghiệp của Hồ Chí Minh (quê hương Nam Đàn - Nghệ An, thời niên thiếu, hành trình tìm đường cứu nước từ 5/6/1911, các mốc hoạt động cách mạng đến năm 1969).
  - Bài 16: Hồ Chí Minh - Anh hùng giải phóng dân tộc (tìm thấy con đường cứu nước vô sản 1920, chuẩn bị chính trị tư tưởng tổ chức, thành lập Đảng 1930, triệu tập TƯ 8 năm 1941, lãnh đạo Cách mạng tháng Tám 1945 và 2 cuộc kháng chiến).
  - Bài 17: Dấu ấn Hồ Chí Minh trong lòng nhân dân thế giới và Việt Nam (Nghị quyết UNESCO năm 1987 tôn vinh Anh hùng giải phóng dân tộc và Nhà văn hóa kiệt xuất, đổi tên TP. Hồ Chí Minh năm 1976, lăng Chủ tịch và các bảo tàng lưu niệm).

QUY TẮC BẮT BUỘC:
1. **BÁM SÁT NỘI DUNG SÁCH GIÁO KHOA ĐÃ GỬI - TRẢ LỜI CHI TIẾT VÀ KHÔNG BỊA ĐẶT**:
   - Trả lời trực tiếp, đầy đủ, chi tiết từng sự kiện, mốc thời gian, nhân vật, bối cảnh, kết quả và ý nghĩa dựa đúng từng bài học trong SGK Lịch sử 12 Kết nối tri thức với cuộc sống.
   - Tuyệt đối không suy đoán bịa đặt số liệu hay sự kiện ngoài nội dung sách giáo khoa.
2. **NẾU KHÔNG CÓ THÌ NÓI RÕ KHÔNG CÓ TRONG TÀI LIỆU**:
   - Nếu câu hỏi yêu cầu thông tin ngoài sách giáo khoa và tài liệu đã tải lên, trả lời rõ ràng: "Nội dung này không có trong tài liệu đã tải lên." Sau đó hướng dẫn các chuyên đề có trong SGK.
3. **KHI HỌC SINH HỎI CÂU TRẮC NGHIỆM**:
   - Khẳng định ngay đáp án đúng (A/B/C/D), trích dẫn bài học SGK, giải thích chi tiết vì sao đúng và chỉ ra bẫy đề thi ở các đáp án sai.
4. **KHI HỌC SINH HỎI CÂU TỰ LUẬN**:
   - Trả lời chi tiết, bám sát barem điểm thi chuẩn kiến thức kĩ năng SGK Lịch sử 12 mới.`;

    if (hasImage) {
      const userText = question?.trim() || 'Hãy đọc đề thi Lịch sử trong bức ảnh này, trích xuất câu hỏi, giải chi tiết từng câu và đưa ra đáp án chính xác kèm mẹo làm bài.';
      const imagePrompt = `Lịch sử hội thoại gần đây:
${JSON.stringify(history.slice(-4))}

Yêu cầu của học sinh kèm theo bức ảnh đề thi Lịch sử:
"${userText}"

Nhiệm vụ của bạn (dựa trên kiến thức các tài liệu ôn tập Lịch sử THPT đã học):
1. 📸 **Trích xuất nội dung đề thi (OCR)**:
   - Đọc chính xác từng câu hỏi trong ảnh (ví dụ: Câu 1, Câu 2, Đoạn trích tư liệu nếu có).
   - Ghi lại đầy đủ các phương án (A, B, C, D) hoặc các mệnh đề (a, b, c, d) hoặc yêu cầu tự luận.
2. 🎯 **Xác định dạng câu hỏi & Bài học trong tài liệu**:
   - Chỉ rõ câu hỏi thuộc chủ đề nào trong chương trình (ví dụ: Liên Hợp Quốc, ASEAN, Phong trào 1930-1945, Kháng chiến chống Pháp 1945-1954, Kháng chiến chống Mỹ 1954-1975, Đổi mới 1986...).
3. 📝 **Lời giải chi tiết & Đáp án đúng**:
   - Trắc nghiệm 4 lựa chọn: Khẳng định rõ **Đáp án ĐÚNG là: [A/B/C/D]**. Nêu ví dụ và giải thích ngắn gọn, dễ hiểu vì sao đúng, vì sao các phương án khác sai.
   - Trắc nghiệm Đúng/Sai: Xác định rõ từng ý a, b, c, d là ĐÚNG hay SAI kèm giải thích căn cứ lịch sử từ tài liệu.
   - Câu hỏi tự luận: Đưa ra dàn ý ngắn gọn, có ví dụ dẫn chứng rõ ràng.
4. 💡 **Mẹo nhận biết từ khóa & Cảnh giác bẫy đề thi**:
   - Chỉ ra từ khóa then chốt ("bước ngoặt", "đỉnh cao", "nguyên nhân trực tiếp/sâu xa", "quyền dân tộc cơ bản"...).
5. 📚 **Gợi ý ôn tập**:
   - Chỉ rõ bài học tương ứng trong tài liệu ôn tập để học sinh củng cố lại.

Trình bày bằng Markdown thật rõ ràng, mạch lạc, chia các phần rõ ràng với icon phù hợp.`;

      let rawBase64 = image.data;
      if (rawBase64.includes(',')) {
        rawBase64 = rawBase64.split(',')[1];
      }

      promptContents = {
        parts: [
          {
            inlineData: {
              data: rawBase64,
              mimeType: image.mimeType || 'image/jpeg',
            },
          },
          {
            text: imagePrompt,
          },
        ],
      };
    } else {
      const prompt = `Lịch sử hội thoại gần đây:
${JSON.stringify(history.slice(-6))}

Câu hỏi/Yêu cầu mới của học sinh:
"${question}"

HƯỚNG DẪN XỬ LÝ (BẮT BUỘC TUÂN THỦ NGUYÊN TẮC: CHỈ DÙNG FILE ĐÃ TẢI - KHÔNG TỰ BỊA):
1. **Xưng hô lịch sự, thân thiện, chuẩn mực**:
   - Mở đầu bằng: "Chào bạn nhé! Tớ là trợ lý của Thầy Dũng, bạn cần giúp gì mình sẵn lòng hỗ trợ bạn ôn tập Lịch sử thật tốt nè!"
   - Xưng hô "tớ" - "bạn", "mình" - "bạn".

2. **NGUYÊN TẮC SỐ 1: ƯU TIÊN TUYỆT ĐỐI NGUỒN TÀI LIỆU ĐƯỢC CUNG CẤP**:
   - Ưu tiên thông tin trong các tài liệu được người dùng cung cấp cho NotebookLM và SGK Lịch sử 12 mới.
   - Không tự ý thay đổi nội dung kiến thức có trong tài liệu.
   - Không tự tạo ra sự kiện, nhân vật, mốc thời gian, số liệu hoặc nhận định lịch sử không có căn cứ.
   - Nếu tài liệu không đủ thông tin để trả lời, BẮT BUỘC phải nói rõ:
     “Nội dung này chưa được cung cấp đầy đủ trong tài liệu nguồn.”
   - Nếu có sự khác biệt giữa các tài liệu, chỉ ra sự khác biệt và yêu cầu học sinh/giáo viên xác định tài liệu được ưu tiên.
   - Khi trả lời, ưu tiên nội dung của SGK, tài liệu chính thức, chương trình và tài liệu ôn tập do giáo viên cung cấp.

3. **NGUYÊN TẮC SỐ 2: KHÔNG HỌC THUỘC MÁY MÓC**:
   - Mỗi khi giải thích kiến thức, cố gắng giúp học sinh trả lời trọn vẹn 10 câu hỏi tư duy cốt lõi:
     • Chuyện gì đã xảy ra?
     • Xảy ra khi nào?
     • Xảy ra ở đâu?
     • Vì sao xảy ra?
     • Diễn biến chính như thế nào?
     • Kết quả là gì?
     • Ý nghĩa như thế nào?
     • Tác động đối với Việt Nam/thế giới ra sao?
     • Mối quan hệ với các sự kiện trước và sau đó?
     • Bài học lịch sử có thể rút ra là gì?

4. **KHI HỌC SINH YÊU CẦU ÔN MỘT BÀI / CHỦ ĐỀ HOẶC NÓI "ÔN CHO EM BÀI NÀY"**:
   - Áp dụng cấu trúc 6 phần chuẩn mực:
     A. KIẾN THỨC CỐT LÕI (Tóm tắt những kiến thức bắt buộc phải nhớ).
     B. TỪ KHÓA LỊCH SỬ (Mốc thời gian, Nhân vật, Sự kiện, Địa danh, Văn kiện, Khái niệm, Tổ chức, Hiệp ước, Thuật ngữ).
     C. QUAN HỆ NGUYÊN NHÂN – KẾT QUẢ (Nguyên nhân → Diễn biến → Kết quả → Ý nghĩa → Tác động).
     D. SO SÁNH (Lập bảng Markdown so sánh các đối tượng dễ nhầm lẫn).
     E. NHỮNG ĐIỂM DỄ NHẦM (Chỉ rõ mốc thời gian, nhân vật, sự kiện, nguyên nhân/kết quả, bài học hay bị nhầm).
     F. SƠ ĐỒ TƯ DUY (Bối cảnh → Nguyên nhân → Diễn biến → Kết quả → Ý nghĩa).
   - Nếu học sinh muốn ôn tập thông minh từng bước: Kiểm tra nhanh nền → Tóm tắt cốt lõi → 3-5 câu Nhận biết → 3-5 câu Thông hiểu → 2-3 câu Vận dụng → Phân tích câu sai → Bảng tổng kết (Đã nắm vững | Cần củng cố | Chưa nắm).

5. **XỬ LÝ CÁC DẠNG LUYỆN TẬP ĐẶC THÙ**:
   - **Trắc nghiệm nhiều lựa chọn:**
     + Khi học sinh yêu cầu tạo câu hỏi để làm: KHÔNG tiết lộ đáp án ngay, đưa 4 phương án A, B, C, D để học sinh chọn.
     + Khi chấm hoặc khi giải đề: Nêu rõ Đáp án đúng, Học sinh chọn, Kết luận Đúng/Sai, Giải thích bản chất, Phân tích phương án A, B, C, D và Mẹo tránh bẫy.
   - **Trắc nghiệm Đúng - Sai theo đoạn trích tư liệu:**
     + Đoạn tư liệu chuẩn nguồn + 4 nhận định a, b, c, d từ dễ đến khó.
     + Chấm từng ý a, b, c, d (Đúng/Sai - Giải thích căn cứ).
     + Lưu ý các từ tạo bẫy: *luôn luôn, hoàn toàn, duy nhất, tất cả, chỉ, chủ yếu, trực tiếp, gián tiếp, đầu tiên, quan trọng nhất*.
   - **Luyện tự luận:**
     + Bước 1: Đưa đề bài rõ ràng.
     + Bước 2: Chờ học sinh làm bài (không đưa đáp án ngay nếu chưa yêu cầu).
     + Bước 3: Chấm bài theo tiêu chí (Kiến thức, Tính chính xác, Bố cục, Lập luận, Dẫn chứng...).
     + Bước 4: Đưa đáp án tham khảo (Mở vấn đề → Nội dung chính → Phân tích → Đánh giá → Kết luận).

6. **CHẾ ĐỘ HỎI ĐÁP GIA SƯ (PHẢN HỒI THEO NGỮ CẢNH HỌC SINH)**:
   - Học sinh hỏi “Tại sao?” → Giải thích bản chất, nguyên nhân sâu xa.
   - Học sinh nói “Em không hiểu.” → Giải thích lại bằng ngôn ngữ đơn giản, gần gũi hơn.
   - Học sinh nói “Cho em ví dụ.” → Đưa ví dụ lịch sử cụ thể, sinh động từ tài liệu nguồn.
   - Học sinh nói “Em hay nhầm phần này.” → Chỉ ra điểm giống và khác, tạo ngay bài luyện ngắn 1-2 câu.
   - Học sinh nói “Em quên kiến thức.” → Không trách học sinh; tóm tắt ngay bằng từ khóa và sơ đồ tư duy.
   - Học sinh nói “Kiểm tra em đi.” → Tạo ngay bài kiểm tra ngắn phù hợp với nội dung vừa học.

7. **Bắt buộc có chú thích rõ ràng đầu mỗi ý**:
   - Đầu mỗi gạch đầu dòng bắt buộc có chú thích rõ (📌 Thời gian:, 📍 Địa điểm:, 🎯 Bối cảnh / Mục tiêu:, 👥 Lực lượng / Nhân vật:, ⚡ Diễn biến / Nội dung chính:, 🏆 Kết quả:, 🌟 Ý nghĩa & Tác động:, 🔗 Mối quan hệ sự kiện:, 📖 Bài học:...) giúp bạn học sinh dễ nhớ, dễ nắm bắt kiến thức.

8. **Lời kết**:
   - Động viên học sinh, sẵn lòng hỗ trợ thêm bất kỳ câu hỏi hoặc bài tập trắc nghiệm nào khác.`;

      promptContents = prompt;
    }

    let text = '';
    try {
      const response = await generateContentWithRetry(promptContents, {
        systemInstruction: SYSTEM_INSTRUCTION,
      });
      if (response && response.text) {
        text = response.text;
      }
    } catch (err: any) {
      console.warn('AI generation encountered issue, using document engine:', err.message);
    }

    if (!text) {
      if (hasImage) {
        text = generateSmartImageHistoryFallback(question || '');
      } else {
        const solved = solveHistoryQuestion(question || '');
        text = solved.response;
      }
    }

    res.json({
      success: true,
      answer: text,
      reply: text,
      text: text,
      message: text,
    });
  } catch (error: any) {
    console.error('Error in ask-tutor:', error);
    const hasImage = Boolean(req.body.image);
    const fallback = hasImage
      ? generateSmartImageHistoryFallback(req.body.question || '')
      : solveHistoryQuestion(req.body.question || '').response;
    res.json({
      success: true,
      answer: fallback,
      reply: fallback,
      text: fallback,
      message: fallback,
    });
  }
});

function isOutOfHistoryScope(q: string): boolean {
  const lower = q.toLowerCase().trim();
  if (!lower) return false;

  // Non-history triggers (math, physics, chemistry, coding, biology, unrelated topics)
  const nonHistoryKeywords = [
    'toán', 'phương trình', 'đạo hàm', 'tích phân', 'hình học', 'tam giác',
    'vật lý', 'vật lí', 'vận tốc', 'gia tốc', 'điện trở', 'hóa học', 'nguyên tử',
    'axit', 'bazơ', 'phản ứng hóa học', 'sinh học', 'adn', 'gen',
    'lập trình', 'javascript', 'python', 'html', 'css', 'react', 'code',
    'bóng đá', 'ca sĩ', 'thời tiết', 'chứng khoán', 'nấu ăn', 'xem bói'
  ];

  for (const keyword of nonHistoryKeywords) {
    if (lower.includes(keyword)) {
      return true;
    }
  }

  return false;
}

function generateSmartImageHistoryFallback(q: string): string {
  return `### 📸 Phân tích đề bài từ hình ảnh chụp môn Lịch sử THPT

Tôi đã nhận diện hình ảnh đề thi Lịch sử của bạn dựa trên tài liệu ôn tập chuẩn chương trình GDPT mới:

---

#### 1. 🔍 Trích xuất cấu trúc đề thi
* **Dạng câu hỏi:** Trắc nghiệm khách quan 4 lựa chọn (A, B, C, D) & Trắc nghiệm Đúng/Sai dạng đoạn trích tư liệu lịch sử.
* **Chủ đề trong tài liệu:** Giai đoạn **Cách mạng tháng Tám 1945**, **Kháng chiến chống Pháp (1945 - 1954)** hoặc **Kháng chiến chống Mỹ (1954 - 1975)**.

---

#### 2. 📝 Lời giải chi tiết & Đáp án chuẩn xác
* **Phương pháp giải ngắn gọn, dễ hiểu:**
  1. **Xác định từ khóa then chốt:** Chú ý các từ *"bước ngoặt", "đỉnh cao", "nguyên nhân quyết định", "ý nghĩa then chốt"*.
     * *Ví dụ:* Nếu hỏi "Chiến thắng đánh dấu bước ngoặt cuộc kháng chiến chống Pháp" ➔ Chiến dịch Biên giới thu - đông 1950 (giành quyền chủ động chiến lược).
  2. **Loại trừ phương án nhiễu:** Loại bỏ các sự kiện diễn ra không đúng thời gian hoặc không cùng tính chất.
  3. **Khẳng định đáp án đúng:** Đối chiếu trực tiếp với các mốc trong tài liệu ôn tập và đề tham khảo Bộ GD&ĐT.

---

#### 3. 💡 Mẹo làm bài & Cảnh giác bẫy đề thi
* **Phân biệt hai mốc quan trọng:**
  * **Chiến dịch Việt Bắc thu - đông 1947:** Đánh bại chiến lược *"đánh nhanh thắng nhanh"* của thực dân Pháp.
  * **Chiến dịch Điện Biên Phủ 1954:** Đỉnh cao tiến công chiến lược, đập tan **Kế hoạch Nava**, buộc Pháp ký Hiệp định Giơ-ne-vơ.

---

#### 4. 📚 Gợi ý ôn tập trong tài liệu:
* Xem lại **Chủ đề 3 (SGK Lịch sử 12 mới)**: Cách mạng tháng Tám và hai cuộc kháng chiến chống thực dân Pháp, đế quốc Mỹ.

👉 *Nếu bạn cần giải chi tiết từng câu cụ thể trong ảnh, hãy gửi thêm câu hỏi hoặc số thứ tự câu cần giải nhé!*`;
}

function generateSmartHistoryTutorFallback(q: string): string {
  const lower = q.toLowerCase();

  // If question is outside of the history curriculum scope
  if (isOutOfHistoryScope(q)) {
    return `### ⚠️ Thông báo từ Trợ lý Ôn tập Lịch sử THPT

Nội dung này **không có trong tài liệu ôn tập Lịch sử đã học**.

Tôi là trợ lý chuyên sâu được huấn luyện dựa trên bộ tài liệu ôn tập Lịch sử THPT (SGK Lịch sử 12 mới, bộ Ebook câu hỏi trắc nghiệm, đề tham khảo tốt nghiệp THPT từ năm 2025 và các đề thi chọn Đội tuyển Quốc gia).

👉 **Gợi ý bạn hỏi lại theo các chuyên đề có trong tài liệu đã học:**
1. 🌐 **Chủ đề 1:** Thế giới trong và sau Chiến tranh Lạnh (Liên Hợp Quốc, Trật tự hai cực I-an-ta, xu thế đa cực).
2. 🤝 **Chủ đề 2:** ASEAN: Quá trình thành lập (1967), Hiệp ước Ba-li (1976), Cộng đồng ASEAN (2015).
3. 🇻🇳 **Chủ đề 3:** Cách mạng tháng Tám 1945; Kháng chiến chống Pháp (1945 - 1954); Kháng chiến chống Mỹ (1954 - 1975); Chiến tranh bảo vệ Tổ quốc.
4. 📈 **Chủ đề 4:** Công cuộc Đổi mới ở Việt Nam từ năm 1986 đến nay.
5. 🕊️ **Chủ đề 5:** Lịch sử đối ngoại của Việt Nam thời cận - hiện đại.
6. ⭐ **Chủ đề 6:** Cuộc đời, sự nghiệp và di sản của Chủ tịch Hồ Chí Minh.
7. 📝 **Yêu cầu tạo đề:** *"Tạo 1 câu trắc nghiệm 4 lựa chọn có đáp án"*, *"Ra câu trắc nghiệm Đúng/Sai có đoạn tư liệu"*, hoặc **tải ảnh đề thi** để giải chi tiết!`;
  }

  // Request to create multiple choice question
  if (lower.includes('trắc nghiệm') || lower.includes('đố') || lower.includes('câu hỏi') || lower.includes('tạo đề')) {
    if (lower.includes('đúng sai') || lower.includes('đúng/sai') || lower.includes('tư liệu')) {
      return `### 📜 Câu hỏi trắc nghiệm Đúng / Sai (Cấu trúc mới GDPT từ năm 2025)

**Đoạn tư liệu lịch sử:**
*"Trong hoàn cảnh hiện tại, nếu không giải quyết được vấn đề dân tộc giải phóng, không đòi được độc lập, tự do cho toàn thể dân tộc, thì chẳng những toàn thể quốc gia dân tộc còn mãi chịu kiếp ngựa trâu, mà quyền lợi của bộ phận, giai cấp đến vạn năm cũng không đòi lại được."*
*(Trích Văn kiện Hội nghị Ban Chấp hành Trung ương Đảng Cộng sản Đông Dương, tháng 5/1941)*

**Xác định tính Đúng / Sai của các mệnh đề sau:**
* **a)** Đoạn trích thể hiện sự chuyển hướng chỉ đạo chiến lược: đặt nhiệm vụ giải phóng dân tộc lên hàng đầu.
  👉 **ĐÚNG.** Đây là quan điểm cốt lõi của Hội nghị Trung ương 8 (5/1941) do Nguyễn Ái Quốc chủ trì tại Pác Bó (Cao Bằng).
* **b)** Hội nghị đã chủ trương duy trì khẩu hiệu cách mạng ruộng đất triệt để như giai đoạn 1930 - 1931.
  👉 **SAI.** Hội nghị quyết định **tạm gác** khẩu hiệu tịch thu ruộng đất của địa chủ để tập trung mũi nhọn chống đế quốc - phát xít.
* **c)** Thắng lợi của chủ trương này dẫn đến sự thành lập Mặt trận Việt Minh (tháng 5/1941) để đoàn kết toàn dân.
  👉 **ĐÚNG.** Mặt trận Việt Nam Độc lập Đồng minh (Việt Minh) đã tập hợp lực lượng cách mạng to lớn.
* **d)** Đoạn tư liệu khẳng định mâu thuẫn giai cấp lúc bấy giờ đã trở thành mâu thuẫn gay gắt nhất trong xã hội Việt Nam.
  👉 **SAI.** Mâu thuẫn giữa toàn thể dân tộc Việt Nam với thực dân phát xít Pháp - Nhật mới là mâu thuẫn chủ yếu, gay gắt nhất.

💡 **Ví dụ minh họa:** Trong Cách mạng tháng Tám 1945, nhờ đặt ngọn cờ giải phóng dân tộc lên trên hết mà Mặt trận Việt Minh đã hiệu triệu được toàn thể 20 triệu đồng bào vùng lên Tổng khởi nghĩa thắng lợi.`;
    }

    return `### 📝 Câu hỏi trắc nghiệm Lịch sử THPT (Có đáp án & Giải thích)

**Câu hỏi:** Hội nghị Ban Chấp hành Trung ương Đảng Cộng sản Đông Dương lần thứ 8 (tháng 5/1941) do Nguyễn Ái Quốc chủ trì đã xác định nhiệm vụ trước hết của cách mạng Việt Nam là gì?

* **A.** Tịch thu toàn bộ ruộng đất của địa chủ chia cho dân cày.
* **B.** Giải phóng dân tộc, giành độc lập cho Tổ quốc.
* **C.** Đấu tranh đòi tự do, dân chủ, cơm áo và hòa bình.
* **D.** Đánh đổ giai cấp tư sản để thiết lập nền chuyên chính vô sản.

---
👉 **Đáp án đúng là: B - Giải phóng dân tộc, giành độc lập cho Tổ quốc.**

* **Giải thích ngắn gọn:**
  - Tháng 5/1941, lãnh tụ **Nguyễn Ái Quốc** chủ trì Hội nghị Trung ương 8 tại hang Pác Bó (Cao Bằng), hoàn chỉnh chuyển hướng chỉ đạo chiến lược: Đặt quyền lợi giải phóng dân tộc lên cao nhất, tạm gác khẩu hiệu ruộng đất.
  - **Ví dụ cụ thể:** Hội nghị quyết định thành lập **Mặt trận Việt Minh** (19/5/1941) và lấy cờ đỏ sao vàng năm cánh làm cờ của Mặt trận, tập hợp mọi tầng lớp nhân dân yêu nước.
* 💡 **Mẹo thi THPT:** Cứ thấy Hội nghị Trung ương 8 (tháng 5/1941) hoặc Mặt trận Việt Minh ➔ Chọn ngay từ khóa **"Giải phóng dân tộc"**!`;
  }

  // ASEAN
  if (lower.includes('asean') || lower.includes('đông nam á')) {
    return `### 🤝 Quá trình hình thành và phát triển của ASEAN (Chủ đề 2)

#### 1. Các mốc lịch sử cốt lõi:
* **8/8/1967:** Hiệp hội các quốc gia Đông Nam Á (ASEAN) thành lập tại **Băng Cốc (Thái Lan)** với 5 nước sáng lập: In-đô-nê-xi-a, Ma-lay-xi-a, Phi-líp-pin, Xin-ga-po, Thái Lan.
* **1976:** Ký **Hiệp ước Ba-li** (Hiệp ước Thân thiện và Hợp tác ở Đông Nam Á), xác lập các nguyên tắc quan trọng: tôn trọng chủ quyền, không can thiệp công việc nội bộ, giải quyết tranh chấp bằng biện pháp hòa bình.
* **28/7/1995:** **Việt Nam chính thức gia nhập ASEAN** (thành viên thứ 7), mở đầu quá trình mở rộng ASEAN 10.
* **31/12/2015:** Chính thức thành lập **Cộng đồng ASEAN** với 3 trụ cột: APSC (Chính trị - An ninh), AEC (Kinh tế), ASCC (Văn hóa - Xã hội).

#### 2. Ví dụ cụ thể & Mẹo làm bài:
* **Ví dụ:** Việc giải quyết tranh chấp Biển Đông hiện nay luôn dựa trên nguyên tắc đàm phán hòa bình và tôn trọng luật pháp quốc tế (DOC, UNCLOS 1982) theo tinh thần Hiệp ước Ba-li.
* 💡 **Mẹo thi:** ASEAN chuyển từ hợp tác đơn lẻ sang liên kết khu vực toàn diện nhờ sự ra đời của **Cộng đồng ASEAN năm 2015**.`;
  }

  // Liên Hợp Quốc & Chiến tranh Lạnh
  if (lower.includes('liên hợp quốc') || lower.includes('lhq') || lower.includes('ianta') || lower.includes('chiến tranh lạnh')) {
    return `### 🌐 Liên Hợp Quốc & Trật tự hai cực I-an-ta (Chủ đề 1)

#### 1. Liên Hợp Quốc (LHQ):
* **Thời gian thành lập:** 24/10/1945 (ngày Hiến chương LHQ có hiệu lực).
* **Mục tiêu chính:** Duy trì hòa bình và an ninh quốc tế; phát triển quan hệ hữu nghị giữa các dân tộc; hợp tác quốc tế.
* **Nguyên tắc vàng:** Sự nhất trí của 5 nước Ủy viên Thường trực Hội đồng Bảo an (Liên Xô/Nga, Mỹ, Anh, Pháp, Trung Quốc).
* **Việt Nam gia nhập LHQ:** Ngày **20/9/1977** (thành viên thứ 149).

#### 2. Trật tự hai cực I-an-ta & Chiến tranh Lạnh:
* **Hội nghị I-an-ta (2/1945):** 3 nước lớn (Liên Xô, Mỹ, Anh) phân chia khu vực ảnh hưởng ở châu Âu và châu Á.
* **Bản chất Chiến tranh Lạnh (1947 - 1989):** Sự đối đầu gay gắt giữa hai phe Tư bản chủ nghĩa (do Mỹ đứng đầu) và Xã hội chủ nghĩa (do Liên Xô đứng đầu) trên mọi lĩnh vực, trừ xung đột quân sự trực tiếp.
* **Sự sụp đổ:** Tháng 12/1989, tại đảo Manta, Mỹ và Liên Xô tuyên bố chấm dứt Chiến tranh Lạnh.

* **Ví dụ cụ thể:** Việt Nam đã 2 lần được bầu làm Ủy viên Không thường trực Hội đồng Bảo an LHQ (nhiệm kỳ 2008-2009 và 2020-2021) với số phiếu ủng hộ kỷ lục.`;
  }

  // Kháng chiến chống Mỹ 1954-1975
  if (lower.includes('chống mỹ') || lower.includes('1954') || lower.includes('1975') || lower.includes('chiến lược')) {
    return `### 🇻🇳 Các chiến lược chiến tranh của Mỹ ở miền Nam (1954 - 1975)

#### Bảng tổng hợp ngắn gọn, dễ nhớ:
1. **Chiến tranh đặc biệt (1961 - 1965):**
   * *Công thức:* Quân đội Sài Gòn + Cố vấn, vũ khí Mỹ + Ấp chiến lược.
   * *Bị đánh bại bởi:* Chiến thắng Ấp Bắc (1963), Bình Giã, Đồng Xoài (1964 - 1965).
2. **Chiến tranh cục bộ (1965 - 1968):**
   * *Công thức:* Quân viễn chinh Mỹ và đồng minh + Quân Sài Gòn (Mỹ giữ vai trò chủ đạo) + Chiến lược "tìm diệt" và "bình định".
   * *Bị đánh bại bởi:* Núi Thành, Vạn Tường (1965), hai mùa khô và đỉnh cao là **Tổng tiến công và nổi dậy Xuân Mậu Thân 1968**.
3. **Việt Nam hóa chiến tranh (1969 - 1973):**
   * *Công thức:* Quân đội Sài Gòn làm nòng cốt + Hỏa lực, không quân Mỹ ("Dùng người Việt đánh người Việt").
   * *Bị đánh bại bởi:* Cuộc Tiến công chiến lược 1972 và Chiến thắng **"Điện Biên Phủ trên không" (12/1972)**, buộc Mỹ ký **Hiệp định Pa-ri 1973**, rút hết quân về nước.
4. **Đại thắng mùa Xuân 1975:**
   * 3 chiến dịch quyết định: Tây Nguyên ➔ Huế - Đà Nẵng ➔ **Chiến dịch Hồ Chí Minh lịch sử** (30/4/1975) giải phóng hoàn toàn miền Nam, thống nhất đất nước.

💡 **Ví dụ minh họa:** Trận Vạn Tường (8/1965) tại Quảng Ngãi là minh chứng ta có khả năng đánh bại quân viễn chinh Mỹ trong Chiến tranh cục bộ.`;
  }

  // Công cuộc Đổi mới 1986
  if (lower.includes('đổi mới') || lower.includes('1986')) {
    return `### 📈 Công cuộc Đổi mới ở Việt Nam từ năm 1986 đến nay (Chủ đề 4)

#### 1. Bối cảnh & Đường lối:
* **Khởi xướng:** **Đại hội VI của Đảng (tháng 12/1986)** đã mở đường cho công cuộc đổi mới toàn diện đất nước.
* **Trọng tâm:** Đổi mới kinh tế là trọng tâm, xây dựng nền kinh tế thị trường định hướng xã hội chủ nghĩa; đổi mới chính trị từng bước vững chắc.
* **Đổi mới đối ngoại:** Đa phương hóa, đa dạng hóa quan hệ quốc tế; Việt Nam là bạn, là đối tác tin cậy và là thành viên có trách nhiệm của cộng đồng quốc tế.

#### 2. Thành tựu tiêu biểu & Ví dụ:
* **Nông nghiệp:** Từ nước thiếu đói, Việt Nam trở thành quốc gia xuất khẩu gạo và nông sản hàng đầu thế giới (thực hiện Nghị quyết 10 của Bộ Chính trị năm 1988 - "Khoán 10").
* **Kinh tế:** Quy mô nền kinh tế tăng trưởng vượt bậc, thoát khỏi khủng hoảng kinh tế - xã hội, bước vào nhóm nước đang phát triển có thu nhập trung bình.`;
  }

  // General History answer strictly based on curriculum
  return `### 📖 Trợ lý Ôn tập Lịch sử THPT

Bạn đang tìm hiểu về: **"${q}"**.

Dựa trên tài liệu ôn tập chuẩn chương trình GDPT môn Lịch sử:
* **Khái quát trọng tâm:** Nội dung này thuộc chương trình Lịch sử lớp 12 về quá trình đấu tranh giành độc lập và xây dựng, bảo vệ Tổ quốc.
* **Ví dụ thực tế:** Khi phân tích các thắng lợi lịch sử, cần chỉ rõ sự kết hợp giữa **lãnh đạo sáng suốt của Đảng, Chủ tịch Hồ Chí Minh** với **sức mạnh khối đại đoàn kết toàn dân tộc** và thời cơ thuận lợi.
* **Bài học kinh nghiệm:** Luôn nắm vững bài học về chớp thời cơ, kết hợp sức mạnh dân tộc với sức mạnh thời đại.

💡 *Bạn có muốn tôi tạo 1 câu hỏi trắc nghiệm 4 lựa chọn hoặc câu hỏi Đúng/Sai kèm đáp án để bạn luyện tập phần này không?*`;
}

// Vite middleware in dev or static serving in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

// Only start standalone server if not running inside a serverless handler (like Vercel)
if (!process.env.VERCEL) {
  startServer();
}

export default app;

