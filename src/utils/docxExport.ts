import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  PageNumber,
  LineRuleType,
} from 'docx';

export interface DocxExportMetadata {
  lessonTitle: string;
  subject: string;
  grade: string;
  curriculumBook?: string;
  lessonDuration: string;
  schoolLevel?: string;
  targetPages?: string;
}

// Clean markdown punctuation, HTML, links, and stray artifacts
function sanitizeText(str: string): string {
  return str
    // Convert markdown links [text](url) -> text
    .replace(/\[([^\]]+)\]\((?:https?:\/\/[^\s)]+|[^\s)]+)\)/g, '$1')
    // Convert HTML line breaks to newline
    .replace(/<br\s*\/?>/gi, '\n')
    // Normalize basic HTML formatting
    .replace(/<\/?b>/gi, '**')
    .replace(/<\/?strong>/gi, '**')
    .replace(/<\/?i>/gi, '*')
    .replace(/<\/?em>/gi, '*')
    // Strip other HTML tags
    .replace(/<[^>]+>/g, '')
    // HTML entities
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    // Strip markdown blockquote symbols
    .replace(/^>\s*/, '');
}

// Colorize special tags: [ỨNG DỤNG SỐ] in #FF0000 and [MÃ NLS ĐẠT ĐƯỢC] in #0070C0
function splitSpecialTags(
  text: string,
  baseStyle: {
    font?: string;
    size?: number;
    bold?: boolean;
    italics?: boolean;
  }
): TextRun[] {
  const tagRegex =
    /(\[(?:ỨNG DỤNG SỐ|Ứng dụng số|ứng dụng số)[^\]]*\]|\[(?:MÃ NLS ĐẠT ĐƯỢC|Mã NLS đạt được|MÃ NLS|Mã NLS|NLS\s*\d+)[^\]]*\])/gi;
  const tokens = text.split(tagRegex);
  const runs: TextRun[] = [];

  for (const token of tokens) {
    if (!token) continue;
    const lower = token.toLowerCase();

    if (lower.startsWith('[ứng dụng số')) {
      runs.push(
        new TextRun({
          text: token,
          font: 'Times New Roman',
          size: baseStyle.size || 26, // 13pt
          bold: true,
          italics: baseStyle.italics || false,
          color: 'FF0000', // Đỏ #FF0000
        })
      );
    } else if (lower.startsWith('[mã nls') || lower.startsWith('[nls')) {
      runs.push(
        new TextRun({
          text: token,
          font: 'Times New Roman',
          size: baseStyle.size || 26, // 13pt
          bold: true,
          italics: baseStyle.italics || false,
          color: '0070C0', // Xanh #0070C0
        })
      );
    } else {
      // Strip any stray unparsed markdown characters (*, _, `, #, ~) from plain segments
      const cleaned = token.replace(/[*_`#~]/g, '');
      if (cleaned) {
        runs.push(
          new TextRun({
            text: cleaned,
            font: 'Times New Roman',
            size: baseStyle.size || 26,
            bold: baseStyle.bold || false,
            italics: baseStyle.italics || false,
            color: '000000', // Đen chuẩn
          })
        );
      }
    }
  }

  return runs;
}

// Convert markdown inline formatting (bold, italic, code, tags) into clean TextRuns
function parseInlineRuns(
  rawText: string,
  options: { size?: number; forceBold?: boolean; forceItalics?: boolean } = {}
): TextRun[] {
  const text = sanitizeText(rawText);
  const defaultSize = options.size || 26; // 13pt
  const runs: TextRun[] = [];

  // Match: ***bold-italic***, **bold**, __bold__, *italic*, _italic_, `code`
  const regex = /(\*\*\*.*?\*\*\*|\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_|`.*?`)/g;
  const parts = text.split(regex);

  for (const part of parts) {
    if (!part) continue;

    if (part.startsWith('***') && part.endsWith('***')) {
      const inner = part.slice(3, -3);
      runs.push(
        ...splitSpecialTags(inner, {
          size: defaultSize,
          bold: true,
          italics: true,
        })
      );
    } else if (
      (part.startsWith('**') && part.endsWith('**')) ||
      (part.startsWith('__') && part.endsWith('__'))
    ) {
      const inner = part.slice(2, -2);
      runs.push(
        ...splitSpecialTags(inner, {
          size: defaultSize,
          bold: true,
          italics: options.forceItalics || false,
        })
      );
    } else if (
      (part.startsWith('*') && part.endsWith('*')) ||
      (part.startsWith('_') && part.endsWith('_'))
    ) {
      const inner = part.slice(1, -1);
      runs.push(
        ...splitSpecialTags(inner, {
          size: defaultSize,
          bold: options.forceBold || false,
          italics: true,
        })
      );
    } else if (part.startsWith('`') && part.endsWith('`')) {
      const inner = part.slice(1, -1);
      runs.push(
        ...splitSpecialTags(inner, {
          size: defaultSize,
          bold: true,
        })
      );
    } else {
      runs.push(
        ...splitSpecialTags(part, {
          size: defaultSize,
          bold: options.forceBold || false,
          italics: options.forceItalics || false,
        })
      );
    }
  }

  return runs;
}

function createDocxTable(rows: string[][]): Table {
  const tableBorder = {
    style: BorderStyle.SINGLE,
    size: 4, // 0.5pt
    color: '000000',
  };

  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: tableBorder,
      bottom: tableBorder,
      left: tableBorder,
      right: tableBorder,
      insideHorizontal: tableBorder,
      insideVertical: tableBorder,
    },
    rows: rows.map((rowCells, rowIndex) => {
      const isHeader = rowIndex === 0;
      return new TableRow({
        tableHeader: isHeader,
        children: rowCells.map((rawCellText) => {
          const sanitized = sanitizeText(rawCellText);
          const cellLines = sanitized.split('\n');

          const paragraphs = cellLines
            .map((lineText) => {
              const trimmed = lineText.trim();
              if (!trimmed) return null;

              const isBullet =
                trimmed.startsWith('- ') ||
                trimmed.startsWith('• ') ||
                trimmed.startsWith('+ ') ||
                trimmed.startsWith('* ');
              const actualText = isBullet ? trimmed.substring(2).trim() : trimmed;

              const runs: TextRun[] = [];
              if (isBullet) {
                runs.push(
                  new TextRun({
                    text: '- ',
                    font: 'Times New Roman',
                    size: 24, // 12pt in tables
                    bold: isHeader,
                    color: '000000',
                  })
                );
              }

              runs.push(
                ...parseInlineRuns(actualText, {
                  size: 24,
                  forceBold: isHeader,
                })
              );

              return new Paragraph({
                alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
                spacing: {
                  before: 15,
                  after: 15,
                  line: 276, // 1.15 line spacing
                  lineRule: LineRuleType.AUTO,
                },
                children: runs,
              });
            })
            .filter((p): p is Paragraph => p !== null);

          return new TableCell({
            shading: isHeader ? { fill: 'F3F4F6' } : undefined,
            children:
              paragraphs.length > 0
                ? paragraphs
                : [
                    new Paragraph({
                      spacing: {
                        line: 276,
                        lineRule: LineRuleType.AUTO,
                      },
                      children: [],
                    }),
                  ],
          });
        }),
      });
    }),
  });
}

export async function exportMarkdownToDocx(
  markdownText: string,
  metadata?: DocxExportMetadata
): Promise<void> {
  const rawLines = markdownText.split(/\r?\n/);

  // 1. Remove introductory conversational greetings/prose like "Tuyệt vời! Với vai trò là Chuyên gia..."
  let startIndex = 0;
  const headingIdx = rawLines.findIndex((line) => {
    const trimmed = line.trim();
    return (
      trimmed.startsWith('# KẾ HOẠCH BÀI DẠY') ||
      trimmed.startsWith('# BÀI:') ||
      trimmed.startsWith('# BÀI DẠY:') ||
      (trimmed.startsWith('# ') && !trimmed.toLowerCase().includes('tuyệt vời'))
    );
  });

  if (headingIdx !== -1) {
    startIndex = headingIdx;
  }

  const linesAfterIntro = rawLines.slice(startIndex).filter((line) => {
    const lower = line.toLowerCase();
    return (
      !lower.includes('tuyệt vời!') &&
      !lower.includes('với vai trò là chuyên gia') &&
      !lower.includes('tôi sẽ xây dựng kế hoạch bài dạy')
    );
  });

  // 2. Filter out "Hướng dẫn Văn hóa & Đạo đức khi ứng dụng Trí tuệ Nhân tạo" (AI Literacy Guide)
  const filteredLines: string[] = [];
  let isSkippingAiLiteracy = false;

  for (const line of linesAfterIntro) {
    const trimmed = line.trim();

    if (
      trimmed.includes('Hướng dẫn Văn hóa & Đạo đức khi ứng dụng Trí tuệ Nhân tạo') ||
      trimmed.includes('AI Literacy Guide for Students')
    ) {
      isSkippingAiLiteracy = true;
      continue;
    }

    if (isSkippingAiLiteracy) {
      if (
        trimmed.startsWith('# ') ||
        trimmed.startsWith('## ') ||
        trimmed.startsWith('### 1.') ||
        trimmed.startsWith('### 2.') ||
        trimmed.startsWith('### 3.') ||
        trimmed.startsWith('### 4.')
      ) {
        isSkippingAiLiteracy = false;
      } else {
        continue;
      }
    }

    filteredLines.push(line);
  }

  const children: (Paragraph | Table)[] = [];
  const isPrimary =
    metadata?.schoolLevel === 'tieuhoc' || metadata?.schoolLevel === 'mamnon';

  // Administrative header (tight 1.15 line spacing, 0 before, 20 after)
  if (isPrimary) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 20, line: 276, lineRule: LineRuleType.AUTO },
        children: [
          new TextRun({
            text: 'TRƯỜNG: ............................................................................',
            font: 'Times New Roman',
            size: 26,
            bold: true,
            color: '000000',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 20, line: 276, lineRule: LineRuleType.AUTO },
        children: [
          new TextRun({
            text: 'KHỐI / LỚP: ........................................................................',
            font: 'Times New Roman',
            size: 26,
            italics: true,
            color: '000000',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 40, line: 276, lineRule: LineRuleType.AUTO },
        children: [
          new TextRun({
            text: 'GIÁO VIÊN: .........................................................................',
            font: 'Times New Roman',
            size: 26,
            bold: true,
            color: '000000',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 40, line: 276, lineRule: LineRuleType.AUTO },
        children: [
          new TextRun({
            text: 'KẾ HOẠCH BÀI DẠY (CÔNG VĂN 2345/BGDĐT-GDTH)',
            font: 'Times New Roman',
            size: 28,
            bold: true,
            color: '000000',
          }),
        ],
      })
    );
  } else {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 20, line: 276, lineRule: LineRuleType.AUTO },
        children: [
          new TextRun({
            text: 'TRƯỜNG: ............................................................................',
            font: 'Times New Roman',
            size: 26,
            bold: true,
            color: '000000',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 20, line: 276, lineRule: LineRuleType.AUTO },
        children: [
          new TextRun({
            text: 'TỔ CHUYÊN MÔN: .....................................................................',
            font: 'Times New Roman',
            size: 26,
            italics: true,
            color: '000000',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 40, line: 276, lineRule: LineRuleType.AUTO },
        children: [
          new TextRun({
            text: 'GIÁO VIÊN: .........................................................................',
            font: 'Times New Roman',
            size: 26,
            bold: true,
            color: '000000',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 40, line: 276, lineRule: LineRuleType.AUTO },
        children: [
          new TextRun({
            text: 'KẾ HOẠCH BÀI DẠY (CÔNG VĂN 5512/BGDĐT-GDTrH)',
            font: 'Times New Roman',
            size: 28,
            bold: true,
            color: '000000',
          }),
        ],
      })
    );
  }

  if (metadata?.lessonTitle) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 20, after: 30, line: 276, lineRule: LineRuleType.AUTO },
        children: [
          new TextRun({
            text: `BÀI: ${metadata.lessonTitle.toUpperCase()}`,
            font: 'Times New Roman',
            size: 28,
            bold: true,
            color: '000000',
          }),
        ],
      })
    );
  }

  if (metadata) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60, line: 276, lineRule: LineRuleType.AUTO },
        children: [
          new TextRun({
            text: `Môn học: ${metadata.subject || ''} | Lớp: ${metadata.grade || ''} | Thời lượng: ${metadata.lessonDuration || ''}`,
            font: 'Times New Roman',
            size: 26,
            italics: true,
            color: '000000',
          }),
        ],
      })
    );
  }

  // Parse lines into Word elements
  let inTable = false;
  let tableRows: string[][] = [];

  for (let i = 0; i < filteredLines.length; i++) {
    const rawLine = filteredLines[i];
    const line = rawLine.trim();

    // Check if line is a table delimiter (|---|---|)
    if (/^\|?(\s*:?-+:?\s*\|?)+$/.test(line) && line.includes('-')) {
      continue;
    }

    // Check if line is a table row (contains | and multiple columns)
    if (line.includes('|') && (line.startsWith('|') || line.split('|').length >= 3)) {
      inTable = true;
      const rawCells = line.split('|');
      // Trim and remove outer empty tokens caused by leading/trailing pipes
      if (rawCells.length > 0 && rawCells[0].trim() === '') rawCells.shift();
      if (rawCells.length > 0 && rawCells[rawCells.length - 1].trim() === '') rawCells.pop();
      const cells = rawCells.map((c) => c.trim());
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      if (tableRows.length > 0) {
        children.push(createDocxTable(tableRows));
        tableRows = [];
      }
      inTable = false;
    }

    // IMPORTANT: DO NOT emit blank paragraphs that cause massive gaps between lines!
    if (!line) {
      continue;
    }

    // Skip duplicating top header if it matches KẾ HOẠCH BÀI DẠY
    if (
      line.startsWith('# KẾ HOẠCH BÀI DẠY:') ||
      line.startsWith('# KẾ HOẠCH BÀI DẠY')
    ) {
      continue;
    }

    // Headings (Tight spacing, 1.15 line spacing)
    if (line.startsWith('# ')) {
      const headingText = line.replace(/^#+\s*/, '').trim();
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 50, line: 276, lineRule: LineRuleType.AUTO },
          children: [
            new TextRun({
              text: headingText,
              font: 'Times New Roman',
              size: 28, // 14pt
              bold: true,
              color: '000000',
            }),
          ],
        })
      );
    } else if (line.startsWith('## ')) {
      const headingText = line.replace(/^#+\s*/, '').trim();
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 100, after: 40, line: 276, lineRule: LineRuleType.AUTO },
          children: [
            new TextRun({
              text: headingText,
              font: 'Times New Roman',
              size: 28, // 14pt
              bold: true,
              color: '000000',
            }),
          ],
        })
      );
    } else if (line.startsWith('### ')) {
      const headingText = line.replace(/^#+\s*/, '').trim();
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 80, after: 30, line: 276, lineRule: LineRuleType.AUTO },
          children: [
            new TextRun({
              text: headingText,
              font: 'Times New Roman',
              size: 26, // 13pt
              bold: true,
              color: '000000',
            }),
          ],
        })
      );
    } else if (line.startsWith('#### ')) {
      const headingText = line.replace(/^#+\s*/, '').trim();
      children.push(
        new Paragraph({
          spacing: { before: 50, after: 20, line: 276, lineRule: LineRuleType.AUTO },
          children: [
            new TextRun({
              text: headingText,
              font: 'Times New Roman',
              size: 26, // 13pt
              bold: true,
              italics: true,
              color: '000000',
            }),
          ],
        })
      );
    } else if (
      line.startsWith('- ') ||
      line.startsWith('* ') ||
      line.startsWith('+ ')
    ) {
      // Manual bullet point (no Word automatic bullets, tight spacing)
      const itemText = line.substring(2).trim();
      children.push(
        new Paragraph({
          spacing: { before: 0, after: 15, line: 276, lineRule: LineRuleType.AUTO },
          alignment: AlignmentType.JUSTIFIED,
          indent: { left: 360, hanging: 240 },
          children: [
            new TextRun({
              text: '- ',
              font: 'Times New Roman',
              size: 26, // 13pt
              bold: true,
              color: '000000',
            }),
            ...parseInlineRuns(itemText),
          ],
        })
      );
    } else if (/^\d+\.\s/.test(line)) {
      // Manual numbered list item
      const numMatch = line.match(/^\d+\.\s/)![0];
      const itemText = line.replace(/^\d+\.\s/, '').trim();
      children.push(
        new Paragraph({
          spacing: { before: 0, after: 20, line: 276, lineRule: LineRuleType.AUTO },
          alignment: AlignmentType.JUSTIFIED,
          indent: { left: 360, hanging: 280 },
          children: [
            new TextRun({
              text: numMatch,
              font: 'Times New Roman',
              size: 26, // 13pt
              bold: true,
              color: '000000',
            }),
            ...parseInlineRuns(itemText),
          ],
        })
      );
    } else {
      // Regular paragraph (clean 1.15 line spacing, 30 after, no extra empty paragraphs)
      children.push(
        new Paragraph({
          spacing: { before: 0, after: 30, line: 276, lineRule: LineRuleType.AUTO },
          alignment: AlignmentType.JUSTIFIED,
          children: parseInlineRuns(line),
        })
      );
    }
  }

  // Flush remaining table if file ends with table
  if (inTable && tableRows.length > 0) {
    children.push(createDocxTable(tableRows));
  }

  // Document construction with strict A4, margins, and centered header page number
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // A4 width: 210 mm
              height: 16838, // A4 height: 297 mm
            },
            margin: {
              top: 1134, // 20 mm
              bottom: 1134, // 20 mm
              left: 1701, // 30 mm
              right: 1134, // 20 mm
              header: 567, // 10 mm
            },
          },
        },
        // Arabic page numbering: centered at the top margin (13pt, Times New Roman)
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 40, line: 276, lineRule: LineRuleType.AUTO },
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: 'Times New Roman',
                    size: 26, // 13pt
                    color: '000000',
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanTitle = (metadata?.lessonTitle || 'KHBD_NangLucSo')
    .replace(/[^a-zA-Z0-9À-ỹ\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  const filename = `${cleanTitle || 'KHBD_Nang_Luc_So'}.docx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
