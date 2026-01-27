import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  PhoneOff,
  ExternalLink,
  Copy,
  CheckCircle2,
  Calendar,
  Video,
  Loader2
} from "lucide-react";
import { getMeetLink } from "../../services/api";
import type { MeetLinkResponse } from "../../types/api";

interface GoogleMeetMeetingProps {
  meetingId: string;
  meetingTitle: string;
  onEndCall: () => void;
}

export function GoogleMeetMeeting({ meetingId, meetingTitle, onEndCall }: GoogleMeetMeetingProps) {
  const [meetData, setMeetData] = useState<MeetLinkResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchMeetLink();
  }, [meetingId]);

  const fetchMeetLink = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMeetLink(meetingId);
      setMeetData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get meeting link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (meetData?.meet_link) {
      await navigator.clipboard.writeText(meetData.meet_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoinMeeting = () => {
    if (meetData?.meet_link) {
      window.open(meetData.meet_link, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <PhoneOff className="w-8 h-8 text-red-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">
                Unable to Load Meeting
              </h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={fetchMeetLink}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Try Again
              </Button>
              <Button
                onClick={onEndCall}
                variant="outline"
                className="flex-1"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Video className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{meetingTitle}</h1>
              <p className="text-sm text-muted-foreground">Google Meet Conference</p>
            </div>
          </div>
          <Button
            onClick={onEndCall}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            Leave
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Meeting Info Card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Meeting Details</h2>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Video className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Status</p>
                    <p className="text-sm text-muted-foreground capitalize">{meetData?.status}</p>
                  </div>
                </div>

                {meetData?.recording_enabled && (
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Recording</p>
                      <p className="text-sm text-red-600">This meeting is being recorded</p>
                    </div>
                  </div>
                )}

                {meetData?.calendar_link && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Calendar Event</p>
                      <a
                        href={meetData.calendar_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                      >
                        View in Calendar
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleJoinMeeting}
                className="w-full h-12 bg-primary hover:bg-primary/90"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Join Google Meet
              </Button>

              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="w-full h-12"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Meeting Link
                  </>
                )}
              </Button>
            </div>

            {/* Meeting Link Display */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
              <p className="text-xs text-muted-foreground mb-2">Meeting Link</p>
              <p className="text-sm text-foreground break-all font-mono bg-gray-50 p-3 rounded-lg">
                {meetData?.meet_link}
              </p>
            </div>
          </div>

          {/* Embedded Google Meet (Optional) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
                <iframe
                  src={meetData?.meet_link}
                  allow="camera; microphone; fullscreen; display-capture"
                  className="w-full h-full absolute inset-0"
                  style={{ border: 'none' }}
                  title="Google Meet"
                />
              </div>
            </div>

            {/* Info Banner */}
            <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-sm text-foreground">
                <strong>Tip:</strong> If the meeting doesn't load, click "Join Google Meet"
                to open it in a new window. Make sure pop-ups are enabled for this site.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
