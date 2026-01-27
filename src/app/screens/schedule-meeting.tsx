import { useState } from "react";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { ArrowLeft, Clock, User, Video, Calendar as CalendarIcon, MessageCircle, Bell } from "lucide-react";
import { createMeeting } from "../../services/api";

export interface MeetingDetails {
  date: Date;
  time: string;
  type: string;
  notes: string;
  enableWhatsAppReminder: boolean;
  reminderTimes: string[];
  videoPlatform: string;
}

interface ScheduleMeetingProps {
  onBack: () => void;
  onSchedule: (meetingDetails: MeetingDetails) => void;
}

export function ScheduleMeeting({ onBack, onSchedule }: ScheduleMeetingProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [meetingType, setMeetingType] = useState("");
  const [videoPlatform, setVideoPlatform] = useState("google_meet");
  const [notes, setNotes] = useState("");
  const [enableWhatsAppReminder, setEnableWhatsAppReminder] = useState(true);
  const [reminderTimes, setReminderTimes] = useState<string[]>(["24h", "1h"]);
  const [isScheduling, setIsScheduling] = useState(false);

  const videoPlatforms = [
    { id: "google_meet", name: "Google Meet", icon: "video" }
  ];

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];

  const meetingTypes = [
    { id: "consultation", name: "Initial Consultation | प्रारंभिक परामर्श" },
    { id: "onboarding", name: "Onboarding Support | ऑनबोर्डिंग सहायता" },
    { id: "business", name: "Business Discussion | व्यापार चर्चा" },
    { id: "support", name: "General Support | सामान्य सहायता" },
    { id: "followup", name: "Follow-up Meeting | फॉलो-अप मीटिंग" }
  ];

  const handleSchedule = async () => {
    if (selectedDate && selectedTime && meetingType) {
      setIsScheduling(true);
      try {
        // Parse time string (e.g., "9:00 AM") to hours
        const timeParts = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
        let hours = parseInt(timeParts?.[1] || "9");
        const minutes = parseInt(timeParts?.[2] || "0");
        const isPM = timeParts?.[3]?.toUpperCase() === "PM";
        if (isPM && hours !== 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;

        // Create start_time ISO string
        const startDate = new Date(selectedDate);
        startDate.setHours(hours, minutes, 0, 0);
        const start_time = startDate.toISOString();

        // End time is 1 hour later
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 1);
        const end_time = endDate.toISOString();

        // Meeting title with Quiver Team
        const meetingTypeInfo = meetingTypes.find(t => t.id === meetingType);
        const title = `${meetingTypeInfo?.name.split('|')[0].trim() || meetingType} - Quiver Team`;

        // Schedule meeting via API
        await createMeeting({
          title,
          description: notes || undefined,
          meeting_type: meetingType as any,
          start_time,
          end_time,
          timezone: "Asia/Kolkata",
        });

        // Call parent callback
        onSchedule({
          date: selectedDate,
          time: selectedTime,
          type: meetingType,
          notes,
          enableWhatsAppReminder,
          reminderTimes,
          videoPlatform
        });
      } catch (error) {
        console.error('Failed to schedule meeting:', error);
        alert('Failed to schedule meeting. Please try again.');
      } finally {
        setIsScheduling(false);
      }
    }
  };

  const toggleReminderTime = (time: string) => {
    setReminderTimes(prev =>
      prev.includes(time)
        ? prev.filter(t => t !== time)
        : [...prev, time]
    );
  };

  const isFormValid = selectedDate && selectedTime && meetingType;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Schedule Meeting with Quiver Team</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Select Date
              </h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border-0"
              />
            </div>

            {/* Selected Date Display */}
            {selectedDate && (
              <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl border border-blue-100 p-6">
                <h4 className="font-semibold text-foreground mb-2">Selected Date</h4>
                <p className="text-2xl font-semibold text-primary">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Meeting Details Section */}
          <div className="space-y-6">
            {/* Time Slot Selection */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Select Time Slot
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`h-12 rounded-lg border-2 transition-all ${
                      selectedTime === time
                        ? "border-primary bg-blue-50 text-primary font-medium"
                        : "border-border hover:border-gray-300 text-foreground"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Meeting With Info */}
            <div className="bg-gradient-to-br from-primary/10 to-blue-50 rounded-2xl border border-primary/20 p-6 space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Meeting With
              </h3>
              <p className="text-lg font-medium text-primary">Quiver Team</p>
              <p className="text-sm text-muted-foreground">
                Our team will help you with onboarding, business strategy, and support.
              </p>
            </div>

            {/* Meeting Type */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Meeting Type
              </h3>
              <Select value={meetingType} onValueChange={setMeetingType}>
                <SelectTrigger className="h-12 bg-input-background border-border">
                  <SelectValue placeholder="Select meeting type" />
                </SelectTrigger>
                <SelectContent>
                  {meetingTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Video Platform Selection */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Video Platform
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {videoPlatforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setVideoPlatform(platform.id)}
                    className={`h-12 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      videoPlatform === platform.id
                        ? "border-primary bg-blue-50 text-primary font-medium"
                        : "border-border hover:border-gray-300 text-foreground"
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    {platform.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {videoPlatform === 'google_meet'
                  ? 'A Google Meet link will be generated automatically'
                  : 'A Zoom link will be shared after confirmation'}
              </p>
            </div>

            {/* WhatsApp Reminders */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-primary mt-1" />
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">WhatsApp Reminders</h3>
                      <p className="text-sm text-muted-foreground">Get meeting reminders on WhatsApp</p>
                    </div>
                    <Checkbox
                      checked={enableWhatsAppReminder}
                      onCheckedChange={(checked) => setEnableWhatsAppReminder(checked as boolean)}
                    />
                  </div>

                  {enableWhatsAppReminder && (
                    <div className="space-y-3 pl-2 border-l-2 border-blue-200">
                      <p className="text-sm text-muted-foreground">When to send reminders:</p>
                      <div className="space-y-2">
                        {[
                          { value: "24h", label: "24 hours before" },
                          { value: "1h", label: "1 hour before" },
                          { value: "15m", label: "15 minutes before" }
                        ].map((option) => (
                          <div key={option.value} className="flex items-center gap-2">
                            <Checkbox
                              checked={reminderTimes.includes(option.value)}
                              onCheckedChange={() => toggleReminderTime(option.value)}
                            />
                            <label className="text-sm text-foreground cursor-pointer">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-foreground">Additional Notes (Optional)</h3>
              <Textarea
                placeholder="Add any specific topics or questions you'd like to discuss..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px] bg-input-background border-border resize-none"
              />
            </div>

            {/* Schedule Button */}
            <Button
              className="w-full h-12 bg-primary hover:bg-primary/90"
              disabled={!isFormValid || isScheduling}
              onClick={handleSchedule}
            >
              {isScheduling ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </>
              )}
            </Button>

            {/* Info Box */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-2">
              <div className="flex items-start gap-2">
                <Bell className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    <strong>Notifications:</strong> You'll receive a confirmation email with the Google Meet meeting link.
                  </p>
                </div>
              </div>
              {enableWhatsAppReminder && (
                <div className="flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      <strong>WhatsApp Reminders:</strong> You'll get reminders {reminderTimes.length > 0 ? reminderTimes.map(t => {
                        if (t === "24h") return "24 hours";
                        if (t === "1h") return "1 hour";
                        if (t === "15m") return "15 minutes";
                        return t;
                      }).join(", ") : ""} before the meeting.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
