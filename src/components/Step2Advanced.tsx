import React from 'react';
import { KHBDConfig } from '../types';
import { COMPETENCY_DOMAINS, DIGITAL_TOOLS } from '../data/standardsData';
import {
  Sparkles,
  Layers,
  Wrench,
  HeartHandshake,
  Globe,
  Atom,
  Bot,
  Compass,
  Check,
  Plus,
} from 'lucide-react';

interface Step2AdvancedProps {
  config: KHBDConfig;
  onChange: (updates: Partial<KHBDConfig>) => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step2Advanced: React.FC<Step2AdvancedProps> = ({
  config,
  onChange,
  onBack,
  onNext,
}) => {
  const toggleDomain = (domainId: string) => {
    const current = config.competencyDomains;
    if (current.includes(domainId)) {
      onChange({ competencyDomains: current.filter((id) => id !== domainId) });
    } else {
      onChange({ competencyDomains: [...current, domainId] });
    }
  };

  const toggleTool = (toolName: string) => {
    const current = config.tools;
    if (current.includes(toolName)) {
      onChange({ tools: current.filter((t) => t !== toolName) });
    } else {
      onChange({ tools: [...current, toolName] });
    }
  };

  const pedagogicalMethods = [
    'Dạy học khám phá kết hợp công nghệ số',
    'Dạy học theo dự án (Project-Based Learning)',
    'Phương pháp Bàn tay nặn bột & Mô phỏng số',
    'Dạy học theo trạm (Station Teaching)',
    'Lớp học đảo ngược (Flipped Classroom)',
    'Dạy học giải quyết vấn đề thực tiễn',
    'Dạy học tích cực kết hợp làm việc nhóm số',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-xs shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Bước 2: Cấu hình Miền Năng Lực Số & Tùy chọn Sư phạm Nâng cao
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Lựa chọn các miền năng lực số trọng tâm, công cụ phần mềm số tương ứng và các chế độ tích hợp đặc thù (Hòa nhập, CLIL, STEM, AI).
            </p>
          </div>
        </div>
      </div>

      {/* 6 Competency Domains selection */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              1. Chọn các Miền Năng Lực Số trọng tâm tích hợp vào bài học
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Khuyến nghị chọn từ 2 đến 4 miền để đảm bảo tính khả thi và tập trung trong thời lượng tiết dạy.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
            Đã chọn {config.competencyDomains.length}/6 miền
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {COMPETENCY_DOMAINS.map((domain) => {
            const isSelected = config.competencyDomains.includes(domain.id);
            return (
              <div
                key={domain.id}
                onClick={() => toggleDomain(domain.id)}
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {domain.code}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{domain.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{domain.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested Digital Tools */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-600" />
            2. Công cụ, Phần mềm & Nền tảng số gợi ý sử dụng trong bài học
          </label>
          <p className="text-xs text-slate-500 mt-0.5">
            Bấm chọn các công cụ để AI đưa vào đúng mục Thiết bị dạy học và Thiết kế chi tiết từng bước tương tác.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {DIGITAL_TOOLS.map((tool) => {
            const isSelected = config.tools.includes(tool.name);
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => toggleTool(tool.name)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-500/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                title={tool.description}
              >
                {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                {tool.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Pedagogical Toggles */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Compass className="w-4 h-4 text-emerald-600" />
          3. Tùy chọn Tích hợp Sư phạm Đặc thù & Đổi mới Phương pháp
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Inclusive Education */}
          <label
            className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3.5 ${
              config.inclusiveEducation
                ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <input
              type="checkbox"
              checked={config.inclusiveEducation}
              onChange={(e) => onChange({ inclusiveEducation: e.target.checked })}
              className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                Dạy học Hòa nhập (Inclusive)
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Tự động bổ sung biện pháp hỗ trợ tiếp cận số, phân hóa mức độ nhiệm vụ và phụ lục hỗ trợ riêng cho HS hòa nhập/chuyên biệt.
              </p>
            </div>
          </label>

          {/* CLIL Integration */}
          <label
            className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3.5 ${
              config.clilIntegration
                ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <input
              type="checkbox"
              checked={config.clilIntegration}
              onChange={(e) => onChange({ clilIntegration: e.target.checked })}
              className="mt-1 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                <Globe className="w-4 h-4 text-blue-600" />
                Ngoại ngữ CLIL (Song ngữ)
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Tích hợp thuật ngữ chuyên môn tiếng Anh song song, kèm bài đọc/tra cứu số bằng tiếng Anh và Bảng chú giải thuật ngữ CLIL.
              </p>
            </div>
          </label>

          {/* STEM Integration */}
          <label
            className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3.5 ${
              config.stemIntegration
                ? 'border-purple-500 bg-purple-50/60 ring-2 ring-purple-500/20'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <input
              type="checkbox"
              checked={config.stemIntegration}
              onChange={(e) => onChange({ stemIntegration: e.target.checked })}
              className="mt-1 rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
            />
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                <Atom className="w-4 h-4 text-purple-600" />
                Giáo dục STEM / STEAM
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Lồng ghép quy trình thiết kế kỹ thuật, giải quyết vấn đề liên môn và tạo ra sản phẩm thực tiễn thông qua công cụ số.
              </p>
            </div>
          </label>

          {/* AI Literacy */}
          <label
            className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3.5 ${
              config.aiLiteracy
                ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <input
              type="checkbox"
              checked={config.aiLiteracy}
              onChange={(e) => onChange({ aiLiteracy: e.target.checked })}
              className="mt-1 rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
            />
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                <Bot className="w-4 h-4 text-amber-600" />
                Tích hợp Trí tuệ Nhân tạo (AI Literacy)
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Hướng dẫn học sinh tương tác có trách nhiệm với các công cụ AI, rèn luyện tư duy phản biện và bảo đảm liêm chính học thuật.
              </p>
            </div>
          </label>
        </div>

        {/* Bilingual Option (Song ngữ Việt - Anh) */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            Tùy chọn Song ngữ Việt - Anh (Bilingual Mode)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'none', label: 'Thuần Tiếng Việt', desc: 'Soạn giáo án bằng tiếng Việt tiêu chuẩn' },
              { id: 'partial', label: 'Song ngữ một phần', desc: 'Ưu tiên phần Khởi động & Từ khóa chuyên môn' },
              { id: 'full', label: 'Song ngữ toàn phần', desc: 'Trình bày song song cả tiếng Anh và tiếng Việt' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`p-3 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                  config.bilingualMode === opt.id
                    ? 'border-blue-600 bg-blue-50/80 ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{opt.label}</span>
                  <input
                    type="radio"
                    name="bilingualChoice"
                    value={opt.id}
                    checked={config.bilingualMode === opt.id}
                    onChange={() => onChange({ bilingualMode: opt.id as any })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Pedagogical Method Selector */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Phương pháp dạy học chủ đạo
          </label>
          <select
            value={config.pedagogicalMethod}
            onChange={(e) => onChange({ pedagogicalMethod: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
          >
            {pedagogicalMethods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Additional custom teacher note */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Yêu cầu riêng của Thầy/Cô (Ghi chú thêm nếu có)
          </label>
          <textarea
            rows={2}
            value={config.additionalRequirements}
            onChange={(e) => onChange({ additionalRequirements: e.target.value })}
            placeholder="Ví dụ: Cần tăng cường hoạt động làm việc nhóm 4 người; Tiết dạy có Ban giám hiệu dự giờ; Chú trọng kỹ năng tra cứu an toàn..."
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition"
        >
          ← Quay lại Bước 1
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
        >
          Tiếp tục: Tải tài liệu & Giáo án nguồn →
        </button>
      </div>
    </div>
  );
};
