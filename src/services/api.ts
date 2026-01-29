// ============================================
// QUIVER API Service
// Complete implementation of backend API endpoints
// ============================================

import type {
  // Auth
  SendOTPRequest,
  SendOTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  DebugOTPsResponse,
  // Onboarding
  QuestionnaireResponse,
  StartOnboardingRequest,
  StartOnboardingResponse,
  UpdateFieldRequest,
  UpdateFieldResponse,
  BulkUpdateFieldsRequest,
  BulkUpdateFieldsResponse,
  OnboardingSessionResponse,
  QuestionnaireWithProgressResponse,
  SubmitOnboardingRequest,
  SubmitOnboardingResponse,
  // Meetings
  CreateMeetingRequest,
  CreateMeetingResponse,
  ListMeetingsParams,
  ListMeetingsResponse,
  MeetingDetailsResponse,
  CancelMeetingRequest,
  CancelMeetingResponse,
  AddParticipantsRequest,
  AddParticipantsResponse,
  GenerateVideoTokenRequest,
  GenerateVideoTokenResponse,
  GetRemindersResponse,
  MeetLinkResponse,
  ErrorResponse,
} from '../types/api';

// ============================================
// CONFIGURATION
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Make an authenticated request with JWT Bearer token
 */
export const makeAuthenticatedRequest = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = localStorage.getItem('access_token');

  console.log('=== Making authenticated request ===');
  console.log('URL:', url);
  console.log('Token present:', token ? 'YES' : 'NO');

  if (!token) {
    console.error('❌ No access token found in localStorage');
    throw new Error('No access token found. Please login again.');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  console.log('Response status:', response.status);

  if (!response.ok) {
    const error: ErrorResponse = await response.json().catch(() => ({
      error: 'unknown_error',
      message: `Request failed with status ${response.status}`,
    }));
    console.error('❌ Request failed:', error);
    throw new Error(error.message || error.error || 'Request failed');
  }

  const data = await response.json();
  console.log('✓ Request successful');
  return data;
};

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

/**
 * POST /auth/send-otp/
 * Send OTP to phone number for authentication
 * Rate limit: Max 3 OTPs per phone in 10 minutes
 * OTP expires in 5 minutes
 */
export const sendOTP = async (phone: string): Promise<SendOTPResponse> => {
  console.log('Sending OTP to:', phone);

  const request: SendOTPRequest = {
    phone: phone, // Backend handles normalization
  };

  const response = await fetch(`${API_BASE_URL}/auth/send-otp/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  console.log('Response status:', response.status);

  if (!response.ok) {
    const error: ErrorResponse = await response.json().catch(() => ({
      error: 'unknown_error',
      message: `Failed to send OTP: ${response.status}`,
    }));
    console.log('Error data:', error);
    throw new Error(error.message || error.error || `Failed to send OTP: ${response.status}`);
  }

  return response.json();
};

/**
 * POST /auth/verify-otp/
 * Verify OTP and receive JWT tokens
 * Auto-creates user and tenant on first verification
 */
export const verifyOTP = async (phone: string, otp: string): Promise<VerifyOTPResponse> => {
  console.log('Verifying OTP for:', phone);

  const request: VerifyOTPRequest = {
    phone: phone, // Backend handles normalization
    otp: otp,
  };

  const response = await fetch(`${API_BASE_URL}/auth/verify-otp/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json().catch(() => ({
      error: 'unknown_error',
      message: `Failed to verify OTP: ${response.status}`,
    }));
    console.error('OTP verification failed:', error);
    throw new Error(error.message || error.error || `Failed to verify OTP: ${response.status}`);
  }

  const data: VerifyOTPResponse = await response.json();
  console.log('OTP verification successful');

  // Validate token data
  if (!data.access) {
    console.error('No access token in response!');
    throw new Error('No access token received from server');
  }

  console.log('Storing tokens...');
  // Store tokens and user data
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);
  localStorage.setItem('tenant_id', data.tenant_id);
  localStorage.setItem('user_id', data.user_id.toString());

  console.log('✓ Tokens stored successfully');

  return data;
};

