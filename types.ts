
export type Language = 'en' | 'pt';

export enum EvidenceLevel {
  GOLD = 'GOLD',
  SILVER = 'SILVER',
  BRONZE = 'BRONZE'
}

export interface Citation {
  title: string;
  author: string;
  year: number;
  doi?: string;
  url?: string;
}

export interface ProtocolStep {
  order: number;
  title: string;
  description: string;
  isMandatory: boolean;
}

export interface Protocol {
  id: string;
  title: string;
  description: string;
  mechanism: string;
  evidenceLevel: EvidenceLevel;
  tags: string[];
  durationDays: number; // Default duration
  steps: ProtocolStep[];
  contraindications: string[];
  citations: Citation[];
  recommendedMetrics: string[]; // e.g., ["Focus", "Energy", "Sleep"]
  isCustom?: boolean; // New: Custom protocols
}

export interface LogEntry {
  date: string;
  metricValue: number; // 1-10
  notes: string;
  tags?: string[]; // e.g., ["sick", "tired", "traveling"]
  mood?: 'happy' | 'neutral' | 'stressed' | 'tired'; // New: Mood tracking
}

export enum ExperimentStatus {
  SETUP = 'SETUP',
  BASELINE = 'BASELINE',
  INTERVENTION = 'INTERVENTION',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

// --- New Features Types ---

export type BookCategory = 'Focus' | 'Habits' | 'Sleep' | 'Psychology' | 'Health' | 'Philosophy' | 'Business' | 'Biography' | 'Strategy' | 'Science';

export type ReadingStatus = 'unread' | 'reading' | 'completed';

export interface BookResource {
  id: string;
  title: string;
  author: string;
  coverUrl?: string; // Emoji or URL
  summary: string;
  category: BookCategory;
  link?: string;
  buyLink?: string; // URL to purchase
  
  // Tracking
  status: ReadingStatus;
  progress: number; // 0-100
  rating?: number; // 1-5
  isUserAdded?: boolean;
  dateCompleted?: string;
}

export interface Achievement {
  id: string;
  icon: string;
  title_en: string;
  title_pt: string;
  desc_en: string;
  desc_pt: string;
  threshold: number; // Books read to unlock
  unlocked?: boolean;
}

export interface HydrationLog {
  date: string; // YYYY-MM-DD
  amountMl: number;
  dailyGoal: number;
}

export interface Affirmation {
  id: string;
  text: string;
  category: 'Confidence' | 'Focus' | 'Calm';
}

export interface ProtocolPack {
  id: string;
  title: string;
  protocolIds: string[];
  iconName: string; // 'Zap', 'Moon', etc.
  description: string;
  colorClass: string;
}

// --- Gamification & Social ---

export interface Challenge {
  id: string;
  category: string; // Changed to string to allow flexible categories
  title_pt: string;
  title_en: string;
  desc_pt: string;
  desc_en: string;
  participants: number;
  progress: number;
  reward: string;
  joined?: boolean; // Optional mainly for UI state
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  avatar: string;
  trend: 'up' | 'down' | 'same';
}

export interface SocialPost {
  id: string;
  author: string;
  avatar: string;
  content: string;
  likes: number;
  timeAgo: string;
  badge?: string;
}

// --- AI Structured Outputs ---

export interface PaperAnalysis {
  objective: string;
  methodology: string;
  sampleSize: string;
  keyResults: string;
  limitations: string[];
  doi?: string;
}

export interface EvidenceGrading {
  grade: 'A' | 'B' | 'C';
  mappedLevel: EvidenceLevel;
  reasoning: string;
  scientificConsensus: string;
}

export interface ExperimentInsight {
  headline: string;
  trendDirection: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  statisticalSummary: string;
  observation: string;
  recommendation: string;
  disclaimer: string;
}

export interface Experiment {
  id: string;
  protocolId: string;
  status: ExperimentStatus;
  startDate: string;
  endDate?: string;
  baselineLogs: LogEntry[];
  interventionLogs: LogEntry[];
  aiAnalysis?: ExperimentInsight; 
  userGoal?: string; // Why they are doing this
}

export interface ChartDataPoint {
  day: string;
  value: number;
  phase: string;
}

// --- Identity & B2B ---

export type UserRole = 'SCIENTIST' | 'MANAGER' | 'ADMIN';
export type Chronotype = 'lion' | 'bear' | 'wolf' | 'dolphin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  orgId?: string;
  onboardingCompleted: boolean;
  chronotype?: Chronotype; // New: Bio-personalization
  goals?: string[];
  points?: number;
}

export interface Organization {
  id: string;
  name: string;
  plan: PlanTier;
  members: number;
  subscriptionStatus?: SubscriptionStatus;
}

export interface TeamInsight {
  metric: string;
  changePercentage: number;
  trend: 'UP' | 'DOWN' | 'FLAT';
  insight: string;
}

// --- Billing ---

export type PlanTier = 'FREE' | 'PREMIUM' | 'SUPER_PREMIUM' | 'ENTERPRISE';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';

export interface Entitlements {
  maxActiveExperiments: number;
  maxMembers: number;
  canUploadCsv: boolean;
  canExportReports: boolean;
  aiModelVersion: 'gemini-flash' | 'gemini-pro';
  supportLevel: 'community' | 'email' | 'dedicated';
  advancedAnalytics: boolean;
}

export interface PlanConfig {
  id: PlanTier;
  name: string;
  priceMonthly: number;
  priceId?: string;
  entitlements: Entitlements;
  features: string[]; // For UI display
  highlight?: boolean;
}
