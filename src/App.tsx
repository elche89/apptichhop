/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { KHBDConfig, ApiSettings, SchoolLevel } from './types';
import { Header } from './components/Header';
import { StepWizard } from './components/StepWizard';
import { Step1General } from './components/Step1General';
import { Step2Advanced } from './components/Step2Advanced';
import { Step3SourceUpload } from './components/Step3SourceUpload';
import { Step4Result } from './components/Step4Result';
import { ApiKeyModal } from './components/ApiKeyModal';
import { DigitalCompetencyGuideModal } from './components/DigitalCompetencyGuideModal';
import { AlertCircle, Sparkles, BookOpen } from 'lucide-react';

const DEFAULT_CONFIG: KHBDConfig = {
  schoolLevel: 'thcs',
  subject: 'Lịch sử và Địa lý',
  grade: 'Lớp 6',
  curriculumBook: 'Chương trình GDPT 2018 (Chuẩn hợp nhất)',
  lessonTitle: 'Bài mở đầu',
  lessonDuration: '1 tiết (45 phút)',
  targetPages: '5 - 7 trang (Đầy đủ, chuẩn mực)',
  integrationLevel: 'Vận dụng',
  competencyDomains: ['domain_1', 'domain_2', 'domain_3'],
  tools: ['Padlet', 'PowerPoint / Google Slides', 'Quizizz'],
  inclusiveEducation: false,
  clilIntegration: false,
  stemIntegration: false,
  aiLiteracy: false,
  bilingualMode: 'none',
  pedagogicalMethod: 'Dạy học tích cực kết hợp Chuyển đổi số',
  additionalRequirements: '',
  existingContent: '',
  distributionContext: '',
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [config, setConfig] = useState<KHBDConfig>(DEFAULT_CONFIG);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  // Settings & modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [hasEnvKey, setHasEnvKey] = useState<boolean>(false);

  const [apiSettings, setApiSettings] = useState<ApiSettings>(() => {
    const savedKey = localStorage.getItem('khbd_custom_api_key') || '';
    const savedModel = localStorage.getItem('khbd_model') || 'gemini-3.8-flash';
    return {
      customApiKey: savedKey,
      model: savedModel,
    };
  });

  // Check system status on mount
  useEffect(() => {
    fetch('/api/system-status')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasDefaultApiKey) {
          setHasEnvKey(true);
        }
      })
      .catch((err) => {
        console.error('Failed to query system status:', err);
      });
  }, []);

  const handleUpdateConfig = (updates: Partial<KHBDConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleSaveApiSettings = (settings: ApiSettings) => {
    setApiSettings(settings);
    localStorage.setItem('khbd_custom_api_key', settings.customApiKey);
    localStorage.setItem('khbd_model', settings.model);
  };

  const handleReset = () => {
    if (confirm('Thầy cô có chắc chắn muốn làm mới để tạo giáo án mới không?')) {
      setConfig({
        ...DEFAULT_CONFIG,
        lessonTitle: 'Bài mở đầu',
        existingContent: '',
        fileName: undefined,
      });
      setGeneratedContent('');
      setCurrentStep(1);
    }
  };

  const canNavigateTo = (step: number) => {
    if (step === 1) return true;
    if (step === 2) return config.lessonTitle.trim().length > 0;
    if (step === 3) return config.lessonTitle.trim().length > 0;
    if (step === 4) return generatedContent.length > 0 || isStreaming;
    return false;
  };

  const startGeneratingKHBD = async () => {
    // Check if key is available
    if (!apiSettings.customApiKey && !hasEnvKey) {
      setIsSettingsOpen(true);
      return;
    }

    setCurrentStep(4);
    setIsStreaming(true);
    setStreamError(null);
    setGeneratedContent('');

    try {
      const response = await fetch('/api/generate-khbd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiSettings.customApiKey,
          model: apiSettings.model,
          ...config,
        }),
      });

      if (!response.ok) {
        let errorMsg = 'Không thể tạo giáo án.';
        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              const parsed = JSON.parse(errorText);
              errorMsg = parsed.message || parsed.error || errorText;
            } catch {
              errorMsg = errorText;
            }
          }
        } catch {
          // ignore
        }
        if (response.status === 503 || errorMsg.includes('503') || errorMsg.includes('overloaded')) {
          errorMsg = 'Hệ thống AI hiện đang tạm thời quá tải (Lỗi 503). Thầy cô vui lòng bấm nút "Soạn lại" sau giây lát.';
        }
        throw new Error(errorMsg);
      }

      if (!response.body) {
        throw new Error('Trình duyệt không hỗ trợ stream phản hồi.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      const processEventBlock = (block: string) => {
        const rawLines = block.split(/\r?\n/);
        for (const rawLine of rawLines) {
          const line = rawLine.trim();
          if (!line || line.startsWith(':')) continue;
          if (line.startsWith('data:')) {
            const jsonStr = line.slice(5).trim();
            if (!jsonStr) continue;
            try {
              const data = JSON.parse(jsonStr);
              if (data.type === 'chunk' && typeof data.text === 'string') {
                setGeneratedContent((prev) => prev + data.text);
              } else if (data.type === 'done' && data.fullText) {
                setGeneratedContent(data.fullText);
              } else if (data.type === 'error') {
                const is503 = (data.message || '').includes('503') || (data.message || '').includes('overloaded');
                setStreamError(
                  is503
                    ? 'Hệ thống AI hiện đang tạm thời quá tải (Lỗi 503). Thầy cô vui lòng bấm nút "Soạn lại" sau giây lát.'
                    : (data.message || 'Lỗi trong quá trình xử lý')
                );
              }
            } catch {
              // Gracefully ignore incomplete or split JSON segments to prevent throwing errors
            }
          }
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          if (buffer.trim()) {
            processEventBlock(buffer);
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        let boundary;
        while ((boundary = buffer.indexOf('\n\n')) !== -1) {
          const eventBlock = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          processEventBlock(eventBlock);
        }
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      const rawMsg = err?.message || 'Lỗi kết nối khi gửi yêu cầu tới AI.';
      const is503 = rawMsg.includes('503') || rawMsg.includes('overloaded');
      setStreamError(
        is503
          ? 'Hệ thống AI hiện đang tạm thời quá tải (Lỗi 503). Thầy cô vui lòng bấm nút "Soạn lại" sau giây lát.'
          : rawMsg
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Header */}
      <Header
        apiSettings={apiSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onReset={handleReset}
        hasEnvKey={hasEnvKey}
      />

      {/* Main content body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Step Wizard Bar */}
        <StepWizard
          currentStep={currentStep}
          onStepClick={(step) => setCurrentStep(step)}
          canNavigateTo={canNavigateTo}
        />

        {/* Global Error Banner */}
        {streamError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs sm:text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Đã xảy ra lỗi:</p>
              <p className="mt-0.5">{streamError}</p>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="mt-2 inline-flex items-center gap-1 font-semibold text-rose-700 underline hover:text-rose-900"
              >
                Kiểm tra lại cấu hình API Key & Model
              </button>
            </div>
          </div>
        )}

        {/* Step 1: General Info */}
        {currentStep === 1 && (
          <Step1General
            config={config}
            onChange={handleUpdateConfig}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {/* Step 2: Advanced Options & Domains */}
        {currentStep === 2 && (
          <Step2Advanced
            config={config}
            onChange={handleUpdateConfig}
            onBack={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
          />
        )}

        {/* Step 3: Source Upload & Samples */}
        {currentStep === 3 && (
          <Step3SourceUpload
            config={config}
            onChange={handleUpdateConfig}
            onBack={() => setCurrentStep(2)}
            onStartGenerate={startGeneratingKHBD}
          />
        )}

        {/* Step 4: Result Document & Refine */}
        {currentStep === 4 && (
          <Step4Result
            config={config}
            apiSettings={apiSettings}
            generatedContent={generatedContent}
            isStreaming={isStreaming}
            onUpdateContent={(val) => setGeneratedContent(val)}
            onRestart={handleReset}
            onRegenerate={startGeneratingKHBD}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs space-y-2">
          <div className="flex items-center justify-center gap-2 font-bold text-slate-900 text-sm">
            <Sparkles className="w-4 h-4 text-blue-600 fill-blue-600" />
            <span>KẾ HOẠCH BÀI DẠY NĂNG LỰC SỐ (KHBD NLS)</span>
          </div>
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl max-w-2xl mx-auto">
            <p className="font-bold text-blue-900 text-xs sm:text-sm">
              Bản quyền thuộc: BÙI VĂN TRUNG
            </p>
            <p className="text-blue-800 text-xs mt-0.5">
              Giáo viên trường THCS Thái Thịnh, phường Đống Đa
            </p>
          </div>
          <p className="text-slate-500 text-[11px]">
            Hệ thống hỗ trợ Giáo viên chuyển đổi số, tích hợp Năng Lực Số (DigComp) theo chuẩn Công văn 5512/BGDĐT-GDTrH
          </p>
        </div>
      </footer>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiSettings={apiSettings}
        onSave={handleSaveApiSettings}
        hasEnvKey={hasEnvKey}
      />

      <DigitalCompetencyGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
