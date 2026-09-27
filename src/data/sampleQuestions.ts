import { MultipleChoiceQuestion, TrueFalseQuestion, EssayQuestion } from '../types/history';

export const SAMPLE_TOPICS = [
  'Tổng hợp Ôn thi Tốt nghiệp THPT',
  'Cách mạng tháng Tám năm 1945 & Khai sinh nước VNDCCH',
  'Cuộc kháng chiến chống thực dân Pháp (1945 - 1954)',
  'Cuộc kháng chiến chống Mỹ, cứu nước (1954 - 1975)',
  'Việt Nam thời kỳ Đổi mới (1986 đến nay)',
  'Trật tự thế giới hai cực Ianta & Chiến tranh Lạnh (1945 - 1991)',
  'ASEAN và xu thế phát triển của thế giới sau Chiến tranh Lạnh',
  'Phong trào dân tộc dân chủ ở Việt Nam (1919 - 1930)',
];

export const SAMPLE_MULTIPLE_CHOICE: MultipleChoiceQuestion[] = [
  {
    id: 'mc-1',
    type: 'multiple_choice',
    topic: 'Cuộc kháng chiến chống thực dân Pháp (1945 - 1954)',
    grade: '12',
    difficulty: 'medium',
    question: 'Chiến thắng nào của quân và dân ta trong cuộc kháng chiến chống Pháp đã giáng đòn quyết định vào ý chí xâm lược của thực dân Pháp, làm phá sản hoàn toàn Kế hoạch Nava?',
    options: [
      'Chiến dịch Việt Bắc thu - đông năm 1947',
      'Chiến dịch Biên giới thu - đông năm 1950',
      'Cuộc Tiến công chiến lược Đông - Xuân 1953 - 1954',
      'Chiến dịch lịch sử Điện Biên Phủ năm 1954',
    ],
    correctAnswer: 3,
    explanation: 'Chiến thắng lịch sử Điện Biên Phủ (07/05/1954) là đỉnh cao của cuộc tiến công chiến lược Đông - Xuân 1953-1954, đập tan hoàn toàn kế hoạch Nava, giáng đòn quyết định vào ý chí xâm lược của thực dân Pháp, xoay chuyển cục diện chiến tranh, tạo cơ sở thực lực đi đến ký kết Hiệp định Giơ-ne-vơ 1954.',
    historicalTip: 'Mẹo nhớ: Việt Bắc 1947 (Phá sản kế hoạch Rơve, bảo vệ cơ quan đầu não) -> Biên giới 1950 (Giành quyền chủ động chiến lược) -> Điện Biên Phủ 1954 (Đòn quyết định đập tan Kế hoạch Nava).',
  },
  {
    id: 'mc-2',
    type: 'multiple_choice',
    topic: 'Cách mạng tháng Tám năm 1945 & Khai sinh nước VNDCCH',
    grade: '12',
    difficulty: 'easy',
    question: 'Hội nghị lần thứ 8 Ban Chấp hành Trung ương Đảng Cộng sản Đông Dương (tháng 5/1941) đã chủ trương đặt nhiệm vụ nào lên hàng đầu?',
    options: [
      'Giải phóng giai cấp công nông',
      'Giải phóng dân tộc',
      'Thực hiện cách mạng ruộng đất',
      'Đấu tranh đòi quyền dân sinh, dân chủ',
    ],
    correctAnswer: 1,
    explanation: 'Hội nghị Trung ương 8 (5/1941) do lãnh tụ Nguyễn Ái Quốc chủ trì tại Pác Bó (Cao Bằng) đã hoàn chỉnh chủ trương chuyển hướng chỉ đạo chiến lược: đặt nhiệm vụ giải phóng dân tộc lên hàng trước tiên và cao nhất, tạm gác khẩu hiệu tịch thu ruộng đất của địa chủ.',
    historicalTip: 'Từ Hội nghị TƯ 6 (1939) đến TƯ 8 (1941), ngọn cờ giải phóng dân tộc được giương cao nhất.',
  },
  {
    id: 'mc-3',
    type: 'multiple_choice',
    topic: 'Cuộc kháng chiến chống Mỹ, cứu nước (1954 - 1975)',
    grade: '12',
    difficulty: 'hard',
    question: 'Điểm giống nhau cơ bản giữa chiến lược "Chiến tranh đặc biệt" (1961 - 1965) và "Chiến tranh cục bộ" (1965 - 1968) của đế quốc Mỹ ở miền Nam Việt Nam là gì?',
    options: [
      'Đều dựa vào lực lượng chủ yếu là quân đội viễn chinh Mỹ và đồng minh',
      'Đều là các hình thức chiến tranh xâm lược thực dân mới, nằm trong chiến lược toàn cầu của Mỹ',
      'Đều được tiến hành sau khi thất bại trong phong trào Đồng khởi',
      'Đều sử dụng ồ ạt không quân và hải quân đánh phá miền Bắc ngay từ đầu',
    ],
    correctAnswer: 1,
    explanation: 'Điểm tương đồng bản chất nhất: Cả hai chiến lược đều là loại hình chiến tranh xâm lược thực dân mới của đế quốc Mỹ, nhằm chia cắt lâu dài đất nước ta, biến miền Nam thành thuộc địa kiểu mới và căn cứ quân sự của Mỹ, nằm trong chiến lược toàn cầu "Phản ứng linh hoạt". Điểm khác biệt lớn nhất là lực lượng tham chiến chủ yếu ("Chiến tranh đặc biệt" dùng quân đội Sài Gòn, "Chiến tranh cục bộ" dùng quân viễn chinh Mỹ giữ vai trò chủ chốt).',
    historicalTip: 'Phân biệt lực lượng nòng cốt: Chiến tranh đặc biệt = Quân đội Sài Gòn + cố vấn Mỹ; Chiến tranh cục bộ = Quân Mỹ + quân đồng minh + quân đội Sài Gòn.',
  },
  {
    id: 'mc-4',
    type: 'multiple_choice',
    topic: 'Trật tự thế giới hai cực Ianta & Chiến tranh Lạnh (1945 - 1991)',
    grade: '12',
    difficulty: 'medium',
    question: 'Sự kiện nào được xem là khởi đầu cho chính sách chống Liên Xô và các nước Xã hội chủ nghĩa của Mỹ, mở đầu cục diện Chiến tranh Lạnh?',
    options: [
      'Thông điệp của Tổng thống Truman tại Quốc hội Mỹ (3/1947)',
      'Kế hoạch Mác-san (Marshall) phục hưng châu Âu (6/1947)',
      'Sự thành lập khối quân sự NATO (4/1949)',
      'Sự ra đời của tổ chức Hiệp ước Vác-sa-va (5/1955)',
    ],
    correctAnswer: 0,
    explanation: 'Ngày 12/3/1947, Tổng thống Truman đọc thông điệp trước Quốc hội Mỹ khẳng định sự tồn tại của Liên Xô là mối đe dọa nghiêm trọng đối với nước Mỹ và đề nghị viện trợ khẩn cấp cho Hy Lạp và Thổ Nhĩ Kỳ. Sự kiện này là sự khởi đầu chính thức của Chiến tranh Lạnh.',
    historicalTip: 'Mốc mở đầu Chiến tranh Lạnh: Học thuyết Truman (3/1947). Mốc kết thúc: Tuyên bố chung giữa Gooc-ba-chốp và Bush cha tại đảo Manta (12/1989).',
  },
  {
    id: 'mc-5',
    type: 'multiple_choice',
    topic: 'Việt Nam thời kỳ Đổi mới (1986 đến nay)',
    grade: '12',
    difficulty: 'easy',
    question: 'Đại hội đại biểu toàn quốc lần thứ VI của Đảng Cộng sản Việt Nam (tháng 12/1986) đã đề ra đường lối đổi mới đất nước, trong đó xác định trọng tâm là đổi mới về lĩnh vực nào?',
    options: [
      'Đổi mới chính trị và xây dựng bộ máy nhà nước',
      'Đổi mới kinh tế',
      'Đổi mới văn hóa, giáo dục và khoa học công nghệ',
      'Đổi mới quốc phòng, an ninh và đối ngoại',
    ],
    correctAnswer: 1,
    explanation: 'Đại hội VI (12/1986) xác định trọng tâm là đổi mới kinh tế, đồng thời từng bước đổi mới về chính trị. Về kinh tế: xóa bỏ cơ chế tập trung quan liêu bao cấp, phát triển nền kinh tế hàng hóa nhiều thành phần vận hành theo cơ chế thị trường có sự quản lý của Nhà nước.',
    historicalTip: 'Khắc ghi nguyên tắc Đổi mới: Đổi mới toàn diện, đồng bộ, nhưng lấy đổi mới kinh tế làm trọng tâm!',
  },
];

