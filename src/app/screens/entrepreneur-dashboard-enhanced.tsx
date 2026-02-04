import { useState } from "react";
import { MeetingsList } from "../components/meetings-list";
import {
  Calendar as CalendarIcon,
  Video,
  Clock,
  User,
  Sparkles,
  CheckCircle2,
  FileText,
  TrendingUp,
  Plus,
  MessageCircle
} from "lucide-react";

interface EntrepreneurDashboardProps {
  profileData: any;
  onScheduleMeeting: () => void;
  onJoinMeeting: (meetingId: string) => void;
}

export function EntrepreneurDashboard({ profileData, onScheduleMeeting, onJoinMeeting }: EntrepreneurDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const milestones = [
    { id: 1, title: "Business Registration", status: "completed", date: "Nov 15, 2024" },
    { id: 2, title: "Market Research", status: "completed", date: "Nov 20, 2024" },
    { id: 3, title: "Product Development", status: "in_progress", date: "Ongoing" },
    { id: 4, title: "Funding Round", status: "upcoming", date: "Jan 2025" }
  ];

  const resources = [
    { id: 1, title: "Business Plan Template", type: "document", date: "Dec 10, 2024" },
    { id: 2, title: "Financial Projection Guide", type: "guide", date: "Dec 12, 2024" },
    { id: 3, title: "Marketing Strategy Workshop", type: "video", date: "Dec 15, 2024" }
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm py-3 px-5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Quiver Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={onScheduleMeeting} className="inline-flex items-center bg-accent hover:bg-accent/90 text-white font-bold rounded-xl min-h-[48px] px-4 py-2">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Schedule Meeting
              </button>
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <span className="text-white font-semibold">
                  {profileData?.fullName?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Welcome back, {profileData?.fullName || 'Entrepreneur'}! 👋
                </h2>
                <p className="text-gray-500">
                  Here's what's happening with your business journey today.
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  Growth Score
                </div>
                <div className="text-3xl font-bold text-accent">8.5/10</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg inline-flex p-1 gap-1">
              {["overview", "meetings", "milestones", "resources"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-accent text-white"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Video className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Upcoming Meetings</p>
                      <p className="text-2xl font-semibold text-gray-900">3</p>
                    </div>
                  </div>
                  <button onClick={onScheduleMeeting} className="w-full border border-gray-200 rounded-xl py-2 px-4 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                    Schedule New
                  </button>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Completed Tasks</p>
                      <p className="text-2xl font-semibold text-gray-900">12</p>
                    </div>
                  </div>
                  <button className="w-full border border-gray-200 rounded-xl py-2 px-4 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                    View All
                  </button>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Resources</p>
                      <p className="text-2xl font-semibold text-gray-900">8</p>
                    </div>
                  </div>
                  <button className="w-full border border-gray-200 rounded-xl py-2 px-4 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                    Browse
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    className="h-auto p-4 text-left border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    onClick={onScheduleMeeting}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 text-accent" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Schedule Mentorship Call</p>
                        <p className="text-sm text-gray-500">Book a video session with WhatsApp reminders</p>
                      </div>
                    </div>
                  </button>

                  <button className="h-auto p-4 text-left border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-accent" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Chat with AI Assistant</p>
                        <p className="text-sm text-gray-500">Get instant help and guidance</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>}

            {/* Meetings Tab - Uses new MeetingsList component */}
            {activeTab === "meetings" && <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Your Meetings</h3>
                    <p className="text-sm text-gray-500">
                      Manage your scheduled video calls with mentors
                    </p>
                  </div>
                  <button onClick={onScheduleMeeting} className="inline-flex items-center bg-accent hover:bg-accent/90 text-white font-bold rounded-xl min-h-[48px] px-4 py-2">
                    <Plus className="w-4 h-4 mr-2" />
                    New Meeting
                  </button>
                </div>

                {/* Integrated Meetings List Component */}
                <MeetingsList onJoinMeeting={onJoinMeeting} />

                {/* Info Box */}
                <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-accent mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        WhatsApp Reminders Enabled
                      </p>
                      <p className="text-xs text-gray-500">
                        You'll receive WhatsApp notifications before your scheduled meetings.
                        All video calls use Google Meet for high-quality conferencing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>}

            {/* Milestones Tab */}
            {activeTab === "milestones" && <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Growth Milestones</h3>
                <div className="space-y-4">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        milestone.status === 'completed' ? 'bg-accent/10' :
                        milestone.status === 'in_progress' ? 'bg-accent/10' : 'bg-gray-100'
                      }`}>
                        <CheckCircle2 className={`w-5 h-5 ${
                          milestone.status === 'completed' ? 'text-accent' :
                          milestone.status === 'in_progress' ? 'text-accent' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{milestone.title}</p>
                        <p className="text-sm text-gray-500">{milestone.date}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        milestone.status === 'completed' ? 'bg-accent/10 text-accent' :
                        milestone.status === 'in_progress' ? 'bg-accent/10 text-accent' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {milestone.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>}

            {/* Resources Tab */}
            {activeTab === "resources" && <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Learning Resources</h3>
                <div className="space-y-3">
                  {resources.map((resource) => (
                    <div key={resource.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{resource.title}</p>
                        <p className="text-sm text-gray-500">{resource.type} • {resource.date}</p>
                      </div>
                      <button className="border border-gray-200 rounded-xl py-1.5 px-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors">Download</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>}
          </div>
        </div>
      </main>
    </div>
  );
}
