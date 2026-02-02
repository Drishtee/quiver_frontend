import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Calendar,
  Clock,
  User,
  Video,
  MessageCircle,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { getMeetings, cancelMeeting, sendWhatsAppReminder } from "../../services/api";

interface Meeting {
  id: string;
  title: string;
  mentor_name: string;
  mentor_avatar?: string;
  date: string;
  time: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  meeting_type: string;
  whatsapp_enabled: boolean;
  twilio_room_name?: string;
}

interface MeetingsListProps {
  onJoinMeeting?: (meetingId: string) => void;
}

export function MeetingsList({ onJoinMeeting }: MeetingsListProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const data = await getMeetings();
      setMeetings(data.meetings || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load meetings:', err);
      setError('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelMeeting = async (meetingId: string) => {
    if (!confirm('Are you sure you want to cancel this meeting?')) return;

    try {
      await cancelMeeting(meetingId);
      // Refresh meetings list
      loadMeetings();
    } catch (err) {
      console.error('Failed to cancel meeting:', err);
      alert('Failed to cancel meeting');
    }
  };

  const handleSendReminder = async (meetingId: string) => {
    try {
      await sendWhatsAppReminder(meetingId);
      alert('WhatsApp reminder sent successfully!');
    } catch (err) {
      console.error('Failed to send reminder:', err);
      alert('Failed to send WhatsApp reminder');
    }
  };

  const getStatusBadge = (status: Meeting['status']) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
      in_progress: 'bg-green-100 text-green-700 border-green-200',
      completed: 'bg-gray-100 text-gray-700 border-gray-200',
      cancelled: 'bg-amber-100 text-amber-700 border-amber-200'
    };

    const icons = {
      scheduled: <Clock className="w-3 h-3" />,
      in_progress: <Video className="w-3 h-3" />,
      completed: <CheckCircle2 className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />
    };

    const labels = {
      scheduled: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {icons[status]}
        {labels[status]}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isUpcoming = (dateStr: string, timeStr: string) => {
    const meetingDateTime = new Date(`${dateStr} ${timeStr}`);
    const now = new Date();
    const timeDiff = meetingDateTime.getTime() - now.getTime();
    // Meeting is upcoming if it's within 15 minutes
    return timeDiff > 0 && timeDiff < 15 * 60 * 1000;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <p className="text-amber-600">{error}</p>
        <Button onClick={loadMeetings} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">No meetings scheduled</h3>
          <p className="text-muted-foreground">Schedule your first meeting to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => (
        <div
          key={meeting.id}
          className="bg-white rounded-xl border border-border shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Meeting Info */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">{meeting.title || meeting.meeting_type}</h3>
                  {getStatusBadge(meeting.status)}
                </div>
              </div>

              {/* Mentor Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {meeting.mentor_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{meeting.mentor_name}</p>
                  <p className="text-xs text-muted-foreground">Quiver Mentor</p>
                </div>
              </div>

              {/* Date and Time */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(meeting.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{meeting.time}</span>
                </div>
              </div>

              {/* WhatsApp Indicator */}
              {meeting.whatsapp_enabled && (
                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 w-fit">
                  <MessageCircle className="w-3 h-3" />
                  <span>WhatsApp reminders enabled</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {meeting.status === 'scheduled' && isUpcoming(meeting.date, meeting.time) && (
                <Button
                  onClick={() => onJoinMeeting?.(meeting.id)}
                  className="bg-primary hover:bg-primary/90"
                  size="sm"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Join Now
                </Button>
              )}

              {meeting.status === 'scheduled' && meeting.whatsapp_enabled && (
                <Button
                  onClick={() => handleSendReminder(meeting.id)}
                  variant="outline"
                  size="sm"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Reminder
                </Button>
              )}

              {meeting.status === 'scheduled' && (
                <Button
                  onClick={() => handleCancelMeeting(meeting.id)}
                  variant="outline"
                  size="sm"
                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
