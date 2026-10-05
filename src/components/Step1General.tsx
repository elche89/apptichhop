import React from 'react';
import { SchoolLevel, KHBDConfig } from '../types';
import { SUBJECTS, CURRICULUM_BOOKS } from '../data/standardsData';
import { BookOpen, GraduationCap, Clock, Award, FileText } from 'lucide-react';

interface Step1GeneralProps {
  config: KHBDConfig;
  onChange: (updates: Partial<KHBDConfig>) => void;
  onNext: () => void;
}

export const Step1General: React.FC<Step1GeneralProps> = ({ config, onChange, onNext }) => {
  const getGradesForLevel = (level: SchoolLevel) => {
    switch (level) {
      case 'mamnon':
        return ['Mầm non (3-4 tuổi)', 'Mẫu giáo nhỡ (4-5 tuổi)', 'Mẫu giáo lớn (5-6 tuổi)'];
      case 'tieuhoc':
        return ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'];
      case 'thcs':
        return ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9'];
      case 'thpt':
        return ['Lớp 10', 'Lớp 11', 'Lớp 12'];
    }
  };

  const handleLevelChange = (level: SchoolLevel) => {
    const defaultGrades = getGradesForLevel(level);
    onChange({
      schoolLevel: level,
      grade: defaultGrades[0],
    });
  };

  const availableSubjects = SUBJECTS.filter((s) => s.levels.includes(config.schoolLevel));

  const isFormValid = config.lessonTitle.trim().length > 0 && config.subject.trim().length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Introduction Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-xs shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Bước 1: Thiết lập Thông tin Bài dạy & Khung chương trình
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Hỗ trợ toàn diện từ Mầm non đến Lớp 12 theo Chương trình GDPT 2018 và Khung Năng lực số chuẩn của Bộ GD&ĐT.
            </p>
          </div>
        </div>
      </div>

      {/* School Level & Grade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        {/* School Level */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            1. Cấp học
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'mamnon', label: 'Mầm non', badge: 'Mẫu giáo' },
              { id: 'tieuhoc', label: 'Tiểu học', badge: 'Lớp 1-5' },
              { id: 'thcs', label: 'THCS', badge: 'Lớp 6-9' },
              { id: 'thpt', label: 'THPT', badge: 'Lớp 10-12' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => handleLevelChange(lvl.id as SchoolLevel)}
                className={`py-3 px-2 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                  config.schoolLevel === lvl.id
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold ring-2 ring-blue-500/20'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-sm">{lvl.label}</span>
                <span className="text-[11px] text-slate-500 font-normal mt-0.5">{lvl.badge}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grade Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            2. Khối lớp
          </label>
          <div className="flex flex-wrap gap-2">
            {getGradesForLevel(config.schoolLevel).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onChange({ grade: g })}
                className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
                  config.grade === g
                    ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                    : 'border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subject */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          3. Môn học
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={config.subject}
            onChange={(e) => onChange({ subject: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
          >
            {availableSubjects.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Quick select pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {availableSubjects.slice(0, 6).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onChange({ subject: s.name })}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition ${
                  config.subject === s.name
                    ? 'bg-blue-100 text-blue-800 border-blue-300 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lesson Title, Duration & Page Count */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            4. Tên bài học / Chủ đề bài dạy <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={config.lessonTitle}
              onChange={(e) => onChange({ lessonTitle: e.target.value })}
              placeholder="Ví dụ: Bài mở đầu; Hình lăng trụ đứng; Tế bào - Đơn vị cơ sở của sự sống..."
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Ghi rõ tên bài học để hệ thống tìm kiếm mục tiêu và thiết kế hoạt động chuẩn xác nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" /> 5. Thời lượng
            </label>
            <select
              value={config.lessonDuration}
              onChange={(e) => onChange({ lessonDuration: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="1 tiết (45 phút)">1 tiết (45 phút)</option>
              <option value="2 tiết (90 phút)">2 tiết (90 phút)</option>
              <option value="3 tiết (135 phút)">3 tiết (135 phút)</option>
              <option value="4 tiết (180 phút)">4 tiết (180 phút)</option>
              <option value="5 tiết (225 phút)">5 tiết (225 phút)</option>
              <option value="Chuyên đề (5+ tiết)">Chuyên đề (5+ tiết)</option>
              <option value="1 tiết tiểu học (35 phút)">1 tiết tiểu học (35 phút)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" /> 6. Số trang mong muốn
            </label>
            <select
              value={config.targetPages || '5 - 7 trang (Đầy đủ, chuẩn mực)'}
              onChange={(e) => onChange({ targetPages: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="Tự động (Theo chuẩn nội dung bài học)">Tự động (Theo chuẩn nội dung bài học)</option>
              <option value="3 - 5 trang (Gọn gàng, tinh giản)">3 - 5 trang (Gọn gàng, tinh giản)</option>
              <option value="5 - 7 trang (Đầy đủ, chuẩn mực)">5 - 7 trang (Đầy đủ, chuẩn mực - Phổ biến nhất)</option>
              <option value="8 - 10 trang (Chi tiết, chuyên sâu)">8 - 10 trang (Chi tiết, chuyên sâu)</option>
              <option value="10 - 15 trang (Toàn diện, dự án / chuyên đề)">10 - 15 trang (Toàn diện, dự án / chuyên đề)</option>
              <option value="Trên 15 trang (Hồ sơ bài dạy tích hợp chuyên sâu)">Trên 15 trang (Hồ sơ bài dạy tích hợp chuyên sâu)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              AI sẽ căn chỉnh mức độ mở rộng hoạt động và phụ lục để khớp với dung lượng mong muốn.
            </p>
          </div>
        </div>
      </div>

      {/* Integration Level */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-blue-600" /> 7. Mức độ tích hợp Năng lực số mong muốn
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              level: 'Nhập môn (Khám phá)',
              desc: 'Học sinh tiếp cận công cụ số, tra cứu thông tin cơ bản, xem mô phỏng trực quan dưới sự hướng dẫn của GV.',
              badge: 'Cơ bản',
            },
            {
              level: 'Vận dụng',
              desc: 'Học sinh chủ động thao tác phần mềm, tương tác nhóm trên bảng số, giải quyết bài toán qua công cụ số.',
              badge: 'Phổ biến nhất',
            },
            {
              level: 'Nâng cao (Sáng tạo)',
              desc: 'Học sinh tự tạo sản phẩm số (infographic, video, mô hình), phân tích dữ liệu và tư duy phản biện với AI.',
              badge: 'Sáng tạo cao',
            },
          ].map((item) => (
            <div
              key={item.level}
              onClick={() => onChange({ integrationLevel: item.level as any })}
              className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                config.integrationLevel === item.level
                  ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-bold text-sm text-slate-900">{item.level}</h4>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.badge === 'Phổ biến nhất'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation action */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          disabled={!isFormValid}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition"
        >
          Tiếp tục: Cấu hình Miền NLS & Tùy chọn nâng cao →
        </button>
      </div>
    </div>
  );
};
