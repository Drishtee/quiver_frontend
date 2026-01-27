# Quiver Meeting System - Complete Setup Guide

## Overview

The Quiver meeting system integrates:
- **Twilio Video** for high-quality video conferencing
- **WhatsApp** for meeting reminders and notifications
- Full meeting lifecycle management (schedule, join, cancel, reschedule)

---

## Frontend Components Created

### 1. **Twilio Video Service** (`src/services/twilio.ts`)
Handles all Twilio Video operations:
- Room connection/disconnection
- Local audio/video track management
- Participant management
- Track attachment/detachment

### 2. **Enhanced Video Meeting Component** (`src/app/screens/twilio-video-meeting.tsx`)
Real Twilio Video integration with:
- Live video/audio streams
- Participant tracking
- Meeting controls (mute, video toggle, screen share)
- In-meeting chat
- Full-screen mode
- Connection status handling

### 3. **Schedule Meeting Component** (`src/app/screens/schedule-meeting.tsx`)
Updated with:
- WhatsApp reminder toggles
- Multiple reminder time options (24h, 1h, 15m before)
- API integration for meeting scheduling
- Visual feedback for scheduling status

### 4. **Meetings List Component** (`src/app/components/meetings-list.tsx`)
Dashboard component showing:
- All scheduled meetings
- Meeting status badges
- Quick join for upcoming meetings
- WhatsApp reminder controls
- Meeting cancellation

### 5. **API Functions** (`src/services/api.ts`)
New endpoints:
- `scheduleMeeting()` - Create meeting with WhatsApp options
- `getMeetings()` - Fetch all meetings
- `getTwilioToken()` - Get Twilio access token
- `cancelMeeting()` - Cancel a meeting
- `sendWhatsAppReminder()` - Trigger WhatsApp reminder
- `testWhatsAppConnection()` - Test WhatsApp integration

---

## Installation

### 1. Install Dependencies

```bash
npm install twilio-video@^2.28.1
```

Or if using pnpm:
```bash
pnpm add twilio-video@^2.28.1
```

### 2. Install TypeScript Types (if needed)

```bash
npm install --save-dev @types/twilio-video
```

---

## Backend Setup Required

### 1. Twilio Video Configuration

#### Create Twilio Account
1. Sign up at https://www.twilio.com/
2. Get your Account SID and Auth Token from the console
3. Create a Twilio API Key and Secret

#### Backend Environment Variables
```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_API_KEY=your_api_key
TWILIO_API_SECRET=your_api_secret
TWILIO_AUTH_TOKEN=your_auth_token
```

#### Backend Endpoint: `/meetings/twilio-token/`

**Django Example:**
```python
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VideoGrant
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_twilio_token(request):
    meeting_id = request.data.get('meeting_id')
    identity = request.data.get('identity')

    # Get or create meeting room
    meeting = Meeting.objects.get(id=meeting_id)
    room_name = meeting.twilio_room_name or f"meeting_{meeting_id}"

    # Create access token
    token = AccessToken(
        settings.TWILIO_ACCOUNT_SID,
        settings.TWILIO_API_KEY,
        settings.TWILIO_API_SECRET,
        identity=identity
    )

    # Create video grant
    video_grant = VideoGrant(room=room_name)
    token.add_grant(video_grant)

    return Response({
        'token': token.to_jwt(),
        'room_name': room_name
    })
```

**FastAPI Example:**
```python
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VideoGrant
from fastapi import APIRouter, Depends
from pydantic import BaseModel

router = APIRouter()

class TwilioTokenRequest(BaseModel):
    meeting_id: str
    identity: str

@router.post("/meetings/twilio-token/")
async def get_twilio_token(
    request: TwilioTokenRequest,
    current_user = Depends(get_current_user)
):
    # Get meeting
    meeting = await get_meeting(request.meeting_id)
    room_name = meeting.twilio_room_name or f"meeting_{request.meeting_id}"

    # Create token
    token = AccessToken(
        TWILIO_ACCOUNT_SID,
        TWILIO_API_KEY,
        TWILIO_API_SECRET,
        identity=request.identity
    )

    # Add video grant
    video_grant = VideoGrant(room=room_name)
    token.add_grant(video_grant)

    return {
        'token': token.to_jwt(),
        'room_name': room_name
    }
```

