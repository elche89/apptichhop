import React, { useState } from 'react';
import { Key, CheckCircle2, AlertCircle, X, ExternalLink, Cpu, Loader2 } from 'lucide-react';
import { ApiSettings } from '../types';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiSettings: ApiSettings;
  onSave: (settings: ApiSettings) => void;
  hasEnvKey: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiSettings,
  onSave,
  hasEnvKey,
}) => {
  const [apiKey, setApiKey] = useState(apiSettings.customApiKey || '');
  const [model, setModel] = useState(apiSettings.model || 'gemini-3.8-flash');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/check-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim(), model }),
      });
      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text || 'Phản hồi không hợp lệ từ máy chủ.' };
      }

      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `Kết nối thành công với ${model}! Gemini AI đã sẵn sàng hoạt động.`,
        });
      } else {
        const errorMsg = data.message || 'Không thể kết nối. Vui lòng kiểm tra lại API Key.';
        const is503 = errorMsg.includes('503') || errorMsg.includes('overloaded');
        setTestResult({
          success: false,
          message: is503
            ? 'Máy chủ AI hiện đang tạm thời quá tải (Lỗi 503). Thầy cô vui lòng bấm kiểm tra lại sau giây lát.'
            : errorMsg,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Lỗi mạng khi kiểm tra API Key.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSave({
      customApiKey: apiKey.trim(),
      model,
    });
    onClose();
  };

  const modelsList = [
    {
      id: 'gemini-3.8-flash',
      name: 'Gemini 3.8 Flash',
      badge: 'Khuyên dùng',
      desc: 'Tốc độ phản hồi cực nhanh, chuẩn cấu trúc sư phạm và tiết kiệm tài nguyên.',
    },
    {
      id: 'gemini-3.1-pro-preview',
      name: 'Gemini 3.1 Pro Preview',
      badge: 'Chuyên sâu',
      desc: 'Suy luận logic nâng cao, phân tích phương pháp sư phạm và năng lực số chuyên biệt.',
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      badge: 'Tiêu chuẩn',
      desc: 'Phiên bản Flash ổn định với chất lượng văn phong đồng đều.',
    },
    {
      id: 'gemini-3.1-flash-lite',
      name: 'Gemini 3.1 Flash Lite',
      badge: 'Tốc độ cao',
      desc: 'Phù hợp khi cần xử lý nhanh gọn các bài học ngắn.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-lg">Cấu hình API Key & Mô hình Gemini</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Status Note */}
          {hasEnvKey ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900">
                <p className="font-semibold text-emerald-800">
                  Hệ thống đã nhận diện API Key mặc định của máy chủ.
                </p>
                <p className="mt-0.5">
                  Thầy cô có thể để trống ô bên dưới để dùng khoá mặc định, hoặc nhập API Key cá nhân của mình để quản lý riêng hạn ngạch.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <p className="font-semibold text-amber-800">Cần thiết lập API Key cá nhân</p>
                <p className="mt-0.5">
                  Thầy cô vui lòng dán Gemini API Key của mình vào ô bên dưới để bắt đầu soạn giáo án tích hợp NLS.
                </p>
              </div>
            </div>
          )}

          {/* API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-slate-800">
                Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
              >
                Lấy API Key miễn phí <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder={hasEnvKey ? 'Dùng API Key mặc định hệ thống (hoặc nhập khóa mới...)' : 'AIzaSy...'}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Khóa API của thầy cô được lưu trữ an toàn trên trình duyệt của máy và gửi trực tiếp qua kết nối bảo mật đến máy chủ.
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mb-2">
              <Cpu className="w-4 h-4 text-blue-600" /> Chọn Mô hình Gemini AI (Model)
            </label>
            <div className="space-y-2">
              {modelsList.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    model === m.id
                      ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="modelSelection"
                    value={m.id}
                    checked={model === m.id}
                    onChange={() => {
                      setModel(m.id);
                      setTestResult(null);
                    }}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900">{m.name}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          m.badge === 'Khuyên dùng'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Test connection feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting || (!apiKey && !hasEnvKey)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition disabled:opacity-50"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Đang kiểm tra...
              </>
            ) : (
              'Kiểm tra kết nối'
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
            >
              Lưu & Áp dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
