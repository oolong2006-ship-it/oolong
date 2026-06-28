import type {
  User,
  Session,
  Payment,
  ProjectCredit,
  Establishment,
  UploadedFile,
  QuestionnaireAnswer,
  AiAnalysisResult,
  GeneratedReport,
  ReportSection,
  AdminUser,
  AuditLog,
  UserRole,
  ProjectStatus,
  PaymentStatus,
} from "@prisma/client";

// Re-export Prisma enums
export { UserRole, ProjectStatus, PaymentStatus };

// Re-export Prisma models
export type {
  User,
  Session,
  Payment,
  ProjectCredit,
  Establishment,
  UploadedFile,
  QuestionnaireAnswer,
  AiAnalysisResult,
  GeneratedReport,
  ReportSection,
  AdminUser,
  AuditLog,
};

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  sessionId: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  mobile?: string;
  password: string;
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export interface PaymentInitInput {
  userId: string;
  amount: number;
  currency?: string;
  description?: string;
}

export interface PaymentInitResult {
  paymentId: string;
  checkoutUrl: string;
  providerRef: string;
}

export interface PaymentVerifyResult {
  status: PaymentStatus;
  providerRef: string;
  providerPayload: Record<string, unknown>;
}

// ─── Establishment ───────────────────────────────────────────────────────────

export interface EstablishmentWithRelations extends Establishment {
  uploadedFiles?: UploadedFile[];
  answers?: QuestionnaireAnswer[];
  aiResults?: AiAnalysisResult[];
  reports?: GeneratedReport[];
  credit?: ProjectCredit | null;
}

export interface EstablishmentSummary {
  id: string;
  nameAr: string | null;
  nameEn: string | null;
  activityType: string | null;
  city: string | null;
  status: ProjectStatus;
  dataCompletion: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Questionnaire ───────────────────────────────────────────────────────────

export type QuestionnaireSection =
  | "general"
  | "identity"
  | "products"
  | "market"
  | "financials"
  | "operations"
  | "hr"
  | "supply_chain"
  | "franchise_intent";

export interface QuestionnaireSectionData {
  section: QuestionnaireSection;
  answers: Record<string, string | number | boolean | null>;
  completedAt?: Date;
}

export interface QuestionnaireProgress {
  section: QuestionnaireSection;
  label: string;
  completed: boolean;
  completedAt?: Date;
  fieldCount: number;
  answeredCount: number;
}

// ─── AI Analysis ─────────────────────────────────────────────────────────────

export type AiSectionKey =
  | "executive_summary"
  | "brand_analysis"
  | "market_analysis"
  | "financial_analysis"
  | "operations_analysis"
  | "hr_analysis"
  | "supply_chain_analysis"
  | "franchise_readiness"
  | "recommendations";

export interface AiAnalysisInput {
  establishmentId: string;
  sectionKey: AiSectionKey;
  establishment: Establishment;
  answers: QuestionnaireAnswer[];
}

export interface AiAnalysisOutput {
  sectionKey: AiSectionKey;
  content: string;
  parsedOutput?: Record<string, unknown>;
  tokensUsed?: number;
}

// ─── Report ──────────────────────────────────────────────────────────────────

export interface ReadinessScores {
  readinessScore: number;
  brandStrength: number;
  replicability: number;
  productClarity: number;
  unitEconomics: number;
  systemsSOPs: number;
  supplyChain: number;
  legalReadiness: number;
}

export interface GeneratedReportWithSections extends GeneratedReport {
  sections: ReportSection[];
}

// ─── File Upload ──────────────────────────────────────────────────────────────

export type FileType =
  | "commercial_register"
  | "trademark_certificate"
  | "financial_statements"
  | "menu_pricelist"
  | "brand_assets"
  | "other";

export interface UploadFileInput {
  establishmentId: string;
  fileType: FileType;
  file: File | Buffer;
  fileName: string;
  mimeType: string;
}

export interface UploadFileResult {
  fileId: string;
  storagePath: string;
  publicUrl: string | null;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminDashboardStats {
  totalUsers: number;
  totalEstablishments: number;
  totalRevenue: number;
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
  projectsByStatus: Record<ProjectStatus, number>;
}

// ─── Forms ────────────────────────────────────────────────────────────────────

export interface FormError {
  field: string;
  message: string;
}

export interface ActionState<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  errors?: FormError[];
  message?: string;
}
