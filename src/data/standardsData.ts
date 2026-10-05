import { CompetencyDomain, DigitalTool, SampleLesson, SubjectOption } from '../types';

export const SUBJECTS: SubjectOption[] = [
  { id: 'toan', name: 'Toán', levels: ['tieuhoc', 'thcs', 'thpt'] },
  { id: 'nguvan', name: 'Ngữ văn (Tiếng Việt)', levels: ['tieuhoc', 'thcs', 'thpt'] },
  { id: 'tienganh', name: 'Tiếng Anh', levels: ['mamnon', 'tieuhoc', 'thcs', 'thpt'] },
  { id: 'tinhoc', name: 'Tin học', levels: ['tieuhoc', 'thcs', 'thpt'] },
  { id: 'khoahoctunhien', name: 'Khoa học tự nhiên', levels: ['thcs'] },
  { id: 'lichsu_diali', name: 'Lịch sử và Địa lý', levels: ['thcs'] },
  { id: 'vatli', name: 'Vật lí', levels: ['thpt'] },
  { id: 'hoahoc', name: 'Hóa học', levels: ['thpt'] },
  { id: 'sinhhoc', name: 'Sinh học', levels: ['thpt'] },
  { id: 'lichsu', name: 'Lịch sử', levels: ['thpt'] },
  { id: 'diali', name: 'Địa lí', levels: ['thpt'] },
  { id: 'congnghe', name: 'Công nghệ', levels: ['tieuhoc', 'thcs', 'thpt'] },
  { id: 'gdcd', name: 'GDCD / Kinh tế & Pháp luật', levels: ['thcs', 'thpt'] },
  { id: 'theduc', name: 'Thể dục (Giáo dục thể chất)', levels: ['mamnon', 'tieuhoc', 'thcs', 'thpt'] },
  { id: 'nghethuat', name: 'Nghệ thuật (Âm nhạc, Mĩ thuật)', levels: ['mamnon', 'tieuhoc', 'thcs', 'thpt'] },
  { id: 'hdtn', name: 'Hoạt động trải nghiệm, hướng nghiệp', levels: ['tieuhoc', 'thcs', 'thpt'] },
  { id: 'gdqpan', name: 'Giáo dục Quốc phòng - An ninh', levels: ['thpt'] },
  { id: 'gddp', name: 'Giáo dục Địa phương', levels: ['thcs', 'thpt'] },
  { id: 'tunhien_xahoi', name: 'Tự nhiên và Xã hội / Khoa học', levels: ['tieuhoc'] },
  { id: 'khampha_mn', name: 'Khám phá khoa học & Xã hội', levels: ['mamnon'] },
  { id: 'mon_khac', name: 'Môn học khác...', levels: ['mamnon', 'tieuhoc', 'thcs', 'thpt'] },
];

export const ALL_GRADES = [
  'Mầm non',
  'Lớp 1',
  'Lớp 2',
  'Lớp 3',
  'Lớp 4',
  'Lớp 5',
  'Lớp 6',
  'Lớp 7',
  'Lớp 8',
  'Lớp 9',
  'Lớp 10',
  'Lớp 11',
  'Lớp 12',
];

export const CURRICULUM_BOOKS = [
  'Kết nối tri thức với cuộc sống',
  'Chân trời sáng tạo',
  'Cánh diều',
  'Bộ tài liệu giáo dục địa phương',
  'Bộ sách khác / Tự chủ nhà trường',
];

