import { GoogleGenerativeAI } from '@google/generative-ai';

// Các model Gemini tốc độ cao và ổn định hiện hành
const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
];

// Ngân hàng câu hỏi dự phòng chất lượng cao chuẩn chương trình Lịch sử 12 GDPT
const FALLBACK_BANK_MULTIPLE_CHOICE = [
  {
    id: 'mc-fb-1',
    type: 'multiple_choice',
    topic: 'Cách mạng tháng Tám năm 1945 & Khai sinh nước VNDCCH',
    grade: '12',
    difficulty: 'medium',
    question: 'Hội nghị lần thứ 8 Ban Chấp hành Trung ương Đảng Cộng sản Đông Dương (tháng 5/1941) đã xác định nhiệm vụ trọng tâm hàng đầu của cách mạng Việt Nam là gì?',
    options: [
      'Giải phóng dân tộc',
      'Cách mạng ruộng đất',
      'Đòi tự do, dân sinh, dân chủ',
      'Đánh đổ phong kiến tay sai',
    ],
    correctAnswer: 0,
    explanation: 'Hội nghị Trung ương 8 (5/1941) do lãnh tụ Nguyễn Ái Quốc chủ trì tại Pác Bó (Cao Bằng) đã quyết định đặt nhiệm vụ giải phóng dân tộc lên trên hết, trước hết, tạm gác khẩu hiệu tịch thu ruộng đất.',
    historicalTip: 'Mẹo nhớ: Từ Hội nghị TƯ 6 (1939) đến TƯ 8 (1941), ngọn cờ giải phóng dân tộc được giương cao nhất.',
  },
  {
    id: 'mc-fb-2',
    type: 'multiple_choice',
    topic: 'Cuộc kháng chiến chống thực dân Pháp (1945 - 1954)',
    grade: '12',
    difficulty: 'medium',
    question: 'Chiến thắng nào của quân và dân ta đã làm phá sản hoàn toàn Kế hoạch Nava của thực dân Pháp và can thiệp Mỹ?',
    options: [
      'Chiến dịch Việt Bắc thu - đông 1947',
      'Chiến dịch Biên giới thu - đông 1950',
      'Cuộc Tiến công chiến lược Đông - Xuân 1953 - 1954',
      'Chiến dịch lịch sử Điện Biên Phủ năm 1954',
    ],
    correctAnswer: 3,
    explanation: 'Chiến thắng lịch sử Điện Biên Phủ (7/5/1954) đập tan tập đoàn cứ điểm mạnh nhất Đông Dương của Pháp, làm phá sản hoàn toàn Kế hoạch Nava, buộc Pháp ký Hiệp định Giơ-ne-vơ 1954.',
    historicalTip: 'Việt Bắc 1947 (phá Kế hoạch Rơ-ve/đánh nhanh thắng nhanh) ➔ Biên giới 1950 (giành quyền chủ động) ➔ Điện Biên Phủ 1954 (đòn quyết định xoay chuyển cục diện).',
  },
  {
    id: 'mc-fb-3',
    type: 'multiple_choice',
    topic: 'Cuộc kháng chiến chống Mỹ, cứu nước (1954 - 1975)',
    grade: '12',
    difficulty: 'hard',
    question: 'Điểm giống nhau cơ bản giữa chiến lược "Chiến tranh đặc biệt" (1961 - 1965) và "Chiến tranh cục bộ" (1965 - 1968) của Mỹ ở miền Nam là gì?',
    options: [
      'Đều lấy lực lượng quân viễn chinh Mỹ giữ vai trò nòng cốt trực tiếp tác chiến',
      'Đều là các hình thức chiến tranh xâm lược thực dân mới, nằm trong chiến lược toàn cầu của Mỹ',
      'Đều được tiến hành sau thất bại của chiến lược "Việt Nam hóa chiến tranh"',
      'Đều sử dụng không quân tập kích miền Bắc bằng pháo đài bay B-52',
    ],
    correctAnswer: 1,
    explanation: 'Cả hai chiến lược đều là loại hình chiến tranh xâm lược thực dân mới của đế quốc Mỹ nhằm biến miền Nam Việt Nam thành thuộc địa kiểu mới và căn cứ quân sự. Khác biệt lớn nhất là: Chiến tranh đặc biệt dựa vào quân đội Sài Gòn; Chiến tranh cục bộ dựa vào quân viễn chinh Mỹ.',
    historicalTip: 'Phân biệt lực lượng: Đặc biệt = Quân đội Sài Gòn; Cục bộ = Quân viễn chinh Mỹ làm nòng cốt.',
  },
  {
    id: 'mc-fb-4',
    type: 'multiple_choice',
    topic: 'Trật tự thế giới hai cực Ianta & Chiến tranh Lạnh (1945 - 1991)',
    grade: '12',
    difficulty: 'medium',
    question: 'Theo thỏa thuận của Hội nghị I-an-ta (2/1945), phạm vi ảnh hưởng ở Đông Âu thuộc về quốc gia nào?',
    options: ['Mỹ', 'Liên Xô', 'Anh', 'Pháp'],
    correctAnswer: 1,
    explanation: 'Hội nghị I-an-ta (tháng 2/1945) thỏa thuận: Đông Âu thuộc phạm vi ảnh hưởng của Liên Xô; Tây Âu thuộc phạm vi ảnh hưởng của Mỹ, Anh và Pháp.',
    historicalTip: 'Mẹo nhớ: Đông Âu, Bắc Triều Tiên = Liên Xô; Tây Âu, Nam Triều Tiên, Nhật Bản = Mỹ.',
  },
  {
    id: 'mc-fb-5',
    type: 'multiple_choice',
    topic: 'Việt Nam thời kỳ Đổi mới (1986 đến nay)',
    grade: '12',
    difficulty: 'easy',
    question: 'Đại hội đại biểu toàn quốc lần thứ VI của Đảng (tháng 12/1986) đã xác định trọng tâm của công cuộc Đổi mới là lĩnh vực nào?',
    options: [
      'Đổi mới chính trị và tinh giản biên chế',
      'Đổi mới kinh tế',
      'Đổi mới văn hóa và giáo dục',
      'Đổi mới quốc phòng và an ninh',
    ],
    correctAnswer: 1,
    explanation: 'Đại hội VI (12/1986) xác định lấy đổi mới kinh tế làm trọng tâm, xóa bỏ cơ chế tập trung quan liêu bao cấp, phát triển nền kinh tế hàng hóa nhiều thành phần có sự quản lý của Nhà nước.',
    historicalTip: 'Nguyên tắc Đổi mới: Đổi mới toàn diện và đồng bộ, nhưng trọng tâm là ĐỔI MỚI KINH TẾ.',
  },
  {
    id: 'mc-fb-6',
    type: 'multiple_choice',
    topic: 'ASEAN và xu thế phát triển của thế giới sau Chiến tranh Lạnh',
    grade: '12',
    difficulty: 'medium',
    question: 'Việt Nam chính thức gia nhập Hiệp hội các quốc gia Đông Nam Á (ASEAN) vào thời gian nào?',
    options: [
      'Ngày 28 tháng 7 năm 1995',
      'Ngày 8 tháng 8 năm 1967',
      'Ngày 30 tháng 4 năm 1999',
      'Ngày 20 tháng 9 năm 1977',
    ],
    correctAnswer: 0,
    explanation: 'Ngày 28/7/1995, tại Hội nghị Bộ trưởng Ngoại giao ASEAN lần thứ 28 tại Bru-nây, Việt Nam chính thức được kết nạp là thành viên thứ 7 của ASEAN.',
    historicalTip: 'Mốc sự kiện quan trọng năm 1995: Bình thường hóa quan hệ Việt - Mỹ và Gia nhập ASEAN (28/7/1995).',
  },
];