export const SAMPLE_TRUE_FALSE: TrueFalseQuestion[] = [
  {
    id: 'tf-1',
    type: 'true_false',
    topic: 'Cách mạng tháng Tám năm 1945 & Khai sinh nước VNDCCH',
    grade: '12',
    difficulty: 'medium',
    passage: `Ngày 2-9-1945, tại Quảng trường Ba Đình (Hà Nội), Chủ tịch Hồ Chí Minh thay mặt Chính phủ lâm thời đọc bản Tuyên ngôn Độc lập, trịnh trọng tuyên bố trước quốc dân và thế giới: "Nước Việt Nam có quyền hưởng tự do và độc lập, và sự thật đã thành một nước tự do độc lập. Toàn thể dân tộc Việt Nam quyết đem tất cả tinh thần và lực lượng, tính mạng và của cải để giữ vững quyền tự do, độc lập ấy". Bản Tuyên ngôn Độc lập là một văn kiện lịch sử vô giá, khẳng định ý chí sắt đá và quyền tự quyết thiêng liêng của dân tộc Việt Nam.`,
    leadIn: 'Đọc đoạn trích trên và vận dụng kiến thức lịch sử, hãy xác định các mệnh đề dưới đây là Đúng hay Sai:',
    statements: [
      {
        id: 's-1-1',
        text: 'Tuyên ngôn Độc lập ngày 2-9-1945 đã tuyên bố chấm dứt hoàn toàn chế độ thực dân Pháp và phát xít Nhật cùng chế độ phong kiến tồn tại hàng nghìn năm ở Việt Nam.',
        isCorrect: true,
        explanation: 'Đúng. Bản Tuyên ngôn khẳng định nhân dân ta đã lật đổ xiềng xích thực dân gần 100 năm và ách thống trị phát xít, đồng thời lật đổ chế độ quân chủ ngót chục thế kỷ để lập nên chế độ Dân chủ Cộng hòa.',
      },
      {
        id: 's-1-2',
        text: 'Bản Tuyên ngôn Độc lập được công bố khi quân Đồng minh (Anh và quân Trung Hoa Dân quốc) đã tiến vào giải giáp quân Nhật trên toàn lãnh thổ nước ta.',
        isCorrect: false,
        explanation: 'Sai. Lúc này (ngày 2-9-1945), quân Đồng minh chưa chính thức vào nước ta với danh nghĩa giải giáp quân Nhật (phải đến đầu tháng 9 sau đó quân Tưởng và quân Anh mới lần lượt kéo vào). Việc đọc Tuyên ngôn Độc lập trước giúp Việt Nam xuất hiện với tư cách một quốc gia độc lập có chính quyền hợp pháp.',
      },
      {
        id: 's-1-3',
        text: 'Đoạn trích thể hiện quyết tâm bảo vệ nền độc lập dân tộc bằng mọi giá của nhân dân Việt Nam ngay sau khi giành được chính quyền.',
        isCorrect: true,
        explanation: 'Đúng. Câu trích: "Toàn thể dân tộc Việt Nam quyết đem tất cả tinh thần và lực lượng, tính mạng và của cải để giữ vững quyền tự do, độc lập ấy" thể hiện ý chí quật cường và quyết tâm cao độ.',
      },
      {
        id: 's-1-4',
        text: 'Sau ngày 2-9-1945, vị thế quốc tế của nước Việt Nam Dân chủ Cộng hòa đã được tất cả các cường quốc trong Hội đồng Bảo an Liên Hợp Quốc công nhận ngay lập tức.',
        isCorrect: false,
        explanation: 'Sai. Sau 2-9-1945, nước ta ở trong tình thế "ngàn cân treo sợi tóc", chưa có bất kỳ nước nào trên thế giới công nhận và đặt quan hệ ngoại giao (phải đến năm 1950, Liên Xô, Trung Quốc và các nước XHCN mới chính thức công nhận).',
      },
    ],
    overallExplanation: 'Tuyên ngôn Độc lập 2/9/1945 là mốc son chói lọi, khai sinh ra nước Việt Nam Dân chủ Cộng hòa, mở ra kỷ nguyên mới: kỷ nguyên độc lập, tự do và đi lên chủ nghĩa xã hội.',
  },
  {
    id: 'tf-2',
    type: 'true_false',
    topic: 'Cuộc kháng chiến chống Mỹ, cứu nước (1954 - 1975)',
    grade: '12',
    difficulty: 'hard',
    passage: `Hiệp định Pari về chấm dứt chiến tranh, lập lại hòa bình ở Việt Nam được ký chính thức ngày 27-1-1973. Hiệp định quy định: Hoa Kỳ và các nước cam kết tôn trọng độc lập, chủ quyền, thống nhất và toàn vẹn lãnh thổ của Việt Nam. Hoa Kỳ rút hết quân đội của mình và quân các nước đồng minh, hủy bỏ các căn cứ quân sự, cam kết không tiếp tục dính líu quân sự hoặc can thiệp vào công việc nội bộ của miền Nam Việt Nam. Nhân dân miền Nam Việt Nam tự quyết định tương lai chính trị của mình thông qua tổng tuyển cử tự do, dân chủ.`,
    leadIn: 'Dựa vào đoạn tư liệu về Hiệp định Pari 1973, xác định tính Đúng/Sai của các nhận định sau:',
    statements: [
      {
        id: 's-2-1',
        text: 'Hiệp định Pari 1973 là thắng lợi của sự kết hợp chặt chẽ giữa đấu tranh quân sự, chính trị và ngoại giao của dân tộc ta.',
        isCorrect: true,
        explanation: 'Đúng. Thắng lợi trên bàn đàm phán Pari bắt nguồn từ thắng lợi trên chiến trường miền Nam (Tiến công chiến lược 1972) và chiến thắng oanh liệt "Điện Biên Phủ trên không" cuối năm 1972 buộc Mỹ phải ký kết.',
      },
      {
        id: 's-2-2',
        text: 'Cũng giống như Hiệp định Giơ-ne-vơ năm 1954, Hiệp định Pari 1973 quy định việc tập kết chuyển quân của hai bên ở hai miền Nam - Bắc qua vĩ tuyến 17.',
        isCorrect: false,
        explanation: 'Sai. Đây là điểm khác biệt cốt tử! Hiệp định Giơ-ne-vơ 1954 có điều khoản tập kết quân sự chuyển quân hai miền (quân ta phải rút ra Bắc), còn Hiệp định Pari 1973 giữ nguyên trạng lực lượng quân giải phóng tại chỗ ở miền Nam, chỉ buộc quân Mỹ và đồng minh rút về nước.',
      },
      {
        id: 's-2-3',
        text: 'Với Hiệp định Pari năm 1973, ta đã hoàn thành mục tiêu "đánh cho Mỹ cút", tạo so sánh lực lượng thay đổi căn bản có lợi cho cách mạng miền Nam.',
        isCorrect: true,
        explanation: 'Đúng. Thực hiện lời dạy của Chủ tịch Hồ Chí Minh: "Đánh cho Mỹ cút, đánh cho Ngụy nhào", Hiệp định Pari đã tạo bước ngoặt buộc Mỹ rút hết quân, chỉ còn chính quyền Sài Gòn mất đi chỗ dựa quân sự trực tiếp.',
      },
      {
        id: 's-2-4',
        text: 'Ngay sau khi ký Hiệp định Pari 1973, chính quyền Sài Gòn đã nghiêm chỉnh thi hành ngừng bắn và chuẩn bị tổng tuyển cử hòa bình theo đúng thỏa thuận.',
        isCorrect: false,
        explanation: 'Sai. Ngay sau khi ký kết, chính quyền Nguyễn Văn Thiệu đã ngang nhiên phá hoại hiệp định, tiến hành các chiến dịch "tràn ngập lãnh thổ", càn quét "bình định", buộc quân dân ta phải tiếp tục đấu tranh chống vi phạm.',
      },
    ],
    overallExplanation: 'Hiệp định Pari 1973 là mốc lịch sử vĩ đại, đòn ngoại giao quyết định đưa đến Đại thắng mùa Xuân 1975 giải phóng hoàn toàn miền Nam, thống nhất đất nước.',
  },
];