export const COMPETENCY_DOMAINS: CompetencyDomain[] = [
  {
    id: 'domain_1',
    code: 'NLS 1',
    title: 'Vận hành thiết bị và phần mềm',
    description: 'Sử dụng thành thạo các thiết bị kỹ thuật số cơ bản (máy tính, máy tính bảng, điện thoại), hệ điều hành và các ứng dụng học tập số.',
    icon: 'Monitor',
    indicators: [
      'Bật/tắt thiết bị, kết nối mạng Internet/Wifi trường học an toàn.',
      'Đăng nhập và thao tác trên tài khoản học tập (Google Classroom, MS Teams, LMS).',
      'Quản lý, phân loại thư mục và lưu trữ tệp bài làm khoa học.',
      'Sử dụng các thiết bị ngoại vi: micro, webcam, bảng vẽ tương tác.',
    ],
  },
  {
    id: 'domain_2',
    code: 'NLS 2',
    title: 'Khai thác thông tin và dữ liệu số',
    description: 'Tìm kiếm, truy xuất, đối chiếu, thẩm định độ tin cậy và phân tích dữ liệu, thông tin trên môi trường số.',
    icon: 'Search',
    indicators: [
      'Sử dụng từ khóa tìm kiếm nâng cao trên Google, Bing, bách khoa toàn thư mở.',
      'Đánh giá và thẩm định độ xác thực của nguồn tin số (tác giả, cơ quan bảo trợ, ngày xuất bản).',
      'Thu thập và sắp xếp dữ liệu học tập vào bảng tính hoặc sơ đồ tổng hợp.',
      'Trích dẫn đúng quy định nguồn gốc tài liệu trực tuyến tham khảo.',
    ],
  },
  {
    id: 'domain_3',
    code: 'NLS 3',
    title: 'Giao tiếp và hợp tác trên môi trường số',
    description: 'Tương tác, thảo luận, chia sẻ tài liệu và phối hợp làm việc nhóm hiệu quả qua các nền tảng mạng và công cụ trực tuyến.',
    icon: 'Users',
    indicators: [
      'Tham gia thảo luận nhóm tích cực trên Padlet, Google Jamboard, Miro.',
      'Gửi phản hồi, nhận xét mang tính xây dựng cho bạn bè bằng bình luận số (comment).',
      'Đồng chỉnh sửa trực tiếp tài liệu nhóm (Google Docs/Slides/Sheets).',
      'Tuân thủ quy tắc ứng xử văn minh và lịch sự trên không gian mạng (Netiquette).',
    ],
  },
  {
    id: 'domain_4',
    code: 'NLS 4',
    title: 'Sáng tạo nội dung số',
    description: 'Thiết kế, xây dựng và thể hiện tri thức dưới dạng đa phương tiện (trình chiếu, infographic, video ngắn, sơ đồ tư duy, mô hình).',
    icon: 'Sparkles',
    indicators: [
      'Thiết kế bài thuyết trình đa phương tiện sinh động (Canva, Google Slides, Genially).',
      'Tạo sơ đồ tư duy tóm tắt bài học (Mindmeister, GitMind, Coggle).',
      'Biên tập video thuyết minh ngắn hoặc podcast báo cáo dự án học tập.',
      'Tuân thủ quyền tác giả, giấy phép Creative Commons khi sử dụng hình ảnh/âm thanh.',
    ],
  },
  {
    id: 'domain_5',
    code: 'NLS 5',
    title: 'An toàn và đạo đức số',
    description: 'Bảo vệ dữ liệu cá nhân, giữ gìn sức khỏe thể chất - tinh thần khi dùng thiết bị và thực hành liêm chính học thuật.',
    icon: 'ShieldCheck',
    indicators: [
      'Đặt mật khẩu mạnh và không chia sẻ thông tin tài khoản cho người khác.',
      'Nhận diện các chiêu trò lừa đảo trực tuyến (phishing, đường link độc hại).',
      'Cân bằng thời gian tiếp xúc màn hình, duy trì tư thế ngồi học công thái học.',
      'Trung thực trong học tập trực tuyến, không gian lận hay sao chép bài mà không trích dẫn.',
    ],
  },
  {
    id: 'domain_6',
    code: 'NLS 6',
    title: 'Giải quyết vấn đề bằng công nghệ & Tư duy máy tính',
    description: 'Vận dụng công cụ công nghệ, mô phỏng số và tư duy thuật toán để giải quyết các bài toán môn học và thực tế đời sống.',
    icon: 'Cpu',
    indicators: [
      'Sử dụng phần mềm mô phỏng (GeoGebra, PhET, Algodoo) để khám phá quy luật khoa học.',
      'Chia nhỏ vấn đề phức tạp thành các bước xử lý logic, biểu diễn thuật toán sơ đồ khối.',
      'Tự khắc phục các lỗi kỹ thuật cơ bản khi phần mềm học tập gặp sự cố.',
      'Ứng dụng Trí tuệ nhân tạo (AI) như một trợ lý học tập có tư duy phản biện.',
    ],
  },
];