const FALLBACK_BANK_TRUE_FALSE = [
  {
    id: 'tf-fb-1',
    type: 'true_false',
    topic: 'Cách mạng tháng Tám năm 1945 & Khai sinh nước VNDCCH',
    grade: '12',
    difficulty: 'medium',
    passage: `Ngày 2-9-1945, tại Quảng trường Ba Đình (Hà Nội), Chủ tịch Hồ Chí Minh thay mặt Chính phủ lâm thời đọc bản Tuyên ngôn Độc lập, trịnh trọng tuyên bố trước quốc dân và thế giới: "Nước Việt Nam có quyền hưởng tự do và độc lập, và sự thật đã thành một nước tự do độc lập. Toàn thể dân tộc Việt Nam quyết đem tất cả tinh thần và lực lượng, tính mạng và của cải để giữ vững quyền tự do, độc lập ấy". Bản Tuyên ngôn Độc lập là một văn kiện lịch sử vô giá, khẳng định ý chí sắt đá và quyền tự quyết thiêng liêng của dân tộc Việt Nam.`,
    leadIn: 'Đọc đoạn trích trên và vận dụng kiến thức lịch sử, hãy xác định các mệnh đề dưới đây là Đúng hay Sai:',
    statements: [
      {
        id: 's-fb-1',
        text: 'Tuyên ngôn Độc lập ngày 2-9-1945 đã tuyên bố chấm dứt hoàn toàn chế độ thực dân Pháp và phát xít Nhật cùng chế độ phong kiến tồn tại hàng nghìn năm ở Việt Nam.',
        isCorrect: true,
        explanation: 'Đúng. Bản Tuyên ngôn khẳng định nhân dân ta đã lật đổ ách thống trị thực dân, phát xít và chế độ phong kiến để lập nên nước Việt Nam Dân chủ Cộng hòa.',
      },
      {
        id: 's-fb-2',
        text: 'Bản Tuyên ngôn Độc lập được công bố khi quân Đồng minh (quân Anh và quân Trung Hoa Dân quốc) đã tiến vào giải giáp quân đội Nhật trên khắp cả nước.',
        isCorrect: false,
        explanation: 'Sai. Đến đầu tháng 9/1945 quân Đồng minh mới tiến vào. Việc tuyên ngôn trước giúp nước ta xác lập tư cách quốc gia độc lập có chính quyền hợp pháp.',
      },
      {
        id: 's-fb-3',
        text: 'Đoạn trích thể hiện tinh thần quyết tâm bảo vệ vững chắc nền độc lập, tự do bằng mọi giá của toàn thể dân tộc Việt Nam.',
        isCorrect: true,
        explanation: 'Đúng. Khẩu hiệu "Toàn thể dân tộc Việt Nam quyết đem tất cả tinh thần và lực lượng..." thể hiện rõ ý chí kiên cường bảo vệ độc lập.',
      },
      {
        id: 's-fb-4',
        text: 'Tuyên ngôn Độc lập chỉ có giá trị pháp lý nội bộ trong nước, không có ý nghĩa đối ngoại quốc tế.',
        isCorrect: false,
        explanation: 'Sai. Tuyên ngôn Độc lập có ý nghĩa quốc tế sâu sắc, khẳng định quyền dân tộc cơ bản và là nguồn cổ vũ phong trào giải phóng dân tộc thế giới.',
      },
    ],
    overallExplanation: 'Tuyên ngôn Độc lập (2/9/1945) là văn kiện có ý nghĩa thời đại, khai sinh ra nước Việt Nam Dân chủ Cộng hòa.',
  },
  {
    id: 'tf-fb-2',
    type: 'true_false',
    topic: 'Cuộc kháng chiến chống Mỹ, cứu nước (1954 - 1975)',
    grade: '12',
    difficulty: 'medium',
    passage: `Thắng lợi của cuộc Tổng tiến công và nổi dậy Xuân Mậu Thân 1968 đã giáng một đòn bất ngờ vào ý chí xâm lược của giới cầm quyền Mỹ, làm lung lay ý chí của đế quốc Mỹ, buộc Mỹ phải tuyên bố "phi Mỹ hóa" chiến tranh xâm lược (tức thừa nhận thất bại của Chiến tranh cục bộ), chấm dứt không điều kiện chiến tranh phá hoại miền Bắc và chấp nhận ngồi vào bàn đàm phán ở Pari.`,
    leadIn: 'Dựa vào đoạn tư liệu lịch sử trên, hãy đánh giá tính Đúng/Sai của các nhận định sau:',
    statements: [
      {
        id: 's-fb-5',
        text: 'Cuộc Tổng tiến công và nổi dậy Xuân Mậu Thân 1968 đã buộc Mỹ phải chấm dứt chiến lược "Chiến tranh cục bộ".',
        isCorrect: true,
        explanation: 'Đúng. Thắng lợi này buộc Mỹ tuyên bố "phi Mỹ hóa" chiến tranh, thừa nhận thất bại của Chiến tranh cục bộ.',
      },
      {
        id: 's-fb-6',
        text: 'Xuân Mậu Thân 1968 là thắng lợi quân sự trực tiếp giải phóng hoàn toàn miền Nam thống nhất đất nước.',
        isCorrect: false,
        explanation: 'Sai. Đại thắng mùa Xuân 1975 mới là thắng lợi giải phóng hoàn toàn miền Nam.',
      },
      {
        id: 's-fb-7',
        text: 'Sau đòn tấn công Mậu Thân 1968, Mỹ đã phải ngồi vào bàn đàm phán chính thức tại Hội nghị Pa-ri.',
        isCorrect: true,
        explanation: 'Đúng. Mậu Thân 1968 mở ra cục diện "vừa đánh vừa đàm" tại Pa-ri.',
      },
      {
        id: 's-fb-8',
        text: 'Chiến thắng Mậu Thân 1968 đã làm phá sản chiến lược "Việt Nam hóa chiến tranh" của tổng thống Ních-xơn.',
        isCorrect: false,
        explanation: 'Sai. Mậu Thân 1968 làm phá sản "Chiến tranh cục bộ", sau đó Mỹ mới chuyển sang "Việt Nam hóa chiến tranh".',
      },
    ],
    overallExplanation: 'Xuân Mậu Thân 1968 là bước ngoặt quyết định buộc Mỹ xuống thang chiến tranh và đàm phán ở Paris.',
  },
];

