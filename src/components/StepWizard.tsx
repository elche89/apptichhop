import React from 'react';
import { Check, GraduationCap, Layers, UploadCloud, FileCheck2 } from 'lucide-react';

interface StepWizardProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  canNavigateTo: (step: number) => boolean;
}

export const StepWizard: React.FC<StepWizardProps> = ({
  currentStep,
  onStepClick,
  canNavigateTo,
}) => {
  const steps = [
    { number: 1, title: 'Thông tin chung', desc: 'Môn, Lớp, Bộ sách', icon: GraduationCap },
    { number: 2, title: 'Miền NLS & Sư phạm', desc: 'Công cụ, Hòa nhập, CLIL', icon: Layers },
    { number: 3, title: 'Tài liệu nguồn', desc: 'Tải file / Bài mẫu', icon: UploadCloud },
    { number: 4, title: 'Giáo án số 5512', desc: 'Xem & Tải Word', icon: FileCheck2 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-2xs no-print">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        {steps.map((s) => {
          const isCurrent = currentStep === s.number;
          const isCompleted = currentStep > s.number;
          const isClickable = canNavigateTo(s.number);
          const Icon = s.icon;

          return (
            <button
              key={s.number}
              type="button"
              onClick={() => isClickable && onStepClick(s.number)}
              disabled={!isClickable}
              className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                isCurrent
                  ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                  : isCompleted
                  ? 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-slate-800'
                  : 'border-slate-200 bg-slate-50/60 opacity-60 cursor-not-allowed'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs transition ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-4 h-4" />}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Bước {s.number}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {s.title}
                </h4>
                <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                  {s.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
