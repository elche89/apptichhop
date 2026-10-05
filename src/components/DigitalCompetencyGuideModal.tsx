import React from 'react';
import { X, BookOpen, Monitor, Search, Users, Sparkles, ShieldCheck, Cpu, CheckCircle } from 'lucide-react';
import { COMPETENCY_DOMAINS } from '../data/standardsData';

interface DigitalCompetencyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalCompetencyGuideModal: React.FC<DigitalCompetencyGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const getDomainIcon = (iconName: string) => {
    switch (iconName) {
      case 'Monitor':
        return <Monitor className="w-5 h-5 text-blue-600" />;
      case 'Search':
        return <Search className="w-5 h-5 text-emerald-600" />;
      case 'Users':
        return <Users className="w-5 h-5 text-indigo-600" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-purple-600" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-rose-600" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-amber-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[88vh] overflow-hidden flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-amber-300" />
            <div>
              <h3 className="font-bold text-lg">Khung Năng Lực Số Học Sinh Phổ Thông</h3>
              <p className="text-xs text-blue-100">
                Theo chuẩn Chương trình GDPT 2018 & Khung năng lực số (DigComp) Bộ Giáo dục & Đào tạo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
            <p className="font-semibold text-blue-800 text-sm mb-1">
              💡 Lưu ý quan trọng khi tích hợp Năng lực số vào KHBD (theo CV 5512):
            </p>
            Tích hợp năng lực số không chỉ dừng lại ở việc giáo viên chiếu slide trình chiếu. Năng lực số chỉ thực sự hình thành khi <strong>học sinh là chủ thể trực tiếp thao tác</strong>: tự tìm kiếm thông tin, tự thu thập dữ liệu, tự tương tác trên phần mềm mô phỏng, hoặc tự thiết kế và chia sẻ sản phẩm học tập số của mình.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COMPETENCY_DOMAINS.map((domain) => (
              <div
                key={domain.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    {getDomainIcon(domain.icon)}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {domain.code}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 mt-0.5">{domain.title}</h4>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mb-3">{domain.description}</p>
                <div className="space-y-1.5 border-t border-slate-100 pt-2.5">
                  <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
                    Chỉ số hành vi cụ thể của học sinh:
                  </p>
                  {domain.indicators.map((ind, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span>{ind}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500 font-medium">
            Bản quyền: <strong className="text-slate-800">BÙI VĂN TRUNG</strong> - GV trường THCS Thái Thịnh, phường Đống Đa
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
          >
            Đã hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