---

### 2. WhatsApp Configuration

#### Option A: Twilio WhatsApp API

1. **Setup Twilio WhatsApp Sandbox** (for testing):
   - Go to Twilio Console → Messaging → Try it out → Send a WhatsApp message
   - Follow instructions to connect your phone

2. **For Production** - Enable Twilio WhatsApp:
   - Go to Twilio Console → Messaging → Senders → WhatsApp senders
   - Request production access
   - Get approved by WhatsApp

#### Option B: WhatsApp Business API

1. Sign up for WhatsApp Business API
2. Get API credentials
3. Create message templates

#### Backend Environment Variables
```bash
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886  # Twilio sandbox number
# or
WHATSAPP_API_KEY=your_api_key
WHATSAPP_API_SECRET=your_api_secret
```

#### Backend Endpoint: `/meetings/schedule/`

**Django Example:**
```python
from twilio.rest import Client
from datetime import datetime, timedelta

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def schedule_meeting(request):
    # Create meeting
    meeting = Meeting.objects.create(
        user=request.user,
        date=request.data.get('date'),
        time=request.data.get('time'),
        mentor_id=request.data.get('mentor_id'),
        meeting_type=request.data.get('meeting_type'),
        notes=request.data.get('notes'),
        enable_whatsapp_reminder=request.data.get('enable_whatsapp_reminder', False),
        whatsapp_reminder_times=request.data.get('whatsapp_reminder_times', [])
    )

    # Schedule WhatsApp reminders
    if meeting.enable_whatsapp_reminder:
        schedule_whatsapp_reminders(meeting)

    return Response({
        'success': True,
        'meeting_id': meeting.id,
        'message': 'Meeting scheduled successfully'
    })

def schedule_whatsapp_reminders(meeting):
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

    for reminder_time in meeting.whatsapp_reminder_times:
        # Calculate send time
        meeting_datetime = datetime.combine(meeting.date, meeting.time)

        if reminder_time == '24h':
            send_at = meeting_datetime - timedelta(hours=24)
        elif reminder_time == '1h':
            send_at = meeting_datetime - timedelta(hours=1)
        elif reminder_time == '15m':
            send_at = meeting_datetime - timedelta(minutes=15)

        # Schedule the reminder (use Celery or similar)
        send_whatsapp_reminder.apply_async(
            args=[meeting.id],
            eta=send_at
        )
```

#### Backend Endpoint: `/meetings/{id}/send-reminder/`

```python
from twilio.rest import Client

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_whatsapp_reminder(request, meeting_id):
    meeting = Meeting.objects.get(id=meeting_id, user=request.user)

    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

    message_body = f"""
🔔 *Upcoming Meeting Reminder*

📅 Date: {meeting.date.strftime('%B %d, %Y')}
⏰ Time: {meeting.time}
👤 Mentor: {meeting.mentor.name}
📝 Type: {meeting.meeting_type}

Join Link: {settings.FRONTEND_URL}/meeting/{meeting.id}

See you there! 🚀
"""

    try:
        message = client.messages.create(
            from_=f'whatsapp:{settings.TWILIO_WHATSAPP_NUMBER}',
            to=f'whatsapp:{meeting.user.phone}',
            body=message_body
        )

        return Response({
            'success': True,
            'message_sid': message.sid
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)
```

---

### 3. Meeting Database Model

**Django Example:**
```python
from django.db import models
from django.contrib.auth.models import User

class Meeting(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    mentor = models.ForeignKey('Mentor', on_delete=models.CASCADE)
    date = models.DateField()
    time = models.TimeField()
    meeting_type = models.CharField(max_length=100)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')

    # Twilio Video
    twilio_room_name = models.CharField(max_length=200, blank=True)
    twilio_room_sid = models.CharField(max_length=200, blank=True)

    # WhatsApp
    enable_whatsapp_reminder = models.BooleanField(default=False)
    whatsapp_reminder_times = models.JSONField(default=list)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-time']
```

