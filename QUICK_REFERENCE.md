# Quiver Meeting System - Quick Reference

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install twilio-video@^2.28.1
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Configure Backend
See `MEETING_SYSTEM_SETUP.md` for detailed backend setup.

---

## 📁 Files Created/Modified

### New Files
```
src/services/twilio.ts                      - Twilio Video service
src/services/api.ts                         - Updated with meeting APIs
src/app/screens/twilio-video-meeting.tsx   - Real Twilio Video component
src/app/screens/schedule-meeting.tsx        - Updated with WhatsApp options
src/app/components/meetings-list.tsx        - Meetings dashboard component
src/app/screens/entrepreneur-dashboard-enhanced.tsx - Dashboard with meetings
```

### Modified Files
```
package.json                                - Added twilio-video dependency
```

### Documentation
```
MEETING_SYSTEM_SETUP.md                    - Complete setup guide
QUICK_REFERENCE.md                         - This file
```

---

## 🎯 Key Features

### Meeting Scheduling
- ✅ Date/time picker
- ✅ Mentor selection
- ✅ Meeting type selection
- ✅ WhatsApp reminder toggles (24h, 1h, 15m before)
- ✅ Optional notes

### Video Conferencing
- ✅ Real Twilio Video integration
- ✅ Local video/audio streams
- ✅ Remote participant video/audio
- ✅ Picture-in-picture layout
- ✅ Mute/unmute controls
- ✅ Video on/off toggle
- ✅ In-meeting chat
- ✅ Full-screen mode
- ✅ Connection status handling

### WhatsApp Integration
- ✅ Automatic reminders
- ✅ Manual reminder sending
- ✅ Customizable timing
- ✅ Rich message formatting

### Meetings Dashboard
- ✅ View all meetings
- ✅ Status badges (scheduled, in progress, completed, cancelled)
- ✅ Quick join for upcoming meetings
- ✅ Cancel meetings
- ✅ Send WhatsApp reminders

---

## 🔌 API Endpoints Required

### Backend Must Implement:

```typescript
POST   /meetings/schedule/           - Create meeting with WhatsApp options
GET    /meetings/                    - List all meetings
GET    /meetings/{id}/               - Get meeting details
POST   /meetings/{id}/cancel/        - Cancel meeting
POST   /meetings/{id}/reschedule/    - Reschedule meeting
POST   /meetings/twilio-token/       - Get Twilio access token
POST   /meetings/{id}/send-reminder/ - Send WhatsApp reminder
POST   /whatsapp/test/               - Test WhatsApp connection
```

---

## 📦 Component Usage

### Schedule Meeting
```tsx
import { ScheduleMeeting } from "./screens/schedule-meeting";

<ScheduleMeeting
  onBack={() => navigate('dashboard')}
  onSchedule={(details) => {
    console.log('Meeting scheduled:', details);
    navigate('dashboard');
  }}
/>
```

### Twilio Video Meeting
```tsx
import { TwilioVideoMeeting } from "./screens/twilio-video-meeting";

<TwilioVideoMeeting
  meetingId="meeting123"
  meetingTitle="Initial Consultation"
  mentorName="Priya Sharma"
  onEndCall={() => navigate('dashboard')}
/>
```

### Meetings List
```tsx
import { MeetingsList } from "./components/meetings-list";

<MeetingsList
  onJoinMeeting={(meetingId) => {
    setCurrentMeeting(meetingId);
    navigate('video-meeting');
  }}
/>
```

---

## 🔑 Environment Variables

### Frontend
```bash
VITE_API_BASE_URL=http://localhost:8000
```

### Backend
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_API_KEY=SKxxxxxxxx
TWILIO_API_SECRET=xxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
FRONTEND_URL=http://localhost:5173
```

---

## 🧪 Testing Checklist

- [ ] Schedule a meeting with WhatsApp reminders enabled
- [ ] Verify WhatsApp reminder checkboxes work
- [ ] Check meeting appears in meetings list
- [ ] Click "Join Now" for upcoming meeting
- [ ] Verify video/audio works
- [ ] Test mute/unmute
- [ ] Test video on/off
- [ ] Test in-meeting chat
- [ ] Test full-screen mode
- [ ] End call successfully
- [ ] Send manual WhatsApp reminder
- [ ] Cancel a meeting
- [ ] Check WhatsApp message received

---

## 🐛 Common Issues

### "No access token found"
- Check if backend authentication is working
- Verify localStorage has `access_token`

### Video connection fails
- Verify Twilio credentials in backend
- Check browser camera/microphone permissions
- Review console logs for errors

### WhatsApp not sending
- Check phone number format (+91XXXXXXXXXX)
- For sandbox: ensure user joined with code
- Verify Twilio WhatsApp number is correct

### Meeting not scheduling
- Check network tab for API errors
- Verify all required fields are filled
- Check backend logs

---

## 💡 Best Practices

### Security
- Never expose Twilio credentials in frontend
- Always validate tokens on backend
- Use HTTPS in production

### Performance
- Limit video quality for slow connections
- Use P2P rooms for 1-on-1 meetings
- Implement pagination for meetings list

### UX
- Show connection status clearly
- Provide retry options on failure
- Add loading states for all async operations
- Display clear error messages

---

## 📞 Integration with App.tsx

```typescript
import { TwilioVideoMeeting } from "./screens/twilio-video-meeting";
import { ScheduleMeeting } from "./screens/schedule-meeting";
import { MeetingsList } from "./components/meetings-list";

// Add to screen type
type Screen = "landing" | "otp" | "dashboard" | "schedule" | "video-meeting" | ...;

// Add state
const [currentMeeting, setCurrentMeeting] = useState<{
  id: string;
  title: string;
  mentor: string;
} | null>(null);

// Add handlers
const handleScheduleMeeting = () => {
  setCurrentScreen("schedule");
};

const handleJoinMeeting = (meetingId: string) => {
  setCurrentMeeting({
    id: meetingId,
    title: "Mentorship Session",
    mentor: "Priya Sharma"
  });
  setCurrentScreen("video-meeting");
};

const handleEndCall = () => {
  setCurrentMeeting(null);
  setCurrentScreen("dashboard");
};

// Add to render
{currentScreen === "schedule" && (
  <ScheduleMeeting
    onBack={() => setCurrentScreen("dashboard")}
    onSchedule={handleScheduleComplete}
  />
)}

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

## 🎨 Customization

### Change Meeting Controls
Edit `src/app/screens/twilio-video-meeting.tsx` - Control Bar section

### Modify WhatsApp Message
Backend: Update message template in `/meetings/{id}/send-reminder/` endpoint

### Add More Reminder Times
Edit `src/app/screens/schedule-meeting.tsx` - reminderTimes options

### Customize Meeting Status
Edit `src/app/components/meetings-list.tsx` - getStatusBadge function

---

## 📚 Resources

- [Twilio Video Docs](https://www.twilio.com/docs/video)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- [twilio-video NPM Package](https://www.npmjs.com/package/twilio-video)

---

## 🎉 Next Steps

1. Install dependencies: `npm install`
2. Configure Twilio account
3. Set up backend endpoints
4. Test locally
5. Deploy to production
6. Monitor usage and costs

For detailed setup: See `MEETING_SYSTEM_SETUP.md`