export const DIGITAL_TOOLS: DigitalTool[] = [
  { id: 'canva', name: 'Canva', category: 'Trình chiếu & Thiết kế', description: 'Thiết kế infographic, poster, sơ đồ tóm tắt kiến thức và slide bài giảng sinh động' },
  { id: 'powerpoint', name: 'PowerPoint / Google Slides', category: 'Trình chiếu & Thiết kế', description: 'Trình chiếu tương tác, chèn video, trigger hoạt ảnh sư phạm' },
  { id: 'padlet', name: 'Padlet', category: 'Cộng tác & Bảng số', description: 'Bảng tương tác thu thập ý kiến học sinh, nộp bài, thảo luận nhóm trực tuyến' },
  { id: 'quizizz', name: 'Quizizz', category: 'Tương tác & Đánh giá', description: 'Trắc nghiệm tương tác gamification, kiểm tra khởi động hoặc củng cố' },
  { id: 'kahoot', name: 'Kahoot!', category: 'Tương tác & Đánh giá', description: 'Đấu trường kiến thức trực tiếp hào hứng cho cả lớp' },
  { id: 'wordwall', name: 'Wordwall', category: 'Tương tác & Đánh giá', description: 'Bộ trò chơi học tập tương tác đa dạng (nối chữ, vòng quay may mắn, mở hộp quà)' },
  { id: 'geogebra', name: 'GeoGebra', category: 'Mô phỏng & Chuyên ngành', description: 'Vẽ đồ thị hàm số, hình học động 2D/3D trực quan cho môn Toán' },
  { id: 'phet', name: 'PhET Interactive Simulations', category: 'Mô phỏng & Chuyên ngành', description: 'Mô phỏng thí nghiệm ảo Vật lí, Hóa học, Sinh học, Toán học chuẩn Đại học Colorado' },
  { id: 'google_workspace', name: 'Google Docs / Sheets', category: 'Cộng tác & Bảng số', description: 'Học sinh cùng viết báo cáo và phân tích số liệu theo nhóm thời gian thực' },
  { id: 'google_earth', name: 'Google Earth / Maps', category: 'Mô phỏng & Chuyên ngành', description: 'Khám phá không gian địa lí, địa danh lịch sử, khảo sát địa hình 3D' },
  { id: 'gemini_ai', name: 'Trợ lý AI (Gemini / ChatGPT)', category: 'Trí tuệ Nhân tạo (AI)', description: 'Rèn luyện kỹ năng đặt câu lệnh (prompt), tra cứu đối chiếu và tư duy phản biện' },
  { id: 'scratch', name: 'Scratch / Blockly', category: 'Lập trình & Kỹ thuật số', description: 'Lập trình trực quan kéo thả, xây dựng mô phỏng câu chuyện và trò chơi học tập' },
  { id: 'tinkercad', name: 'Tinkercad 3D / Circuits', category: 'Lập trình & Kỹ thuật số', description: 'Thiết kế mô hình 3D và mô phỏng mạch điện tử phục vụ dự án STEM' },
  { id: 'azota', name: 'Azota / Google Forms', category: 'Tương tác & Đánh giá', description: 'Tạo phiếu học tập số, kiểm tra tự động chấm điểm và thống kê tiến độ học tập' },
];

