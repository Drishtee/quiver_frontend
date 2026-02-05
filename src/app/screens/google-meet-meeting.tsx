import { useState, useEffect, useRef, useCallback } from "react";
import {
  PhoneOff,
  ExternalLink,
  Copy,
  CheckCircle2,
  Calendar,
  Video,
  Loader2,
  Clock
} from "lucide-react";
import { getMeetLink } from "../../services/api";
import type { MeetLinkResponse } from "../../types/api";

interface GoogleMeetMeetingProps {
  meetingId: string;
  meetingTitle: string;
  onEndCall: () => void;
}

function useCountdown(targetDate: string | undefined) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!targetDate) return;

    const update = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("Starting now...");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

export function GoogleMeetMeeting({ meetingId, meetingTitle, onEndCall }: GoogleMeetMeetingProps) {
  const [meetData, setMeetData] = useState<MeetLinkResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const countdown = useCountdown(meetData?.can_join === false ? meetData.start_time : undefined);

  const fetchMeetLink = useCallback(async () => {
    try {
      setError(null);
      const data = await getMeetLink(meetingId);
      setMeetData(data);

      // Stop polling once user can join
      if (data.can_join && pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get meeting link');
    } finally {
      setIsLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    fetchMeetLink();
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchMeetLink]);

  // Start polling when in waiting room
  useEffect(() => {
    if (meetData && !meetData.can_join && !pollIntervalRef.current) {
      pollIntervalRef.current = setInterval(fetchMeetLink, 30000);
    }
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [meetData?.can_join, fetchMeetLink]);

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto" />
          <p className="text-gray-500">Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <PhoneOff className="w-8 h-8 text-red-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">
                Unable to Load Meeting
              </h2>
              <p className="text-gray-500">{error}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchMeetLink}
                className="flex-1 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl min-h-[48px] px-4 inline-flex items-center justify-center"
              >
                Try Again
              </button>
              <button
                onClick={onEndCall}
                className="flex-1 border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-xl min-h-[48px] px-4 inline-flex items-center justify-center"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Waiting room: user cannot join yet
  if (meetData && !meetData.can_join) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-accent" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">
                {meetingTitle}
              </h2>
              <p className="text-gray-500">{meetData.message}</p>
            </div>

            {meetData.start_time && countdown && (
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Meeting starts in</p>
                <p className="text-3xl font-bold text-accent">{countdown}</p>
                <p className="text-xs text-gray-400">
                  {new Date(meetData.start_time).toLocaleString()}
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Checking automatically...</span>
            </div>

            <button
              onClick={onEndCall}
              className="w-full border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-xl min-h-[48px] px-4 inline-flex items-center justify-center"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
              <Video className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{meetingTitle}</h1>
              <p className="text-sm text-gray-500">Google Meet Conference</p>
            </div>
          </div>
          <button
            onClick={onEndCall}
            className="border-2 border-red-200 text-red-600 hover:bg-red-50 bg-white font-medium rounded-xl min-h-[48px] px-4 inline-flex items-center justify-center"
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            Leave
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Meeting Info Card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Meeting Details</h2>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Video className="w-5 h-5 text-accent mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Status</p>
                    <p className="text-sm text-gray-500 capitalize">{meetData?.status}</p>
                  </div>
                </div>

                {meetData?.recording_enabled && (
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Recording</p>
                      <p className="text-sm text-amber-600">Recording enabled - please start recording when the meeting begins</p>
                    </div>
                  </div>
                )}

                {meetData?.calendar_link && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-accent mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Calendar Event</p>
                      <a
                        href={meetData.calendar_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-accent hover:underline inline-flex items-center gap-1"
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
              <button
                onClick={handleJoinMeeting}
                className="w-full bg-accent hover:bg-accent/90 text-white font-bold rounded-xl min-h-[48px] px-4 inline-flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Join Google Meet
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-xl min-h-[48px] px-4 inline-flex items-center justify-center"
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
              </button>
            </div>

            {/* Meeting Link Display */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <p className="text-xs text-gray-500 mb-2">Meeting Link</p>
              <p className="text-sm text-gray-900 break-all font-mono bg-gray-50 p-3 rounded-lg">
                {meetData?.meet_link}
              </p>
            </div>
          </div>

          {/* Embedded Google Meet (Optional) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
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
            <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-900">
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
