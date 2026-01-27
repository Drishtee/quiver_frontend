import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { AIAssistant } from "../components/ai-assistant";
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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Quiver Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={onScheduleMeeting} className="bg-primary hover:bg-primary/90">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
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
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl border border-blue-100 p-8">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  Welcome back, {profileData?.fullName || 'Entrepreneur'}! 👋
                </h2>
                <p className="text-muted-foreground">
                  Here's what's happening with your business journey today.
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingUp className="w-4 h-4" />
                  Growth Score
                </div>
                <div className="text-3xl font-bold text-primary">8.5/10</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white border border-border">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="meetings">Meetings</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Video className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Upcoming Meetings</p>
                      <p className="text-2xl font-semibold text-foreground">3</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={onScheduleMeeting}>
                    Schedule New
                  </Button>
                </Card>

                <Card className="p-6 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completed Tasks</p>
                      <p className="text-2xl font-semibold text-foreground">12</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    View All
                  </Button>
                </Card>

                <Card className="p-6 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Resources</p>
                      <p className="text-2xl font-semibold text-foreground">8</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Browse
                  </Button>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-4 justify-start"
                    onClick={onScheduleMeeting}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Schedule Mentorship Call</p>
                        <p className="text-sm text-muted-foreground">Book a video session with WhatsApp reminders</p>
                      </div>
                    </div>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 justify-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Chat with AI Assistant</p>
                        <p className="text-sm text-muted-foreground">Get instant help and guidance</p>
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Meetings Tab - Uses new MeetingsList component */}
            <TabsContent value="meetings" className="space-y-6">
              <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Your Meetings</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your scheduled video calls with mentors
                    </p>
                  </div>
                  <Button onClick={onScheduleMeeting} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    New Meeting
                  </Button>
                </div>

                {/* Integrated Meetings List Component */}
                <MeetingsList onJoinMeeting={onJoinMeeting} />

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground mb-1">
                        WhatsApp Reminders Enabled
                      </p>
                      <p className="text-xs text-muted-foreground">
                        You'll receive WhatsApp notifications before your scheduled meetings.
                        All video calls use Google Meet for high-quality conferencing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Milestones Tab */}
            <TabsContent value="milestones" className="space-y-6">
              <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Growth Milestones</h3>
                <div className="space-y-4">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        milestone.status === 'completed' ? 'bg-green-100' :
                        milestone.status === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <CheckCircle2 className={`w-5 h-5 ${
                          milestone.status === 'completed' ? 'text-green-600' :
                          milestone.status === 'in_progress' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{milestone.title}</p>
                        <p className="text-sm text-muted-foreground">{milestone.date}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        milestone.status === 'completed' ? 'bg-green-100 text-green-700' :
                        milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {milestone.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-6">
              <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Learning Resources</h3>
                <div className="space-y-3">
                  {resources.map((resource) => (
                    <div key={resource.id} className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{resource.title}</p>
                        <p className="text-sm text-muted-foreground">{resource.type} • {resource.date}</p>
                      </div>
                      <Button size="sm" variant="outline">Download</Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* AI Assistant */}
      <AIAssistant message="Need help? Ask me anything!" />
    </div>
  );
}
