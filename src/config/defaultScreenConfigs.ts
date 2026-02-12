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
    system_prompt_override: 'The user is considering joining Quiver. Share your excitement about the partnership — explain simply that Quiver becomes their business sathi (partner). Answer their questions honestly and warmly. If they are ready, help them accept and move forward.',
    enabled_tools: ['navigate_to_screen', 'trigger_action'],
    allowed_navigation_targets: ['profile', 'voice-onboarding'],
    custom_actions: [
      { action_id: 'accept_consent', label: 'Accept Consent', description: 'Accept the consent terms and proceed to profile' },
    ],
  }),
  profile: makeConfig({
    screen_key: 'profile',
    enabled: true,
    system_prompt_override: 'Get to know the user naturally — their name, where they are from, a bit about themselves. Do not interrogate. Let it flow like a first meeting with a new friend. When you have learned most details (or user says done), summarize everything warmly and ask for confirmation before moving on.',
    enabled_tools: ['update_form_field', 'batch_update_fields', 'summarize_and_confirm', 'navigate_to_screen', 'trigger_action'],
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
    system_prompt_override: 'Learn about the user\'s business with genuine curiosity — what do they do, how long have they been doing it, who helps them run it. When you have got the picture (or user says done), summarize and confirm before moving to the next section.',
    enabled_tools: ['update_form_field', 'batch_update_fields', 'summarize_and_confirm', 'navigate_to_screen', 'trigger_action'],
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
    system_prompt_override: 'This is the big conversation — their business story. Products, customers, money, dreams. Take it topic by topic naturally. When each area is covered, summarize what you have learned and confirm before moving to the next topic.',
    enabled_tools: ['update_form_field', 'batch_update_fields', 'summarize_and_confirm', 'navigate_to_screen', 'trigger_action'],
    allowed_navigation_targets: ['industry', 'equity'],
    custom_actions: [
      { action_id: 'submit_questionnaire', label: 'Save Answers', description: 'Submit questionnaire and proceed to equity' },
      { action_id: 'go_back', label: 'Go Back', description: 'Go back to the previous screen' },
    ],
  }),
  equity: makeConfig({
    screen_key: 'equity',
    enabled: true,
    system_prompt_override: 'Explain the partnership simply — "Quiver aapka sathi ban-ta hai" (Quiver becomes your partner). Answer their concerns honestly. When they are ready, confirm their preference.',
    enabled_tools: ['update_form_field', 'summarize_and_confirm', 'navigate_to_screen', 'trigger_action'],
    allowed_navigation_targets: ['questionnaire', 'review'],
    custom_actions: [
      { action_id: 'submit_equity', label: 'Save Equity', description: 'Submit equity preference and proceed to review' },
      { action_id: 'go_back', label: 'Go Back', description: 'Go back to the previous screen' },
    ],
  }),
  documents: makeConfig({
    screen_key: 'documents',
    enabled: true,
    system_prompt_override: 'Help the user upload their documents — Aadhaar, Udyam certificate, CIBIL report. Keep it light and supportive. If they are confused about a document, explain simply what it is and why it is needed.',
    enabled_tools: ['navigate_to_screen', 'trigger_action'],
    allowed_navigation_targets: ['dashboard', 'review'],
    custom_actions: [
      { action_id: 'upload_document', label: 'Upload Document', description: 'Open document upload dialog' },
    ],
  }),
  review: makeConfig({
    screen_key: 'review',
    enabled: true,
    system_prompt_override: 'Read back their complete application warmly. Help them feel confident about what they have shared. If anything needs changing, offer to navigate back to that section.',
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
    system_prompt_override: 'The user is on their dashboard. Help them navigate — schedule meetings, upload documents, or check their profile. Keep it light and helpful.',
    enabled_tools: ['navigate_to_screen'],
    allowed_navigation_targets: ['schedule', 'documents', 'profile'],
  }),
  schedule: makeConfig({
    screen_key: 'schedule',
    enabled: true,
    system_prompt_override: 'Help the user schedule a meeting with the Quiver team. Be friendly and help them pick a time that works.',
    enabled_tools: ['update_form_field', 'batch_update_fields', 'navigate_to_screen'],
    allowed_navigation_targets: ['dashboard'],
  }),
  'video-meeting': makeConfig({ screen_key: 'video-meeting' }),
  'voice-onboarding': makeConfig({ screen_key: 'voice-onboarding' }),
};
