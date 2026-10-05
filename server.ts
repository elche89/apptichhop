import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to get Gemini client
function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Chưa cấu hình API Key. Vui lòng cung cấp API Key trong phần Cài đặt hoặc thiết lập GEMINI_API_KEY.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Robust retry wrapper for Gemini operations to eradicate 503 (Overloaded) and transient errors
async function generateStreamWithRetry(
  ai: GoogleGenAI,
  requestedModel: string,
  prompt: string,
  systemInstruction: string,
  maxAttemptsPerModel = 3
) {
  // Ordered fallback models
  const candidateModels = Array.from(
    new Set([
      requestedModel,
      'gemini-3.8-flash',
      'gemini-2.5-flash',
      'gemini-3.1-flash-lite',
    ])
  );

  let lastErr: any = null;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= maxAttemptsPerModel; attempt++) {
      try {
        const stream = await ai.models.generateContentStream({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 32768,
          },
        });
        return { stream, modelUsed: model };
      } catch (err: any) {
        lastErr = err;
        const msg = String(err?.message || err);
        const is503OrOverloaded =
          msg.includes('503') ||
          msg.includes('overloaded') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('Resource has been exhausted') ||
          msg.includes('rateLimit') ||
          msg.includes('INTERNAL');

        console.warn(`[Gemini Stream] Attempt ${attempt} on model ${model} failed: ${msg}`);

        if (is503OrOverloaded && attempt < maxAttemptsPerModel) {
          // Exponential backoff: 1000ms, 2000ms...
          await new Promise((r) => setTimeout(r, attempt * 1200));
          continue;
        }
        // If exhausted attempts on this model, break to try fallback model
        break;
      }
    }
  }

  throw lastErr;
}

// Robust unary call with retry for refinement
async function generateContentWithRetry(
  ai: GoogleGenAI,
  requestedModel: string,
  prompt: string,
  systemInstruction: string,
  maxAttempts = 3
) {
  const candidateModels = Array.from(
    new Set([
      requestedModel,
      'gemini-3.8-flash',
      'gemini-2.5-flash',
      'gemini-3.1-flash-lite',
    ])
  );

  let lastErr: any = null;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            maxOutputTokens: 32768,
          },
        });
        return { response, modelUsed: model };
      } catch (err: any) {
        lastErr = err;
        const msg = String(err?.message || err);
        const is503OrOverloaded =
          msg.includes('503') ||
          msg.includes('overloaded') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('Resource has been exhausted');

        console.warn(`[Gemini Content] Attempt ${attempt} on ${model} failed: ${msg}`);

        if (is503OrOverloaded && attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, attempt * 1200));
          continue;
        }
        break;
      }
    }
  }

  throw lastErr;
}

// Health & System Info check
app.get('/api/system-status', (req, res) => {
  const hasEnvKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    hasDefaultApiKey: hasEnvKey,
    recommendedModel: 'gemini-3.8-flash',
    supportedModels: [
      { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Khuyên dùng - Nhanh & Chuẩn xác)', isDefault: true },
      { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (Chuyên sâu - Suy luận cao cấp)' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Ổn định, tiêu chuẩn)' },
      { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite (Tốc độ cao)' },
    ],
  });
});

// Check API Key endpoint
app.post('/api/check-api-key', async (req, res) => {
  try {
    const { apiKey, model = 'gemini-3.8-flash' } = req.body;
    const ai = getGeminiClient(apiKey);
    
    const { response, modelUsed } = await generateContentWithRetry(
      ai,
      model,
      'Trả lời ngắn gọn "OK" để kiểm tra kết nối API Key.',
      'Bạn là trợ lý kiểm tra kết nối API.',
      2
    );

    res.json({
      success: true,
      message: 'Kết nối API Key thành công!',
      modelUsed,
      reply: response.text?.trim() || 'OK',
    });
  } catch (error: any) {
    console.error('Error verifying API Key:', error);
    const msg = error?.message || 'Không thể kết nối với Gemini API.';
    const is503 = msg.includes('503') || msg.includes('overloaded');
    res.status(400).json({
      success: false,
      message: is503
        ? 'Máy chủ AI đang tạm thời quá tải (503). Hệ thống đã tự động thử lại nhưng chưa thành công, vui lòng thử lại sau giây lát.'
        : msg,
    });
  }
});

