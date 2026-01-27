# Frontend Integration Guide

This guide outlines all the changes needed in your frontend to integrate with the QUIVER backend.

## 🚀 Quick Start

1. **Copy the API client**: Move `frontend-api-client.ts` to your frontend project (e.g., `src/services/api.ts`)
2. **Install dependencies**: `npm install axios`
3. **Configure environment**: Set `REACT_APP_API_URL=http://localhost:8000` in your `.env` file
4. **Review the checklist**: Follow the implementation checklist below

---

## 📚 Files Created for You

1. **API_ENDPOINTS.md** - Complete API endpoint documentation with examples
2. **frontend-api-client.ts** - Ready-to-use TypeScript API client with all endpoints
3. **FRONTEND_INTEGRATION_GUIDE.md** - This file
4. **GOOGLE_MEET_README.md** - Google Meet integration quick start
5. **API_CHANGES_GOOGLE_MEET.md** - Detailed API changes for Google Meet

---

## ⚠️ Important: Google Meet Integration

**The backend now uses Google Meet** for video conferencing instead of Twilio. This means:
- ✅ **No video SDK required** - Just use Google Meet links
- ✅ **Simpler implementation** - No token management or video tracks
- ✅ **Better UX** - Familiar Google Meet interface
- ✅ **Mobile support** - Works with Google Meet mobile app
- ✅ **Recording ready** - Cloud recording with Google Workspace

See `API_CHANGES_GOOGLE_MEET.md` for migration details from Twilio.

---

## Frontend Implementation Checklist

### 1. Authentication & Authorization

#### Required Pages/Components:
- [ ] **Login Page** (`/login`)
  - Phone number input field
  - OTP request button
  - OTP input field (6 digits)
  - OTP verification button
  - Error handling for invalid phone/OTP
  - Rate limiting message (max 3 OTPs per 10 minutes)

#### Implementation:
```typescript
// Example: Login Component
import api from './services/api';

async function handleSendOTP(phone: string) {
  try {
    await api.sendOTP({ phone });
    // Show OTP input field
  } catch (error) {
    // Handle error (rate limit, invalid phone)
  }
}

async function handleVerifyOTP(phone: string, otp: string) {
  try {
    const result = await api.verifyOTP({ phone, otp });
    // Redirect to onboarding or dashboard
    // Token is automatically stored by the API client
  } catch (error) {
    // Handle invalid OTP
  }
}
```

#### Authentication State Management:
- [ ] Store JWT tokens in localStorage (handled by API client)
- [ ] Create authentication context/provider
- [ ] Implement protected routes that redirect to login if not authenticated
- [ ] Add logout functionality that clears tokens
- [ ] Handle 401 errors globally (auto-logout on token expiration)

---

### 2. Onboarding Flow

#### Required Pages/Components:
- [ ] **Onboarding Start Page** (`/onboarding`)
  - Welcome screen
  - Start onboarding button

- [ ] **Onboarding Questionnaire** (`/onboarding/questionnaire`)
  - Multi-step form based on questionnaire sections
  - Progress indicator
  - Field validation
  - Support for different field types (text, select, etc.)
  - Save draft functionality (auto-save on field update)
  - Previous/Next navigation
  - Submit button on final step

- [ ] **Onboarding Review Page** (optional)
  - Review all entered information
  - Edit individual fields
  - Final submission

#### Implementation:
```typescript
// Example: Onboarding Flow
import api from './services/api';
import { useState, useEffect } from 'react';

function OnboardingQuestionnaire() {
  const [sessionId, setSessionId] = useState('');
  const [questionnaire, setQuestionnaire] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Start onboarding session
    async function start() {
      const session = await api.startOnboarding();
      setSessionId(session.session_id);

      // Get questionnaire with progress
      const data = await api.getQuestionnaireWithProgress(session.session_id);
      setQuestionnaire(data);
    }
    start();
  }, []);

  async function handleFieldUpdate(key: string, value: any) {
    await api.updateField({
      session_id: sessionId,
      key,
      value,
      source: 'ui'
    });
  }

  async function handleSubmit() {
    await api.submitOnboarding({ session_id: sessionId });
    // Redirect to dashboard
  }

  // Render questionnaire...
}
```

#### Features to Implement:
- [ ] Auto-save fields as user types (debounced)
- [ ] Show validation errors
- [ ] Display field status (suggested vs confirmed)
- [ ] Handle different field types (text, select, radio, checkbox)
- [ ] Show completion percentage
- [ ] Allow skipping optional fields
- [ ] Resume incomplete onboarding sessions

---

