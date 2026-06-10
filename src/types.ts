export interface Profile {
  name: string;
  email: string;
  role: string;
  avatar: string;
  activeCampaignsCount: number;
  leadsCapturedCount: number;
  dmsSentCount: number;
  repliesMadeCount: number;
  lastLoginAt?: string;
}

export interface Webhook {
  event: "lead_captured" | "automation_error";
  url: string;
  payloadFormat: "JSON" | "Form-Data";
  enabled: boolean;
}

export interface HashtagGroup {
  id: string;
  name: string;
  hashtags: string;
}

export interface Config {
  masterPrompt: string;
  defaultHashtags: string;
  toneOfVoice: string;
  fixedGenerationTime?: string;
  automationActive?: boolean;
  automationTime?: string;
  automationTasks?: string[];
  timezone?: string;
  emailNotificationsEnabled?: boolean;
  notificationEmail?: string;
  notifyOnCampaignComplete?: boolean;
  notifyOnErrorCritical?: boolean;
  webhooks?: Webhook[];
  hashtagGroups?: HashtagGroup[];
  autoPublishScheduledEnabled?: boolean;
}

export interface Campaign {
  id: string;
  robot: string;
  postTitle: string;
  postLink: string;
  keyword: string;
  status: "Ativa" | "Pausada" | "Concluída";
  respondidos: number;
  pendentes: number;
  leads: number;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  channel: string;
  status: "Draft" | "Agendado" | "Publicado";
  scheduledDate: string;
  publishDate: string;
  author: string;
  keyword: string;
  views?: number;
  content: string;
}

export interface Lead {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  status: "Novo" | "Contactado" | "Convertido";
  source: string;
  date: string;
}

export interface RadarSignal {
  id: string;
  platform: "X" | "YouTube" | "GitHub";
  title: string;
  description: string;
  author: string;
  date: string;
  stats?: string;
  tags: string[];
}

export interface RadarTopicSuggestion {
  platform: string;
  title: string;
  angle: string;
  suggestedFormat: string;
  keyword: string;
}

export interface RadarAnalysis {
  summary: string;
  keyInsights: string[];
  suggestions: RadarTopicSuggestion[];
  analyzedAt: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  message: string;
  type?: "success" | "warning" | "error";
}

export interface Audit {
  id: string;
  timestamp: string;
  action: string;
  severity: "info" | "warning" | "critical";
  user: string;
  details: string;
}

export interface AppState {
  profile: Profile;
  config: Config;
  campaigns: Campaign[];
  posts: Post[];
  leads: Lead[];
  radar: RadarSignal[];
  activityLogs: ActivityLog[];
  audits?: Audit[];
  radarAnalysis?: RadarAnalysis;
  darkMode?: boolean;
  activeTheme?: "classic" | "ch3" | "uol" | "h2" | "refined_neon" | "sales_iq" | "cyber_matrix" | "forest_harmony" | "royal_velvet" | "carbon_brutalist";
  authSession?: {
    isLoggedIn: boolean;
    username: string;
    email: string;
  };
  socialLogins?: {
    channel: string;
    username: string;
    connectedAt: string;
  }[];
}
