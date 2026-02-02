import { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Users,
  Settings,
  Monitor,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Loader2
} from "lucide-react";
import { getTwilioToken } from "../../services/api";
import twilioVideoService from "../../services/twilio";
import { Room, RemoteParticipant, RemoteTrack, RemoteVideoTrack, RemoteAudioTrack } from 'twilio-video';

interface TwilioVideoMeetingProps {
  meetingId: string;
  meetingTitle: string;
  mentorName: string;
  onEndCall: () => void;
}

export function TwilioVideoMeeting({ meetingId, meetingTitle, mentorName, onEndCall }: TwilioVideoMeetingProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);

  const [chatMessages, setChatMessages] = useState([
    { sender: mentorName, message: "Welcome! I'll be joining shortly.", time: new Date().toLocaleTimeString() }
  ]);
  const [newMessage, setNewMessage] = useState("");

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<Room | null>(null);

  // Connect to Twilio room on mount
  useEffect(() => {
    connectToRoom();
    return () => {
      disconnectFromRoom();
    };
  }, [meetingId]);

  // Meeting duration timer
  useEffect(() => {
    if (isConnected) {
      const timer = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isConnected]);

  const connectToRoom = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Get user info from localStorage
      const userId = localStorage.getItem('user_id') || 'user';
      const userName = localStorage.getItem('user_name') || `User ${userId}`;

      // Get Twilio token from backend
      console.log('Getting Twilio token for meeting:', meetingId);
      const { token, room_name } = await getTwilioToken(meetingId, userName);

      console.log('Connecting to room:', room_name);
      // Join the room
      const room = await twilioVideoService.joinRoom({
        token,
        roomName: room_name
      });

      roomRef.current = room;
      setIsConnected(true);
      setIsConnecting(false);

      // Attach local video
      attachLocalVideo();

      // Setup participant handlers
      setupParticipantHandlers(room);

      // Handle existing participants
      room.participants.forEach(participant => {
        console.log('Existing participant:', participant.identity);
        handleParticipantConnected(participant);
      });

    } catch (err) {
      console.error('Failed to connect to room:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to video call');
      setIsConnecting(false);
    }
  };

  const disconnectFromRoom = () => {
    if (roomRef.current) {
      twilioVideoService.leaveRoom();
      roomRef.current = null;
    }
  };

  const attachLocalVideo = () => {
    const videoTrack = twilioVideoService.getLocalVideoTrack();
    if (videoTrack && localVideoRef.current) {
      const videoElement = videoTrack.attach();
      videoElement.className = 'w-full h-full object-cover';
      localVideoRef.current.innerHTML = '';
      localVideoRef.current.appendChild(videoElement);
    }
  };

  const setupParticipantHandlers = (room: Room) => {
    room.on('participantConnected', handleParticipantConnected);
    room.on('participantDisconnected', handleParticipantDisconnected);
  };

  const handleParticipantConnected = (participant: RemoteParticipant) => {
    console.log('Participant connected:', participant.identity);
    setParticipants(prev => [...prev, participant]);

    // Subscribe to participant's tracks
    participant.tracks.forEach(publication => {
      if (publication.isSubscribed && publication.track) {
        attachTrack(publication.track as RemoteTrack);
      }
    });

    participant.on('trackSubscribed', (track: RemoteTrack) => {
      attachTrack(track);
    });

    participant.on('trackUnsubscribed', (track: RemoteTrack) => {
      detachTrack(track);
    });
  };

  const handleParticipantDisconnected = (participant: RemoteParticipant) => {
    console.log('Participant disconnected:', participant.identity);
    setParticipants(prev => prev.filter(p => p.sid !== participant.sid));
  };

  const attachTrack = (track: RemoteTrack) => {
    if (track.kind === 'video' && remoteVideoRef.current) {
      const videoElement = (track as RemoteVideoTrack).attach();
      videoElement.className = 'w-full h-full object-cover';
      remoteVideoRef.current.innerHTML = '';
      remoteVideoRef.current.appendChild(videoElement);
    } else if (track.kind === 'audio') {
      (track as RemoteAudioTrack).attach();
    }
  };

  const detachTrack = (track: RemoteTrack) => {
    track.detach().forEach(element => element.remove());
  };

  const toggleMute = () => {
    twilioVideoService.toggleAudio(!isMuted);
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    twilioVideoService.toggleVideo(!isVideoOn);
    setIsVideoOn(!isVideoOn);
  };

  const handleEndCall = () => {
    disconnectFromRoom();
    onEndCall();
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([
        ...chatMessages,
        { sender: "You", message: newMessage, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }
      ]);
      setNewMessage("");
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // Show loading or error state
  if (isConnecting) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <div className="text-white space-y-2">
            <h2 className="text-xl font-semibold">Connecting to meeting...</h2>
            <p className="text-gray-400">Please wait while we set up your video call</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-6">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
            <VideoOff className="w-8 h-8 text-amber-500" />
          </div>
          <div className="text-white space-y-2">
            <h2 className="text-xl font-semibold">Connection Failed</h2>
            <p className="text-gray-400">{error}</p>
          </div>
          <div className="space-y-2">
            <Button onClick={connectToRoom} className="w-full bg-primary hover:bg-primary/90">
              Try Again
            </Button>
            <Button onClick={onEndCall} variant="outline" className="w-full text-white border-gray-600 hover:bg-gray-800">
              Exit Meeting
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-white">{meetingTitle}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {formatDuration(duration)}
              </span>
              <span>Meeting ID: {meetingId}</span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {participants.length + 1} participant{participants.length !== 0 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullScreen}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors"
            >
              {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Video Area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Remote Video (Mentor) */}
        <div className={`${showChat ? 'flex-1' : 'w-full'} relative bg-gray-800`}>
          <div ref={remoteVideoRef} className="w-full h-full bg-gradient-to-br from-blue-900 to-teal-900" />

          {participants.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                  <span className="text-5xl text-white font-semibold">
                    {mentorName.charAt(0)}
                  </span>
                </div>
                <div className="text-white space-y-1">
                  <p className="text-xl font-semibold">{mentorName}</p>
                  <p className="text-sm text-gray-300">Waiting to join...</p>
                </div>
              </div>
            </div>
          )}

          {/* Your Video (Picture-in-Picture) */}
          <div className="absolute bottom-6 right-6 w-64 h-48 bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-700 shadow-xl">
            <div ref={localVideoRef} className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800" />
            {!isVideoOn && (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <VideoOff className="w-8 h-8 text-gray-500" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
              You {isMuted && <span>(muted)</span>}
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-96 bg-white border-l border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Meeting Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`space-y-1 ${msg.sender === "You" ? "text-right" : ""}`}>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {msg.sender === "You" ? (
                      <>
                        <span className="ml-auto">{msg.time}</span>
                        <span className="font-medium">{msg.sender}</span>
                      </>
                    ) : (
                      <>
                        <span className="font-medium">{msg.sender}</span>
                        <span>{msg.time}</span>
                      </>
                    )}
                  </div>
                  <div className={`inline-block px-4 py-2 rounded-lg ${
                    msg.sender === "You"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-foreground"
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-4 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  className="bg-primary hover:bg-primary/90"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          {/* Mic Toggle */}
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              isMuted
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              !isVideoOn
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            title={isVideoOn ? "Stop Video" : "Start Video"}
          >
            {isVideoOn ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Speaker Toggle */}
          <button
            onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              isSpeakerMuted
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            title={isSpeakerMuted ? "Unmute Speaker" : "Mute Speaker"}
          >
            {isSpeakerMuted ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Screen Share */}
          <button
            className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
            title="Share Screen"
          >
            <Monitor className="w-6 h-6 text-white" />
          </button>

          {/* Chat Toggle */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              showChat
                ? "bg-primary hover:bg-primary/90"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            title="Toggle Chat"
          >
            <MessageSquare className="w-6 h-6 text-white" />
          </button>

          {/* End Call */}
          <button
            onClick={handleEndCall}
            className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center transition-colors ml-4"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Control Labels */}
        <div className="flex items-center justify-center gap-4 mt-2">
          <span className="text-xs text-gray-400 w-14 text-center">
            {isMuted ? "Unmute" : "Mute"}
          </span>
          <span className="text-xs text-gray-400 w-14 text-center">
            {isVideoOn ? "Stop" : "Start"}
          </span>
          <span className="text-xs text-gray-400 w-14 text-center">
            {isSpeakerMuted ? "Unmute" : "Mute"}
          </span>
          <span className="text-xs text-gray-400 w-14 text-center">Share</span>
          <span className="text-xs text-gray-400 w-14 text-center">Chat</span>
          <span className="text-xs text-amber-400 w-14 text-center ml-4">Leave</span>
        </div>
      </div>
    </div>
  );
}