### 3. Meetings Management

#### Required Pages/Components:

- [ ] **Meetings List Page** (`/meetings`)
  - List all meetings (scheduled, in_progress, completed)
  - Filter by status, date range, meeting type
  - Create meeting button
  - Meeting cards showing:
    - Title
    - Date/Time (in user's timezone)
    - Participant count
    - Meeting status
    - Recurring badge
    - "Join Google Meet" button
  - Click to view details

- [ ] **Create Meeting Page** (`/meetings/create`)
  - Meeting title input
  - Description textarea
  - Meeting type selector (one_on_one, group)
  - Date/time pickers (start and end)
  - Timezone selector
  - Participant phone numbers input (multi-select or tags)
  - Recurrence options (optional):
    - Frequency selector (daily, weekly, monthly)
    - Interval input
    - End date or occurrence count
    - Days of week (for weekly)
    - Day of month (for monthly)
  - Create button

- [ ] **Meeting Details Page** (`/meetings/:id`)
  - Display all meeting info
  - Show organizer and participants
  - Show participant response status
  - **Google Meet Link/Button** - Primary action
  - Add participants button (organizer only)
  - Cancel meeting button (organizer only)
  - View reminders
  - Show recording status (if enabled)
  - Edit meeting button (future enhancement)

- [ ] **Google Meet Integration Component**
  - **Option 1:** Direct link button to open Google Meet
  - **Option 2:** Embedded iframe with Google Meet
  - **Option 3:** Copy link to clipboard

#### Implementation:

```typescript
// Example: Create Meeting
import api from './services/api';

async function handleCreateMeeting(formData) {
  try {
    const meeting = await api.createMeeting({
      title: formData.title,
      description: formData.description,
      meeting_type: formData.meetingType,
      start_time: formData.startTime.toISOString(),
      end_time: formData.endTime.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      participant_phone_numbers: formData.participants,
      recurrence: formData.isRecurring ? {
        frequency: formData.frequency,
        interval: formData.interval,
        end_date: formData.endDate
      } : undefined
    });

    // Redirect to meeting details
    navigate(`/meetings/${meeting.meeting_id}`);
  } catch (error) {
    // Handle error
  }
}
```

```typescript
// Example: Google Meet Integration - Option 1 (Direct Link Button)
import { useState, useEffect } from 'react';
import api from './services/api';

function JoinMeetingButton({ meetingId }: { meetingId: string }) {
  const [meetLink, setMeetLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeetLink() {
      try {
        const data = await api.getMeetLink(meetingId);
        setMeetLink(data.meet_link);
      } catch (error) {
        console.error('Failed to get meet link:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMeetLink();
  }, [meetingId]);

  if (loading) return <button disabled>Loading...</button>;
  if (!meetLink) return <button disabled>No meeting link</button>;

  return (
    <a href={meetLink} target="_blank" rel="noopener noreferrer">
      <button className="join-meeting-btn">
        Join Google Meet
      </button>
    </a>
  );
}
```

```typescript
// Example: Google Meet Integration - Option 2 (Embedded Iframe)
import { useState, useEffect } from 'react';
import api from './services/api';

function GoogleMeetEmbed({ meetingId }: { meetingId: string }) {
  const [meetLink, setMeetLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeetLink() {
      try {
        const data = await api.getMeetLink(meetingId);
        setMeetLink(data.meet_link);
      } catch (error) {
        console.error('Failed to get meet link:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMeetLink();
  }, [meetingId]);

  if (loading) return <div>Loading meeting...</div>;
  if (!meetLink) return <div>Meeting link unavailable</div>;

  return (
    <div className="meeting-container">
      <iframe
        src={meetLink}
        allow="camera; microphone; fullscreen; display-capture"
        width="100%"
        height="600px"
        frameBorder="0"
        style={{ border: 'none', borderRadius: '8px' }}
      />
    </div>
  );
}
```

```typescript
// Example: Google Meet Integration - Option 3 (Copy Link)
import { useState, useEffect } from 'react';
import api from './services/api';

function CopyMeetLink({ meetingId }: { meetingId: string }) {
  const [meetLink, setMeetLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchMeetLink() {
      try {
        const data = await api.getMeetLink(meetingId);
        setMeetLink(data.meet_link);
      } catch (error) {
        console.error('Failed to get meet link:', error);
      }
    }
    fetchMeetLink();
  }, [meetingId]);

  async function handleCopy() {
    if (meetLink) {
      await navigator.clipboard.writeText(meetLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div>
      <input type="text" value={meetLink || 'Loading...'} readOnly />
      <button onClick={handleCopy}>
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  );
}
```

```typescript
// Example: Full Meeting Details Component
import { useState, useEffect } from 'react';
import api from './services/api';

function MeetingDetails({ meetingId }: { meetingId: string }) {
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeeting() {
      try {
        const data = await api.getMeetingDetails(meetingId);
        setMeeting(data);
      } catch (error) {
        console.error('Failed to fetch meeting:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMeeting();
  }, [meetingId]);

  if (loading) return <div>Loading...</div>;
  if (!meeting) return <div>Meeting not found</div>;

  return (
    <div className="meeting-details">
      <h1>{meeting.title}</h1>
      <p>{meeting.description}</p>

      {/* Meeting Info */}
      <div className="meeting-info">
        <p>Start: {new Date(meeting.start_time).toLocaleString()}</p>
        <p>End: {new Date(meeting.end_time).toLocaleString()}</p>
        <p>Type: {meeting.meeting_type}</p>
        <p>Status: {meeting.status}</p>
      </div>

      {/* Google Meet Section */}
      {meeting.google_meet && (
        <div className="google-meet-section">
          <h2>Video Conference</h2>
          <a
            href={meeting.google_meet.meet_link}
            target="_blank"
            rel="noopener noreferrer"
            className="join-btn"
          >
            Join Google Meet
          </a>
          {meeting.google_meet.recording_enabled && (
            <p>🔴 Recording enabled</p>
          )}
          {meeting.google_meet.recording_url && (
            <a href={meeting.google_meet.recording_url} target="_blank">
              View Recording
            </a>
          )}
        </div>
      )}

      {/* Participants */}
      <div className="participants">
        <h2>Participants</h2>
        {meeting.participants.map(p => (
          <div key={p.user_id}>
            {p.phone} - {p.response_status}
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Features to Implement:
- [ ] Calendar view for meetings
- [ ] Meeting search and filters
- [ ] Sort by date, title, status
- [ ] Meeting notifications/reminders in UI
- [ ] Edit meeting details
- [ ] Recurring meeting management
- [ ] Meeting invitations
- [ ] Response status (accept/decline)
- [ ] Export to calendar (ICS file)
- [ ] **Google Meet link display/copy**
- [ ] **Embedded Google Meet option**
- [ ] **Show recording status and links**

---

### 4. Dashboard/Home Page

#### Required:
- [ ] **Dashboard** (`/` or `/dashboard`)
  - Welcome message with user info
  - Upcoming meetings widget with "Join" buttons
  - Onboarding status (if incomplete)
  - Quick actions:
    - Create meeting
    - Join upcoming meeting (Google Meet link)
    - Complete onboarding
  - Recent activity

---

### 5. Navigation & Layout

#### Required Components:
- [ ] **App Navigation**
  - Header/navbar with:
    - Logo/brand
    - Navigation links (Dashboard, Meetings, Profile)
    - User menu (Profile, Logout)
  - Mobile-responsive menu

- [ ] **Protected Route Wrapper**
  - Check authentication status
  - Redirect to login if not authenticated
  - Show loading state while checking auth

---

### 6. Global State Management

#### Recommended Setup (choose one):
- [ ] Context API (for smaller apps)
- [ ] Redux Toolkit (for complex state)
- [ ] Zustand (lightweight alternative)
- [ ] Recoil (atomic state management)

#### State to Manage:
- [ ] Authentication state (user, token, isAuthenticated)
- [ ] User profile data
- [ ] Onboarding session
- [ ] Current meeting
- [ ] Notifications/alerts

---

### 7. Error Handling & User Feedback

#### Required:
- [ ] **Toast/Notification System**
  - Success messages
  - Error messages
  - Warning messages
  - Info messages

- [ ] **Loading States**
  - Skeleton loaders
  - Spinners
  - Progress indicators

- [ ] **Error Boundaries**
  - Catch and display React errors
  - Fallback UI

- [ ] **Form Validation**
  - Client-side validation before API calls
  - Display validation errors
  - Disable submit while submitting

---

### 8. Dependencies to Install

```bash
# Core dependencies
npm install axios

# Date/Time handling (choose one)
npm install date-fns
# OR
npm install moment
# OR
npm install dayjs

# UI Component Library (choose one)
npm install @mui/material @emotion/react @emotion/styled
# OR
npm install antd
# OR
npm install @chakra-ui/react @emotion/react @emotion/styled

# React Router (if not installed)
npm install react-router-dom

# State Management (optional, choose one)
npm install @reduxjs/toolkit react-redux
# OR
npm install zustand
# OR
npm install recoil

# Form Handling (optional but recommended)
npm install react-hook-form
# OR
npm install formik yup

# Notifications
npm install react-hot-toast
# OR
npm install react-toastify
```

**Note:** ❌ **DO NOT install `twilio-video`** - Google Meet integration doesn't require any video SDK!

---

### 9. Environment Configuration

Create `.env` file in your frontend root:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000

# For production
# REACT_APP_API_URL=https://api.yourapp.com

# No Google Meet or Twilio config needed in frontend!
# Google Meet links are generated by the backend
```

---

### 10. Route Structure

Recommended route structure:

```
/login                          → Login page (public)
/                              → Dashboard (protected)
/onboarding                    → Onboarding start (protected)
/onboarding/questionnaire      → Onboarding form (protected)
/meetings                      → Meetings list (protected)
/meetings/create              → Create meeting (protected)
/meetings/:id                 → Meeting details (protected)
/profile                       → User profile (protected)
```

**Note:** No dedicated video call route needed - users click Google Meet link to join!

---

### 11. Testing Checklist

#### Authentication:
- [ ] Can send OTP
- [ ] Can verify OTP and login
- [ ] Can logout
- [ ] Protected routes redirect to login when not authenticated
- [ ] Token persists on page refresh
- [ ] Auto-logout on token expiration (401 response)

#### Onboarding:
- [ ] Can load questionnaire
- [ ] Can start onboarding session
- [ ] Can update individual fields
- [ ] Can update multiple fields
- [ ] Can see progress/current step
- [ ] Can submit onboarding
- [ ] Resume incomplete onboarding works

#### Meetings:
- [ ] Can create one-time meeting
- [ ] Can create recurring meeting
- [ ] Can list meetings with filters
- [ ] Can view meeting details
- [ ] Can add participants
- [ ] Can cancel meeting
- [ ] **Can get Google Meet link**
- [ ] **Google Meet link opens correctly**
- [ ] **Can join meeting via Google Meet**
- [ ] **Recording status displays correctly**

---

### 12. Key Differences from Twilio Implementation

If migrating from Twilio, here are the key changes:

#### 1. **Video Integration (MAJOR CHANGE)**

**OLD (Twilio):**
```typescript
// Had to install twilio-video SDK
npm install twilio-video

// Generate token from backend
const { token } = await api.generateVideoToken(meetingId);

// Connect to Twilio room
import Video from 'twilio-video';
const room = await Video.connect(token);

// Handle video tracks manually
room.participants.forEach(participant => {
  participant.tracks.forEach(publication => {
    // Attach video/audio tracks
  });
});
```

**NEW (Google Meet):**
```typescript
// NO SDK needed!

// Get Google Meet link from backend
const { meet_link } = await api.getMeetLink(meetingId);

// Just open the link!
window.open(meet_link, '_blank');

// OR embed it
<iframe src={meet_link} allow="camera; microphone" />

// That's it! Much simpler!
```

#### 2. **Meeting Details Response**

**OLD:**
```typescript
interface MeetingDetails {
  twilio_room: {
    room_id: string;
    room_sid: string;
    status: string;
  }
}
```

**NEW:**
```typescript
interface MeetingDetails {
  google_meet: {
    room_id: string;
    meet_link: string;              // Direct Google Meet URL
    calendar_link: string | null;   // Google Calendar event
    status: string;
    recording_enabled: boolean;
    recording_url: string | null;   // Link to recording
    transcript_url: string | null;  // Link to transcript
  }
}
```

#### 3. **API Endpoint Changes**

**REMOVED:**
- ❌ `POST /meetings/<id>/video/token/` - No longer needed

**ADDED:**
- ✅ `GET /meetings/<id>/meet-link/` - Get Google Meet link

#### 4. **Other Changes:**
   - Phone OTP authentication (instead of username/password)
   - JWT tokens returned in verify-otp response
   - User and tenant auto-created on first login
   - Field update sources: `voice | ui | text | document`
   - Field statuses: `suggested | confirmed`
   - Session-based onboarding
   - WhatsApp reminders for participants
   - Recurring meetings support
   - Timezone support

---

### 13. Updated TypeScript Types

Update your TypeScript interfaces:

```typescript
// Google Meet room interface
export interface GoogleMeet {
  room_id: string;
  meet_link: string;
  calendar_link: string | null;
  status: 'created' | 'active' | 'ended' | 'error';
  recording_enabled: boolean;
  recording_url: string | null;
  transcript_url: string | null;
}

// Meeting details interface
export interface MeetingDetails {
  meeting_id: string;
  title: string;
  description: string;
  meeting_type: 'one_on_one' | 'group';
  start_time: string;
  end_time: string;
  timezone: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  organizer: {
    user_id: number;
    phone: string;
  };
  participants: Array<{
    user_id: number;
    phone: string;
    response_status: 'pending' | 'accepted' | 'declined' | 'tentative';
    enable_whatsapp_reminders: boolean;
  }>;
  google_meet: GoogleMeet | null;  // Changed from twilio_room
  reminders: Array<{
    reminder_type: '24h' | '1h';
    scheduled_for: string;
    status: string;
  }>;
}

// Get meet link response
export interface MeetLinkResponse {
  meet_link: string;
  calendar_link: string | null;
  recording_enabled: boolean;
  status: string;
}
```

---

### 14. Optional Enhancements

- [ ] **Progressive Web App (PWA)**
  - Add service worker
  - Enable offline mode
  - Add to home screen

- [ ] **Push Notifications**
  - Meeting reminders
  - New meeting invitations
  - Meeting updates

- [ ] **Calendar Integration**
  - Google Calendar sync (already done by backend!)
  - iCal export
  - Outlook integration

- [ ] **Internationalization (i18n)**
  - Multi-language support
  - Timezone handling
  - Date/time formatting

- [ ] **Accessibility**
  - Screen reader support
  - Keyboard navigation
  - ARIA labels
  - Color contrast compliance

- [ ] **Analytics**
  - Track user interactions
  - Meeting analytics
  - Onboarding completion rate

- [ ] **Google Meet Enhancements**
  - Show recording availability
  - Display meeting transcripts
  - Voice analysis visualization
  - Download recordings

---

## Quick Reference

### API Client Usage:

```typescript
import api from './services/api';

// Check if logged in
if (api.isAuthenticated()) {
  // User is logged in
}

// Login
const result = await api.verifyOTP({ phone, otp });

// Logout
api.clearToken();

// Create meeting
const meeting = await api.createMeeting({ ... });

// Get meetings
const meetings = await api.listMeetings({ status: 'scheduled' });

// Get Google Meet link (NEW!)
const { meet_link } = await api.getMeetLink(meetingId);
window.open(meet_link, '_blank');
```

### Common Patterns:

```typescript
// Protected Component
function ProtectedComponent() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate('/login');
    }
  }, []);

  // Component content
}

// Error Handling
try {
  await api.createMeeting(data);
  toast.success('Meeting created!');
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
  } else if (error.response?.status === 400) {
    // Show validation errors
  } else {
    toast.error('Something went wrong');
  }
}

// Loading States
const [loading, setLoading] = useState(false);

async function fetchData() {
  setLoading(true);
  try {
    const data = await api.listMeetings();
    setMeetings(data.meetings);
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
}
```

---

## Support & Documentation

- **API Endpoints:** See `API_ENDPOINTS.md` for complete endpoint documentation
- **API Client:** See `frontend-api-client.ts` for TypeScript definitions and usage examples
- **Google Meet Migration:** See `API_CHANGES_GOOGLE_MEET.md` for detailed API changes
- **Google Meet Setup:** See `GOOGLE_MEET_README.md` for quick start
- **Backend Code:** Check backend source code for implementation details

---

## Next Steps

1. ✅ Copy `frontend-api-client.ts` to your frontend project
2. ✅ Install required dependencies (NO twilio-video needed!)
3. ✅ Set up environment configuration
4. ✅ Implement authentication flow first
5. ✅ Add onboarding flow
6. ✅ Implement meetings management with Google Meet integration
7. ✅ Test thoroughly (especially Google Meet links)
8. ✅ Deploy!

---

## 🎉 Benefits of Google Meet Integration

### For Users
- ✅ Familiar interface (Google Meet)
- ✅ Works on mobile (Google Meet app)
- ✅ No app download required
- ✅ Better call quality
- ✅ Calendar integration
- ✅ Cloud recording (Google Workspace)

### For Developers
- ✅ **Much simpler code** (no video SDK!)
- ✅ No token management
- ✅ No video track handling
- ✅ Fewer dependencies
- ✅ Less code to maintain
- ✅ Better error handling

### For Business
- ✅ Lower costs (no per-minute charges)
- ✅ Better user adoption
- ✅ Enterprise features (recordings, transcripts)
- ✅ Compliance and security (Google infrastructure)

---

Good luck with your integration! 🚀

For Google Meet specific questions, see `GOOGLE_MEET_README.md` and `API_CHANGES_GOOGLE_MEET.md`.
