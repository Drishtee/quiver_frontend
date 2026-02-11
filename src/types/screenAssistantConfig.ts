export type AllScreenType =
  | 'landing' | 'login' | 'signup' | 'otp' | 'business-model'
  | 'consent' | 'profile' | 'enterprise' | 'industry' | 'pathway'
  | 'ai-pathway' | 'questionnaire' | 'equity' | 'documents' | 'review'
  | 'admin' | 'success' | 'dashboard' | 'schedule' | 'video-meeting'
  | 'voice-onboarding';

export interface ScreenAction {
  action_id: string;
  label: string;
  description: string;
}

export interface ScreenAssistantConfig {
  screen_key: AllScreenType;
  enabled: boolean;
  system_prompt_override: string;
  enabled_tools: string[];
  allowed_navigation_targets: AllScreenType[];
  custom_actions: ScreenAction[];
}

export type ScreenConfigMap = Record<string, ScreenAssistantConfig>;