function isLessonPlanComplete(text: string, isPrimary: boolean): boolean {
  if (!text || text.length < 2000) return false;
  const lower = text.toLowerCase();
  const hasActivity4 = lower.includes('hoạt động 4') || lower.includes('vận dụng') || lower.includes('trải nghiệm');
  if (isPrimary) {
    const hasSection4 = lower.includes('điều chỉnh') || lower.includes('đánh giá') || lower.includes('phụ lục');
    return hasActivity4 && hasSection4;
  } else {
    const hasSection4 = lower.includes('iv.') || lower.includes('phụ lục') || lower.includes('rubric') || lower.includes('tiêu chí đánh giá') || lower.includes('phiếu học tập');
    return hasActivity4 && hasSection4;
  }
}

// SSE Streaming Generation for KHBD
app.post('/api/generate-khbd', async (req, res) => {
  let pingInterval: NodeJS.Timeout | null = null;

  try {
    const {
      apiKey,
      model = 'gemini-3.8-flash',
      schoolLevel,
      subject,
      grade,
      curriculumBook,
      lessonTitle,
      lessonDuration,
      targetPages = '5 - 7 trang (Đầy đủ, chuẩn mực)',
      competencyDomains = [],
      integrationLevel = 'vận dụng',
      tools = [],
      inclusiveEducation = false,
      clilIntegration = false,
      stemIntegration = false,
      aiLiteracy = false,
      bilingualMode = 'none',
      pedagogicalMethod = 'Dạy học tích cực kết hợp Chuyển đổi số',
      additionalRequirements = '',
      existingContent = '',
      distributionContext = '',
    } = req.body;

    const ai = getGeminiClient(apiKey);

    // Bilingual description
    let bilingualInstruction = '';
    if (bilingualMode === 'full') {
      bilingualInstruction = 'YÊU CẦU ĐẶC BIỆT: Soạn Kế hoạch bài dạy SONG NGỮ TOÀN PHẦN (English - Vietnamese). Mọi tiêu đề, mục tiêu, chỉ số NLS và tiến trình 4 hoạt động đều trình bày song song cả tiếng Việt và tiếng Anh chuẩn mực.';
    } else if (bilingualMode === 'partial') {
      bilingualInstruction = 'YÊU CẦU ĐẶC BIỆT: Soạn Kế hoạch bài dạy SONG NGỮ MỘT PHẦN (Partial Bilingual). Ưu tiên trình bày song ngữ ở phần mục tiêu, hoạt động khởi động, các từ khóa thuật ngữ chuyên môn trọng tâm và học liệu số.';
    }

    const isPrimary = schoolLevel === 'tieuhoc' || schoolLevel === 'mamnon';
    const standardName = isPrimary ? 'Công văn 2345/BGDĐT-GDTH' : 'Công văn 5512/BGDĐT-GDTrH';

    // Build comprehensive system instruction for Vietnamese Digital Competency KHBD
    const prompt = `
Bạn là Chuyên gia Cao cấp về Phương pháp Dạy học và Chuyển đổi số trong Giáo dục phổ thông Việt Nam (theo Chương trình GDPT 2018 và Khung Năng Lực Số của Bộ Giáo dục & Đào tạo).

Hãy xây dựng KẾ HOẠCH BÀI DẠY (KHBD) TÍCH HỢP NĂNG LỰC SỐ HOÀN CHỈNH, CHUYÊN SÂU theo đúng quy định ${standardName} với thông tin sau:
- Cấp học: ${schoolLevel === 'tieuhoc' ? 'Tiểu học' : schoolLevel === 'mamnon' ? 'Mầm non' : schoolLevel === 'thpt' ? 'Trung học phổ thông' : 'Trung học cơ sở'}
- Môn học: ${subject || 'Lịch sử và Địa lý'}
- Khối lớp: ${grade || 'Lớp 6'}
- Chương trình: Chương trình Giáo dục phổ thông 2018 (Chuẩn quốc gia hợp nhất)
- Tên bài học / Chủ đề: ${lessonTitle || 'Bài mở đầu'}
- Thời lượng: ${lessonDuration || '1 tiết (45 phút)'}
- Dung lượng số trang mong muốn khi in: ${targetPages}
- Mức độ tích hợp NLS: ${integrationLevel}
- Các miền Năng lực số trọng tâm cần tích hợp: ${competencyDomains.length > 0 ? competencyDomains.join(', ') : 'Khai thác thông tin và dữ liệu, Giao tiếp và hợp tác số, Sáng tạo nội dung số, An toàn số'}
- Thiết bị & Công cụ số gợi ý sử dụng: ${tools.length > 0 ? tools.join(', ') : 'Máy chiếu, TV tương tác, Padlet, Canva, Quizizz, GeoGebra, Google Workspace'}
- Phương pháp dạy học: ${pedagogicalMethod}
- Tùy chọn chuyên biệt:
  * Dạy học hòa nhập cho HS chuyên biệt/yếu thế: ${inclusiveEducation ? 'CÓ (Cần có biện pháp hỗ trợ tiếp cận số, phân hóa mức độ cho HS hòa nhập)' : 'Không'}
  * Tích hợp Ngoại ngữ CLIL (Song ngữ thuật ngữ chuyên môn): ${clilIntegration ? 'CÓ (Chèn thuật ngữ tiếng Anh song song và bài đọc/tra cứu số bằng tiếng Anh)' : 'Không'}
  * Chế độ Song ngữ: ${bilingualMode !== 'none' ? bilingualMode : 'Không'}
  * Tích hợp Giáo dục STEM / STEAM: ${stemIntegration ? 'CÓ (Gắn với quy trình thiết kế kỹ thuật, giải quyết vấn đề thực tiễn)' : 'Không'}
${bilingualInstruction ? `\n${bilingualInstruction}\n` : ''}
${additionalRequirements ? `- Yêu cầu bổ sung của giáo viên: ${additionalRequirements}` : ''}
${existingContent ? `- NỘI DUNG GIÁO ÁN GỐC DO GIÁO VIÊN TẢI LÊN:\n${existingContent.slice(0, 7000)}` : ''}
${distributionContext ? `- BỐI CẢNH PHÂN PHỐI CHƯƠNG TRÌNH / KHUNG NĂNG LỰC ĐỊA PHƯƠNG:\n${distributionContext.slice(0, 3000)}` : ''}

QUY TẮC BẮT BUỘC:
1. BẮT ĐẦU NGAY LẬP TỨC bằng dòng tiêu đề Markdown "# KẾ HOẠCH BÀI DẠY: [TÊN BÀI HỌC]".
2. TUYỆT ĐỐI KHÔNG ĐƯỢC VIẾT bất kỳ lời chào, câu chào mừng hay lời dẫn dắt mở đầu nào như "Tuyệt vời!", "Với vai trò là Chuyên gia...", "Chào bạn...", "Dưới đây là...".
3. TUYỆT ĐỐI KHÔNG thêm mục "Hướng dẫn Văn hóa & Đạo đức khi ứng dụng Trí tuệ Nhân tạo (AI Literacy Guide for Students)".
4. Để trống phần Tên trường và Tên giáo viên bằng dòng kẻ chấm chấm để giáo viên tự điền.
5. YÊU CẦU HOÀN CHỈNH TOÀN BỘ CÁC PHẦN (TUYỆT ĐỐI KHÔNG NGẮT GIỮA CHỪNG):
   - Kế hoạch bài dạy PHẢI ĐƯỢC VIẾT HOÀN THIỆN ĐẦY ĐỦ 100% TỪNG PHẦN, TỪ ĐẦU ĐẾN CUỐI:
     + Mục tiêu bài dạy (Kiến thức, Năng lực chung, Năng lực đặc thù, NĂNG LỰC SỐ TÍCH HỢP, Phẩm chất).
     + Thiết bị dạy học và học liệu số.
     + Tiến trình dạy học chi tiết ĐẦY ĐỦ 4 HOẠT ĐỘNG: Hoạt động 1 (Khởi động), Hoạt động 2 (Hình thành kiến thức mới), Hoạt động 3 (Luyện tập), Hoạt động 4 (Vận dụng). Mỗi hoạt động phải đầy đủ Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện 4 bước.
     + Phụ lục & Đánh giá NLS (Bảng Rubric đầy đủ tiêu chí và Phiếu học tập số).
   - Tùy chọn "Số trang mong muốn" (${targetPages}) là định hướng dung lượng trong giới hạn tối đa có thể đạt được: TUYỆT ĐỐI KHÔNG ĐƯỢC ngắt giữa chừng, không dừng lại ở Hoạt động 2 hay Hoạt động 3 chỉ để bảo đảm số trang. Phải kết thúc bài trọn vẹn, xuất sắc!
6. QUY CHUẨN GHI CHÚ THÍCH CÔNG CỤ SỐ VÀ NĂNG LỰC SỐ:
   - Dùng đúng thẻ [ỨNG DỤNG SỐ] (hoặc [ỨNG DỤNG SỐ: Tên nền tảng/công cụ]) trong các bước tổ chức thực hiện.
   - Dùng đúng thẻ [MÃ NLS ĐẠT ĐƯỢC] (hoặc [MÃ NLS ĐẠT ĐƯỢC: Mã NLS]) trong các bước học sinh thao tác số.

${isPrimary ? `
YÊU CẦU CẤU TRÚC KẾ HOẠCH BÀI DẠY TIỂU HỌC (CHUẨN CÔNG VĂN 2345/BGDĐT-GDTH):
# KẾ HOẠCH BÀI DẠY: [TÊN BÀI HỌC VIẾT HOA]
**Trường:** ....................................................
**Khối/Lớp:** .................................................
**Giáo viên:** .................................................
**Môn học:** [Môn] - **Lớp:** [Lớp]
**Thời lượng thực hiện:** [Số tiết]

## I. YÊU CẦU CẦN ĐẠT
### 1. Năng lực đặc thù:
(Nêu rõ các yêu cầu cần đạt môn học theo CT GDPT 2018)
### 2. Năng lực chung & Năng lực số:
- Năng lực chung: Tự chủ và tự học, Giao tiếp và hợp tác, Giải quyết vấn đề và sáng tạo.
- Năng lực số (NLS) tích hợp: (Chỉ số hành vi số của học sinh tiểu học)
### 3. Phẩm chất:
(Yêu nước, nhân ái, chăm chỉ, trung thực, trách nhiệm)

## II. ĐỒ DÙNG DẠY HỌC
### 1. Đối với giáo viên:
- Thiết bị và ứng dụng số: (Máy tính, bài giảng tương tác, trò chơi số Wordwall/Quizizz/Padlet...)
### 2. Đối với học sinh:
- Thiết bị (nếu có) hoặc học liệu số chuẩn bị trước.

## III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU
1. **Hoạt động 1: Khởi động (Kết nối)**
   - Mục tiêu:
   - Cách thức tiến hành (Tổ chức theo 2 cột hoặc 2 mục rõ ràng: Hoạt động của giáo viên | Hoạt động của học sinh; ghi rõ ứng dụng số và chỉ số NLS).
2. **Hoạt động 2: Khám phá (Hình thành kiến thức mới)**
   - Mục tiêu:
   - Cách thức tiến hành (Hoạt động của giáo viên | Hoạt động của học sinh).
3. **Hoạt động 3: Luyện tập, thực hành**
   - Mục tiêu:
   - Cách thức tiến hành (Hoạt động của giáo viên | Hoạt động của học sinh).
4. **Hoạt động 4: Vận dụng, trải nghiệm**
   - Mục tiêu:
   - Cách thức tiến hành (Hoạt động của giáo viên | Hoạt động của học sinh).

## IV. ĐIỀU CHỈNH SAU BÀI DẠY (NẾU CÓ)
(Để trống để giáo viên ghi chú sau giờ dạy)
` : `
YÊU CẦU CẤU TRÚC KẾ HOẠCH BÀI DẠY THCS & THPT (CHUẨN CÔNG VĂN 5512/BGDĐT-GDTrH):
# KẾ HOẠCH BÀI DẠY: [TÊN BÀI HỌC VIẾT HOA]
**Trường:** ....................................................
**Tổ chuyên môn:** .....................................
**Giáo viên:** .................................................
**Môn học:** [Môn] - **Lớp:** [Lớp]
**Thời lượng thực hiện:** [Số tiết]

## I. MỤC TIÊU BÀI DẠY
### 1. Về kiến thức
(Liệt kê các Yêu cầu cần đạt chuẩn theo CT GDPT 2018)
### 2. Về năng lực
- **Năng lực chung:** Tự chủ và tự học, Giao tiếp và hợp tác, Giải quyết vấn đề và sáng tạo.
- **Năng lực đặc thù môn học:** [Nêu rõ năng lực chuyên môn môn học].
- **NĂNG LỰC SỐ (NLS) TÍCH HỢP ĐẶC BIỆT:**
  (Phân tích chi tiết thành các chỉ số hành vi cụ thể gắn với mã miền NLS: NLS 1, NLS 2, NLS 3, NLS 4, NLS 5, NLS 6).
### 3. Về phẩm chất
(Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm)

## II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU SỐ
### 1. Đối với Giáo viên:
- Thiết bị phần cứng: [Máy tính, tivi thông minh, máy chiếu...]
- Nền tảng & Ứng dụng số: [Phần mềm, website học tập, Quizizz/Padlet/Canva/GeoGebra...]
- Học liệu số: [Video clip tương tác, kho ảnh số, bài giảng e-learning...]
### 2. Đối với Học sinh:
- Thiết bị cá nhân hoặc phòng máy bộ môn.
- Tài khoản học tập & Học liệu số chuẩn bị trước.

## III. TIẾN TRÌNH DẠY HỌC CHI TIẾT
Gồm 4 hoạt động chuẩn 5512:
1. **Hoạt động 1: Mở đầu / Khởi động (Xác định vấn đề / nhiệm vụ học tập)**
   - a) Mục tiêu:
   - b) Nội dung:
   - c) Sản phẩm:
   - d) Tổ chức thực hiện (Rõ 4 bước: Giao nhiệm vụ -> Thực hiện nhiệm vụ -> Báo cáo, thảo luận -> Kết luận, nhận định. Trong mỗi bước ghi rõ: [ỨNG DỤNG SỐ] và [MÃ NLS ĐẠT ĐƯỢC])
