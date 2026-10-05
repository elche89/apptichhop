import React, { useState, useEffect, useRef } from 'react';
import { KHBDConfig, ApiSettings } from '../types';
import { exportMarkdownToDocx } from '../utils/docxExport';
import {
  Download,
  Copy,
  Printer,
  Edit3,
  Check,
  RotateCcw,
  Sparkles,
  Send,
  Loader2,
  FileCheck,
  Eye,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

interface Step4ResultProps {
  config: KHBDConfig;
  apiSettings: ApiSettings;
  generatedContent: string;
  isStreaming: boolean;
  onUpdateContent: (newContent: string) => void;
  onRestart: () => void;
  onRegenerate: () => void;
}

export const Step4Result: React.FC<Step4ResultProps> = ({
  config,
  apiSettings,
  generatedContent,
  isStreaming,
  onUpdateContent,
  onRestart,
  onRegenerate,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'nls_summary'>('preview');
  const [isCopied, setIsCopied] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll while streaming
  useEffect(() => {
    if (isStreaming && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [generatedContent, isStreaming]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error('Copy error:', err);
    }
  };

  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    try {
      await exportMarkdownToDocx(generatedContent, {
        lessonTitle: config.lessonTitle,
        subject: config.subject,
        grade: config.grade,
        curriculumBook: config.curriculumBook,
        lessonDuration: config.lessonDuration,
        schoolLevel: config.schoolLevel,
        targetPages: config.targetPages,
      });
    } catch (err) {
      console.error('Export docx error:', err);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRefine = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!refinePrompt.trim() || isRefining || isStreaming) return;

    setIsRefining(true);
    setRefineError(null);

    try {
      const res = await fetch('/api/refine-khbd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiSettings.customApiKey,
          model: apiSettings.model,
          currentPlan: generatedContent,
          instruction: refinePrompt.trim(),
        }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text || 'Lỗi xử lý phản hồi từ máy chủ.' };
      }

      if (res.ok && data.success && data.updatedPlan) {
        onUpdateContent(data.updatedPlan);
        setRefinePrompt('');
      } else {
        const errorMsg = data.error || 'Không thể cập nhật. Vui lòng thử lại.';
        const is503 = errorMsg.includes('503') || errorMsg.includes('overloaded');
        setRefineError(
          is503
            ? 'Hệ thống AI hiện đang tạm thời quá tải (Lỗi 503). Thầy cô vui lòng gửi lại yêu cầu sau giây lát.'
            : errorMsg
        );
      }
    } catch (err: any) {
      setRefineError(err.message || 'Lỗi mạng khi tinh chỉnh giáo án.');
    } finally {
      setIsRefining(false);
    }
  };

  // Simple Markdown renderer for preview
  const renderFormattedMarkdown = (text: string) => {
    const rawLines = text.split('\n');
    let startIdx = 0;
    const hIdx = rawLines.findIndex((l) => l.trim().startsWith('# '));
    if (hIdx !== -1) startIdx = hIdx;

    const lines = rawLines.slice(startIdx).filter((l) => {
      const lower = l.toLowerCase();
      return (
        !lower.includes('tuyệt vời!') &&
        !lower.includes('với vai trò là chuyên gia') &&
        !lower.includes('tôi sẽ xây dựng kế hoạch') &&
        !lower.includes('hướng dẫn văn hóa & đạo đức khi ứng dụng trí tuệ nhân tạo') &&
        !lower.includes('ai literacy guide')
      );
    });

    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const flushTable = (keyPrefix: string) => {
      if (tableRows.length === 0) return;
      elements.push(
        <div key={keyPrefix} className="overflow-x-auto my-4 rounded-xl border border-slate-300">
          <table className="min-w-full divide-y divide-slate-300 text-xs">
            <thead className="bg-slate-100">
              <tr>
                {tableRows[0].map((th, i) => (
                  <th key={i} className="px-3 py-2 text-left font-bold text-slate-800 border-r border-slate-300 last:border-none">
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {tableRows.slice(1).map((row, rIdx) => (
                <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-slate-700 border-r border-slate-200 last:border-none align-top">
                      {formatInlineSpans(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Check table row
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        if (/^\|(\s*[-:]+\s*\|)+$/.test(trimmed)) {
          return; // skip separator row
        }
        inTable = true;
        const cells = trimmed
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim());
        tableRows.push(cells);
        return;
      } else if (inTable) {
        flushTable(`table-${idx}`);
        inTable = false;
      }

      if (!trimmed) {
        elements.push(<div key={idx} className="h-3" />);
        return;
      }

      if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={idx} className="text-xl sm:text-2xl font-black text-blue-900 text-center uppercase tracking-tight my-4 pb-2 border-b-2 border-blue-200">
            {trimmed.replace('# ', '')}
          </h1>
        );
      } else if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={idx} className="text-base sm:text-lg font-bold text-slate-900 mt-6 mb-3 pb-1 border-b border-slate-300 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            {trimmed.replace('## ', '')}
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="text-sm sm:text-base font-bold text-indigo-900 mt-4 mb-2">
            {trimmed.replace('### ', '')}
          </h3>
        );
      } else if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={idx} className="text-xs sm:text-sm font-semibold text-slate-800 italic mt-3 mb-1">
            {trimmed.replace('#### ', '')}
          </h4>
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(
          <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800 ml-4 mb-1.5 leading-relaxed">
            <span className="text-blue-600 font-bold shrink-0 mt-0.5">•</span>
            <div>{formatInlineSpans(trimmed.substring(2))}</div>
          </div>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        const num = trimmed.match(/^\d+\.\s/)![0];
        const rest = trimmed.replace(/^\d+\.\s/, '');
        elements.push(
          <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800 ml-4 mb-1.5 leading-relaxed">
            <span className="font-bold text-blue-700 shrink-0">{num}</span>
            <div>{formatInlineSpans(rest)}</div>
          </div>
        );
      } else {
        elements.push(
          <p key={idx} className="text-xs sm:text-sm text-slate-800 leading-relaxed mb-2 text-justify">
            {formatInlineSpans(trimmed)}
          </p>
        );
      }
    });

    if (inTable) {
      flushTable('table-end');
    }

    return elements;
  };

  // Helper to colorize NLS tags and bold texts
  const formatInlineSpans = (text: string) => {
    // Regex for bold, special tags [ỨNG DỤNG SỐ...], [MÃ NLS...], code
    const parts = text.split(
      /(\*\*.*?\*\*|\[(?:ỨNG DỤNG SỐ|Ứng dụng số)[^\]]*\]|\[(?:MÃ NLS ĐẠT ĐƯỢC|Mã NLS đạt được|MÃ NLS|NLS\s*\d+)[^\]]*\]|`.*?`)/gi
    );

    return parts.map((part, i) => {
      if (!part) return null;
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      const lower = part.toLowerCase();
      if (lower.startsWith('[ứng dụng số') && part.endsWith(']')) {
        return (
          <span
            key={i}
            className="inline-block mx-1 px-2 py-0.5 text-xs font-bold rounded-md"
            style={{ color: '#FF0000', backgroundColor: '#FFF1F2', border: '1px solid #FECDD3' }}
          >
            {part.slice(1, -1)}
          </span>
        );
      }
      if ((lower.startsWith('[mã nls') || lower.startsWith('[nls')) && part.endsWith(']')) {
        return (
          <span
            key={i}
            className="inline-block mx-1 px-2 py-0.5 text-xs font-bold rounded-md"
            style={{ color: '#0070C0', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}
          >
            {part.slice(1, -1)}
          </span>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 bg-slate-100 text-sky-700 rounded text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Streaming Status Header */}
      {isStreaming ? (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white rounded-2xl p-5 shadow-sm no-print">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-amber-300" />
            <div>
              <h3 className="font-bold text-base">Hệ thống đang tích hợp Năng lực số vào KHBD 5512...</h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Đang xử lý mục tiêu kiến thức, phân tích chỉ số hành vi NLS, xây dựng 4 hoạt động dạy học và bảng Rubric đánh giá.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs no-print">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-emerald-950">
                Kế hoạch bài dạy (KHBD) Năng lực số đã sẵn sàng!
              </h3>
              <p className="text-xs text-emerald-700">
                Chuẩn Công văn 5512/BGDĐT - Tích hợp đầy đủ các miền NLS, học liệu số và tiêu chí đánh giá.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportDocx}
              disabled={isExportingDocx || isStreaming}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              {isExportingDocx ? 'Đang tạo .docx...' : 'Tải file Word (.docx)'}
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {isCopied ? 'Đã chép' : 'Sao chép'}
            </button>
          </div>
        </div>
      )}

      {/* Main Document Viewer Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Navigation Bar inside Document */}
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between no-print flex-wrap gap-2">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Xem bản in 5512
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'edit'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Chỉnh sửa trực tiếp
            </button>
          </div>

          {/* Quick tool actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white rounded-lg transition"
              title="In ra giấy hoặc lưu thành file PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              In ấn / PDF
            </button>
            <button
              onClick={onRegenerate}
              disabled={isStreaming}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white rounded-lg transition disabled:opacity-50"
              title="Sinh lại giáo án với các thông số hiện tại"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Soạn lại
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div
          ref={contentRef}
          className="p-6 sm:p-10 max-h-[72vh] overflow-y-auto bg-white"
        >
          {activeTab === 'preview' ? (
            <div className="lesson-doc-view max-w-4xl mx-auto">
              {renderFormattedMarkdown(generatedContent)}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                <span>Trình chỉnh sửa văn bản Markdown:</span>
                <span>{generatedContent.split(/\s+/).length} từ</span>
              </div>
              <textarea
                value={generatedContent}
                onChange={(e) => onUpdateContent(e.target.value)}
                rows={22}
                className="w-full p-4 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed text-slate-800"
              />
            </div>
          )}
        </div>

        {/* Interactive "Tinh chỉnh cùng AI" Footer Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 no-print">
          <form onSubmit={handleRefine} className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={refinePrompt}
                onChange={(e) => setRefinePrompt(e.target.value)}
                placeholder="Yêu cầu AI tinh chỉnh thêm (ví dụ: 'Thêm trò chơi Quizizz ở phần luyện tập', 'Tăng cường hoạt động hòa nhập')..."
                disabled={isStreaming || isRefining}
                className="w-full pl-4 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
              <Sparkles className="w-4 h-4 text-amber-500 absolute right-3.5 top-3 pointer-events-none" />
            </div>

            <button
              type="submit"
              disabled={!refinePrompt.trim() || isRefining || isStreaming}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition shrink-0"
            >
              {isRefining ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Tinh chỉnh với AI
                </>
              )}
            </button>
          </form>

          {refineError && (
            <p className="text-xs text-rose-600 mt-2 font-medium">{refineError}</p>
          )}

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-600">Gợi ý nhanh:</span>
            {[
              'Bổ sung trò chơi khởi động trên Quizizz',
              'Tăng cường năng lực số cho Hoạt động 4 (Vận dụng)',
              'Thêm bảng Rubric đánh giá NLS 3 mức độ chi tiết hơn',
              'Bổ sung bảng thuật ngữ tiếng Anh song ngữ CLIL',
            ].map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRefinePrompt(sug)}
                className="text-[11px] px-2 py-0.5 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-md transition"
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom restart action */}
      <div className="flex justify-between items-center pt-2 no-print">
        <button
          type="button"
          onClick={onRestart}
          className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition"
        >
          ← Soạn bài học mới khác
        </button>

        <button
          type="button"
          onClick={handleExportDocx}
          disabled={isExportingDocx || isStreaming}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition"
        >
          <Download className="w-4 h-4" />
          Tải file Word (.docx) về máy
        </button>
      </div>
    </div>
  );
};