/**
 * GET /auth/debug-otps/
 * View recent OTPs (DEVELOPMENT ONLY - REMOVE IN PRODUCTION)
 */
export const getDebugOTPs = async (): Promise<DebugOTPsResponse> => {
  console.log('Fetching debug OTPs...');

  const response = await fetch(`${API_BASE_URL}/auth/debug-otps/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch debug OTPs');
  }

  return response.json();
};

// ============================================
// ONBOARDING ENDPOINTS
// ============================================

/**
 * GET /onboarding/questionnaire/
 * Get the onboarding questionnaire structure
 */
export const getQuestionnaire = async (): Promise<QuestionnaireResponse> => {
  console.log('Fetching onboarding questionnaire...');

  const response = await fetch(`${API_BASE_URL}/onboarding/questionnaire/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch questionnaire');
  }

  return response.json();
};

/**
 * POST /onboarding/start/
 * Create or resume an onboarding session
 * Only one in-progress session per user
 */
export const startOnboarding = async (): Promise<StartOnboardingResponse> => {
  const request: StartOnboardingRequest = {};

  return makeAuthenticatedRequest('/onboarding/start/', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

/**
 * POST /onboarding/update-field/
 * Update a single field in onboarding session
 * - voice source → status: "suggested"
 * - ui/text/document source → status: "confirmed"
 */
export const updateField = async (
  sessionId: string,
  key: string,
  value: string | number | boolean | string[],
  source: 'voice' | 'ui' | 'text' | 'document' = 'ui'
): Promise<UpdateFieldResponse> => {
  const request: UpdateFieldRequest = {
    session_id: sessionId,
    key,
    value,
    source,
  };

  return makeAuthenticatedRequest('/onboarding/update-field/', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

/**
 * POST /onboarding/bulk-update-fields/
 * Update multiple fields at once
 */
export const bulkUpdateFields = async (
  sessionId: string,
  fields: Array<{ key: string; value: string | number | boolean | string[]; source: 'voice' | 'ui' | 'text' | 'document' }>
): Promise<BulkUpdateFieldsResponse> => {
  const request: BulkUpdateFieldsRequest = {
    session_id: sessionId,
    fields,
  };

  return makeAuthenticatedRequest('/onboarding/bulk-update-fields/', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

/**
 * GET /onboarding/{session_id}/
 * Get current onboarding session data
 */
export const getOnboardingSession = async (sessionId: string): Promise<OnboardingSessionResponse> => {
  return makeAuthenticatedRequest(`/onboarding/${sessionId}/`);
};

/**
 * GET /onboarding/{session_id}/questionnaire/
 * Get questionnaire with current session progress
 */
export const getQuestionnaireWithProgress = async (
  sessionId: string
): Promise<QuestionnaireWithProgressResponse> => {
  return makeAuthenticatedRequest(`/onboarding/${sessionId}/questionnaire/`);
};

/**
 * POST /onboarding/submit/
 * Complete onboarding session
 */
export const submitOnboarding = async (sessionId: string): Promise<SubmitOnboardingResponse> => {
  const request: SubmitOnboardingRequest = {
    session_id: sessionId,
  };

  return makeAuthenticatedRequest('/onboarding/submit/', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

// ============================================
// MEETINGS ENDPOINTS
// ============================================

/**
 * POST /meetings/create/
 * Create a new meeting (scheduled or recurring)
 * Features:
 * - Auto-creates Google Meet room for video conferencing
 * - Schedules reminders (24h and 1h before)
 * - Automatically adds participants
 */
export const createMeeting = async (meetingData: CreateMeetingRequest): Promise<CreateMeetingResponse> => {
  return makeAuthenticatedRequest('/meetings/create/', {
    method: 'POST',
    body: JSON.stringify(meetingData),
  });
};

/**
 * GET /meetings/list/
 * List all meetings for authenticated user
 * Returns meetings where user is organizer OR participant
 * Maximum 100 results
 */
export const listMeetings = async (params?: ListMeetingsParams): Promise<ListMeetingsResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.status) queryParams.append('status', params.status);
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);
  if (params?.meeting_type) queryParams.append('meeting_type', params.meeting_type);

  const queryString = queryParams.toString();
  const url = queryString ? `/meetings/list/?${queryString}` : '/meetings/list/';

  return makeAuthenticatedRequest(url);
};

/**
 * GET /meetings/{meeting_id}/
 * Get full meeting details with participants and reminders
 */
export const getMeetingDetails = async (meetingId: string): Promise<MeetingDetailsResponse> => {
  return makeAuthenticatedRequest(`/meetings/${meetingId}/`);
};

/**
 * POST /meetings/{meeting_id}/cancel/
 * Cancel a meeting (organizer only)
 * - cancel_all_future: true cancels all future occurrences of recurring meetings
 */
export const cancelMeeting = async (
  meetingId: string,
  cancelAllFuture: boolean = false
): Promise<CancelMeetingResponse> => {
  const request: CancelMeetingRequest = {
    cancel_all_future: cancelAllFuture,
  };

  return makeAuthenticatedRequest(`/meetings/${meetingId}/cancel/`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

/**
 * POST /meetings/{meeting_id}/participants/add/
 * Add participants to a meeting (organizer only)
 * - Only adds users in same tenant
 * - Creates reminders for new participants
 * - Ignores users already in meeting
 */
export const addParticipants = async (
  meetingId: string,
  phoneNumbers: string[]
): Promise<AddParticipantsResponse> => {
  const request: AddParticipantsRequest = {
    phone_numbers: phoneNumbers,
  };

  return makeAuthenticatedRequest(`/meetings/${meetingId}/participants/add/`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

/**
 * POST /meetings/{meeting_id}/video/token/
 * Generate Twilio access token for video room
 * - Token valid for 4 hours
 * - Identity format: user-{user_id}
 * - Token automatically stored in database
 */
export const generateVideoToken = async (meetingId: string): Promise<GenerateVideoTokenResponse> => {
  const request: GenerateVideoTokenRequest = {};

  return makeAuthenticatedRequest(`/meetings/${meetingId}/video/token/`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

/**
 * GET /meetings/{meeting_id}/reminders/
 * Get all reminders for a meeting
 */
export const getMeetingReminders = async (meetingId: string): Promise<GetRemindersResponse> => {
  return makeAuthenticatedRequest(`/meetings/${meetingId}/reminders/`);
};

/**
 * GET /meetings/{meeting_id}/meet-link/
 * Get Google Meet link for a meeting
 * - Returns direct link to Google Meet
 * - Includes calendar link if available
 * - Shows recording status
 */
export const getMeetLink = async (meetingId: string): Promise<MeetLinkResponse> => {
  return makeAuthenticatedRequest(`/meetings/${meetingId}/meet-link/`);
};

// ============================================
// LEGACY/CUSTOM ENDPOINTS (Keep for backward compatibility)
// ============================================

/**
 * Legacy: Use getOnboardingSession instead
 * @deprecated
 */
export const getOnboardingData = async (sessionId: string): Promise<OnboardingSessionResponse> => {
  console.warn('getOnboardingData is deprecated. Use getOnboardingSession instead.');
  return getOnboardingSession(sessionId);
};

/**
 * Legacy: Use createMeeting instead
 * @deprecated
 */
export const scheduleMeeting = async (meetingData: any): Promise<any> => {
  console.warn('scheduleMeeting is deprecated. Use createMeeting instead.');
  // Try to call legacy endpoint if it exists, otherwise fall back to createMeeting
  try {
    return await makeAuthenticatedRequest('/meetings/schedule/', {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
  } catch (error) {
    console.error('Legacy scheduleMeeting endpoint not available:', error);
    throw error;
  }
};

/**
 * Legacy: Use listMeetings instead
 * @deprecated
 */
export const getMeetings = async (): Promise<any> => {
  console.warn('getMeetings is deprecated. Use listMeetings instead.');
  try {
    return await makeAuthenticatedRequest('/meetings/');
  } catch (error) {
    // Fall back to new endpoint
    return listMeetings();
  }
};

/**
 * Legacy: Use generateVideoToken instead
 * @deprecated
 */
export const getTwilioToken = async (meetingId: string, identity: string): Promise<any> => {
  console.warn('getTwilioToken is deprecated. Use generateVideoToken instead.');
  try {
    return await makeAuthenticatedRequest('/meetings/twilio-token/', {
      method: 'POST',
      body: JSON.stringify({ meeting_id: meetingId, identity }),
    });
  } catch (error) {
    // Fall back to new endpoint
    return generateVideoToken(meetingId);
  }
};

/**
 * Reschedule meeting (if backend supports it)
 * Note: Not in official API docs, may need backend implementation
 */
export const rescheduleMeeting = async (
  meetingId: string,
  newStartTime: string,
  newEndTime: string
): Promise<any> => {
  return makeAuthenticatedRequest(`/meetings/${meetingId}/reschedule/`, {
    method: 'POST',
    body: JSON.stringify({ start_time: newStartTime, end_time: newEndTime }),
  });
};

/**
 * Start meeting recording (if backend supports it)
 * Note: Not in official API docs, may need backend implementation
 */
export const startMeetingRecording = async (meetingId: string): Promise<any> => {
  return makeAuthenticatedRequest(`/meetings/${meetingId}/start-recording/`, {
    method: 'POST',
  });
};

/**
 * Stop meeting recording (if backend supports it)
 * Note: Not in official API docs, may need backend implementation
 */
export const stopMeetingRecording = async (meetingId: string): Promise<any> => {
  return makeAuthenticatedRequest(`/meetings/${meetingId}/stop-recording/`, {
    method: 'POST',
  });
};

/**
 * Send WhatsApp reminder (if backend supports it)
 * Note: Not in official API docs, may need backend implementation
 */
export const sendWhatsAppReminder = async (meetingId: string): Promise<any> => {
  return makeAuthenticatedRequest(`/meetings/${meetingId}/send-reminder/`, {
    method: 'POST',
  });
};

/**
 * Test WhatsApp connection (if backend supports it)
 * Note: Not in official API docs, may need backend implementation
 */
export const testWhatsAppConnection = async (phoneNumber: string): Promise<any> => {
  return makeAuthenticatedRequest('/whatsapp/test/', {
    method: 'POST',
    body: JSON.stringify({ phone: phoneNumber }),
  });
};

// ============================================
// AUDIO UPLOAD ENDPOINTS
// ============================================

export interface AudioUploadMetadata {
  session_id: string;
  transcript?: string;
  duration_seconds?: number;
  screen?: string;
  field_key?: string;
  recorded_at?: string;
}

export interface AudioUploadResponse {
  success: boolean;
  audio_record_id: number;
  audio_url: string;
  blob_name: string;
}

export interface AudioRecord {
  id: number;
  audio_url: string;
  transcript?: string;
  duration_seconds?: number;
  file_size_bytes?: number;
  screen?: string;
  field_key?: string;
  recorded_at?: string;
  created_at: string;
}

export interface AudioRecordsResponse {
  session_id: string;
  audio_records: AudioRecord[];
}

/**
 * POST /onboarding/upload-audio/
 * Upload audio recording to Azure Blob Storage
 */
export const uploadAudio = async (
  sessionId: string,
  audioBlob: Blob,
  metadata: Omit<AudioUploadMetadata, 'session_id'>
): Promise<AudioUploadResponse> => {
  console.log('Uploading audio recording...');

  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.wav');
  formData.append('session_id', sessionId);

  if (metadata.transcript) formData.append('transcript', metadata.transcript);
  if (metadata.duration_seconds !== undefined) formData.append('duration_seconds', String(metadata.duration_seconds));
  if (metadata.screen) formData.append('screen', metadata.screen);
  if (metadata.field_key) formData.append('field_key', metadata.field_key);
  if (metadata.recorded_at) formData.append('recorded_at', metadata.recorded_at);

  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('No access token found. Please login again.');
  }

  const response = await fetch(`${API_BASE_URL}/onboarding/upload-audio/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'unknown_error',
      message: 'Failed to upload audio',
    }));
    throw new Error(error.message || error.error);
  }

  return response.json();
};

/**
 * GET /onboarding/{session_id}/audio-records/
 * Get all audio records for a session
 */
export const getAudioRecords = async (sessionId: string): Promise<AudioRecordsResponse> => {
  return makeAuthenticatedRequest(`/onboarding/${sessionId}/audio-records/`);
};

// ============================================
// USER PROFILE ENDPOINT
// ============================================

export interface MyProfileResponse {
  has_profile: boolean;
  session_id?: string;
  status?: string;
  current_step?: string;
  created_at?: string;
  submitted_at?: string;
  phone?: string;
  is_phone_verified?: boolean;
  date_joined?: string;
  profile?: Record<string, string>;
  audio_count?: number;
  message?: string;
}

/**
 * GET /onboarding/my-profile/
 * Get the authenticated user's own profile data
 */
export const getMyProfile = async (): Promise<MyProfileResponse> => {
  return makeAuthenticatedRequest('/onboarding/my-profile/');
};

// ============================================
// VOICE AGENT ENDPOINTS
// ============================================

export interface VoiceAgentTokenResponse {
  token: string;
  expires_at: number;
  model: string;
  websocket_url: string;
  client_secret?: {
    value: string;
    expires_at: number;
  };
}

export interface VoiceAgentConfigResponse {
  model: string;
  instructions: string;
  voice: string;
  input_audio_format: string;
  output_audio_format: string;
  input_audio_transcription: {
    model: string;
  };
  turn_detection: {
    type: string;
    threshold: number;
    prefix_padding_ms: number;
    silence_duration_ms: number;
  };
  tools: Array<{
    type: string;
    name: string;
    description: string;
    parameters: any;
  }>;
}

export interface VoiceAgentSubmitRequest {
  phone: string;
  voice_data: Record<string, any>;
  session_id?: string;
}

export interface VoiceAgentSubmitResponse {
  success: boolean;
  session_id: string;
  fields_saved: string[];
}

/**
 * GET /auth/voice-agent/token/
 * Get ephemeral token for OpenAI Realtime API WebSocket connection
 */
export const getVoiceAgentToken = async (): Promise<VoiceAgentTokenResponse> => {
  console.log('Fetching voice agent token from:', `${API_BASE_URL}/auth/voice-agent/token/`);

  const response = await fetch(`${API_BASE_URL}/auth/voice-agent/token/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  console.log('Voice token response status:', response.status);

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'unknown_error',
      message: 'Failed to get voice agent token',
    }));
    console.error('Voice token error:', error);
    throw new Error(error.message || error.error);
  }

  const data = await response.json();
  console.log('Voice token data:', JSON.stringify(data, null, 2));
  return data;
};

/**
 * GET /auth/voice-agent/config/
 * Get session configuration for the voice agent
 */
export const getVoiceAgentConfig = async (): Promise<VoiceAgentConfigResponse> => {
  console.log('Fetching voice agent config...');

  const response = await fetch(`${API_BASE_URL}/auth/voice-agent/config/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to get voice agent config');
  }

  return response.json();
};

/**
 * POST /auth/voice-agent/submit/
 * Submit voice-collected data to onboarding
 */
export const submitVoiceAgentData = async (
  phone: string,
  voiceData: Record<string, any>,
  sessionId?: string
): Promise<VoiceAgentSubmitResponse> => {
  console.log('Submitting voice agent data...');

  const request: VoiceAgentSubmitRequest = {
    phone,
    voice_data: voiceData,
    session_id: sessionId,
  };

  const response = await fetch(`${API_BASE_URL}/auth/voice-agent/submit/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'unknown_error',
      message: 'Failed to submit voice data',
    }));
    throw new Error(error.message || error.error);
  }

  return response.json();
};

// ============================================
// LOGOUT (Custom - not in API docs but useful)
// ============================================

/**
 * Logout user and clear all auth data
 * Note: This is a client-side only logout
 * Backend doesn't have a logout endpoint in the docs
 */
export const logout = async (): Promise<void> => {
  console.log('Logging out user...');

  // Clear all auth data from localStorage
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('tenant_id');
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_phone');
  localStorage.removeItem('user_name');
  localStorage.removeItem('user_email');
  localStorage.removeItem('tenant_name');

  console.log('✓ User logged out successfully');
};
