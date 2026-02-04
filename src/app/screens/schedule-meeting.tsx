import { useState } from "react";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
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
  meetingId?: string;
  meetLink?: string;
  calendarLink?: string;
}

interface ScheduleMeetingProps {
  onBack: () => void;
  onSchedule: (meetingDetails: MeetingDetails) => void;
}

export function ScheduleMeeting({ onBack, onSchedule }: ScheduleMeetingProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [enableWhatsAppReminder, setEnableWhatsAppReminder] = useState(true);
  const [reminderTimes, setReminderTimes] = useState<string[]>(["24h", "1h"]);
  const [isScheduling, setIsScheduling] = useState(false);

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];

  const handleSchedule = async () => {
    if (selectedDate && selectedTime) {
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

        // Schedule meeting via API - always with Quiver Team
        const response = await createMeeting({
          title: "Meeting with Quiver Team",
          description: notes || undefined,
          meeting_type: "one_on_one",
          start_time,
          end_time,
          timezone: "Asia/Kolkata",
        });

        // Extract meet link from API response
        const meetLink = response.google_meet_room?.meet_link || '';
        const calendarLink = response.google_meet_room?.calendar_link || '';

        // Call parent callback with real data from API
        onSchedule({
          date: selectedDate,
          time: selectedTime,
          type: "one_on_one",
          notes,
          enableWhatsAppReminder,
          reminderTimes,
          videoPlatform: "google_meet",
          meetingId: response.meeting_id,
          meetLink,
          calendarLink
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

  const isFormValid = selectedDate && selectedTime;

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-20 mobile-full-screen">
      {/* Header - Mobile-first */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 md:px-6 md:py-4 flex items-center gap-3 md:gap-4">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg min-h-touch min-w-touch flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </button>
          <h1 className="text-base md:text-lg font-semibold text-gray-900 truncate">Schedule Meeting with Quiver Team</h1>
        </div>
      </header>

      {/* Main Content - Mobile-first */}
      <main className="max-w-4xl mx-auto px-4 py-6 md:px-6 md:py-12">
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Calendar Section - Mobile-first */}
          <div className="space-y-4 md:space-y-6">
            <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6">
              <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                <CalendarIcon className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                Select Date
              </h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border-0 w-full"
              />
            </div>

            {/* Selected Date Display - Compact on mobile */}
            {selectedDate && (
              <div className="bg-gray-50 rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6">
                <h4 className="font-semibold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">Selected Date</h4>
                <p className="text-lg md:text-2xl font-semibold text-accent">
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

          {/* Meeting Details Section - Mobile-first */}
          <div className="space-y-4 md:space-y-6">
            {/* Time Slot Selection - Touch-friendly */}
            <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6 space-y-3 md:space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm md:text-base">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                Select Time Slot
              </h3>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`min-h-[48px] md:h-12 rounded-lg border-2 transition-all text-sm md:text-base font-medium ${
                      selectedTime === time
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-gray-200 hover:border-gray-300 active:border-accent/50 text-gray-900"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Meeting With Info */}
            <div className="bg-accent/5 rounded-2xl border border-gray-200 p-6 space-y-2">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-accent" />
                Meeting With
              </h3>
              <p className="text-lg font-medium text-primary">Quiver Team</p>
              <p className="text-sm text-gray-500">
                Our team will help you with onboarding, business strategy, and support.
              </p>
            </div>

            {/* Google Meet Info */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-2">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-accent" />
                Video Call via Google Meet
              </h3>
              <p className="text-sm text-gray-500">
                A Google Meet link will be generated automatically and shared with you.
              </p>
            </div>

            {/* WhatsApp Reminders */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-accent mt-1" />
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">WhatsApp Reminders</h3>
                      <p className="text-sm text-gray-500">Get meeting reminders on WhatsApp</p>
                    </div>
                    <Checkbox
                      checked={enableWhatsAppReminder}
                      onCheckedChange={(checked) => setEnableWhatsAppReminder(checked as boolean)}
                    />
                  </div>

                  {enableWhatsAppReminder && (
                    <div className="space-y-3 pl-2 border-l-2 border-blue-200">
                      <p className="text-sm text-gray-500">When to send reminders:</p>
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
                            <label className="text-sm text-gray-900 cursor-pointer">
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
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Additional Notes (Optional)</h3>
              <Textarea
                placeholder="Add any specific topics or questions you'd like to discuss..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px] bg-gray-50 border-gray-200 resize-none"
              />
            </div>

            {/* Schedule Button - Sticky on mobile */}
            <div className="sticky bottom-0 -mx-4 md:mx-0 px-4 py-4 md:p-0 bg-white md:bg-transparent border-t md:border-0 border-gray-200">
              <Button
                className="w-full min-h-[52px] md:h-12 bg-primary hover:bg-primary/90 active:bg-primary/80"
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
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-2">
              <div className="flex items-start gap-2">
                <Bell className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <strong>Notifications:</strong> You'll receive a confirmation email with the Google Meet meeting link.
                  </p>
                </div>
              </div>
              {enableWhatsAppReminder && (
                <div className="flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
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
