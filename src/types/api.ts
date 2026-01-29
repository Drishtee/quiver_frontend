// ============================================
// QUIVER API Types
// Complete TypeScript definitions for backend API
// ============================================

// ============================================
// COMMON TYPES
// ============================================

export type MeetingType = 'one_on_one' | 'group';
export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type FieldStatus = 'suggested' | 'confirmed';
export type FieldSource = 'voice' | 'ui' | 'text' | 'document';
export type OnboardingStatus = 'in_progress' | 'submitted' | 'locked';
export type ReminderType = '24h' | '1h' | '15m';
export type ReminderStatus = 'pending' | 'sent' | 'failed';
export type ParticipantResponseStatus = 'pending' | 'accepted' | 'declined';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

export interface ErrorResponse {
  error: string;
  message: string;
  details?: string;
  debug?: string;
}

// ============================================
// AUTHENTICATION
// ============================================

export interface SendOTPRequest {
  phone: string; // 10-digit phone number
}

export interface SendOTPResponse {
  success: true;
}

export interface VerifyOTPRequest {
  phone: string; // 10-digit phone number
  otp: string; // 6-digit OTP
}

export interface VerifyOTPResponse {
  success: true;
  access: string; // JWT access token
  refresh: string; // JWT refresh token
  tenant_id: string; // UUID
  user_id: number;
  is_new_user: boolean; // true if user was just created (first-time login)
  onboarding_completed: boolean; // true if user has completed onboarding
  has_in_progress_onboarding: boolean; // true if user has incomplete onboarding session
}

export interface DebugOTP {
  phone: string;
  otp: string;
  is_used: boolean;
  created_at: string; // ISO datetime
  expires_at: string; // ISO datetime
  expired: boolean;
}

export interface DebugOTPsResponse {
  otps: DebugOTP[];
}

// ============================================
// ONBOARDING
// ============================================

export interface QuestionOption {
  key: string;
  question_text: string;
  field_type: 'text' | 'email' | 'number' | 'date' | 'select' | 'multiselect' | 'textarea';
  options: string[]; // For select/multiselect types
  required: boolean;
}

export interface QuestionnaireSection {
  name: string;
  questions: QuestionOption[];
}

export interface QuestionnaireResponse {
  sections: QuestionnaireSection[];
}

export interface StartOnboardingRequest {
  // Empty object
}

export interface StartOnboardingResponse {
  session_id: string; // UUID
  status: OnboardingStatus;
  message: string;
}

export interface UpdateFieldRequest {
  session_id: string; // UUID
  key: string;
  value: string | number | boolean | string[];
  source: FieldSource;
}

export interface UpdateFieldResponse {
  success: true;
  key: string;
  status: FieldStatus;
}

export interface BulkUpdateField {
  key: string;
  value: string | number | boolean | string[];
  source: FieldSource;
}

export interface BulkUpdateFieldsRequest {
  session_id: string; // UUID
  fields: BulkUpdateField[];
}

export interface BulkUpdateFieldsResponse {
  success: true;
  updated_fields: Array<{
    key: string;
    status: FieldStatus;
  }>;
}

export interface OnboardingFieldData {
  value: string | number | boolean | string[];
  status: FieldStatus;
  source: FieldSource;
}

export interface OnboardingSessionResponse {
  session_id: string; // UUID
  status: OnboardingStatus;
  current_step: number;
  fields: {
    [key: string]: OnboardingFieldData;
  };
}

export interface QuestionWithProgress extends QuestionOption {
  current_value?: string | number | boolean | string[];
  current_status?: FieldStatus;
  current_source?: FieldSource;
}

export interface SectionWithProgress {
  name: string;
  questions: QuestionWithProgress[];
}

export interface QuestionnaireWithProgressResponse {
  questionnaire: {
    sections: SectionWithProgress[];
  };
  session_id: string; // UUID
  session_status: OnboardingStatus;
}

export interface SubmitOnboardingRequest {
  session_id: string; // UUID
}

export interface SubmitOnboardingResponse {
  success: true;
}

// ============================================
// MEETINGS
// ============================================

export interface MeetingRecurrence {
  frequency: RecurrenceFrequency;
  interval: number; // Repeat every N days/weeks/months
  end_date?: string; // ISO date (YYYY-MM-DD)
  occurrence_count?: number;
  days_of_week?: string; // Comma-separated: "0,1,2,3,4" (Mon=0, Sun=6)
  day_of_month?: number; // 1-31
}

