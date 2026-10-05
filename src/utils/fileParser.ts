import mammoth from 'mammoth';

export interface ParsedFileResult {
  fileName: string;
  fileSize: number;
  text: string;
  format: 'docx' | 'txt' | 'md' | 'pdf' | 'unknown';
  wordCount: number;
}

export async function parseUploadedFile(file: File): Promise<ParsedFileResult> {
  const fileName = file.name;
  const fileSize = file.size;
  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  let text = '';
  let format: ParsedFileResult['format'] = 'unknown';

  if (extension === 'docx') {
    format = 'docx';
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    text = result.value || '';
  } else if (extension === 'txt' || extension === 'md') {
    format = extension as 'txt' | 'md';
    text = await file.text();
  } else if (extension === 'pdf') {
    format = 'pdf';
    // For PDF files, extract readable ASCII/Unicode text chunks
    const arrayBuffer = await file.arrayBuffer();
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const rawContent = decoder.decode(arrayBuffer);
    
    // Extract text streams between BT ... ET or readable blocks
    const matches = rawContent.match(/\(([^()]{2,})\)/g);
    if (matches && matches.length > 10) {
      text = matches
        .map((m) => m.slice(1, -1))
        .filter((t) => /[a-zA-ZÀ-ỹ0-9]/.test(t))
        .join(' ');
    } else {
      text = `Tệp PDF: ${fileName} (${(fileSize / 1024).toFixed(1)} KB). Để đạt hiệu quả tối ưu nhất với định dạng văn bản chuẩn, thầy cô nên ưu tiên dùng file .docx hoặc dán trực tiếp nội dung đề cương vào ô bên dưới.`;
    }
  } else {
    text = await file.text();
  }

  // Calculate approximate word count
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return {
    fileName,
    fileSize,
    text,
    format,
    wordCount: words,
  };
}