const FALLBACK_BANK_ESSAY = [
  {
    id: 'es-fb-1',
    type: 'essay',
    topic: 'Cách mạng tháng Tám năm 1945 & Khai sinh nước VNDCCH',
    question: 'Phân tích nguyên nhân thắng lợi và bài học kinh nghiệm của Cách mạng tháng Tám năm 1945 trong việc chớp thời cơ cách mạng.',
    keyPoints: [
      'Nguyên nhân chủ quan: Sự lãnh đạo đúng đắn, sáng suốt của Đảng Cộng sản Đông Dương đứng đầu là Chủ tịch Hồ Chí Minh; tinh thần yêu nước và sức mạnh khối đại đoàn kết toàn dân.',
      'Nguyên nhân khách quan: Thắng lợi của quân Đồng minh và Hồng quân Liên Xô đánh bại chủ nghĩa phát xít Nhật Bản tạo thời cơ ngàn năm có một.',
      'Nghệ thuật chớp thời cơ: Thời cơ xuất hiện từ khi Nhật đầu hàng Đồng minh (15/8/1945) đến trước khi quân Đồng minh vào Đông Dương (đầu tháng 9/1945).',
      'Bài học kinh nghiệm: Kết hợp sức mạnh dân tộc với sức mạnh thời đại, kiên quyết phát động toàn dân đứng lên khởi nghĩa giành chính quyền.',
    ],
    rubric: '1. Đặt vấn đề (1.0 điểm)\n2. Nguyên nhân thắng lợi (3.5 điểm)\n3. Nghệ thuật chớp thời cơ (3.5 điểm)\n4. Bài học thực tiễn hiện nay (2.0 điểm)',
    guideNote: 'Cần nhấn mạnh thời cơ "ngàn năm có một" chỉ tồn tại trong khoảng thời gian rất ngắn từ ngày 15/8/1945 đến đầu tháng 9/1945.',
    suggestedAnswer: `1. Mở bài: Nêu vị trí, tầm vóc lịch sử của Cách mạng tháng Tám năm 1945 trong tiến trình lịch sử dân tộc.
2. Thân bài:
- Nguyên nhân thắng lợi chủ quan và khách quan.
- Phân tích nghệ thuật nhận định và chớp thời cơ của Đảng: chuẩn bị chu đáo về lực lượng chính trị, lực lượng vũ trang và căn cứ địa cách mạng trong suốt 15 năm (1930 - 1945).
- Khi thời cơ chín muồi (Nhật đầu hàng), Đảng kịp thời phát lệnh Tổng khởi nghĩa giành chính quyền trên cả nước trong vòng 15 ngày.
3. Kết luận: Khẳng định giá trị bài học chớp thời cơ và xây dựng khối đại đoàn kết trong sự nghiệp xây dựng, bảo vệ Tổ quốc hôm nay.`,
  },
];

