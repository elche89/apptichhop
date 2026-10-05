export type SchoolLevel = 'mamnon' | 'tieuhoc' | 'thcs' | 'thpt';

export interface SubjectOption {
  id: string;
  name: string;
  levels: SchoolLevel[];
}

export interface CompetencyDomain {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  indicators: string[];
}

export interface DigitalTool {
  id: string;
  name: string;
  category: 'Trình chiếu & Thiết kế' | 'Tương tác & Đánh giá' | 'Cộng tác & Bảng số' | 'Mô phỏng & Chuyên ngành' | 'Trí tuệ Nhân tạo (AI)' | 'Lập trình & Kỹ thuật số';
  icon?: string;
  description: string;
}

export interface SampleLesson {
  id: string;
  schoolLevel: SchoolLevel;
  subject: string;
  grade: string;
  curriculumBook: string;
  lessonTitle: string;
  duration: string;
  integrationLevel: string;
  competencyDomains: string[];
  tools: string[];
  inclusiveEducation: boolean;
  clilIntegration: boolean;
  stemIntegration: boolean;
  aiLiteracy: boolean;
  bilingualMode: 'none' | 'partial' | 'full';
  pedagogicalMethod: string;
  sampleOutline: string;
}

export interface KHBDConfig {
  schoolLevel: SchoolLevel;
  subject: string;
  grade: string;
  curriculumBook: string;
  lessonTitle: string;
  lessonDuration: string;
  targetPages?: string;
  integrationLevel: 'Nhập môn (Khám phá)' | 'Vận dụng' | 'Nâng cao (Sáng tạo)';
  competencyDomains: string[];
  tools: string[];
  inclusiveEducation: boolean;
  clilIntegration: boolean;
  stemIntegration: boolean;
  aiLiteracy: boolean;
  bilingualMode: 'none' | 'partial' | 'full';
  pedagogicalMethod: string;
  additionalRequirements: string;
  existingContent: string;
  distributionContext: string;
  fileName?: string;
}

export interface ApiSettings {
  customApiKey: string;
  model: string;
}

