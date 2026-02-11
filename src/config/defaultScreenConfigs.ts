import type { ScreenAssistantConfig, ScreenConfigMap } from '../types/screenAssistantConfig';

const makeConfig = (
  partial: Partial<ScreenAssistantConfig> & { screen_key: ScreenAssistantConfig['screen_key'] }
): ScreenAssistantConfig => ({
  enabled: false,
  system_prompt_override: '',
  enabled_tools: [],
  allowed_navigation_targets: [],
  custom_actions: [],
  ...partial,
});

export const DEFAULT_SCREEN_CONFIGS: ScreenConfigMap = {
  // --- Auth / pre-onboarding screens: AI disabled ---
  landing: makeConfig({ screen_key: 'landing' }),
  login: makeConfig({ screen_key: 'login' }),
  signup: makeConfig({ screen_key: 'signup' }),
  otp: makeConfig({ screen_key: 'otp' }),
  'business-model': makeConfig({ screen_key: 'business-model' }),

  // --- Onboarding screens: AI enabled ---
  consent: makeConfig({
    screen_key: 'consent',
    enabled: true,
    system_prompt_override: 'You are on the Consent screen. Help the user understand and accept the partnership terms. Explain what Quiver is and how the equity partnership works.',
    enabled_tools: ['navigate_to_screen', 'trigger_action'],
    allowed_navigation_targets: ['profile', 'voice-onboarding'],
    custom_actions: [
      { action_id: 'accept_consent', label: 'Accept Consent', description: 'Accept the consent terms and proceed to profile' },
    ],
  }),
  profile: makeConfig({
    screen_key: 'profile',
    enabled: true,
    system_prompt_override: 'The user is on the Profile screen. If they ask for help or seem stuck, you can guide them through their personal details. Do NOT ask for each field one by one unprompted — let the user share info at their own pace.',
    enabled_tools: ['update_form_field', 'batch_update_fields', 'confirm_all_fields', 'navigate_to_screen', 'trigger_action'],
    allowed_navigation_targets: ['consent', 'industry'],
    custom_actions: [
      { action_id: 'submit_profile', label: 'Save Profile', description: 'Submit profile and proceed to industry selection' },
      { action_id: 'go_back', label: 'Go Back', description: 'Go back to the previous screen' },
    ],
  }),
  enterprise: makeConfig({
    screen_key: 'enterprise',
    enabled: false,
  }),
  industry: makeConfig({
    screen_key: 'industry',
    enabled: true,
    system_prompt_override: 'The user is on the Industry/Business Details screen. Chat naturally about their business. If they share details, save them. Only guide them through specific fields if they ask for help.',
    enabled_tools: ['update_form_field', 'batch_update_fields', 'confirm_all_fields', 'navigate_to_screen', 'trigger_action'],
    allowed_navigation_targets: ['profile', 'questionnaire'],
    custom_actions: [
      { action_id: 'submit_industry', label: 'Save Industry', description: 'Submit industry details and proceed to questionnaire' },
      { action_id: 'go_back', label: 'Go Back', description: 'Go back to the previous screen' },
    ],
  }),
  pathway: makeConfig({ screen_key: 'pathway' }),
  'ai-pathway': makeConfig({ screen_key: 'ai-pathway' }),
  questionnaire: makeConfig({
    screen_key: 'questionnaire',
    enabled: true,
    system_prompt_override: 'The user is on the Business Questionnaire. Have a natural conversation about their business — products, customers, revenue, goals. Let them share at their own pace. Save details as they come up naturally.',
    enabled_tools: ['update_form_field', 'batch_update_fields', 'confirm_all_fields', 'navigate_to_screen', 'trigger_action'],
    allowed_navigation_targets: ['industry', 'equity'],
    custom_actions: [
      { action_id: 'submit_questionnaire', label: 'Save Answers', description: 'Submit questionnaire and proceed to equity' },
      { action_id: 'go_back', label: 'Go Back', description: 'Go back to the previous screen' },
    ],
  }),
  equity: makeConfig({
    screen_key: 'equity',
    enabled: true,
    system_prompt_override: 'The user is on the Equity Partnership screen. If they have questions about equity partnership, explain it simply. Let them decide at their own pace.',
    enabled_tools: ['update_form_field', 'navigate_to_screen', 'trigger_action'],
    allowed_navigation_targets: ['questionnaire', 'review'],
    custom_actions: [
      { action_id: 'submit_equity', label: 'Save Equity', description: 'Submit equity preference and proceed to review' },
      { action_id: 'go_back', label: 'Go Back', description: 'Go back to the previous screen' },
    ],
  }),
  documents: makeConfig({
    screen_key: 'documents',
    enabled: true,
    system_prompt_override: 'You are on the Document Upload screen. Help the user upload required documents like Aadhaar, Udyam certificate, and CIBIL report.',
    enabled_tools: ['navigate_to_screen', 'trigger_action'],
    allowed_navigation_targets: ['dashboard', 'review'],
    custom_actions: [
      { action_id: 'upload_document', label: 'Upload Document', description: 'Open document upload dialog' },
    ],
  }),
  review: makeConfig({
    screen_key: 'review',
    enabled: true,
    system_prompt_override: 'You are on the Review & Submit screen. Help the user review all their information before final submission. They can go back and edit any section.',
    enabled_tools: ['navigate_to_screen', 'trigger_action'],
    allowed_navigation_targets: ['profile', 'industry', 'questionnaire', 'equity'],
    custom_actions: [
      { action_id: 'submit_review', label: 'Submit Application', description: 'Submit the complete application' },
      { action_id: 'go_back', label: 'Go Back', description: 'Go back to the previous screen' },
    ],
  }),

  // --- Post-onboarding screens ---
  admin: makeConfig({ screen_key: 'admin' }),
  success: makeConfig({ screen_key: 'success' }),
  dashboard: makeConfig({
    screen_key: 'dashboard',
    enabled: true,
    system_prompt_override: 'You are on the Dashboard. Help the user navigate to different sections: schedule meetings, upload documents, or view their profile.',
    enabled_tools: ['navigate_to_screen'],
    allowed_navigation_targets: ['schedule', 'documents', 'profile'],
  }),
  schedule: makeConfig({
    screen_key: 'schedule',
    enabled: true,
    system_prompt_override: 'You are on the Schedule Meeting screen. Help the user schedule a meeting with the Quiver team.',
    enabled_tools: ['update_form_field', 'batch_update_fields', 'navigate_to_screen'],
    allowed_navigation_targets: ['dashboard'],
  }),
  'video-meeting': makeConfig({ screen_key: 'video-meeting' }),
  'voice-onboarding': makeConfig({ screen_key: 'voice-onboarding' }),
};
