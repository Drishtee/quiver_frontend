# QUIVER Frontend API Integration Guide

Complete guide for using the API service in the QUIVER frontend application.

## Table of Contents
- [Setup](#setup)
- [Authentication Flow](#authentication-flow)
- [Onboarding Flow](#onboarding-flow)
- [Meetings Management](#meetings-management)
- [Error Handling](#error-handling)
- [TypeScript Types](#typescript-types)
- [Migration Guide](#migration-guide)

---

## Setup

### Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the API base URL in `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

3. For production, set the production API URL:
   ```env
   VITE_API_BASE_URL=https://api.quiver.com
   VITE_APP_ENV=production
   VITE_DEBUG_MODE=false
   ```

### Import API Functions

```typescript
import {
  sendOTP,
  verifyOTP,
  createMeeting,
  listMeetings,
  // ... other functions
} from '@/services/api';
```

### Import Types

```typescript
import type {
  CreateMeetingRequest,
  MeetingDetailsResponse,
  // ... other types
} from '@/types/api';
```

---

## Authentication Flow

### 1. Send OTP

```typescript
import { sendOTP } from '@/services/api';

const handleSendOTP = async (phoneNumber: string) => {
  try {
    // Phone number should be 10 digits (backend handles normalization)
    const response = await sendOTP(phoneNumber);
    console.log('OTP sent successfully:', response);

    // Show success message to user
    alert('OTP sent to your phone number');
  } catch (error) {
    console.error('Failed to send OTP:', error);
    alert(error.message);
  }
};

// Usage
handleSendOTP('9876543210');
```

**Important Notes:**
- Rate limit: Max 3 OTPs per phone in 10 minutes
- OTP expires in 5 minutes
- Backend handles phone number normalization (removes +91 prefix)
- Don't add country code prefix

### 2. Verify OTP

```typescript
import { verifyOTP } from '@/services/api';

const handleVerifyOTP = async (phoneNumber: string, otp: string) => {
  try {
    const response = await verifyOTP(phoneNumber, otp);

    // Tokens are automatically stored in localStorage:
    // - access_token
    // - refresh_token
    // - tenant_id
    // - user_id

    console.log('Login successful:', response);

    // Update auth context or redirect to dashboard
    // response contains: access, refresh, tenant_id, user_id
  } catch (error) {
    console.error('OTP verification failed:', error);
    alert('Invalid OTP. Please try again.');
  }
};

// Usage
handleVerifyOTP('9876543210', '123456');
```

### 3. Debug OTPs (Development Only)

```typescript
import { getDebugOTPs } from '@/services/api';

const viewDebugOTPs = async () => {
  try {
    const response = await getDebugOTPs();
    console.log('Recent OTPs:', response.otps);

    // Display in dev panel
    response.otps.forEach(otp => {
      console.log(`Phone: ${otp.phone}, OTP: ${otp.otp}, Expired: ${otp.expired}`);
    });
  } catch (error) {
    console.error('Failed to fetch debug OTPs:', error);
  }
};
```

**Important:** Remove this endpoint in production builds!

### 4. Logout

```typescript
import { logout } from '@/services/api';

const handleLogout = async () => {
  await logout();

  // All tokens are cleared from localStorage
  // Redirect to login page
  window.location.href = '/login';
};
```

---

## Onboarding Flow

### 1. Get Questionnaire Structure

```typescript
import { getQuestionnaire } from '@/services/api';

const loadQuestionnaire = async () => {
  try {
    const response = await getQuestionnaire();

    response.sections.forEach(section => {
      console.log(`Section: ${section.name}`);
      section.questions.forEach(q => {
        console.log(`  - ${q.question_text} (${q.field_type})`);
      });
    });

    return response;
  } catch (error) {
    console.error('Failed to load questionnaire:', error);
  }
};
```

### 2. Start Onboarding Session

```typescript
import { startOnboarding } from '@/services/api';

const beginOnboarding = async () => {
  try {
    const response = await startOnboarding();

    console.log('Session ID:', response.session_id);
    console.log('Status:', response.status); // "in_progress"

    // Store session_id for subsequent updates
    return response.session_id;
  } catch (error) {
    console.error('Failed to start onboarding:', error);
  }
};
```

### 3. Update Single Field

```typescript
import { updateField } from '@/services/api';

const updateOnboardingField = async (
  sessionId: string,
  fieldKey: string,
  value: string
) => {
  try {
    const response = await updateField(sessionId, fieldKey, value, 'ui');

    console.log(`Updated ${response.key}:`, response.status); // "confirmed"
  } catch (error) {
    console.error('Failed to update field:', error);
  }
};

// Usage
updateOnboardingField(sessionId, 'full_name', 'John Doe');
updateOnboardingField(sessionId, 'email', 'john@example.com');
```

### 4. Bulk Update Fields

```typescript
import { bulkUpdateFields } from '@/services/api';

const saveAllFields = async (sessionId: string, formData: any) => {
  try {
    const fields = [
      { key: 'full_name', value: formData.fullName, source: 'ui' as const },
      { key: 'email', value: formData.email, source: 'ui' as const },
      { key: 'date_of_birth', value: formData.dob, source: 'ui' as const },
      { key: 'organization_name', value: formData.org, source: 'ui' as const },
    ];

    const response = await bulkUpdateFields(sessionId, fields);

    console.log('Updated fields:', response.updated_fields);
  } catch (error) {
    console.error('Failed to bulk update:', error);
  }
};
```

### 5. Get Session Progress

```typescript
import { getOnboardingSession } from '@/services/api';

const loadProgress = async (sessionId: string) => {
  try {
    const response = await getOnboardingSession(sessionId);

    console.log('Current step:', response.current_step);
    console.log('Status:', response.status);

    // Access field values
    Object.entries(response.fields).forEach(([key, data]) => {
      console.log(`${key}: ${data.value} (${data.status})`);
    });

    return response;
  } catch (error) {
    console.error('Failed to load session:', error);
  }
};
```

### 6. Submit Onboarding

```typescript
import { submitOnboarding } from '@/services/api';

const completeOnboarding = async (sessionId: string) => {
  try {
    const response = await submitOnboarding(sessionId);

    if (response.success) {
      console.log('Onboarding completed!');
      // Redirect to dashboard
    }
  } catch (error) {
    console.error('Failed to submit onboarding:', error);
  }
};
```

---

## Meetings Management

### 1. Create Meeting

```typescript
import { createMeeting } from '@/services/api';
import type { CreateMeetingRequest } from '@/types/api';

const scheduleMeeting = async () => {
  try {
    const meetingData: CreateMeetingRequest = {
      title: 'Team Standup',
      description: 'Daily standup meeting',
      meeting_type: 'group',
      start_time: '2026-01-03T10:00:00Z', // ISO datetime
      end_time: '2026-01-03T10:30:00Z',
      timezone: 'Asia/Kolkata', // IANA timezone
      participant_phone_numbers: ['9876543210', '9123456789'],
    };

    const response = await createMeeting(meetingData);

    console.log('Meeting created:', response.meeting_id);
    console.log('Status:', response.status); // "scheduled"

    return response;
  } catch (error) {
    console.error('Failed to create meeting:', error);
  }
};
```

### 2. Create Recurring Meeting

```typescript
import { createMeeting } from '@/services/api';

const createRecurringMeeting = async () => {
  try {
    const response = await createMeeting({
      title: 'Weekly Team Sync',
      meeting_type: 'group',
      start_time: '2026-01-06T15:00:00Z',
      end_time: '2026-01-06T16:00:00Z',
      timezone: 'Asia/Kolkata',
      participant_phone_numbers: ['9876543210'],
      recurrence: {
        frequency: 'weekly',
        interval: 1, // Every week
        days_of_week: '0,1,2,3,4', // Monday to Friday (Mon=0, Sun=6)
        occurrence_count: 12, // 12 occurrences
      },
    });

    console.log('Recurring meeting created:', response);
  } catch (error) {
    console.error('Failed to create recurring meeting:', error);
  }
};
```

### 3. List Meetings

```typescript
import { listMeetings } from '@/services/api';

const loadMeetings = async () => {
  try {
    // List all meetings
    const allMeetings = await listMeetings();

    // Filter by status
    const scheduledMeetings = await listMeetings({
      status: 'scheduled',
    });

    // Filter by date range
    const upcomingMeetings = await listMeetings({
      start_date: '2026-01-01',
      end_date: '2026-01-31',
      meeting_type: 'group',
    });

    console.log('Total meetings:', upcomingMeetings.total);
    upcomingMeetings.meetings.forEach(meeting => {
      console.log(`${meeting.title} - ${meeting.start_time}`);
    });

    return upcomingMeetings;
  } catch (error) {
    console.error('Failed to load meetings:', error);
  }
};
```

### 4. Get Meeting Details

```typescript
import { getMeetingDetails } from '@/services/api';

const loadMeetingDetails = async (meetingId: string) => {
  try {
    const meeting = await getMeetingDetails(meetingId);

    console.log('Meeting:', meeting.title);
    console.log('Organizer:', meeting.organizer.phone);
    console.log('Participants:', meeting.participants.length);
    console.log('Twilio Room:', meeting.twilio_room?.room_sid);
    console.log('Reminders:', meeting.reminders.length);

    // Access participant details
    meeting.participants.forEach(p => {
      console.log(`${p.phone}: ${p.response_status}`);
    });

    return meeting;
  } catch (error) {
    console.error('Failed to load meeting details:', error);
  }
};
```

### 5. Cancel Meeting

```typescript
import { cancelMeeting } from '@/services/api';

const handleCancelMeeting = async (meetingId: string, cancelAll: boolean = false) => {
  try {
    const response = await cancelMeeting(meetingId, cancelAll);

    if (response.success) {
      console.log('Meeting cancelled:', response.message);
    }
  } catch (error) {
    console.error('Failed to cancel meeting:', error);
    alert('Only the organizer can cancel meetings');
  }
};
```

### 6. Add Participants

```typescript
import { addParticipants } from '@/services/api';

const inviteParticipants = async (meetingId: string) => {
  try {
    const phoneNumbers = ['9111111111', '9222222222'];
    const response = await addParticipants(meetingId, phoneNumbers);

    console.log('Added participants:', response.added_participants);
  } catch (error) {
    console.error('Failed to add participants:', error);
  }
};
```

### 7. Join Video Meeting

```typescript
import { generateVideoToken } from '@/services/api';
import { connect as twilioConnect } from 'twilio-video';

const joinVideoMeeting = async (meetingId: string) => {
  try {
    // Get Twilio token
    const tokenData = await generateVideoToken(meetingId);

    console.log('Room:', tokenData.room_name);
    console.log('Identity:', tokenData.identity);
    console.log('Token expires:', tokenData.expires_at);

    // Connect to Twilio Video
    const room = await twilioConnect(tokenData.token, {
      name: tokenData.room_name,
      audio: true,
      video: true,
    });

    console.log('Connected to room:', room.name);

    return room;
  } catch (error) {
    console.error('Failed to join meeting:', error);
  }
};
```

### 8. Get Meeting Reminders

```typescript
import { getMeetingReminders } from '@/services/api';

const loadReminders = async (meetingId: string) => {
  try {
    const response = await getMeetingReminders(meetingId);

    response.reminders.forEach(reminder => {
      console.log(`${reminder.reminder_type}: ${reminder.status}`);
      if (reminder.sent_at) {
        console.log(`  Sent at: ${reminder.sent_at}`);
        console.log(`  WhatsApp status: ${reminder.whatsapp_status}`);
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to load reminders:', error);
  }
};
```

---

## Error Handling

All API functions throw errors that can be caught and handled:

```typescript
import { sendOTP } from '@/services/api';

const handleAPICall = async () => {
  try {
    await sendOTP('9876543210');
  } catch (error) {
    // Error is already formatted with a user-friendly message
    console.error(error.message);

    // Show error to user
    alert(error.message);

    // Or use a toast notification
    toast.error(error.message);
  }
};
```

### Common Error Scenarios

**401 Unauthorized:**
```typescript
// Token expired or invalid
// Solution: Redirect to login
if (error.message.includes('No access token')) {
  window.location.href = '/login';
}
```

**403 Forbidden:**
```typescript
// User doesn't have permission
// Example: Non-organizer trying to cancel meeting
alert('You do not have permission to perform this action');
```

**404 Not Found:**
```typescript
// Resource doesn't exist
alert('Meeting not found');
```

**429 Too Many Requests:**
```typescript
// Rate limit exceeded (e.g., too many OTP requests)
alert('Too many requests. Please try again later.');
```

---

## TypeScript Types

All API types are defined in `src/types/api.ts`. Use them for type safety:

```typescript
import type {
  // Common
  MeetingType,
  MeetingStatus,
  FieldSource,
  // Requests
  CreateMeetingRequest,
  UpdateFieldRequest,
  // Responses
  MeetingDetailsResponse,
  ListMeetingsResponse,
} from '@/types/api';

// Example: Type-safe meeting creation
const meetingData: CreateMeetingRequest = {
  title: 'Team Meeting',
  meeting_type: 'group', // TypeScript will enforce valid values
  start_time: '2026-01-03T10:00:00Z',
  end_time: '2026-01-03T11:00:00Z',
  timezone: 'Asia/Kolkata',
};
```

---

## Migration Guide

If you're migrating from the old API implementation:

### Deprecated Functions

| Old Function | New Function | Notes |
|-------------|--------------|-------|
| `scheduleMeeting()` | `createMeeting()` | Different request structure |
| `getMeetings()` | `listMeetings()` | Supports query parameters |
| `getTwilioToken(meetingId, identity)` | `generateVideoToken(meetingId)` | Identity auto-generated |
| `getOnboardingData(sessionId)` | `getOnboardingSession(sessionId)` | Same functionality |

### Breaking Changes

1. **Phone Number Format:**
   - Old: Required `+91` prefix
   - New: Backend handles normalization, send 10-digit number

2. **Meeting Creation:**
   - Old: `scheduleMeeting({ date, time, mentor_id, ... })`
   - New: `createMeeting({ title, start_time, end_time, timezone, ... })`

3. **Meeting List:**
   - Old: `getMeetings()` (no filtering)
   - New: `listMeetings({ status, start_date, end_date, meeting_type })`

### Migration Steps

1. Update imports:
   ```typescript
   // Old
   import { scheduleMeeting } from '@/services/api';

   // New
   import { createMeeting } from '@/services/api';
   import type { CreateMeetingRequest } from '@/types/api';
   ```

2. Update function calls:
   ```typescript
   // Old
   await scheduleMeeting({
     date: '2026-01-03',
     time: '10:00',
     mentor_id: 'user-123',
     ...
   });

   // New
   await createMeeting({
     title: 'Meeting Title',
     start_time: '2026-01-03T10:00:00Z',
     end_time: '2026-01-03T11:00:00Z',
     timezone: 'Asia/Kolkata',
     ...
   });
   ```

3. Add environment variables to `.env`

4. Test thoroughly!

---

## Best Practices

1. **Always use TypeScript types** for API calls
2. **Handle errors gracefully** with try-catch blocks
3. **Use environment variables** for API configuration
4. **Store session IDs** for onboarding workflow
5. **Validate data** before sending to API
6. **Use async/await** instead of promises
7. **Show loading states** during API calls
8. **Cache meeting lists** to reduce API calls
9. **Clear tokens on logout** using the `logout()` function
10. **Don't hardcode API URLs** - use environment variables

---

## Support

For backend API documentation, see the main `API_ENDPOINTS.md` file provided by the backend team.

For frontend issues, check:
- TypeScript types in `src/types/api.ts`
- API service implementation in `src/services/api.ts`
- Environment configuration in `.env`