export interface CreateMeetingRequest {
  title: string;
  description?: string;
  meeting_type: MeetingType;
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
  timezone: string; // IANA timezone (e.g., "Asia/Kolkata")
  participant_phone_numbers?: string[]; // 10-digit phone numbers
  recurrence?: MeetingRecurrence;
}

export interface CreateMeetingResponse {
  meeting_id: string; // UUID
  title: string;
  meeting_type: MeetingType;
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
  timezone: string;
  status: MeetingStatus;
  is_recurring: boolean;
  created_at: string; // ISO datetime
  google_meet_room?: {
    meet_link: string;
    calendar_link: string | null;
    status: string;
    recording_enabled: boolean;
  } | null;
}

export interface ListMeetingsParams {
  status?: MeetingStatus;
  start_date?: string; // ISO date (YYYY-MM-DD)
  end_date?: string; // ISO date (YYYY-MM-DD)
  meeting_type?: MeetingType;
}

export interface MeetingListItem {
  meeting_id: string; // UUID
  title: string;
  meeting_type: MeetingType;
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
  status: MeetingStatus;
  participant_count: number;
  is_recurring: boolean;
}

export interface ListMeetingsResponse {
  meetings: MeetingListItem[];
  total: number;
}

export interface MeetingOrganizer {
  user_id: number;
  phone: string;
}

export interface MeetingParticipant {
  user_id: number;
  phone: string;
  response_status: ParticipantResponseStatus;
  enable_whatsapp_reminders: boolean;
}

export interface TwilioRoom {
  room_id: string; // UUID
  room_sid: string; // Twilio room SID
  status: 'created' | 'in_progress' | 'completed';
}

// Google Meet room interface (NEW)
export interface GoogleMeet {
  room_id: string; // UUID
  meet_link: string; // Direct Google Meet URL
  calendar_link: string | null; // Google Calendar event link
  status: 'created' | 'active' | 'ended' | 'error';
  recording_enabled: boolean;
  recording_url: string | null; // Link to recording
  transcript_url: string | null; // Link to transcript
}

export interface MeetingReminder {
  reminder_type: ReminderType;
  scheduled_for: string; // ISO datetime
  status: ReminderStatus;
}

export interface MeetingDetailsResponse {
  meeting_id: string; // UUID
  title: string;
  description?: string;
  meeting_type: MeetingType;
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
  timezone: string;
  status: MeetingStatus;
  organizer: MeetingOrganizer;
  participants: MeetingParticipant[];
  twilio_room?: TwilioRoom; // Legacy - for backward compatibility
  google_meet?: GoogleMeet; // NEW - Google Meet integration
  reminders: MeetingReminder[];
}

export interface CancelMeetingRequest {
  cancel_all_future?: boolean;
}

export interface CancelMeetingResponse {
  success: true;
  message: string;
}

export interface AddParticipantsRequest {
  phone_numbers: string[]; // 10-digit phone numbers
}

export interface AddParticipantsResponse {
  success: true;
  added_participants: string[];
}

export interface GenerateVideoTokenRequest {
  // Empty object
}

export interface GenerateVideoTokenResponse {
  token: string; // Twilio JWT token
  room_name: string;
  identity: string; // Format: "user-{user_id}"
  expires_at: string; // ISO datetime
}

export interface ReminderDetails {
  reminder_type: ReminderType;
  participant: {
    user_id: number;
    phone: string;
  };
  scheduled_for: string; // ISO datetime
  status: ReminderStatus;
  sent_at: string | null; // ISO datetime
  whatsapp_status: string | null;
}

export interface GetRemindersResponse {
  reminders: ReminderDetails[];
}

// Google Meet link response (NEW)
export interface MeetLinkResponse {
  meet_link: string; // Direct Google Meet URL
  calendar_link: string | null; // Google Calendar event link
  recording_enabled: boolean;
  status: 'created' | 'active' | 'ended' | 'error';
}

// ============================================
// WEBHOOKS (For reference, not used in frontend)
// ============================================

export interface WhatsAppWebhookVerification {
  'hub.mode': string;
  'hub.verify_token': string;
  'hub.challenge': string;
}

export interface TwilioWebhookEvent {
  RoomSid: string;
  StatusCallbackEvent: 'room-created' | 'room-ended' | 'participant-connected' | 'participant-disconnected';
}

// ============================================
// USER & TENANT (From context)
// ============================================

export interface User {
  id: string;
  phone: string;
  fullName?: string;
  email?: string;
  tenantId: string;
  tenantName?: string;
}