export const SAMPLE_LESSONS: SampleLesson[] = [
  {
    id: 'sample_toan7',
    schoolLevel: 'thcs',
    subject: 'Toán',
    grade: 'Lớp 7',
    curriculumBook: 'Kết nối tri thức với cuộc sống',
    lessonTitle: 'Hình lăng trụ đứng tam giác và hình lăng trụ đứng tứ giác',
    duration: '2 tiết (90 phút)',
    integrationLevel: 'Vận dụng',
    competencyDomains: ['domain_1', 'domain_4', 'domain_6'],
    tools: ['GeoGebra', 'Padlet', 'Quizizz', 'PowerPoint / Google Slides'],
    inclusiveEducation: true,
    clilIntegration: true,
    stemIntegration: true,
    aiLiteracy: false,
    bilingualMode: 'partial',
    pedagogicalMethod: 'Dạy học khám phá kết hợp mô phỏng số 3D và làm việc nhóm',
    sampleOutline: `I. Mục tiêu:
1. Kiến thức: Mô tả được các yếu tố: đỉnh, cạnh đáy, cạnh bên, mặt đáy, mặt bên của hình lăng trụ đứng tam giác, tứ giác. Tính được diện tích xung quanh và thể tích.
2. Năng lực số:
- Khai thác phần mềm GeoGebra 3D để xoay, mở phẳng mô hình hình lăng trụ (NLS 6).
- Chia sẻ sản phẩm thiết kế bao bì hộp quà dạng lăng trụ lên Padlet nhóm (NLS 3, NLS 4).
3. Thiết bị: Máy chiếu, máy tính bảng/phòng máy, tài khoản GeoGebra Classroom, Padlet.
Tiến trình gồm 4 hoạt động:
- HĐ 1: Khởi động qua trò chơi nhận diện vật thể thực tế dạng lăng trụ trên Quizizz.
- HĐ 2: Khám phá các yếu tố hình học thông qua thao tác xoay hình 3D trên GeoGebra.
- HĐ 3: Luyện tập tính diện tích xung quanh, thể tích với phiếu học tập tương tác.
- HĐ 4: Vận dụng thiết kế mô hình hộp quà sáng tạo (STEM mini).`,
  },
  {
    id: 'sample_tinhoc8',
    schoolLevel: 'thcs',
    subject: 'Tin học',
    grade: 'Lớp 8',
    curriculumBook: 'Cánh diều',
    lessonTitle: 'Sắp xếp và lọc dữ liệu trong bảng tính điện tử',
    duration: '1 tiết (45 phút)',
    integrationLevel: 'Nâng cao (Sáng tạo)',
    competencyDomains: ['domain_1', 'domain_2', 'domain_5', 'domain_6'],
    tools: ['Google Docs / Sheets', 'Quizizz', 'Canva'],
    inclusiveEducation: false,
    clilIntegration: false,
    stemIntegration: false,
    aiLiteracy: true,
    bilingualMode: 'none',
    pedagogicalMethod: 'Dạy học theo trạm kết hợp thực hành trên dữ liệu số thực tế',
    sampleOutline: `I. Mục tiêu bài học:
1. Kiến thức: Thực hiện được các thao tác sắp xếp dữ liệu theo thứ tự tăng dần, giảm dần; lọc dữ liệu theo điều kiện cụ thể trên Google Sheets/Excel.
2. Năng lực số:
- NLS 2: Xử lý, phân tích bảng điểm thi đua hoặc số liệu nhiệt độ thời tiết địa phương.
- NLS 5: Bảo đảm an toàn thông tin khi chia sẻ tệp dữ liệu có thông tin cá nhân.
- NLS 6: Ứng dụng AI phân tích ý nghĩa kết quả sau khi lọc dữ liệu.
II. Thiết bị dạy học: Phòng máy tính nối mạng, Google Drive, phiếu học tập số.
III. Tiến trình:
- HĐ 1: Đặt vấn đề tìm Top 5 học sinh có điểm cao nhất lớp từ bảng dữ liệu 100 học sinh.
- HĐ 2: Khám phá thao tác Sort & Filter trên bảng tính mẫu.
- HĐ 3: Thực hành theo nhóm 4 trạm dữ liệu thực tế.
- HĐ 4: Báo cáo kết quả và rút ra nhận xét.`,
  },
  {
    id: 'sample_khtn6',
    schoolLevel: 'thcs',
    subject: 'Khoa học tự nhiên',
    grade: 'Lớp 6',
    curriculumBook: 'Chân trời sáng tạo',
    lessonTitle: 'Tế bào - Đơn vị cơ sở của sự sống (Quan sát tế bào thực vật và động vật)',
    duration: '2 tiết (90 phút)',
    integrationLevel: 'Vận dụng',
    competencyDomains: ['domain_1', 'domain_2', 'domain_4'],
    tools: ['PhET Interactive Simulations', 'Canva', 'Padlet', 'Wordwall'],
    inclusiveEducation: true,
    clilIntegration: true,
    stemIntegration: true,
    aiLiteracy: false,
    bilingualMode: 'partial',
    pedagogicalMethod: 'Phương pháp Bàn tay nặn bột kết hợp Kính hiển vi kỹ thuật số & Mô phỏng tế bào 3D',
    sampleOutline: `I. Mục tiêu:
1. Kiến thức: Nêu được cấu tạo cơ bản của tế bào (màng sinh chất, chất tế bào, nhân/vùng nhân); phân biệt tế bào động vật và tế bào thực vật.
2. Năng lực số:
- NLS 1 & 6: Sử dụng mô phỏng tế bào tương tác trực quan 3D trên kính hiển vi ảo.
- NLS 4: Thiết kế sơ đồ so sánh tế bào trên Canva theo nhóm.
- CLIL: Tích hợp từ vựng chuyên ngành (Cell, Membrane, Cytoplasm, Nucleus, Chloroplast).
II. Học liệu số: Kính hiển vi ảo, video vi mô 4K, Padlet nhóm lớp.`,
  },
  {
    id: 'sample_tienganh9',
    schoolLevel: 'thcs',
    subject: 'Tiếng Anh',
    grade: 'Lớp 9',
    curriculumBook: 'Kết nối tri thức với cuộc sống',
    lessonTitle: 'Unit 8: Tourism in the Digital Age - Communication & Skills',
    duration: '1 tiết (45 phút)',
    integrationLevel: 'Nâng cao (Sáng tạo)',
    competencyDomains: ['domain_2', 'domain_3', 'domain_4', 'domain_5'],
    tools: ['Google Earth / Maps', 'Canva', 'Padlet', 'Trợ lý AI (Gemini / ChatGPT)'],
    inclusiveEducation: false,
    clilIntegration: true,
    stemIntegration: false,
    aiLiteracy: true,
    bilingualMode: 'full',
    pedagogicalMethod: 'Dạy học theo dự án (Project-Based Learning) - Thiết kế tour du lịch thông minh',
    sampleOutline: `I. Objectives:
1. Language knowledge: Use vocabulary related to ecotourism, travel apps, digital booking, and online reviews.
2. Digital Competencies:
- NLS 2: Search and critically evaluate digital travel information and reviews on Google Maps/TripAdvisor.
- NLS 3: Collaborate in pairs to create an interactive travel brochure on Canva.
- NLS 5: Discuss digital safety when making online travel payments and privacy settings.
- AI Literacy: Use AI prompts to check grammar and brainstorm itineraries ethically.`,
  },
  {
    id: 'sample_lichsudiali7',
    schoolLevel: 'thcs',
    subject: 'Lịch sử và Địa lí',
    grade: 'Lớp 7',
    curriculumBook: 'Kết nối tri thức với cuộc sống',
    lessonTitle: 'Cuộc khởi nghĩa Lam Sơn (1418 - 1427) - Những dấu mốc lịch sử chói lọi',
    duration: '2 tiết (90 phút)',
    integrationLevel: 'Vận dụng',
    competencyDomains: ['domain_1', 'domain_2', 'domain_3', 'domain_4'],
    tools: ['Google Earth / Maps', 'PowerPoint / Google Slides', 'Padlet', 'Wordwall'],
    inclusiveEducation: false,
    clilIntegration: false,
    stemIntegration: false,
    aiLiteracy: false,
    bilingualMode: 'none',
    pedagogicalMethod: 'Dạy học kết hợp lược đồ lịch sử số và dòng thời gian tương tác (Interactive Timeline)',
    sampleOutline: `I. Mục tiêu:
1. Kiến thức: Trình bày được các giai đoạn phát triển của khởi nghĩa Lam Sơn, phân tích nguyên nhân thắng lợi và ý nghĩa lịch sử.
2. Năng lực số:
- NLS 2: Khai thác bản đồ di tích lịch sử Lam Kinh trên Google Earth 3D.
- NLS 4: Cùng xây dựng dòng thời gian số (Digital Timeline) thể hiện các chiến thắng Tốt Động - Chúc Động, Chi Lăng - Xương Giang.`,
  },
  {
    id: 'sample_tieuhoc_tiengviet4',
    schoolLevel: 'tieuhoc',
    subject: 'Ngữ văn (Tiếng Việt)',
    grade: 'Lớp 4',
    curriculumBook: 'Chân trời sáng tạo',
    lessonTitle: 'Luyện từ và câu: Mở rộng vốn từ Nhân hậu - Đoàn kết',
    duration: '1 tiết (35 phút)',
    integrationLevel: 'Nhập môn (Khám phá)',
    competencyDomains: ['domain_1', 'domain_2', 'domain_3'],
    tools: ['Wordwall', 'Padlet', 'PowerPoint / Google Slides'],
    inclusiveEducation: true,
    clilIntegration: false,
    stemIntegration: false,
    aiLiteracy: false,
    bilingualMode: 'none',
    pedagogicalMethod: 'Trò chơi học tập tương tác số kết hợp kể chuyện đạo đức',
    sampleOutline: `I. Mục tiêu:
1. Hiểu nghĩa và sử dụng đúng các từ ngữ về lòng nhân hậu, tinh thần đoàn kết trong giao tiếp.
2. Năng lực số học sinh tiểu học:
- NLS 1: Thao tác bấm chạm trên màn hình tương tác hoặc điện thoại/máy tính của phụ huynh để tham gia trò chơi nối từ Wordwall.
- NLS 3: Viết một câu chia sẻ lời yêu thương gửi tới bạn bè lên Bảng hoa việc tốt Padlet.`,
  },
];
