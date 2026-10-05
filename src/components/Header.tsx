import React from 'react';
import { Sparkles, BookOpen, Key, HelpCircle, RotateCcw } from 'lucide-react';
import { ApiSettings } from '../types';

interface HeaderProps {
  apiSettings: ApiSettings;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onReset: () => void;
  hasEnvKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  apiSettings,
  onOpenSettings,
  onOpenGuide,
  onReset,
  hasEnvKey,
}) => {
  const isKeyActive = Boolean(apiSettings.customApiKey || hasEnvKey);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100">
              <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 uppercase">
                  KHBD <span className="text-blue-600">Năng Lực Số</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 rounded-full">
                  CV 5512
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-600 hidden sm:block">
                Bản quyền: <span className="font-bold text-slate-900">BÙI VĂN TRUNG</span> - GV trường THCS Thái Thịnh, phường Đống Đa
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              title="Tra cứu Khung 6 Miền Năng lực số theo Bộ GD&ĐT"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="hidden md:inline">Khung Năng Lực Số</span>
              <span className="md:hidden">Khung NLS</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition shadow-2xs relative"
              title="Cấu hình Model & API Key Gemini"
            >
              <Key className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Cấu hình API Key</span>
              <span className="text-xs text-slate-500 hidden lg:inline">({apiSettings.model.replace('gemini-', '')})</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isKeyActive ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                title={isKeyActive ? 'API Key đã sẵn sàng' : 'Chưa thiết lập API Key'}
              />
            </button>

            <button
              onClick={onReset}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
              title="Làm mới để soạn giáo án mới"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