2. **Hoạt động 2: Hình thành kiến thức mới (Khám phá tri thức)**
   - a) Mục tiêu:
   - b) Nội dung:
   - c) Sản phẩm:
   - d) Tổ chức thực hiện (Giao nhiệm vụ -> Thực hiện nhiệm vụ -> Báo cáo, thảo luận -> Kết luận, nhận định)
3. **Hoạt động 3: Luyện tập (Củng cố và rèn luyện kỹ năng)**
   - a) Mục tiêu:
   - b) Nội dung:
   - c) Sản phẩm:
   - d) Tổ chức thực hiện
4. **Hoạt động 4: Vận dụng (Mở rộng và ứng dụng vào thực tiễn cuộc sống)**
   - a) Mục tiêu:
   - b) Nội dung:
   - c) Sản phẩm:
   - d) Tổ chức thực hiện

## IV. PHỤ LỤC & ĐÁNH GIÁ NĂNG LỰC SỐ
### 1. Bảng Tiêu chí Đánh giá (Rubric) Năng lực số của học sinh trong bài học:
(Lập bảng Markdown gồm: Miền năng lực số | Tiêu chí đánh giá | Mức 1 (Chưa đạt) | Mức 2 (Đạt) | Mức 3 (Tốt))
### 2. Phiếu học tập số / Hướng dẫn nhiệm vụ học tập số
${inclusiveEducation ? '### 3. Kế hoạch Hỗ trợ Giáo dục Hòa nhập (Dành riêng cho HS cần hỗ trợ đặc biệt)' : ''}
${clilIntegration ? '### 4. Bảng Thuật ngữ Tiếng Anh Chuyên ngành (CLIL Glossary)' : ''}
`}

Hãy viết một giáo án cực kỳ chi tiết, chỉn chu, ngôn từ sư phạm chuẩn mực Bộ Giáo dục & Đào tạo, các tình huống tương tác số sinh động, khả thi trong điều kiện các trường học phổ thông hiện nay.
`;

    // Set headers for SSE streaming
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    // Start keep-alive ping to prevent 504 / 503 gateway timeouts during long model thinking
    pingInterval = setInterval(() => {
      res.write(': keep-alive\n\n');
    }, 8000);

    res.write(`data: ${JSON.stringify({ type: 'start', message: 'Đang bắt đầu phân tích và tích hợp Năng lực số...' })}\n\n`);

    // Call with retry & fallback
    const { stream: responseStream, modelUsed } = await generateStreamWithRetry(
      ai,
      model,
      prompt,
      'Bạn là chuyên gia sư phạm hàng đầu Việt Nam về thiết kế kế hoạch bài dạy 5512 tích hợp Năng Lực Số (DigComp). Luôn trả về nội dung hoàn chỉnh, sắc sảo, thực tế, đúng thể thức sư phạm.'
    );

    let fullText = '';
    let streamIterationError: any = null;

    try {
      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          fullText += text;
          res.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`);
        }
      }
    } catch (err: any) {
      streamIterationError = err;
      console.warn('[Stream Iteration] Interrupted:', err?.message || err);
    }

    if (streamIterationError && fullText.length < 500) {
      // If stream failed very early, seamlessly fall back to unary generateContentWithRetry
      console.log('[Stream Recovery] Falling back to non-streaming generateContentWithRetry...');
      const { response, modelUsed: fallbackModel } = await generateContentWithRetry(
        ai,
        model,
        prompt,
        'Bạn là chuyên gia sư phạm hàng đầu Việt Nam về thiết kế kế hoạch bài dạy tích hợp Năng Lực Số (DigComp). Luôn trả về nội dung hoàn chỉnh, sắc sảo, thực tế, đúng thể thức sư phạm.',
        3
      );

      fullText = response.text || '';
      res.write(`data: ${JSON.stringify({ type: 'chunk', text: fullText })}\n\n`);
    }

    // Auto-continuation if lesson plan is incomplete (never cut off mid-way!)
    if (!isLessonPlanComplete(fullText, isPrimary)) {
      console.log(`[Auto-Continuation] Lesson plan incomplete (${fullText.length} chars). Invoking auto-continuation to guarantee complete lesson plan...`);
      res.write(`data: ${JSON.stringify({ type: 'start', message: 'Đang tự động viết tiếp tục để hoàn thiện trọn vẹn toàn bộ 4 hoạt động và Phụ lục...' })}\n\n`);

      const continuationPrompt = `
Kế hoạch bài dạy tích hợp Năng lực số đang soạn thảo thì bị ngắt ở đoạn sau:
---
${fullText.slice(-3000)}
---

YÊU CẦU BẮT BUỘC:
1. Hãy VIẾT TIẾP TỤC NGAY LẬP TỨC từ điểm bị dừng trên.
2. TUYỆT ĐỐI KHÔNG lặp lại những phần đã viết ở trên.
3. Hoàn thành trọn vẹn tất cả các hoạt động dạy học còn lại (mỗi hoạt động đầy đủ: Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện 4 bước gắn thẻ [ỨNG DỤNG SỐ] và [MÃ NLS ĐẠT ĐƯỢC]).
4. Hoàn thành đầy đủ Phần IV: Bảng Rubric Đánh giá Năng lực số 3 mức độ và Phiếu học tập số.
5. Kết thúc bài học hoàn chỉnh 100%, tuyệt đối không dừng giữa chừng!
`;

      try {
        const { stream: contStream } = await generateStreamWithRetry(
          ai,
          model,
          continuationPrompt,
          'Bạn là chuyên gia sư phạm hàng đầu Việt Nam. Viết tiếp tục kế hoạch bài dạy liền mạch, cực kỳ chi tiết, chuẩn mực và kết thúc trọn vẹn 100%.'
        );

        for await (const chunk of contStream) {
          const text = chunk.text;
          if (text) {
            fullText += text;
            res.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`);
          }
        }
      } catch (contErr) {
        console.warn('[Auto-Continuation Warning]:', contErr);
      }
    }

    if (pingInterval) clearInterval(pingInterval);

    res.write(`data: ${JSON.stringify({ type: 'done', fullText, modelUsed })}\n\n`);
    res.end();
  } catch (error: any) {
    if (pingInterval) clearInterval(pingInterval);
    console.error('Error generating KHBD:', error);
    const msg = error?.message || 'Lỗi xử lý giáo án.';
    const is503 = msg.includes('503') || msg.includes('overloaded');
    const userMessage = is503
      ? 'Mô hình AI hiện đang quá tải (Lỗi 503). Hệ thống đã tự động thử lại các mô hình phụ trợ nhưng chưa nhận được phản hồi. Thầy cô vui lòng bấm nút "Soạn lại" sau giây lát.'
      : msg;

    if (!res.headersSent) {
      res.status(500).json({ success: false, message: userMessage });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', message: userMessage })}\n\n`);
      res.end();
    }
  }
});