export const SAMPLE_ESSAYS: EssayQuestion[] = [
  {
    id: 'es-1',
    type: 'essay',
    topic: 'Cuộc kháng chiến chống thực dân Pháp (1945 - 1954)',
    grade: '12',
    difficulty: 'medium',
    question: 'Phân tích ý nghĩa lịch sử của Chiến thắng Điện Biên Phủ (1954) đối với cách mạng Việt Nam và phong trào giải phóng dân tộc trên thế giới.',
    keyPoints: [
      'Đập tan hoàn toàn kế hoạch Nava và ý chí xâm lược của thực dân Pháp có Mỹ giúp sức.',
      'Là đỉnh cao của cuộc tiến công chiến lược Đông - Xuân 1953-1954, tạo ưu thế quyết định trên bàn đàm phán ký kết Hiệp định Giơ-ne-vơ 1954.',
      'Giải phóng hoàn toàn miền Bắc, tạo hậu phương vững chắc cho cuộc kháng chiến chống Mỹ sau này.',
      'Cổ vũ mạnh mẽ phong trào giải phóng dân tộc ở Á, Phi, Mỹ Latinh, chứng minh chân lý thời đại: một dân tộc nhỏ bé có thể đánh thắng một đế quốc to lớn.',
      'Ghi dấu vào lịch sử nhân loại như một Bạch Đằng, Chi Lăng, Đống Đa của thế kỉ XX.',
    ],
    suggestedAnswer: `1. Đối với cách mạng Việt Nam:
- Là chiến thắng vang dội nhất, đỉnh cao của cuộc kháng chiến chống thực dân Pháp (1945 - 1954).
- Đập tan hoàn toàn nỗ lực quân sự cao nhất của Pháp - Mỹ thông qua kế hoạch Nava, giáng đòn quyết định vào ý chí xâm lược của thực dân Pháp.
- Buộc chính phủ Pháp phải ký kết Hiệp định Giơ-ne-vơ năm 1954 về Đông Dương, công nhận các quyền dân tộc cơ bản của Việt Nam: độc lập, chủ quyền, thống nhất và toàn vẹn lãnh thổ.
- Chấm dứt ách thống trị gần 1 thế kỷ của thực dân Pháp trên đất nước ta; giải phóng hoàn toàn miền Bắc, đưa miền Bắc tiến lên CNXH, làm căn cứ địa vững chắc cho sự nghiệp giải phóng miền Nam thống nhất đất nước.

2. Đối với thế giới:
- Giáng đòn chí mạng vào hệ thống thuộc địa của chủ nghĩa thực dân cũ, mở đầu cho sự sụp đổ của chủ nghĩa thực dân trên phạm vi toàn thế giới.
- Cổ vũ mạnh mẽ phong trào đấu tranh giành độc lập của nhân dân các nước thuộc địa và phụ thuộc ở châu Á, châu Phi và khu vực Mỹ Latinh (tiêu biểu là nhân dân Angiêri).
- Được ghi vào lịch sử thế giới như một chiến công hiển hách mang tầm thời đại, chứng minh một chân lý sáng ngời: Một dân tộc dù đất không rộng, người không đông, nhưng nếu đoàn kết kiên cường, có đường lối lãnh đạo đúng đắn thì hoàn toàn có thể đánh bại bất kỳ thế lực thực dân xâm lược nào.`,
    rubric: 'Thang điểm 10: Ý nghĩa trong nước (5.5 điểm: Phá sản Kế hoạch Nava 1.5đ, Ký Hiệp định Giơ-ne-vơ 1.5đ, Giải phóng miền Bắc 1.5đ, Bài học nghệ thuật quân sự 1.0đ); Ý nghĩa quốc tế (3.5 điểm: Cổ vũ phong trào giải phóng dân tộc 2.0đ, Đánh sụp chủ nghĩa thực dân cũ 1.5đ); Trình bày mạch lạc, dẫn chứng chuẩn xác (1.0 điểm).',
    guideNote: 'Cần phân tách rành mạch hai phương diện: Ý nghĩa đối với cách mạng Việt Nam và Ý nghĩa đối với quốc tế. Tránh viết dàn trải thiếu luận điểm then chốt.',
  },
  {
    id: 'es-2',
    type: 'essay',
    topic: 'Cách mạng tháng Tám năm 1945 & Khai sinh nước VNDCCH',
    grade: '12',
    difficulty: 'hard',
    question: 'Hãy làm rõ thời cơ "ngàn năm có một" của Cách mạng tháng Tám năm 1945 ở Việt Nam. Đảng ta và Chủ tịch Hồ Chí Minh đã chớp thời cơ đó như thế nào?',
    keyPoints: [
      'Điều kiện khách quan thuận lợi: Phát xít Nhật đầu hàng Đồng minh vô điều kiện (giữa tháng 8/1945), quân Nhật ở Đông Dương tê liệt, chính quyền tay sai Trần Trọng Kim hoang mang dao động cực độ.',
      'Khoảng trống quyền lực tồn tại từ sau khi Nhật đầu hàng đến trước khi quân Đồng minh (Anh, Tưởng) tiến vào Đông Dương (chỉ trong khoảng 2 tuần).',
      'Điều kiện chủ quan chín muồi: Toàn dân đã sẵn sàng qua 3 cuộc diễn tập 1930-1931, 1936-1939, 1939-1945; Mặt trận Việt Minh có uy tín tuyệt đối; Lực lượng chính trị và vũ trang phát triển rộng khắp.',
      'Chớp thời cơ thần tốc: Hội nghị toàn quốc của Đảng (13-15/8/1945) và Đại hội Quốc dân Tân Trào (16-17/8/1945) quyết định phát lệnh Tổng khởi nghĩa giành chính quyền.',
      'Tổng khởi nghĩa nổ ra nhanh gọn từ 14/8 đến 28/8/1945 trên cả nước, ít đổ máu, hoàn thành thắng lợi trước khi quân Đồng minh vào nước ta.',
    ],
    suggestedAnswer: `1. Phân tích thời cơ "ngàn năm có một":
Thời cơ cách mạng là sự kết hợp nhuần nhuyễn giữa điều kiện khách quan và chủ quan thuận lợi:
- Điều kiện khách quan: Ngày 15-8-1945, Nhật hoàng tuyên bố đầu hàng Đồng minh không điều kiện. Quân đội Nhật ở Đông Dương mất hết tinh thần chiến đấu, chính phủ bù nhìn Trần Trọng Kim tê liệt rã rời. Xuất hiện một "khoảng trống quyền lực" vô cùng quý giá trước khi quân Anh và quân Trung Hoa Dân quốc kịp kéo vào giải giáp quân Nhật.
- Điều kiện chủ quan (yếu tố quyết định): Đảng ta đã chuẩn bị chu đáo suốt 15 năm qua 3 cao trào cách mạng (1930-1931, 1936-1939 và 1939-1945). Quần chúng nhân dân sục sôi khí thế cách mạng, sẵn sàng đứng lên giành độc lập. Lực lượng chính trị và lực lượng vũ trang (Việt Nam Cứu quốc quân, Việt Nam Tuyên truyền Giải phóng quân) đã hoàn thiện và lớn mạnh.

2. Nghệ thuật chớp thời cơ của Đảng và Bác Hồ:
- Nhận định chính xác tình hình: Ngay khi nhận được tin Nhật sắp đầu hàng, Ban Thường vụ Trung ương Đảng đã họp tại Tân Trào (13/8/1945) lập Ủy ban Khởi nghĩa toàn quốc và ban bố Quân lệnh số 1.
- Quyết tâm cao độ của Chủ tịch Hồ Chí Minh: "Dù hy sinh tới đâu, dù phải đốt cháy cả dãy Trường Sơn cũng phải kiên quyết giành cho được độc lập".
- Hành động thần tốc, linh hoạt: Khởi nghĩa nổ ra thắng lợi nhanh chóng ở các đô thị đầu não: Hà Nội (19/8), Huế (23/8), Sài Gòn (25/8).
- Kết quả: Toàn bộ cuộc Tổng khởi nghĩa diễn ra chỉ trong vòng 15 ngày (từ 14 đến 28-8-1945), giành chính quyền trọn vẹn trong cả nước và khai sinh nước VNDCCH vào ngày 2-9-1945 trước khi bất kỳ lực lượng quân sự Đồng minh nào kịp can thiệp.`,
    rubric: 'Thang điểm 10: Khái niệm và bối cảnh thời cơ khách quan (3.0đ); Chuẩn bị chủ quan (2.5đ); Nghệ thuật chớp thời cơ của Đảng và Bác Hồ (3.5đ); Kết luận và ý nghĩa (1.0đ).',
    guideNote: 'Cần nhấn mạnh tính chất chớp nhoáng (chỉ khoảng 2 tuần lễ). Nếu sớm hơn thì quân Nhật còn mạnh, nếu muộn hơn thì quân Tưởng và quân Anh đã vào chiếm đóng.',
  },
  {
    id: 'es-3',
    type: 'essay',
    topic: 'Cuộc kháng chiến chống thực dân Pháp (1945 - 1954)',
    grade: '12',
    difficulty: 'medium',
    question: 'Vì sao Chiến dịch Biên giới Thu - Đông năm 1950 được xem là bước ngoặt cơ bản, chuyển cuộc kháng chiến chống Pháp sang giai đoạn mới?',
    keyPoints: [
      'Hoàn cảnh lịch sử mới năm 1950: Cách mạng Trung Quốc thành công (1949), Liên Xô và các nước XHCN công nhận, đặt quan hệ ngoại giao với Việt Nam.',
      'Pháp thực hiện Kế hoạch Rơve nhằm khóa chặt biên giới Việt - Trung và cô lập căn cứ địa Việt Bắc.',
      'Mục tiêu chiến dịch của ta: Tiêu diệt một bộ phận sinh lực địch, khai thông biên giới Việt - Trung, củng cố và mở rộng căn cứ địa Việt Bắc.',
      'Ý nghĩa bước ngoặt: Quân đội ta giành quyền chủ động chiến lược trên chiến trường chính Bắc Bộ, chuyển từ thế phòng ngự, giữ gìn lực lượng sang thế tiến công và phản công.',
      'Khai thông con đường liên lạc chiến lược với hậu phương quốc tế xã hội chủ nghĩa.',
    ],
    suggestedAnswer: `1. Hoàn cảnh lịch sử và âm mưu của địch:
- Đầu năm 1950, cục diện chiến tranh có biến chuyển lớn: Cách mạng Trung Quốc thành công, nước CHND Trung Hoa ra đời; Liên Xô, Trung Quốc và các nước XHCN công nhận và đặt quan hệ ngoại giao với Việt Nam Dân chủ Cộng hòa.
- Đế quốc Mỹ tăng cường viện trợ can thiệp cho Pháp thông qua Kế hoạch Rơve: thiết lập "Hành lang Đông - Tây" và hệ thống phòng ngự trên Đường số 4 nhằm khóa chặt biên giới Việt - Trung, cô lập căn cứ Việt Bắc để chuẩn bị cuộc tiến công quy mô lớn.

2. Quyết tâm và diễn biến của quân dân ta:
- Tháng 6-1950, Trung ương Đảng và Bác Hồ quyết định mở Chiến dịch Biên giới Thu - Đông nhằm: Tiêu diệt một bộ phận quan trọng sinh lực địch; Khai thông con đường biên giới Việt - Trung; Củng cố và mở rộng căn cứ địa Việt Bắc.
- Đây là chiến dịch tiến công lớn đầu tiên do Bộ Tổng Tư lệnh chủ động mở, Chủ tịch Hồ Chí Minh trực tiếp ra mặt trận quan sát, chỉ đạo (trận Đông Khê mở màn thắng lợi).

3. Vì sao là bước ngoặt căn bản:
- Về thế và lực: Đập tan hoàn toàn Kế hoạch Rơve của Pháp, giải phóng dải biên giới dài 750km với 35 vạn dân, chọc thủng "Hành lang Đông - Tây".
- Về quyền chủ động: Ta đã giành được quyền chủ động chiến lược trên chiến trường chính Bắc Bộ. Từ đây, quân đội ta liên tục mở các chiến dịch tiến công và phản công, đẩy quân Pháp vào thế bị động phòng ngự.
- Về liên lạc quốc tế: Mở toang cánh cửa nối liền cuộc kháng chiến của nhân dân ta với khối các nước XHCN hùng mạnh, tiếp nhận nguồn viện trợ to lớn về vũ khí, khí tài và kỹ thuật.`,
    rubric: 'Thang điểm 10: Bối cảnh lịch sử và Kế hoạch Rơve (2.5đ); Chủ trương và mục tiêu của ta (2.0đ); Phân tích ý nghĩa bước ngoặt chuyển sang thế chủ động tiến công (4.5đ); Kết luận sâu sắc (1.0đ).',
    guideNote: 'Cần phân biệt rõ: Chiến dịch Việt Bắc 1947 ta giành thế phản công cục bộ bảo toàn đầu não, còn Biên giới 1950 ta giành quyền chủ động chiến lược trên toàn chiến trường chính Bắc Bộ.',
  },
  {
    id: 'es-4',
    type: 'essay',
    topic: 'Kháng chiến chống Mỹ, cứu nước (1954 - 1975)',
    grade: '12',
    difficulty: 'medium',
    question: 'Trình bày nguyên nhân bùng nổ, diễn biến tiêu biểu và ý nghĩa lịch sử của Phong trào "Đồng khởi" (1959 - 1960) ở miền Nam.',
    keyPoints: [
      'Nguyên nhân: Chính quyền Ngô Đình Diệm ban hành Luật 10/59 đặt cộng sản ra ngoài vòng pháp luật, lê máy chém khắp miền Nam, dìm phong trào cách mạng trong biển máu.',
      'Nghị quyết 15 của Trung ương Đảng (đầu năm 1959) soi đường: Xác định con đường cách mạng miền Nam là dùng bạo lực cách mạng của quần chúng.',
      'Diễn biến tiêu biểu: Khởi đầu từ Bắc Ái, Trà Bồng, đỉnh cao bùng nổ mạnh mẽ nhất tại Bến Tre (17/1/1960 dưới sự lãnh đạo của bà Nguyễn Thị Định và "Đội quân tóc dài").',
      'Ý nghĩa bước ngoặt: Chuyển cách mạng miền Nam từ thế giữ gìn lực lượng sang thế tiến công, làm sụp đổ từng mảng lớn chính quyền tay sai ở nông thôn.',
      'Dẫn đến sự ra đời của Mặt trận Dân tộc Giải phóng miền Nam Việt Nam (20/12/1960).',
    ],
    suggestedAnswer: `1. Nguyên nhân bùng nổ:
- Mỹ - Diệm phá hoại Hiệp định Giơ-ne-vơ 1954, thực hiện chiến dịch "tố cộng, diệt cộng", ban hành Luật 10/59 man rợ đặt người yêu nước ra ngoài vòng pháp luật, lê máy chém đi khắp miền Nam làm cho quần chúng nhân dân lâm vào cảnh khốn cùng.
- Tháng 1-1959, Hội nghị Trung ương Đảng lần thứ 15 đã mở đường, xác định: Cách mạng miền Nam phải dùng bạo lực cách mạng, kết hợp đấu tranh chính trị với đấu tranh vũ trang để đánh đổ chính quyền độc tài tay sai.

2. Diễn biến tiêu biểu tại Bến Tre:
- Ngày 17-1-1960, dưới sự lãnh đạo của Tỉnh ủy Bến Tre (tiêu biểu là nữ tướng Nguyễn Thị Định), nhân dân 3 xã Định Thủy, Phước Hiệp, Bình Khánh (huyện Mỏ Cày) đồng loạt nổi dậy với súng ngựa trời, giáo mác, tiếng mõ và trống trận vang trời.
- Phong trào nhanh chóng lan rộng ra toàn tỉnh Bến Tre, khắp Nam Bộ, Tây Nguyên và Trung Trung Bộ, xuất hiện "Đội quân tóc dài" huyền thoại giáng đòn trực diện vào hệ thống đồn bốt địch.

3. Ý nghĩa lịch sử:
- Giáng đòn bất ngờ và chí mạng vào chiến lược thống trị kiểu thực dân mới của Mỹ, làm lung lay tận gốc rễ chính quyền tay sai bù nhìn Ngô Đình Diệm.
- Đánh dấu bước phát triển nhảy vọt của cách mạng miền Nam: Chuyển từ thế giữ gìn lực lượng sang thế tiến công cách mạng liên tục.
- Ngày 20-12-1960, Mặt trận Dân tộc Giải phóng miền Nam Việt Nam ra đời, đoàn kết toàn dân tộc dưới ngọn cờ giải phóng miền Nam, thống nhất Tổ quốc.`,
    rubric: 'Thang điểm 10: Nguyên nhân và Nghị quyết 15 (3.0đ); Diễn biến tại Bến Tre và đặc điểm nổi bật (3.0đ); Phân tích ý nghĩa chuyển thế tiến công và Mặt trận ra đời (3.0đ); Trình bày lưu loát (1.0đ).',
    guideNote: 'Chú ý nhấn mạnh vai trò quyết định của Nghị quyết Trung ương 15 (1959) như ngọn đuốc thắp sáng và bước chuyển thế tiến công.',
  },
  {
    id: 'es-5',
    type: 'essay',
    topic: 'Kháng chiến chống Mỹ, cứu nước (1954 - 1975)',
    grade: '12',
    difficulty: 'hard',
    question: 'Phân tích ý nghĩa bước ngoặt lịch sử của cuộc Tổng tiến công và nổi dậy Tết Mậu Thân 1968. Tại sao thắng lợi này lại buộc Mỹ phải chấp nhận đàm phán tại Hội nghị Pari?',
    keyPoints: [
      'Bối cảnh: Chiến lược "Chiến tranh cục bộ" (1965-1968) của Mỹ lên tới đỉnh cao với hơn nửa triệu quân viễn chinh Mỹ và chư hầu tham chiến.',
      'Sự bất ngờ: Đánh vào các đô thị lớn, sào huyệt đầu não của địch (Tòa Đại sứ Mỹ, Dinh Độc Lập, Đài Phát thanh, Bộ Tổng tham mưu Sài Gòn) ngay trong đêm Giao thừa.',
      'Làm lung lay ý chí xâm lược của giới cầm quyền Washington, gây chấn động dư luận nước Mỹ và phong trào phản chiến quốc tế.',
      'Làm phá sản hoàn toàn chiến lược "Chiến tranh cục bộ" của Mỹ.',
      'Buộc Tổng thống Mỹ Giôn-xơn tuyên bố ngừng ném bom miền Bắc từ vĩ tuyến 20 trở ra, không tái tranh cử và chấp nhận ngồi vào bàn đàm phán Pari.',
    ],
    suggestedAnswer: `1. Bối cảnh và nét độc đáo của cuộc Tổng tiến công:
- Đến năm 1968, quân Mỹ đã đưa hơn 50 vạn quân viễn chinh vào miền Nam, chi tiêu hàng trăm tỷ đô la nhằm thực hiện chiến lược "Chiến tranh cục bộ" với các cuộc hành quân "tìm diệt" và "bình định".
- Đêm 30 rạng ngày 31-1-1968 (Tết Mậu Thân), quân giải phóng bất ngờ đồng loạt tiến công và nổi dậy tại 37/44 thị xã, thành phố, 4 đô thị lớn và hàng loạt căn cứ quân sự, đặc biệt là các sào huyệt đầu não tại Sài Gòn (Tòa Đại sứ Mỹ, Dinh Tổng thống, Bộ Tổng Tham mưu Sài Gòn).

2. Vì sao Mậu Thân 1968 là bước ngoặt quyết định:
- Đòn bất ngờ về không gian, thời gian và mục tiêu: Mỹ luôn nghĩ quân ta chỉ hoạt động ở vùng nông thôn, rừng núi; việc đánh thẳng vào các đô thị đã phơi bày sự bất lực của bộ máy tình báo và quân sự Mỹ.
- Đánh gục ý chí xâm lược của đế quốc Mỹ: Những hình ảnh lính Mỹ hoảng loạn tại Tòa đại sứ truyền hình trực tiếp về Washington đã làm sụp đổ niềm tin của nhân dân Mỹ, đẩy phong trào đòi rút quân lên đỉnh điểm.
- Phá sản chiến lược "Chiến tranh cục bộ" - nỗ lực quân sự cao nhất của đế quốc Mỹ tại Việt Nam.

3. Buộc Mỹ phải xuống thang chiến tranh và đàm phán:
- Ngày 31-3-1968, Tổng thống Mỹ Johnson phải tuyên bố 3 điều:
  + Đơn phương ngừng ném bom bắn phá miền Bắc từ vĩ tuyến 20 trở ra.
  + Chấp nhận cử đại diện đàm phán với Chính phủ Việt Nam Dân chủ Cộng hòa tại Hội nghị Pari.
  + Tuyên bố không ra tranh cử Tổng thống Mỹ nhiệm kỳ tiếp theo.
- Đây là dấu mốc mở ra cục diện "vừa đánh vừa đàm", tạo tiền đề chiến lược để tiến tới ký kết Hiệp định Pari năm 1973.`,
    rubric: 'Thang điểm 10: Bối cảnh và nét đặc sắc nghệ thuật quân sự (3.0đ); Tác động tới nội bộ nước Mỹ và chiến lược chiến tranh (3.5đ); Tuyên bố của Johnson và ý nghĩa đàm phán Pari (2.5đ); Lập luận chặt chẽ (1.0đ).',
    guideNote: 'Cần làm bật được khái niệm "đánh gục ý chí xâm lược" và sự kiện ngày 31/3/1968 của Tổng thống Mỹ Johnson.',
  },
  {
    id: 'es-6',
    type: 'essay',
    topic: 'Kháng chiến chống Mỹ, cứu nước (1954 - 1975)',
    grade: '12',
    difficulty: 'hard',
    question: 'Hãy làm sáng tỏ mối quan hệ biện chứng giữa Chiến thắng "Điện Biên Phủ trên không" (12 ngày đêm cuối năm 1972) và việc ký kết Hiệp định Pari năm 1973.',
    keyPoints: [
      'Âm mưu của Ních-xơn: Dùng máy bay chiến lược B-52 mở cuộc tập kích hủy diệt Hà Nội, Hải Phòng nhằm "đưa miền Bắc về thời kỳ đồ đá", ép ta phải nhượng bộ trên bàn đàm phán Pari.',
      'Quân dân miền Bắc kiên cường chiến đấu 12 ngày đêm (18/12 - 29/12/1972), bắn rơi 81 máy bay (trong đó có 34 siêu pháo đài bay B-52), đập tan huyền thoại pháo đài bay của không lực Hoa Kỳ.',
      'Là đòn quyết định buộc Mỹ phải ngừng ném bom và quay trở lại ký Hiệp định Pari đúng theo dự thảo đã thỏa thuận trước đó.',
      'Hiệp định Pari 1973 được ký kết ngày 27/1/1973, Mỹ phải công nhận độc lập, chủ quyền, thống nhất và toàn vẹn lãnh thổ của Việt Nam, cam kết rút hết quân viễn chinh về nước.',
      'Hoàn thành mục tiêu "Đánh cho Mỹ cút", tạo so sánh lực lượng áp đảo cho Đại thắng mùa Xuân 1975 ("Đánh cho Ngụy nhào").',
    ],
    suggestedAnswer: `1. Âm mưu của Mỹ và đòn tập kích B-52:
- Đến cuối năm 1972, bản dự thảo Hiệp định Pari cơ bản đã hoàn tất, nhưng chính quyền Nixon đã bội ước, trì hoãn ký kết và mở cuộc tập kích chiến lược bằng máy bay B-52 vào Hà Nội, Hải Phòng suốt 12 ngày đêm (18 đến 29-12-1972).
- Mục tiêu của Mỹ: Ép ta phải ký kết hiệp định theo những điều khoản có lợi cho Mỹ và chính quyền Sài Gòn, đồng thời cứu vãn uy danh quân sự trước khi rút lui.

2. Chiến thắng "Điện Biên Phủ trên không":
- Với sự chủ động đón trước tình hình của Bác Hồ và Bộ Quốc phòng, quân và dân miền Bắc (nòng cốt là bộ đội Phòng không - Không quân) đã anh dũng đánh bại cuộc tập kích, bắn rơi 81 máy bay hiện đại, trong đó có 34 máy bay B-52, bắt sống nhiều phi công Mỹ.
- Đây là tổn thất nặng nề nhất chưa từng có trong lịch sử không lực Hoa Kỳ, đập tan hoàn toàn huyền thoại "bất khả xâm phạm" của pháo đài bay B-52.

3. Mối quan hệ quyết định đến việc ký kết Hiệp định Pari 1973:
- Thắng lợi quân sự trên bầu trời Hà Nội trực tiếp đè bẹp ý chí uy hiếp bằng bom đạn của Nixon, buộc chính quyền Mỹ phải tuyên bố chấm dứt tập kích và chấp nhận ký Hiệp định Pari vào ngày 27-1-1973.
- Các điều khoản ký kết hoàn toàn giữ nguyên nội dung bản dự thảo mà Việt Nam đã kiên trì bảo vệ: Mỹ cam kết tôn trọng độc lập, chủ quyền, thống nhất, toàn vẹn lãnh thổ của Việt Nam; rút hết quân viễn chinh và quân đồng minh về nước, chấm dứt dính líu quân sự.
- Ý nghĩa: Hoàn thành bước thứ nhất trong tư tưởng Hồ Chí Minh: "Đánh cho Mỹ cút", làm thay đổi căn bản tương quan lực lượng trên chiến trường để quân dân ta tiến tới "Đánh cho Ngụy nhào" mùa Xuân năm 1975.`,
    rubric: 'Thang điểm 10: Âm mưu đen tối của Mỹ (2.5đ); Diễn biến và tầm vóc trận Điện Biên Phủ trên không (3.0đ); Mối liên hệ ký Hiệp định Pari (3.5đ); Đánh giá "Đánh cho Mỹ cút" (1.0đ).',
    guideNote: 'Cần phân tích mối quan hệ nhân quả: Chiến trường quyết định bàn đàm phán ngoại giao. Không có 12 ngày đêm Điện Biên Phủ trên không thì Mỹ sẽ không bao giờ ký Hiệp định Pari.',
  },
  {
    id: 'es-7',
    type: 'essay',
    topic: 'Kháng chiến chống Mỹ, cứu nước (1954 - 1975)',
    grade: '12',
    difficulty: 'medium',
    question: 'Nêu các nguyên nhân thắng lợi và bài học kinh nghiệm sâu sắc của cuộc Kháng chiến chống Mỹ, cứu nước (1954 - 1975).',
    keyPoints: [
      'Nguyên nhân chủ quan (quyết định): Sự lãnh đạo đúng đắn, sáng tạo của Đảng với đường lối giương cao hai ngọn cờ độc lập dân tộc và CNXH.',
      'Sức mạnh đại đoàn kết toàn dân tộc, tinh thần quả cảm kiên cường của quân và dân hai miền Nam - Bắc.',
      'Hậu phương miền Bắc XHCN vững chắc chi viện sức người, sức của không ngừng cho tiền tuyến lớn miền Nam.',
      'Nguyên nhân khách quan: Tình đoàn kết chiến đấu keo sơn của 3 dân tộc Đông Dương (Việt Nam - Lào - Campuchia); Sự giúp đỡ to lớn của Liên Xô, Trung Quốc và các nước XHCN; Phong trào phản chiến quốc tế mạnh mẽ.',
      'Bài học kinh nghiệm: Giữ vững độc lập tự chủ; Kết hợp đấu tranh quân sự, chính trị và ngoại giao; Nắm vững thời cơ chiến lược.',
    ],
    suggestedAnswer: `1. Các nguyên nhân thắng lợi:
* Nguyên nhân chủ quan (mang tính quyết định):
- Sự lãnh đạo sáng suốt, tài tình của Đảng Cộng sản Việt Nam với đường lối độc lập, tự chủ và sáng tạo; tiến hành đồng thời hai chiến lược cách mạng: Cách mạng XHCN ở miền Bắc và Cách mạng dân tộc dân chủ nhân dân ở miền Nam.
- Truyền thống yêu nước nồng nàn, tinh thần quả cảm không quản hy sinh "Không có gì quý hơn độc lập, tự do" của toàn thể nhân dân và các lực lượng vũ trang nhân dân Việt Nam.
- Miền Bắc XHCN là hậu phương lớn, hoàn thành xuất sắc nghĩa vụ chi viện "thóc không thiếu một cân, quân không thiếu một người" cho tiền tuyến lớn miền Nam.

* Nguyên nhân khách quan:
- Sự phối hợp chiến đấu và liên minh chặt chẽ của nhân dân ba nước Đông Dương (Việt Nam - Lào - Campuchia).
- Sự đồng tình, ủng hộ chí tình, viện trợ vật chất và tinh thần to lớn của các nước xã hội chủ nghĩa anh em (Liên Xô, Trung Quốc) cùng sự ủng hộ của phong trào công nhân và nhân dân yêu chuộng hòa bình toàn thế giới (kể cả nhân dân tiến bộ Mỹ).

2. Bài học kinh nghiệm lịch sử:
- Giữ vững và tăng cường sự lãnh đạo tuyệt đối của Đảng, nắm vững ngọn cờ độc lập dân tộc gắn liền với chủ nghĩa xã hội.
- Nghệ thuật kết hợp sức mạnh dân tộc với sức mạnh thời đại, kết hợp chặt chẽ giữa đấu tranh quân sự, chính trị và ngoại giao.
- Xây dựng lực lượng vũ trang ba thứ quân vững mạnh, nghệ thuật tiến hành chiến tranh nhân dân toàn dân, toàn diện.
- Bài học về phát hiện và chớp thời cơ chiến lược: Quyết định mở cuộc Tổng tiến công mùa Xuân 1975 với tư tưởng "Thần tốc, táo bạo, bất ngờ, chắc thắng".`,
    rubric: 'Thang điểm 10: Phân tích nguyên nhân chủ quan (4.0đ); Nguyên nhân khách quan (2.5đ); Rút ra 3-4 bài học kinh nghiệm sâu sắc cho công cuộc xây dựng và bảo vệ Tổ quốc hôm nay (3.5đ).',
    guideNote: 'Cần phân biệt rõ nguyên nhân quyết định nhất là sự lãnh đạo của Đảng và sức mạnh khối đại đoàn kết toàn dân tộc.',
  },
  {
    id: 'es-8',
    type: 'essay',
    topic: 'Phong trào cách mạng 1930 - 1945',
    grade: '12',
    difficulty: 'medium',
    question: 'Chứng minh rằng Phong trào cách mạng 1930 - 1931 với đỉnh cao Xô viết Nghệ - Tĩnh là cuộc diễn tập đầu tiên chuẩn bị cho thắng lợi của Cách mạng tháng Tám năm 1945.',
    keyPoints: [
      'Khẳng định quyền lãnh đạo thực tế của Đảng Cộng sản Việt Nam ngay từ khi vừa mới ra đời.',
      'Hình thành và rèn luyện khối liên minh công nông vững chắc - nền tảng của mọi thắng lợi cách mạng.',
      'Thành lập chính quyền Xô viết ở một số địa phương thuộc Nghệ An và Hà Tĩnh - mầm mống của chính quyền kiểu mới của dân, do dân, vì dân.',
      'Quần chúng được thử lửa đấu tranh chính trị kết hợp vũ trang sơ khai, tôi luyện lòng yêu nước và ý chí bất khuất.',
      'Để lại bài học sâu sắc cho Đảng về xây dựng lực lượng, thời cơ, khởi nghĩa vũ trang và liên minh giai cấp.',
    ],
    suggestedAnswer: `1. Khái quát về phong trào 1930 - 1931 và Xô viết Nghệ - Tĩnh:
- Phong trào bùng nổ ngay sau khi Đảng ra đời, đỉnh cao là sự xuất hiện của chính quyền Xô viết tại các xã thuộc Nghệ An và Hà Tĩnh vào cuối năm 1930 - đầu năm 1931. Chính quyền này đã ban bố các quyền tự do dân chủ, tịch thu ruộng đất công chia cho dân cày nghèo, xóa bỏ sưu thuế vô lý và tổ chức đời sống mới.

2. Vì sao là cuộc "diễn tập đầu tiên" cho Cách mạng tháng Tám 1945:
- Khẳng định vai trò lãnh đạo tuyệt đối của Đảng: Lần đầu tiên Đảng lãnh đạo một phong trào cách mạng quy mô toàn quốc, chứng tỏ đường lối trong Cương lĩnh chính trị đầu tiên là đúng đắn, làm phá sản hoàn toàn khuynh hướng cách mạng dân chủ tư sản.
- Xây dựng khối liên minh công nông vững chắc: Phong trào đã gắn kết chặt chẽ công nhân và nông dân trong cuộc đấu tranh sinh tử chống đế quốc và phong kiến, tạo nên đạo quân chủ lực hùng hậu của cách mạng.
- Tập dượt cho quần chúng nhân dân nắm chính quyền: Hình thái chính quyền Xô viết dù chỉ tồn tại trong 4-5 tháng nhưng là mầm mống của chính quyền cách mạng kiểu mới, giúp nhân dân hiểu rõ mục tiêu đấu tranh là giành chính quyền về tay mình.
- Bài học quý báu cho Đảng: Đảng đúc rút được nhiều bài học kinh nghiệm vô giá về xây dựng khối liên minh công nông, xây dựng mặt trận dân tộc thống nhất, tổ chức các hình thức đấu tranh và nghệ thuật khởi nghĩa vũ trang giành chính quyền.`,
    rubric: 'Thang điểm 10: Giới thiệu bản chất Xô viết Nghệ Tĩnh (2.5đ); Phân tích vai trò lãnh đạo và liên minh công nông (3.5đ); Phân tích ý nghĩa cuộc tập dượt cho CM Tám 1945 (3.0đ); Trình bày chuẩn xác (1.0đ).',
    guideNote: 'Cần trích dẫn hoặc nêu bật nhận định của Chủ tịch Hồ Chí Minh: Nếu không có phong trào 1930-1931 thì không thể có thắng lợi của Cách mạng tháng Tám năm 1945.',
  },
  {
    id: 'es-9',
    type: 'essay',
    topic: 'Phong trào cách mạng 1930 - 1945',
    grade: '12',
    difficulty: 'medium',
    question: 'Phân tích ý nghĩa lịch sử của việc thành lập Đảng Cộng sản Việt Nam (đầu năm 1930) và tính sáng tạo của Cương lĩnh chính trị đầu tiên do Nguyễn Ái Quốc soạn thảo.',
    keyPoints: [
      'Ý nghĩa: Là mốc son chói lọi, chấm dứt cuộc khủng hoảng sâu sắc về đường lối cứu nước và giai cấp lãnh đạo kéo dài gần một thế kỷ.',
      'Là sản phẩm kết hợp giữa chủ nghĩa Mác - Lênin với phong trào công nhân và phong trào yêu nước Việt Nam.',
      'Đưa cách mạng Việt Nam trở thành một bộ phận khăng khít của phong trào cách mạng thế giới.',
      'Tính đúng đắn và sáng tạo của Cương lĩnh chính trị đầu tiên: Vận dụng nhuần nhuyễn chủ nghĩa Mác - Lênin vào hoàn cảnh cụ thể của một nước thuộc địa nửa phong kiến.',
      'Xác định đúng mâu thuẫn chủ yếu: Đặt nhiệm vụ giải phóng dân tộc lên hàng đầu; tập hợp rộng rãi mọi lực lượng yêu nước trong Mặt trận thống nhất.',
    ],
    suggestedAnswer: `1. Ý nghĩa lịch sử của sự kiện thành lập Đảng (đầu năm 1930):
- Chấm dứt thời kỳ khủng hoảng về đường lối và giai cấp lãnh đạo: Từ đây cách mạng Việt Nam có một chính đảng duy nhất của giai cấp công nhân, có đường lối khoa học và cách mạng đúng đắn lãnh đạo.
- Là sản phẩm của quy luật sáng tạo đặc biệt: Sự kết hợp giữa chủ nghĩa Mác - Lênin với phong trào công nhân và phong trào yêu nước Việt Nam (đây là điểm sáng tạo của Nguyễn Ái Quốc so với học thuyết Mác ở châu Âu).
- Gắn cách mạng Việt Nam với cách mạng thế giới: Cách mạng nước ta trở thành một bộ phận khăng khít của phong trào giải phóng dân tộc và phong trào vô sản quốc tế.
- Là nhân tố hàng đầu quyết định mọi thắng lợi của cách mạng Việt Nam suốt từ năm 1930 đến nay.

2. Tính đúng đắn và sáng tạo của Cương lĩnh chính trị đầu tiên:
- Về đường lối chiến lược: Tiến hành "tư sản dân quyền cách mạng và thổ địa cách mạng để đi tới xã hội cộng sản" - gắn liền độc lập dân tộc với chủ nghĩa xã hội.
- Về nhiệm vụ cách mạng: Đặt nhiệm vụ chống đế quốc giành độc lập dân tộc lên hàng đầu, nhiệm vụ chống phong kiến giành ruộng đất cho dân cày được thực hiện từng bước phục vụ cho nhiệm vụ giải phóng dân tộc.
- Về lực lượng cách mạng: Xác định công nông là gốc của cách mạng; đồng thời chủ trương đoàn kết, lôi kéo hoặc trung lập tiểu tư sản, trí thức, phú nông, trung tiểu địa chủ và tư sản dân tộc yêu nước. Đây là tư tưởng đại đoàn kết dân tộc hết sức sáng tạo, không rập khuôn máy móc giáo điều.`,
    rubric: 'Thang điểm 10: Ý nghĩa thành lập Đảng (4.0đ); Phân tích các luận điểm sáng tạo trong Cương lĩnh (4.5đ); Đánh giá tổng kết (1.5đ).',
    guideNote: 'Cần làm nổi bật luận điểm: Quy luật thành lập Đảng ở Việt Nam có thêm yếu tố "phong trào yêu nước", và tinh thần tập hợp lực lượng đại đoàn kết dân tộc.',
  },
  {
    id: 'es-10',
    type: 'essay',
    topic: 'Công cuộc Đổi mới đất nước (1986 đến nay)',
    grade: '12',
    difficulty: 'medium',
    question: 'Trình bày bối cảnh lịch sử, nội dung trọng tâm của đường lối Đổi mới do Đại hội VI của Đảng (12/1986) đề ra và ý nghĩa lịch sử của công cuộc Đổi mới.',
    keyPoints: [
      'Bối cảnh: Đất nước lâm vào khủng hoảng kinh tế - xã hội trầm trọng do duy trì quá lâu cơ chế tập trung quan liêu bao cấp và những sai lầm trong bố trí cơ cấu kinh tế.',
      'Bối cảnh quốc tế: Xu thế cải tổ của Liên Xô và các nước XHCN; cuộc cách mạng khoa học - công nghệ đang diễn ra như vũ bão trên thế giới.',
      'Nội dung Đổi mới của Đại hội VI: Đổi mới toàn diện, đồng bộ, trọng tâm là đổi mới kinh tế gắn liền với từng bước đổi mới chính trị.',
      'Nội dung kinh tế cốt lõi: Phát triển nền kinh tế nhiều thành phần; xóa bỏ cơ chế tập trung quan liêu bao cấp sang cơ chế thị trường định hướng XHCN; thực hiện 3 chương trình kinh tế lớn (Lương thực - thực phẩm, Hàng tiêu dùng, Hàng xuất khẩu).',
      'Ý nghĩa: Đưa đất nước thoát khỏi khủng hoảng, nâng cao đời sống nhân dân, khẳng định vị thế và uy tín quốc tế của Việt Nam ngày nay.',
    ],
    suggestedAnswer: `1. Bối cảnh lịch sử trước Đại hội VI (1986):
- Trong nước: Sau 10 năm thống nhất (1975 - 1985), đất nước đạt được nhiều thành tựu quan trọng nhưng lâm vào cuộc khủng hoảng kinh tế - xã hội trầm trọng: lạm phát phi mã lên tới trên 700% (năm 1986), hàng hóa khan hiếm, đời sống nhân dân vô cùng khó khăn. Nguyên nhân chủ quan là do ta mắc bệnh chủ quan, duy ý chí, duy trì quá lâu cơ chế tập trung quan liêu bao cấp.
- Quốc tế: Tác động của cuộc cách mạng khoa học - công nghệ hiện đại, xu thế toàn cầu hóa; Liên Xô và các nước Đông Âu tiến hành cải tổ, cải cách mở cửa.

2. Nội dung cơ bản của đường lối Đổi mới (Đại hội VI, tháng 12-1986):
- Quan điểm chỉ đạo: "Nhìn thẳng vào sự thật, đánh giá đúng sự thật, nói rõ sự thật"; đổi mới toàn diện và đồng bộ nhưng trọng tâm là đổi mới về kinh tế.
- Đổi mới kinh tế:
  + Phát triển nền kinh tế hàng hóa nhiều thành phần có sự quản lý của Nhà nước theo định hướng XHCN.
  + Xóa bỏ cơ chế quản lý tập trung quan liêu, bao cấp, chuyển sang hạch toán kinh doanh, vận hành theo cơ chế thị trường.
  + Tập trung nguồn lực thực hiện 3 chương trình kinh tế lớn: Lương thực - thực phẩm, Hàng tiêu dùng và Hàng xuất khẩu.
- Đổi mới chính trị: Xây dựng Nhà nước pháp quyền XHCN của nhân dân, do nhân dân, vì nhân dân; đổi mới phương thức lãnh đạo của Đảng; thực hiện chính sách đối ngoại rộng mở: "Việt Nam muốn là bạn với tất cả các nước".

3. Ý nghĩa lịch sử:
- Đại hội VI là mốc son mở ra bước ngoặt lịch sử đưa đất nước thoát khỏi khủng hoảng kinh tế - xã hội.
- Giúp Việt Nam từ một nước thiếu lương thực trở thành quốc gia xuất khẩu gạo và nông sản hàng đầu thế giới; quy mô kinh tế tăng vọt, đời sống nhân dân được cải thiện vượt bậc, giữ vững ổn định chính trị - xã hội.`,
    rubric: 'Thang điểm 10: Bối cảnh trong nước và quốc tế (3.0đ); Phân tích nội dung đổi mới kinh tế và chính trị (4.0đ); Ý nghĩa và thành tựu (3.0đ).',
    guideNote: 'Cần nhấn mạnh nguyên tắc đổi mới: "Đổi mới toàn diện nhưng trọng tâm là kinh tế, đổi mới không phải thay đổi mục tiêu XHCN mà làm cho CNXH được thực hiện hiệu quả hơn".',
  },
  {
    id: 'es-11',
    type: 'essay',
    topic: 'Lịch sử thế giới hiện đại & Quan hệ quốc tế',
    grade: '12',
    difficulty: 'hard',
    question: 'Phân tích các xu thế phát triển của thế giới sau khi Chiến tranh lạnh chấm dứt (1991). Xu thế đó mang lại những thời cơ và thách thức gì cho Việt Nam?',
    keyPoints: [
      'Bối cảnh: Trật tự hai cực Ianta sụp đổ sau sự tan rã của Liên Xô (1991), chấm dứt thời kỳ Chiến tranh lạnh kéo dài gần nửa thế kỷ.',
      '4 xu thế phát triển chủ đạo: 1) Xu thế đa cực, nhiều trung tâm; 2) Các quốc gia lấy phát triển kinh tế làm trọng tâm; 3) Quan hệ giữa các nước lớn hòa hoãn, đối thoại, tránh xung đột trực tiếp; 4) Xu thế toàn cầu hóa và hội nhập quốc tế.',
      'Thời cơ đối với Việt Nam: Mở rộng quan hệ ngoại giao đa phương hóa, đa dạng hóa; thu hút vốn đầu tư nước ngoài (FDI), tiếp thu khoa học công nghệ, mở rộng thị trường xuất khẩu.',
      'Thách thức đối với Việt Nam: Nguy cơ tụt hậu xa hơn về kinh tế nếu không bắt kịp nhịp độ; cạnh tranh khốc liệt; nguy cơ xói mòn bản sắc văn hóa; diễn biến hòa bình và an ninh phi truyền thống.',
    ],
    suggestedAnswer: `1. Các xu thế phát triển của thế giới sau Chiến tranh lạnh (sau năm 1991):
- Xu thế đa cực: Trật tự hai cực Ianta sụp đổ, thế giới đang chuyển dịch mạnh mẽ sang trật tự đa cực với sự vươn lên của nhiều trung tâm quyền lực (Mỹ, EU, Nhật Bản, Trung Quốc, Nga, Ấn Độ...).
- Lấy kinh tế làm trọng điểm: Hầu hết các quốc gia đều điều chỉnh chiến lược, lấy phát triển kinh tế làm trung tâm để tăng cường sức mạnh tổng hợp quốc gia.
- Quan hệ giữa các nước lớn: Chuyển từ đối đầu căng thẳng sang hòa hoãn, vừa hợp tác vừa đấu tranh, kiềm chế lẫn nhau, tránh xung đột vũ trang trực tiếp.
- Xu thế toàn cầu hóa: Mở rộng liên kết kinh tế quốc tế, thương mại tự do và sự phụ thuộc lẫn nhau ngày càng sâu sắc giữa các nền kinh tế.
- Tuy nhiên, hòa bình thế giới vẫn bị đe dọa bởi xung đột cục bộ, sắc tộc, tôn giáo và các vấn đề an ninh phi truyền thống (biến đổi khí hậu, dịch bệnh, khủng bố).

2. Thời cơ đối với Việt Nam:
- Môi trường hòa bình, ổn định để tập trung phát triển đất nước; phá bỏ thế bao vây cô lập, thiết lập quan hệ ngoại giao với hơn 190 quốc gia (bình thường hóa quan hệ với Trung Quốc, Mỹ năm 1995, gia nhập ASEAN, WTO...).
- Cơ hội thu hút nguồn vốn đầu tư trực tiếp nước ngoài (FDI), tiếp cận tri thức khoa học, công nghệ hiện đại và mở rộng thị trường xuất khẩu toàn cầu.

3. Thách thức đối với Việt Nam:
- Nguy cơ tụt hậu xa hơn về kinh tế nếu không tận dụng được cơ hội cách mạng công nghiệp lần thứ tư.
- Sự cạnh tranh kinh tế toàn cầu vô cùng gay gắt; nguy cơ hòa tan, mai một bản sắc văn hóa dân tộc trong dòng xoáy hội nhập.
- Các thách thức an ninh phi truyền thống và âm mưu "diễn biến hòa bình" của các thế lực thù địch nhằm can thiệp vào chủ quyền đất nước.`,
    rubric: 'Thang điểm 10: Phân tích 4-5 xu thế sau Chiến tranh lạnh (4.5đ); Phân tích các thời cơ cho Việt Nam (2.5đ); Phân tích các thách thức và giải pháp (3.0đ).',
    guideNote: 'Cần liên hệ thực tiễn đường lối đối ngoại của Đại hội XIII của Đảng: Chủ động và tích cực hội nhập quốc tế sâu rộng, là bạn, là đối tác tin cậy và thành viên có trách nhiệm của cộng đồng quốc tế.',
  },
  {
    id: 'es-12',
    type: 'essay',
    topic: 'Lịch sử thế giới hiện đại & Quan hệ quốc tế',
    grade: '12',
    difficulty: 'medium',
    question: 'Trình bày quá trình gia nhập ASEAN (1995) của Việt Nam và đánh giá những đóng góp nổi bật của nước ta trong việc xây dựng Cộng đồng ASEAN đoàn kết, vững mạnh.',
    keyPoints: [
      'Bối cảnh: Sự chuyển biến từ đối đầu sang đối thoại ở Đông Nam Á sau khi "vấn đề Campuchia" được giải quyết (1991).',
      'Việt Nam chính thức tham gia Hiệp ước Thân thiện và Hợp tác (Hiệp ước Bali) năm 1992 và trở thành thành viên thứ 7 của ASEAN vào ngày 28/7/1995.',
      'Ý nghĩa: Đánh dấu bước tiến quan trọng mở đường cho sự hòa nhập toàn diện của Việt Nam với khu vực và quốc tế, hiện thực hóa ý tưởng về một ASEAN gồm đủ 10 quốc gia Đông Nam Á.',
      'Đóng góp nổi bật: Thúc đẩy kết nạp Lào, Mianma (1997), Campuchia (1999); Xây dựng Hiến chương ASEAN và hình thành Cộng đồng ASEAN (2015); Giữ vai trò Chủ tịch ASEAN (các năm 1998, 2010, 2020) với nhiều sáng kiến hòa bình.',
      'Đóng góp bảo vệ hòa bình, an ninh khu vực, đặc biệt là duy trì lập trường chung về Biển Đông dựa trên luật pháp quốc tế (UNCLOS 1982).',
    ],
    suggestedAnswer: `1. Quá trình Việt Nam gia nhập ASEAN:
- Sau khi vấn đề Campuchia được giải quyết bằng Hiệp định Pari năm 1991, cục diện quan hệ ở khu vực Đông Nam Á chuyển từ đối đầu căng thẳng sang đối thoại, hòa bình và hợp tác.
- Năm 1992, Việt Nam tham gia Hiệp ước Bali (Hiệp ước Thân thiện và Hợp tác ở Đông Nam Á), trở thành quan sát viên của ASEAN.
- Ngày 28-7-1995, tại Hội nghị Bộ trưởng Ngoại giao ASEAN lần thứ 28 tại Brunây, Việt Nam chính thức được kết nạp làm thành viên thứ 7 của Hiệp hội các quốc gia Đông Nam Á (ASEAN).
- Ý nghĩa: Mở ra thời kỳ hội nhập khu vực của nước ta, phá vỡ định kiến cũ, tạo tiền đề để kết nạp các nước còn lại, hoàn thành mục tiêu xây dựng một "ASEAN 10" đoàn kết toàn vẹn.

2. Những đóng góp nổi bật của Việt Nam cho ASEAN:
- Tích cực thúc đẩy mở rộng ASEAN: Việt Nam đóng vai trò cầu nối quan trọng trong việc kết nạp Lào, Mianma (1997) và Campuchia (1999), biến Đông Nam Á từ một khu vực bị chia rẽ thành một khối thống nhất.
- Đóng góp xây dựng các văn kiện then chốt: Tham gia tích cực vào việc soạn thảo và thông qua Hiến chương ASEAN (2007), kế hoạch xây dựng Cộng đồng ASEAN (chính thức hình thành ngày 31-12-2015) trên 3 trụ cột (Chính trị - An ninh, Kinh tế, Văn hóa - Xã hội).
- Đảm nhiệm thành công vai trò Chủ tịch luân phiên của ASEAN (năm 1998 tại Hà Nội, năm 2010 và đặc biệt năm 2020 với chủ đề "Gắn kết và chủ động thích ứng" dẫn dắt khu vực vượt qua đại dịch COVID-19).
- Duy trì hòa bình, an ninh và thượng tôn pháp luật: Kiên trì thúc đẩy lập trường chung của ASEAN về hòa bình, an ninh ở Biển Đông, giải quyết hòa bình các tranh chấp dựa trên luật pháp quốc tế và Công ước Luật biển của LHQ (UNCLOS 1982), thực hiện DOC và tiến tới COC thực chất, hiệu lực.`,
    rubric: 'Thang điểm 10: Quá trình và ý nghĩa gia nhập năm 1995 (3.5đ); Đóng góp mở rộng ASEAN 10 và thể chế Cộng đồng (3.5đ); Vai trò Chủ tịch và giữ vững an ninh Biển Đông (2.0đ); Trình bày logic, sâu sắc (1.0đ).',
    guideNote: 'Cần làm bật được ý nghĩa ngày 28/7/1995 là dấu mốc hội nhập quốc tế đa phương đầu tiên của Việt Nam trong thời kỳ Đổi mới.',
  },
];

