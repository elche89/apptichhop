import React, { useState, useRef } from 'react';
import { KHBDConfig, SampleLesson } from '../types';
import { parseUploadedFile, ParsedFileResult } from '../utils/fileParser';
import { SAMPLE_LESSONS } from '../data/standardsData';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  FileCheck,
  Sparkles,
  BookMarked,
  Eye,
  Trash2,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface Step3SourceUploadProps {
  config: KHBDConfig;
  onChange: (updates: Partial<KHBDConfig>) => void;
  onBack: () => void;
  onStartGenerate: () => void;
}

export const Step3SourceUpload: React.FC<Step3SourceUploadProps> = ({
  config,
  onChange,
  onBack,
  onStartGenerate,
}) => {
  const [isParsing, setIsParsing] = useState(false);
  const [uploadStats, setUploadStats] = useState<ParsedFileResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ppctInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setErrorMsg(null);

    try {
      const parsed = await parseUploadedFile(file);
      setUploadStats(parsed);
      onChange({
        existingContent: parsed.text,
        fileName: parsed.fileName,
      });
    } catch (err: any) {
      console.error('File parse error:', err);
      setErrorMsg('Không thể đọc file. Thầy cô vui lòng kiểm tra lại định dạng file .docx hoặc .txt.');
    } finally {
      setIsParsing(false);
    }
  };

  const handlePpctUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseUploadedFile(file);
      onChange({
        distributionContext: parsed.text,
      });
    } catch (err) {
      console.error('PPCT file parse error:', err);
    }
  };

  const handleApplySample = (sample: SampleLesson) => {
    onChange({
      schoolLevel: sample.schoolLevel,
      subject: sample.subject,
      grade: sample.grade,
      curriculumBook: sample.curriculumBook,
      lessonTitle: sample.lessonTitle,
      lessonDuration: sample.duration,
      integrationLevel: sample.integrationLevel as any,
      competencyDomains: sample.competencyDomains,
      tools: sample.tools,
      inclusiveEducation: sample.inclusiveEducation,
      clilIntegration: sample.clilIntegration,
      stemIntegration: sample.stemIntegration,
      aiLiteracy: sample.aiLiteracy,
      pedagogicalMethod: sample.pedagogicalMethod,
      existingContent: sample.sampleOutline,
      fileName: `[Mẫu thử nghiệm] ${sample.lessonTitle}.docx`,
    });
    setUploadStats({
      fileName: `[Mẫu thử nghiệm] ${sample.lessonTitle}`,
      fileSize: 15420,
      format: 'docx',
      text: sample.sampleOutline,
      wordCount: sample.sampleOutline.split(/\s+/).length,
    });
  };

  const handleClearExisting = () => {
    onChange({
      existingContent: '',
      fileName: undefined,
    });
    setUploadStats(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 rounded-2xl p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-xs shrink-0">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Bước 3: Tải lên Giáo án Nguồn & Tài liệu Tham chiếu
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Thầy cô có thể tải lên file giáo án có sẵn (.docx / .pdf / .txt) để hệ thống giữ nguyên nội dung chuyên môn và chỉ nâng cấp thêm Năng lực số, hoặc chọn nhanh một bài dạy mẫu có sẵn bên dưới.
            </p>
          </div>
        </div>
      </div>

      {/* Main Upload Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-blue-600" />
              1. Tải lên File Giáo án có sẵn (.docx / .pdf / .txt)
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Tối ưu nhất với định dạng Word (.docx). Văn bản sẽ được trích xuất tự động và giữ an toàn trên máy.
            </p>
          </div>
          {config.existingContent && (
            <button
              type="button"
              onClick={handleClearExisting}
              className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" /> Xóa nội dung đã tải
            </button>
          )}
        </div>

        {/* Drag/Drop area */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,.doc,.txt,.md,.pdf"
          onChange={handleFileUpload}
          className="hidden"
          id="lesson-file-upload"
        />

        {!config.existingContent ? (
          <label
            htmlFor="lesson-file-upload"
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/30 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition text-center group"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-100/70 group-hover:bg-blue-200/80 flex items-center justify-center text-blue-600 mb-3 transition">
              {isParsing ? (
                <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
              ) : (
                <UploadCloud className="w-7 h-7" />
              )}
            </div>
            <p className="font-bold text-sm text-slate-800">
              Nhấp để chọn file hoặc kéo thả tệp giáo án vào đây
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Hỗ trợ file Microsoft Word (.docx), PDF (.pdf), Văn bản (.txt, .md)
            </p>
          </label>
        ) : (
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-emerald-950">
                    {config.fileName || 'Tệp giáo án đã tải lên'}
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Đã trích xuất thành công {uploadStats?.wordCount || config.existingContent.split(/\s+/).length} từ.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg flex items-center gap-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showPreview ? 'Thu gọn' : 'Xem nội dung'}
                </button>
                <label
                  htmlFor="lesson-file-upload"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer transition"
                >
                  Đổi file khác
                </label>
              </div>
            </div>

            {/* Content preview or edit */}
            {showPreview && (
              <div className="mt-3 pt-3 border-t border-emerald-200">
                <label className="text-xs font-semibold text-emerald-900 block mb-1">
                  Nội dung giáo án gốc (Thầy cô có thể trực tiếp chỉnh sửa nếu muốn):
                </label>
                <textarea
                  rows={6}
                  value={config.existingContent}
                  onChange={(e) => onChange({ existingContent: e.target.value })}
                  className="w-full p-3 text-xs bg-white border border-emerald-300 rounded-xl font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Curriculum Distribution (PPCT) & District Standard */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" />
            2. Phân phối chương trình (PPCT) hoặc Khung NLS của Trường/Sở (Tùy chọn)
          </label>
          <p className="text-xs text-slate-500 mt-0.5">
            Nếu trường của thầy cô có quy định riêng về mã định danh năng lực số hoặc phân phối tiết dạy, thầy cô có thể tải lên hoặc dán vào đây để đối chiếu chuẩn.
          </p>
        </div>

        <input
          ref={ppctInputRef}
          type="file"
          accept=".docx,.txt,.pdf"
          onChange={handlePpctUpload}
          className="hidden"
          id="ppct-file-upload"
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <label
            htmlFor="ppct-file-upload"
            className="px-4 py-2.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl cursor-pointer transition inline-flex items-center justify-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            Tải tệp PPCT / Hướng dẫn NLS
          </label>

          <input
            type="text"
            value={config.distributionContext}
            onChange={(e) => onChange({ distributionContext: e.target.value })}
            placeholder="Hoặc dán yêu cầu đặc thù của tổ bộ môn vào đây (ví dụ: Tuần 12, Tiết 24...)"
            className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Quick Sample Lessons */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              3. Thử nghiệm nhanh với Bài dạy mẫu có sẵn (1 Click điền dữ liệu)
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Thầy cô chưa có file sẵn có thể bấm chọn một bài học mẫu bất kỳ để trải nghiệm hệ thống ngay lập tức!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SAMPLE_LESSONS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleApplySample(sample)}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/40 cursor-pointer transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    {sample.subject} - {sample.grade}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {sample.duration}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-700 transition line-clamp-2">
                  {sample.lessonTitle}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  Bộ sách: {sample.curriculumBook}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-blue-600 font-semibold">
                <span>Dùng mẫu này</span>
                <span className="group-hover:translate-x-1 transition">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation & Action */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition"
        >
          ← Quay lại Bước 2
        </button>

        <button
          type="button"
          onClick={onStartGenerate}
          className="inline-flex items-center gap-2 px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md transition transform hover:-translate-y-0.5"
        >
          <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
          Tiến hành Tích hợp Năng Lực Số & Tạo KHBD 5512 →
        </button>
      </div>
    </div>
  );
};