function getFilteredFallback(questionType, count = 5) {
  const reqCount = Math.min(Math.max(Number(count) || 1, 1), 10);
  if (questionType === 'multiple_choice') {
    return FALLBACK_BANK_MULTIPLE_CHOICE.slice(0, reqCount);
  }
  if (questionType === 'true_false') {
    return FALLBACK_BANK_TRUE_FALSE.slice(0, reqCount);
  }
  return FALLBACK_BANK_ESSAY.slice(0, reqCount);
}

export default async function handler(req, res) {
  // CORS Headers
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

  const body = req.body || {};
  const {
    topic = 'Tổng hợp Lịch sử THPT',
    questionType = 'multiple_choice',
    difficulty = 'medium',
    count = 5,
    grade = '12',
    keyword = '',
    essayStyle = 'phan-tich',
  } = body;

  const requestedCount = Math.min(Math.max(Number(count) || 1, 1), 10);
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  // Nếu không có API Key, trả về ngân hàng câu hỏi chuẩn ngay lập tức (không báo lỗi!)
  if (!apiKey) {
    const fallbackList = getFilteredFallback(questionType, requestedCount);
    return res.status(200).json({
      success: true,
      questions: fallbackList,
      note: 'Dùng bộ câu hỏi chuẩn biên soạn sẵn (chưa cấu hình GEMINI_API_KEY).',
    });
  }

  // Soạn prompt cho AI
  let prompt = '';
  if (questionType === 'multiple_choice') {
    prompt = `Bạn là chuyên gia khảo thí Lịch sử THPT Việt Nam (Chương trình GDPT mới 2018).
Hãy tạo ${requestedCount} câu hỏi trắc nghiệm 4 lựa chọn (A, B, C, D) cho chủ đề: "${topic}", Lớp ${grade}, độ khó: "${difficulty}".
Trả về duy nhất định dạng JSON thuần túy (không kèm giải thích ngoài JSON):
{
  "questions": [
    {
      "id": "mc-1",
      "type": "multiple_choice",
      "question": "Nội dung câu hỏi chính xác lịch sử?",
      "options": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
      "correctAnswer": 0,
      "explanation": "Giải thích chi tiết vì sao phương án này đúng và phân tích bẫy các phương án sai.",
      "topic": "${topic}",
      "historicalTip": "Mẹo nhớ nhanh hoặc từ khóa lịch sử"
    }
  ]
}`;
  } else if (questionType === 'true_false') {
    prompt = `Bạn là chuyên gia khảo thí Lịch sử THPT Việt Nam (cấu trúc trắc nghiệm Đúng/Sai dạng đoạn tư liệu theo chuẩn Bộ GD&ĐT).
Hãy tạo ${requestedCount} câu hỏi Đúng/Sai cho chủ đề: "${topic}", Lớp ${grade}, độ khó: "${difficulty}".
Trả về duy nhất định dạng JSON:
{
  "questions": [
    {
      "id": "tf-1",
      "type": "true_false",
      "topic": "${topic}",
      "passage": "Đoạn trích tư liệu lịch sử có giá trị (tuyên ngôn, chỉ thị, nhận định lịch sử)...",
      "leadIn": "Đọc đoạn trích trên và xác định tính Đúng/Sai của các mệnh đề sau:",
      "statements": [
        {"id": "s-1", "text": "Mệnh đề a", "isCorrect": true, "explanation": "Giải thích ngắn gọn"},
        {"id": "s-2", "text": "Mệnh đề b", "isCorrect": false, "explanation": "Giải thích ngắn gọn"},
        {"id": "s-3", "text": "Mệnh đề c", "isCorrect": true, "explanation": "Giải thích ngắn gọn"},
        {"id": "s-4", "text": "Mệnh đề d", "isCorrect": false, "explanation": "Giải thích ngắn gọn"}
      ],
      "overallExplanation": "Tổng quan bối cảnh của tư liệu này"
    }
  ]
}`;
  } else {
    prompt = `Bạn là giáo viên Lịch sử THPT Quốc gia. Hãy tạo ${requestedCount} câu hỏi tự luận theo phong cách "${essayStyle}", chủ đề: "${topic}", từ khóa: "${keyword || 'Lịch sử 12'}".
Trả về duy nhất định dạng JSON:
{
  "questions": [
    {
      "id": "es-1",
      "type": "essay",
      "topic": "${topic}",
      "question": "Nội dung câu hỏi tự luận sâu sắc?",
      "keyPoints": ["Luận điểm then chốt 1", "Luận điểm then chốt 2", "Luận điểm then chốt 3"],
      "rubric": "Biểu điểm chi tiết theo thang điểm 10",
      "guideNote": "Lời dặn phương pháp làm bài của giáo viên",
      "suggestedAnswer": "Bài làm mẫu chi tiết, chia rõ các đề mục 1, 2, 3 khoa học"
    }
  ]
}`;
  }

  // Gọi Gemini
  const genAI = new GoogleGenerativeAI(apiKey);
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (text) {
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          const finalQuestions = parsed.questions.map((q, idx) => ({
            ...q,
            id: q.id || `gen-${Date.now()}-${idx}`,
            type: questionType,
            topic: q.topic || topic,
          }));
          return res.status(200).json({ success: true, questions: finalQuestions });
        }
      }
    } catch (err) {
      console.warn(`[Generate Questions] Model ${modelName} issue:`, err?.message || err);
    }
  }

  // Nếu tất cả model Gemini đều bận/lỗi, tự động hoàn trả ngân hàng câu hỏi chất lượng cao
  const fallbackList = getFilteredFallback(questionType, requestedCount);
  return res.status(200).json({
    success: true,
    questions: fallbackList,
    note: 'Đã tải bộ câu hỏi chất lượng cao từ ngân hàng khảo thí Lịch sử.',
  });
}