// Refine endpoint for custom improvements
app.post('/api/refine-khbd', async (req, res) => {
  try {
    const { apiKey, model = 'gemini-3.8-flash', currentPlan, instruction } = req.body;
    if (!currentPlan || !instruction) {
      return res.status(400).json({ error: 'Thiếu nội dung giáo án hoặc yêu cầu tinh chỉnh' });
    }

    const ai = getGeminiClient(apiKey);
    const prompt = `
Dưới đây là Kế hoạch bài dạy (KHBD) Năng lực số hiện tại:
${currentPlan}

YÊU CẦU TINH CHỈNH TỪ GIÁO VIÊN:
"${instruction}"

Hãy áp dụng yêu cầu trên vào giáo án. Trả về toàn bộ nội dung giáo án hoàn chỉnh đã được cập nhật, giữ nguyên cấu trúc chuẩn 5512 và các phần xuất sắc khác.
`;

    const { response } = await generateContentWithRetry(
      ai,
      model,
      prompt,
      'Bạn là chuyên gia phương pháp dạy học. Hãy chỉnh sửa và nâng cấp Kế hoạch bài dạy theo đúng chỉ dẫn của giáo viên.',
      3
    );

    res.json({
      success: true,
      updatedPlan: response.text,
    });
  } catch (error: any) {
    console.error('Error refining KHBD:', error);
    const msg = error?.message || 'Không thể tinh chỉnh giáo án';
    const is503 = msg.includes('503') || msg.includes('overloaded');
    res.status(500).json({
      success: false,
      error: is503
        ? 'Hệ thống AI đang quá tải (503). Thầy cô vui lòng gửi lại yêu cầu tinh chỉnh sau giây lát.'
        : msg,
    });
  }
});

// In production, serve Vite dist files
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (production)`);
  });
} else {
  // In development, hook Vite middleware
  import('vite').then(async ({ createServer }) => {
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Development server running at http://localhost:${PORT}`);
    });
  });
}
