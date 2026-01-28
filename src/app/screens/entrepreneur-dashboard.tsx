import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { AIAssistant } from "../components/ai-assistant";
import { UserMenu } from "../components/user-menu";
import { LanguageSelector } from "../components/language-selector";
import { listMeetings } from "../../services/api";
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
  ArrowRight,
  Target,
  Award,
  MessageCircle,
  Bell,
  ChevronRight,
  Briefcase,
  BarChart3,
  Handshake,
  Loader2
} from "lucide-react";

interface EntrepreneurDashboardProps {
  profileData: any;
  onScheduleMeeting: () => void;
  onJoinMeeting: (meetingId: string) => void;
  onLogout: () => void;
  onViewGrowthPlan?: () => void;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  mentor: string;
  mentorRole: string;
  type: string;
  status: string;
  avatar: string;
  meetLink?: string;
}

export function EntrepreneurDashboard({
  profileData,
  onScheduleMeeting,
  onJoinMeeting,
  onLogout,
  onViewGrowthPlan
}: EntrepreneurDashboardProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [pastMeetings, setPastMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);

  const userName = profileData?.fullName || localStorage.getItem('user_name') || 'Entrepreneur';
  const businessName = profileData?.businessName || localStorage.getItem('business_name') || 'Your Business';

  // Fetch meetings from API
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoadingMeetings(true);
        const response = await listMeetings();

        const now = new Date();
        const upcoming: Meeting[] = [];
        const past: Meeting[] = [];

        (response.meetings || []).forEach((meeting: any) => {
          const startTime = new Date(meeting.start_time);
          // Use meet_link if it's a real Google Meet link, otherwise use calendar link
          let meetLink = meeting.google_meet_room?.meet_link;
          const calendarLink = meeting.google_meet_room?.calendar_link;

          // If meet link is a demo link (not a real Google Meet), prefer calendar link
          if (meetLink && !meetLink.includes('meet.google.com/')) {
            meetLink = calendarLink || meetLink;
          }

          const formattedMeeting: Meeting = {
            id: meeting.id || meeting.meeting_id,
            title: meeting.title || 'Meeting with Quiver Team',
            date: startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            duration: '1 hour',
            mentor: 'Quiver Team',
            mentorRole: 'Support Team',
            type: meeting.meeting_type || 'Consultation',
            status: meeting.status,
            avatar: 'QT',
            meetLink: meetLink || calendarLink
          };

          if (startTime > now && meeting.status === 'scheduled') {
            upcoming.push(formattedMeeting);
          } else {
            past.push(formattedMeeting);
          }
        });

        setUpcomingMeetings(upcoming);
        setPastMeetings(past);
      } catch (error) {
        console.error('Failed to fetch meetings:', error);
      } finally {
        setLoadingMeetings(false);
      }
    };

    fetchMeetings();
  }, []);

  const milestones = [
    { id: 1, title: t('dashboard.progress.milestones.profile'), status: "completed", date: "Jan 15, 2026", icon: User },
    { id: 2, title: t('dashboard.progress.milestones.consultation'), status: "completed", date: "Jan 15, 2026", icon: MessageCircle },
    { id: 3, title: t('dashboard.progress.milestones.businessReview'), status: "in_progress", date: "In Progress", icon: Briefcase },
    { id: 4, title: t('dashboard.progress.milestones.growthPlan'), status: "pending", date: "Upcoming", icon: Target },
    { id: 5, title: t('dashboard.progress.milestones.capitalReady'), status: "pending", date: "Pending", icon: Award }
  ];

  const quickStats = [
    {
      label: t('dashboard.overview.upcomingMeetings'),
      value: upcomingMeetings.length,
      icon: Video,
      color: "primary",
      bgColor: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      label: t('dashboard.overview.milestones'),
      value: `${milestones.filter(m => m.status === 'completed').length}/${milestones.length}`,
      icon: CheckCircle2,
      color: "accent",
      bgColor: "bg-accent/10",
      iconColor: "text-accent"
    },
    {
      label: t('dashboard.overview.pendingDocs'),
      value: 2,
      icon: FileText,
      color: "secondary",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600"
    }
  ];

  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const progressPercent = Math.round((completedMilestones / milestones.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-white pb-20 md:pb-0 mobile-full-screen">
      {/* Header - Mobile-first */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg md:rounded-xl flex items-center justify-center shadow-sm">
                <Handshake className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base md:text-lg font-bold text-gray-900">Quiver</h1>
                <p className="text-xs text-muted-foreground -mt-0.5">{t('dashboard.title')}</p>
              </div>
            </div>

            {/* Right Actions - Mobile optimized */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
              <LanguageSelector variant="compact" />

              {/* Notifications - Touch friendly */}
              <button className="relative p-2 rounded-lg md:rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-touch min-w-touch flex items-center justify-center">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full"></span>
              </button>

              {/* Schedule Button - Desktop only */}
              <Button
                onClick={onScheduleMeeting}
                className="bg-primary hover:bg-primary/90 rounded-xl shadow-sm hidden md:flex"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                {t('dashboard.overview.scheduleMeeting')}
              </Button>

              {/* User Menu */}
              <UserMenu
                userName={userName}
                userEmail={profileData?.email || localStorage.getItem('user_email') || undefined}
                tenantName={localStorage.getItem('tenant_name') || 'Quiver'}
                onLogout={onLogout}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile-first */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Welcome Section */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                {t('dashboard.welcome')}, {userName.split(' ')[0]}!
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                {businessName} • {progressPercent}% complete
              </p>
            </div>

            {/* Mobile Schedule Button - Full width on mobile */}
            <Button
              onClick={onScheduleMeeting}
              className="bg-primary hover:bg-primary/90 active:bg-primary/80 rounded-xl shadow-sm md:hidden w-full min-h-[48px]"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('dashboard.overview.scheduleMeeting')}
            </Button>
          </div>

          {/* Progress Bar - Compact on mobile */}
          <div className="mt-4 bg-white rounded-xl md:rounded-2xl p-3 md:p-4 border border-primary/10 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs md:text-sm font-medium text-gray-700">Journey Progress</span>
              <span className="text-xs md:text-sm font-bold text-primary">{progressPercent}%</span>
            </div>
            <div className="h-1.5 md:h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabs - Mobile-first with horizontal scroll */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide scroll-momentum">
            <TabsList className="bg-white border border-primary/10 p-1 rounded-xl md:rounded-2xl shadow-sm w-max sm:w-auto flex">
              <TabsTrigger
                value="overview"
                className="rounded-lg md:rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 md:px-6 py-2 min-h-touch text-sm md:text-base whitespace-nowrap"
              >
                {t('dashboard.tabs.overview')}
              </TabsTrigger>
              <TabsTrigger
                value="meetings"
                className="rounded-lg md:rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 md:px-6 py-2 min-h-touch text-sm md:text-base whitespace-nowrap"
              >
                {t('dashboard.tabs.meetings')}
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="rounded-lg md:rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-4 md:px-6 py-2 min-h-touch text-sm md:text-base whitespace-nowrap"
              >
                {t('dashboard.tabs.progress')}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab - Mobile-first */}
          <TabsContent value="overview" className="space-y-4 md:space-y-6">
            {/* Quick Stats - Horizontal scroll on mobile */}
            <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0 md:overflow-visible scrollbar-hide scroll-momentum">
              <div className="flex gap-3 md:grid md:grid-cols-3 md:gap-4 min-w-max md:min-w-0">
                {quickStats.map((stat, index) => (
                  <Card
                    key={index}
                    className="p-4 md:p-5 border-primary/10 hover:border-primary/20 active:border-primary/30 transition-colors rounded-xl md:rounded-2xl shadow-sm min-w-[160px] md:min-w-0"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs md:text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                        <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.iconColor}`} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Next Meeting Card */}
            {upcomingMeetings.length > 0 && (
              <Card className="overflow-hidden border-0 shadow-lg rounded-2xl">
                <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-5 h-5" />
                    <span className="text-sm font-medium text-white/80">{t('dashboard.overview.nextMeeting')}</span>
                  </div>
                  <h3 className="text-xl font-bold">{upcomingMeetings[0].title}</h3>
                </div>
                <div className="p-6 bg-white">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold text-lg">
                      {upcomingMeetings[0].avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{upcomingMeetings[0].mentor}</p>
                      <p className="text-sm text-muted-foreground">{upcomingMeetings[0].mentorRole}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{upcomingMeetings[0].date}</p>
                      <p className="text-sm text-muted-foreground">{upcomingMeetings[0].time} • {upcomingMeetings[0].duration}</p>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 rounded-xl h-12 text-base font-semibold shadow-sm"
                    onClick={() => {
                      if (upcomingMeetings[0].meetLink) {
                        window.open(upcomingMeetings[0].meetLink, '_blank');
                      } else {
                        onJoinMeeting(upcomingMeetings[0].id);
                      }
                    }}
                  >
                    <Video className="w-5 h-5 mr-2" />
                    {t('dashboard.overview.joinMeeting')}
                  </Button>
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={onScheduleMeeting}
                className="group bg-white border-2 border-primary/10 rounded-2xl p-6 hover:border-primary/30 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <CalendarIcon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                      Schedule New Meeting
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Book a session with Quiver mentors
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
              </button>

              <button
                onClick={onViewGrowthPlan}
                className="group bg-white border-2 border-primary/10 rounded-2xl p-6 hover:border-primary/30 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <TrendingUp className="w-7 h-7 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-accent transition-colors">
                      {t('dashboard.overview.viewGrowthPlan')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Track your business progress
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors" />
                </div>
              </button>
            </div>

            {/* Recent Activity */}
            <Card className="p-6 border-primary/10 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                <button className="text-sm text-primary hover:text-primary/80 font-medium">View All</button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-green-50 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Onboarding completed</p>
                    <p className="text-sm text-muted-foreground">Your profile has been verified</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 days ago</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Meeting scheduled</p>
                    <p className="text-sm text-muted-foreground">Growth Strategy Session on Jan 18</p>
                  </div>
                  <span className="text-xs text-muted-foreground">3 days ago</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Meetings Tab */}
          <TabsContent value="meetings" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t('dashboard.meetings.upcoming')}</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage your scheduled sessions</p>
              </div>
              <Button onClick={onScheduleMeeting} className="bg-primary hover:bg-primary/90 rounded-xl shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>

            {/* Upcoming Meetings */}
            <div className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <Card
                  key={meeting.id}
                  className="p-5 border-primary/10 hover:border-primary/20 hover:shadow-md transition-all rounded-2xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                        {meeting.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1">{meeting.title}</h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {meeting.mentor}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            {meeting.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {meeting.time}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {meeting.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      className="bg-primary hover:bg-primary/90 rounded-xl shadow-sm w-full sm:w-auto"
                      onClick={() => {
                        if (meeting.meetLink) {
                          window.open(meeting.meetLink, '_blank');
                        } else {
                          onJoinMeeting(meeting.id);
                        }
                      }}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Join
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Past Meetings */}
            <div className="pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.meetings.past')}</h3>
              <div className="space-y-4">
                {pastMeetings.map((meeting) => (
                  <Card
                    key={meeting.id}
                    className="p-5 border-primary/10 bg-gray-50/50 rounded-2xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg flex-shrink-0">
                        {meeting.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{meeting.title}</h4>
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {meeting.mentor}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            {meeting.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {loadingMeetings ? (
              <Card className="p-12 border-primary/10 rounded-2xl text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading meetings...</p>
              </Card>
            ) : upcomingMeetings.length === 0 && (
              <Card className="p-12 border-primary/10 rounded-2xl text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('dashboard.meetings.noUpcoming')}</h3>
                <p className="text-muted-foreground mb-6">{t('dashboard.meetings.scheduleFirst')}</p>
                <Button onClick={onScheduleMeeting} className="bg-primary hover:bg-primary/90 rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Your First Meeting
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('dashboard.progress.title')}</h2>
              <p className="text-sm text-muted-foreground mt-1">Track your entrepreneurship journey with Quiver</p>
            </div>

            {/* Overall Progress Card */}
            <Card className="p-6 border-primary/10 rounded-2xl shadow-sm bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
                  <p className="text-muted-foreground">{completedMilestones} of {milestones.length} milestones completed</p>
                </div>
                <div className="ml-auto">
                  <div className="text-3xl font-bold text-primary">{progressPercent}%</div>
                </div>
              </div>
              <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </Card>

            {/* Milestones Timeline */}
            <Card className="p-6 border-primary/10 rounded-2xl shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-6">Journey Milestones</h3>
              <div className="space-y-1">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="relative">
                    {/* Connector Line */}
                    {index < milestones.length - 1 && (
                      <div className={`absolute left-5 top-12 w-0.5 h-8 ${
                        milestone.status === 'completed' ? 'bg-accent' : 'bg-gray-200'
                      }`} />
                    )}

                    <div className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                      milestone.status === 'completed'
                        ? 'bg-green-50'
                        : milestone.status === 'in_progress'
                        ? 'bg-primary/5'
                        : 'bg-gray-50'
                    }`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        milestone.status === 'completed'
                          ? 'bg-accent text-white'
                          : milestone.status === 'in_progress'
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        {milestone.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : milestone.status === 'in_progress' ? (
                          <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                        ) : (
                          <milestone.icon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          milestone.status === 'completed'
                            ? 'text-gray-900'
                            : milestone.status === 'in_progress'
                            ? 'text-primary'
                            : 'text-gray-500'
                        }`}>
                          {milestone.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">{milestone.date}</p>
                      </div>
                      {milestone.status === 'completed' && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                          Completed
                        </span>
                      )}
                      {milestone.status === 'in_progress' && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Growth Plan CTA */}
            <Card className="p-6 border-primary/10 rounded-2xl shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl" />
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">AI-Powered Growth Plan</h3>
                  <p className="text-sm text-muted-foreground">Get personalized recommendations for your business</p>
                </div>
                <Button
                  onClick={onViewGrowthPlan}
                  className="bg-primary hover:bg-primary/90 rounded-xl shadow-sm"
                >
                  View Plan
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* AI Assistant */}
      <AIAssistant message={t('dashboard.overview.aiHelp') || "Need help with your dashboard?"} />
    </div>
  );
}