---

## Frontend Integration

### Update App.tsx

```typescript
import { TwilioVideoMeeting } from "./screens/twilio-video-meeting";
import { MeetingsList } from "./components/meetings-list";

// In your App component:
const handleJoinMeeting = (meetingId: string) => {
  setCurrentMeeting({
    id: meetingId,
    title: "Mentorship Session",
    mentor: "Priya Sharma"
  });
  setCurrentScreen("video-meeting");
};

// In dashboard screen:
<MeetingsList onJoinMeeting={handleJoinMeeting} />

// In video-meeting screen:
{currentScreen === "video-meeting" && currentMeeting && (
  <TwilioVideoMeeting
    meetingId={currentMeeting.id}
    meetingTitle={currentMeeting.title}
    mentorName={currentMeeting.mentor}
    onEndCall={handleEndCall}
  />
)}
```

---

## Testing

### 1. Test Twilio Video

```typescript
// In browser console:
localStorage.setItem('user_name', 'Test User');

// Then join a meeting and check console logs
```

### 2. Test WhatsApp (Sandbox)

1. Send "join <your-sandbox-code>" to Twilio WhatsApp number
2. Schedule a meeting with WhatsApp reminders enabled
3. Check your phone for the message

---

## Environment Variables Summary

### Frontend (.env or vite config)
```bash
VITE_API_BASE_URL=http://localhost:8000
```

### Backend
```bash
# Twilio Video
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Twilio WhatsApp
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Application
FRONTEND_URL=http://localhost:5173
```

---

## Features Implemented

✅ **Meeting Scheduling**
- Date and time selection
- Mentor selection
- Meeting type selection
- Optional notes

✅ **WhatsApp Reminders**
- Toggle on/off
- Multiple reminder times (24h, 1h, 15m)
- Custom message formatting
- Send reminder manually

✅ **Twilio Video Integration**
- Real-time video/audio
- Picture-in-picture layout
- Meeting controls (mute, video, speaker)
- Participant tracking
- In-meeting chat
- Full-screen mode
- Connection status handling

✅ **Meeting Management**
- View all meetings
- Filter by status
- Quick join upcoming meetings
- Cancel meetings
- Reschedule (backend support needed)

---

## Next Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Backend**
   - Add Twilio credentials
   - Implement endpoints listed above
   - Set up database models

3. **Test the Flow**
   - Schedule a test meeting
   - Join the video call
   - Test WhatsApp reminders

4. **Deploy**
   - Update environment variables for production
   - Enable WhatsApp Business API (not sandbox)
   - Configure Twilio Programmable Video for production

---

## Troubleshooting

### Video Connection Issues
- Check Twilio credentials
- Verify token generation endpoint
- Check browser permissions for camera/microphone
- Check console logs for detailed errors

### WhatsApp Not Sending
- Verify Twilio WhatsApp number
- Check if phone number is in correct format (+91XXXXXXXXXX)
- For sandbox, ensure user joined sandbox
- Check Twilio logs in console

### Meeting Not Scheduling
- Check backend authentication
- Verify all required fields
- Check network tab for API errors
- Review backend logs

---

## Cost Considerations

### Twilio Video Pricing
- Group Rooms: $0.004/participant/minute
- P2P Rooms: $0.0015/participant/minute
- Recording: $0.004/minute

### Twilio WhatsApp Pricing
- Conversations: $0.005 per conversation
- Template messages: Free (user-initiated conversations)

Estimate: For 100 meetings/month (30 min average):
- Video: ~$12-24/month
- WhatsApp: ~$0.50-1/month

---

## Support

For issues or questions:
1. Check Twilio documentation: https://www.twilio.com/docs/video
2. Review WhatsApp API docs: https://www.twilio.com/docs/whatsapp
3. Check browser console for errors
4. Review backend logs
