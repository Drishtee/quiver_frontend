import { useState, useEffect } from "react";
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
  Maximize2
} from "lucide-react";

interface VideoMeetingProps {
  meetingId: string;
  meetingTitle: string;
  mentorName: string;
  onEndCall: () => void;
}

export function VideoMeeting({ meetingId, meetingTitle, mentorName, onEndCall }: VideoMeetingProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [duration, setDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState([
    { sender: mentorName, message: "Welcome! Let me know if you have any questions.", time: "2:00 PM" }
  ]);
  const [newMessage, setNewMessage] = useState("");

  // Meeting duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
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

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-white">{meetingTitle}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Recording {formatDuration(duration)}
              </span>
              <span>Meeting ID: {meetingId}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Video Area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Primary Video (Mentor) */}
        <div className={`${showChat ? 'flex-1' : 'w-full'} relative bg-gray-800 flex items-center justify-center`}>
          {/* Simulated video feed */}
          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-teal-900 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                <span className="text-5xl text-white font-semibold">
                  {mentorName.charAt(0)}
                </span>
              </div>
              <div className="text-white space-y-1">
                <p className="text-xl font-semibold">{mentorName}</p>
                <p className="text-sm text-gray-300">Quiver Mentor</p>
              </div>
            </div>
          </div>

          {/* Your Video (Picture-in-Picture) */}
          <div className="absolute bottom-6 right-6 w-64 h-48 bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-700 shadow-xl">
            {isVideoOn ? (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                    <span className="text-2xl text-white font-semibold">You</span>
                  </div>
                  <p className="text-white text-sm mt-2">You</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <VideoOff className="w-8 h-8 text-gray-500" />
              </div>
            )}
          </div>

          {/* Full Screen Button */}
          <button className="absolute top-4 right-4 p-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-white transition-colors">
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-96 bg-white border-l border-border flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Meeting Chat</h3>
            </div>

            {/* Chat Messages */}
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

            {/* Chat Input */}
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
            onClick={() => setIsMuted(!isMuted)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              isMuted 
                ? "bg-amber-500 hover:bg-amber-600" 
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Video Toggle */}
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              !isVideoOn 
                ? "bg-amber-500 hover:bg-amber-600" 
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {isVideoOn ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Screen Share */}
          <button className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
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
          >
            <MessageSquare className="w-6 h-6 text-white" />
          </button>

          {/* End Call */}
          <button
            onClick={onEndCall}
            className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center transition-colors ml-4"
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
          <span className="text-xs text-gray-400 w-14 text-center">Share</span>
          <span className="text-xs text-gray-400 w-14 text-center">Chat</span>
          <span className="text-xs text-amber-400 w-14 text-center ml-4">Leave</span>
        </div>
      </div>
    </div>
  );
}
