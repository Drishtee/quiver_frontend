import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { UserMenu } from "../components/user-menu";
import { LanguageSelector } from "../components/language-selector";
import { listMeetings, getMyProfile } from "../../services/api";
import type { MyProfileResponse } from "../../services/api";
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
  Loader2,
  Phone,
  Mail,
  MapPin,
  Building2
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
  startTime?: Date;
}

function getTimeGreeting(t: (key: string) => string): string {
  const hour = new Date().getHours();
  if (hour < 12) return t('dashboard.greeting.morning');
  if (hour < 17) return t('dashboard.greeting.afternoon');
  return t('dashboard.greeting.evening');
}

function getCountdown(startTime?: Date): string | null {
  if (!startTime) return null;
  const now = new Date();
  const diff = startTime.getTime() - now.getTime();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

// SVG Circular Progress Ring
function ProgressRing({ percent, size = 80, stroke = 6 }: { percent: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-white/20"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-white transition-all duration-700"
      />
    </svg>
  );
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
  const [myProfile, setMyProfile] = useState<MyProfileResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const userName = myProfile?.profile?.full_name || myProfile?.profile?.owner_name || myProfile?.profile?.fullName || profileData?.fullName || localStorage.getItem('user_name') || 'Entrepreneur';
  const businessName = myProfile?.profile?.business_name || profileData?.businessName || localStorage.getItem('business_name') || 'Your Business';
  const firstName = userName.split(' ')[0];

  // Fetch user profile from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const data = await getMyProfile();
        setMyProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

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
          let meetLink = meeting.google_meet_room?.meet_link;
          const calendarLink = meeting.google_meet_room?.calendar_link;

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
            meetLink: meetLink || calendarLink,
            startTime
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
    { id: 3, title: t('dashboard.progress.milestones.businessReview'), status: "in_progress", date: t('dashboard.progress.inProgress'), icon: Briefcase },
    { id: 4, title: t('dashboard.progress.milestones.growthPlan'), status: "pending", date: "", icon: Target },
    { id: 5, title: t('dashboard.progress.milestones.capitalReady'), status: "pending", date: "", icon: Award }
  ];

  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const progressPercent = Math.round((completedMilestones / milestones.length) * 100);

  const quickStats = useMemo(() => [
    {
      label: t('dashboard.overview.upcomingMeetings'),
      value: upcomingMeetings.length,
      icon: Video,
      stripeColor: "border-l-accent",
      bgColor: "bg-gradient-to-br from-accent/10 to-accent/5",
      iconColor: "text-white",
      iconBg: "bg-gradient-to-br from-accent to-accent/80"
    },
    {
      label: t('dashboard.overview.milestones'),
      value: `${completedMilestones}/${milestones.length}`,
      icon: CheckCircle2,
      stripeColor: "border-l-accent",
      bgColor: "bg-gradient-to-br from-accent/10 to-accent/5",
      iconColor: "text-white",
      iconBg: "bg-gradient-to-br from-accent to-accent/80"
    },
    {
      label: t('dashboard.overview.pendingDocs'),
      value: 2,
      icon: FileText,
      stripeColor: "border-l-gray-400",
      bgColor: "bg-gradient-to-br from-gray-50 to-gray-50/50",
      iconColor: "text-white",
      iconBg: "bg-gradient-to-br from-amber-500 to-amber-400"
    }
  ], [upcomingMeetings.length, completedMilestones, milestones.length, t]);

  const greeting = getTimeGreeting(t);

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0 mobile-full-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center gap-2 md:gap-3">
              <img src="/logo.jpg" alt="Quiver Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
              <div className="hidden sm:block">
                <h1 className="text-base md:text-lg font-bold text-gray-900">Quiver</h1>
                <p className="text-xs text-gray-500 -mt-0.5">{t('dashboard.title')}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
              <LanguageSelector variant="compact" />
              <button className="relative p-2 rounded-lg md:rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-touch min-w-touch flex items-center justify-center">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full"></span>
              </button>
              <Button
                onClick={onScheduleMeeting}
                className="bg-accent hover:bg-accent/90 rounded-xl shadow-sm hidden md:flex"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                {t('dashboard.overview.scheduleMeeting')}
              </Button>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Welcome Hero Card */}
        <div className="mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-accent via-accent/50 to-accent rounded-2xl shadow-xl p-5 sm:p-6 md:p-8 text-white relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4"></div>

            <div className="relative z-10 flex items-center gap-4 sm:gap-5">
              {/* User Initial Avatar */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl sm:text-3xl flex-shrink-0 border border-white/20">
                {firstName.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
                  {greeting}, {firstName}!
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-sm md:text-base text-white/80 truncate">{businessName}</span>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white/90">
                    {progressPercent}% {t('dashboard.overview.complete')}
                  </span>
                </div>
              </div>

              {/* Circular Progress Ring - Hidden on very small mobile */}
              <div className="hidden sm:flex flex-col items-center flex-shrink-0">
                <div className="relative">
                  <ProgressRing percent={progressPercent} size={72} stroke={5} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{progressPercent}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Schedule Button */}
          <Button
            onClick={onScheduleMeeting}
            className="bg-accent hover:bg-accent/90 active:bg-accent/80 rounded-xl shadow-sm md:hidden w-full min-h-[48px] mt-3"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('dashboard.overview.scheduleMeeting')}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide scroll-momentum">
            <TabsList className="bg-white border border-gray-200 p-1 rounded-xl md:rounded-2xl shadow-sm w-max sm:w-auto flex">
              <TabsTrigger
                value="overview"
                className="rounded-lg md:rounded-xl data-[state=active]:bg-accent data-[state=active]:text-white px-4 md:px-6 py-2 min-h-touch text-sm md:text-base whitespace-nowrap"
              >
                {t('dashboard.tabs.overview')}
              </TabsTrigger>
              <TabsTrigger
                value="meetings"
                className="rounded-lg md:rounded-xl data-[state=active]:bg-accent data-[state=active]:text-white px-4 md:px-6 py-2 min-h-touch text-sm md:text-base whitespace-nowrap"
              >
                {t('dashboard.tabs.meetings')}
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="rounded-lg md:rounded-xl data-[state=active]:bg-accent data-[state=active]:text-white px-4 md:px-6 py-2 min-h-touch text-sm md:text-base whitespace-nowrap"
              >
                {t('dashboard.tabs.progress')}
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="rounded-lg md:rounded-xl data-[state=active]:bg-accent data-[state=active]:text-white px-4 md:px-6 py-2 min-h-touch text-sm md:text-base whitespace-nowrap"
              >
                {t('dashboard.tabs.profile')}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 md:space-y-6">
            {/* Stat Cards - Vertical stack on mobile, grid on desktop */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              {quickStats.map((stat, index) => (
                <Card
                  key={index}
                  className={`p-4 md:p-5 border-l-4 ${stat.stripeColor} rounded-2xl shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Next Meeting Card */}
            {upcomingMeetings.length > 0 && (
              <Card className="overflow-hidden border-0 shadow-lg rounded-2xl">
                <div className="bg-accent p-5 sm:p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      <span className="text-sm font-medium text-white/80">{t('dashboard.overview.nextMeeting')}</span>
                    </div>
                    {(() => {
                      const countdown = getCountdown(upcomingMeetings[0].startTime);
                      return countdown ? (
                        <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">
                          {t('dashboard.overview.startsIn', { hours: countdown.split('h')[0], minutes: countdown.split('h ')[1]?.replace('m', '') || '0' })}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <h3 className="text-xl font-bold">{upcomingMeetings[0].title}</h3>
                </div>
                <div className="p-5 sm:p-6 bg-white">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl bg-gradient-to-br from-accent/20 to-accent/20 flex items-center justify-center text-accent font-bold text-xl">
                      {upcomingMeetings[0].avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{upcomingMeetings[0].mentor}</p>
                      <p className="text-sm text-gray-500">{upcomingMeetings[0].mentorRole}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{upcomingMeetings[0].date}</p>
                      <p className="text-sm text-gray-500">{upcomingMeetings[0].time} &bull; {upcomingMeetings[0].duration}</p>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-accent hover:bg-accent/90 rounded-xl h-12 text-base font-semibold shadow-sm"
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

            {/* Empty meeting state on overview */}
            {!loadingMeetings && upcomingMeetings.length === 0 && (
              <Card className="p-8 border-gray-200 rounded-2xl text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('dashboard.overview.noMeetings')}</h3>
                <p className="text-gray-500 mb-4">{t('dashboard.overview.scheduleFirst')}</p>
                <Button onClick={onScheduleMeeting} className="bg-accent hover:bg-accent/90 rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('dashboard.overview.scheduleMeeting')}
                </Button>
              </Card>
            )}

            {/* Quick Actions - Full width stacked on mobile, side-by-side on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={onScheduleMeeting}
                className="group bg-white border-2 border-gray-200 rounded-2xl p-5 md:p-6 hover:border-accent/30 hover:shadow-md transition-all text-left min-h-[100px]"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:from-accent/30 group-hover:to-accent/20 transition-colors flex-shrink-0">
                    <CalendarIcon className="w-7 h-7 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-accent transition-colors">
                      {t('dashboard.overview.scheduleNew')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t('dashboard.overview.scheduleNewDesc')}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors mt-1" />
                </div>
              </button>

              <button
                onClick={onViewGrowthPlan}
                className="group bg-white border-2 border-gray-200 rounded-2xl p-5 md:p-6 hover:border-accent/30 hover:shadow-md transition-all text-left min-h-[100px]"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:from-accent/30 group-hover:to-accent/20 transition-colors flex-shrink-0">
                    <TrendingUp className="w-7 h-7 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-accent transition-colors">
                      {t('dashboard.overview.viewGrowthPlan')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t('dashboard.overview.trackProgress')}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors mt-1" />
                </div>
              </button>
            </div>

            {/* Recent Activity - Timeline style */}
            <Card className="p-5 md:p-6 border-gray-200 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-900">{t('dashboard.overview.recentActivity')}</h3>
                <button className="text-sm text-accent hover:text-accent/80 font-medium">{t('common.viewAll')}</button>
              </div>
              <div className="space-y-1">
                {/* Timeline connector */}
                <div className="relative">
                  <div className="absolute left-[19px] top-6 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 relative">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 bg-green-50 rounded-xl p-3">
                        <p className="font-medium text-gray-900">{t('dashboard.overview.onboardingCompleted')}</p>
                        <p className="text-sm text-gray-500">{t('dashboard.overview.profileVerified')}</p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap mt-3">2d</span>
                    </div>
                    <div className="flex items-start gap-4 relative">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                        <CalendarIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 bg-blue-50 rounded-xl p-3">
                        <p className="font-medium text-gray-900">{t('dashboard.overview.meetingScheduled')}</p>
                        <p className="text-sm text-gray-500">{t('dashboard.overview.growthSession')}</p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap mt-3">3d</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Meetings Tab */}
          <TabsContent value="meetings" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t('dashboard.meetings.upcoming')}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('dashboard.meetings.manageSessions')}</p>
              </div>
              <Button onClick={onScheduleMeeting} className="bg-accent hover:bg-accent/90 rounded-xl shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                {t('dashboard.overview.scheduleMeeting')}
              </Button>
            </div>

            {/* Upcoming Meetings */}
            <div className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <Card
                  key={meeting.id}
                  className="p-5 border-l-4 border-l-accent border-gray-200 hover:shadow-md transition-all rounded-2xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/20 flex items-center justify-center text-accent font-bold text-lg flex-shrink-0">
                        {meeting.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1">{meeting.title}</h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
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
                        <div className="mt-2 flex gap-2">
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                            {meeting.type}
                          </span>
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            {t('dashboard.meetings.scheduled')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      className="bg-accent hover:bg-accent/90 rounded-xl shadow-sm w-full sm:w-auto"
                      onClick={() => {
                        if (meeting.meetLink) {
                          window.open(meeting.meetLink, '_blank');
                        } else {
                          onJoinMeeting(meeting.id);
                        }
                      }}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      {t('dashboard.meetings.join')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Past Meetings */}
            {pastMeetings.length > 0 && (
              <div className="pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.meetings.past')}</h3>
                <div className="space-y-4">
                  {pastMeetings.map((meeting) => (
                    <Card
                      key={meeting.id}
                      className="p-5 border-l-4 border-l-gray-300 border-gray-200 bg-gray-50/50 rounded-2xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg flex-shrink-0">
                          {meeting.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{meeting.title}</h4>
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              {t('dashboard.meetings.completed')}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
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
            )}

            {loadingMeetings ? (
              <Card className="p-12 border-gray-200 rounded-2xl text-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
                <p className="text-gray-500">{t('common.loading')}</p>
              </Card>
            ) : upcomingMeetings.length === 0 && (
              <Card className="p-12 border-gray-200 rounded-2xl text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('dashboard.meetings.noUpcoming')}</h3>
                <p className="text-gray-500 mb-6">{t('dashboard.meetings.scheduleFirst')}</p>
                <Button onClick={onScheduleMeeting} className="bg-accent hover:bg-accent/90 rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('dashboard.meetings.scheduleYourFirst')}
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('dashboard.progress.title')}</h2>
              <p className="text-sm text-gray-500 mt-1">{t('dashboard.progress.subtitle')}</p>
            </div>

            {/* Overall Progress Card with Circular Ring */}
            <Card className="p-6 border-gray-200 rounded-2xl shadow-sm bg-gradient-to-br from-accent/5 to-accent/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                {/* Mobile: Circular progress, Desktop: also circular */}
                <div className="relative flex-shrink-0">
                  <svg width={80} height={80} className="transform -rotate-90">
                    <circle cx={40} cy={40} r={34} fill="none" stroke="currentColor" strokeWidth={6} className="text-gray-200" />
                    <circle
                      cx={40} cy={40} r={34} fill="none" stroke="currentColor" strokeWidth={6}
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={2 * Math.PI * 34 - (progressPercent / 100) * 2 * Math.PI * 34}
                      strokeLinecap="round"
                      className="text-accent transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-accent">{progressPercent}%</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.progress.overallProgress')}</h3>
                  <p className="text-gray-500">{t('dashboard.progress.milestonesCompleted', { completed: completedMilestones, total: milestones.length })}</p>
                </div>
              </div>
            </Card>

            {/* Milestones Timeline - Enhanced */}
            <Card className="p-6 border-gray-200 rounded-2xl shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-6">{t('dashboard.progress.journeyMilestones')}</h3>
              <div className="space-y-1">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="relative">
                    {/* Connector Line - thicker and colored */}
                    {index < milestones.length - 1 && (
                      <div className={`absolute left-[19px] top-[48px] w-1 h-8 rounded-full ${
                        milestone.status === 'completed'
                          ? 'bg-gradient-to-b from-accent to-accent/50'
                          : milestone.status === 'in_progress'
                          ? 'bg-gradient-to-b from-accent/50 to-gray-200'
                          : 'bg-gray-200'
                      }`} />
                    )}

                    <div className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                      milestone.status === 'completed'
                        ? 'bg-green-50'
                        : milestone.status === 'in_progress'
                        ? 'bg-accent/5'
                        : 'bg-gray-50'
                    }`}>
                      {/* Larger milestone dots */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        milestone.status === 'completed'
                          ? 'bg-accent text-white shadow-sm'
                          : milestone.status === 'in_progress'
                          ? 'bg-accent text-white shadow-sm'
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        {milestone.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : milestone.status === 'in_progress' ? (
                          <div className="w-3.5 h-3.5 rounded-full bg-white animate-pulse" />
                        ) : (
                          <milestone.icon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          milestone.status === 'completed'
                            ? 'text-gray-900'
                            : milestone.status === 'in_progress'
                            ? 'text-accent font-semibold'
                            : 'text-gray-500'
                        }`}>
                          {milestone.title}
                        </h4>
                        {milestone.date && (
                          <p className="text-sm text-gray-500">{milestone.date}</p>
                        )}
                      </div>
                      {milestone.status === 'completed' && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                          {t('dashboard.progress.completed')}
                        </span>
                      )}
                      {milestone.status === 'in_progress' && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent animate-pulse">
                          {t('dashboard.progress.inProgress')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Growth Plan CTA */}
            <Card className="p-6 border-gray-200 rounded-2xl shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/20 to-accent/20 rounded-full blur-3xl" />
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-7 h-7 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{t('dashboard.progress.aiGrowthPlan')}</h3>
                  <p className="text-sm text-gray-500">{t('dashboard.progress.personalizedRec')}</p>
                </div>
                <Button
                  onClick={onViewGrowthPlan}
                  className="bg-accent hover:bg-accent/90 rounded-xl shadow-sm"
                >
                  {t('dashboard.progress.viewPlan')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('dashboard.profile.title')}</h2>
              <p className="text-sm text-gray-500 mt-1">{t('dashboard.profile.subtitle')}</p>
            </div>

            {loadingProfile ? (
              <Card className="p-12 border-gray-200 rounded-2xl text-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
                <p className="text-gray-500">{t('dashboard.profile.loadingProfile')}</p>
              </Card>
            ) : !myProfile?.has_profile ? (
              <Card className="p-12 border-gray-200 rounded-2xl text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('dashboard.profile.noProfile')}</h3>
                <p className="text-gray-500">{t('dashboard.profile.completeOnboarding')}</p>
              </Card>
            ) : (
              <>
                {/* Profile Header Card - Larger avatar on mobile */}
                <Card className="overflow-hidden border-0 shadow-lg rounded-2xl">
                  <div className="bg-accent p-5 sm:p-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold text-2xl sm:text-3xl flex-shrink-0 border border-white/20">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl sm:text-2xl font-bold">{userName}</h3>
                        <p className="text-white/80">{businessName}</p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="flex items-center gap-1 text-sm text-white/80">
                            <Phone className="w-3.5 h-3.5" />
                            {myProfile.phone || localStorage.getItem('user_phone') || '-'}
                          </span>
                          {(myProfile.profile?.email || myProfile.profile?.email_address) && (
                            <span className="flex items-center gap-1 text-sm text-white/80">
                              <Mail className="w-3.5 h-3.5" />
                              {myProfile.profile.email || myProfile.profile.email_address}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right hidden md:block">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          myProfile.status === 'submitted' || myProfile.status === 'reviewed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {myProfile.status?.replace('_', ' ')}
                        </span>
                        <p className="text-xs text-white/60 mt-1">
                          {t('dashboard.profile.dateJoined')}: {myProfile.date_joined ? new Date(myProfile.date_joined).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Personal Information */}
                <Card className="p-5 sm:p-6 border-gray-200 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-accent" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{t('dashboard.profile.personalInfo')}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">{t('dashboard.profile.fullName')}</p>
                      <p className="font-medium text-gray-900">{myProfile.profile?.full_name || myProfile.profile?.owner_name || myProfile.profile?.fullName || '-'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">{t('dashboard.profile.phone')}</p>
                      <p className="font-medium text-gray-900 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {myProfile.phone || '-'}
                        {myProfile.is_phone_verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        )}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">{t('dashboard.profile.email')}</p>
                      <p className="font-medium text-gray-900">{myProfile.profile?.email || myProfile.profile?.email_address || '-'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">{t('dashboard.profile.gender')}</p>
                      <p className="font-medium text-gray-900">{myProfile.profile?.gender || '-'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">{t('dashboard.profile.age')}</p>
                      <p className="font-medium text-gray-900">{myProfile.profile?.age || '-'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">{t('dashboard.profile.education')}</p>
                      <p className="font-medium text-gray-900">{myProfile.profile?.education || '-'}</p>
                    </div>
                  </div>
                </Card>

                {/* Location */}
                <Card className="p-5 sm:p-6 border-gray-200 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-accent" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{t('dashboard.profile.location')}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">{t('dashboard.profile.state')}</p>
                      <p className="font-medium text-gray-900">{myProfile.profile?.state || '-'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">{t('dashboard.profile.district')}</p>
                      <p className="font-medium text-gray-900">{myProfile.profile?.district || '-'}</p>
                    </div>
                  </div>
                </Card>

                {/* Business Information */}
                <Card className="p-5 sm:p-6 border-gray-200 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-accent" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{t('dashboard.profile.businessInfo')}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">{t('dashboard.profile.businessName')}</p>
                      <p className="font-medium text-gray-900">{myProfile.profile?.business_name || '-'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">{t('dashboard.profile.sector')}</p>
                      <p className="font-medium text-gray-900">{myProfile.profile?.sector || myProfile.profile?.business_type || '-'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">{t('dashboard.profile.yearStarted')}</p>
                      <p className="font-medium text-gray-900">{myProfile.profile?.year_started || '-'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">{t('dashboard.profile.ownershipType')}</p>
                      <p className="font-medium text-gray-900">{myProfile.profile?.ownership_type || '-'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">{t('dashboard.profile.role')}</p>
                      <p className="font-medium text-gray-900">{myProfile.profile?.role || '-'}</p>
                    </div>
                    {myProfile.profile?.products_services && (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">{t('dashboard.profile.products')}</p>
                        <p className="font-medium text-gray-900">{myProfile.profile.products_services}</p>
                      </div>
                    )}
                    {myProfile.profile?.total_employees && (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">{t('dashboard.profile.employees')}</p>
                        <p className="font-medium text-gray-900">{myProfile.profile.total_employees}</p>
                      </div>
                    )}
                    {myProfile.profile?.annual_revenue && (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">{t('dashboard.profile.revenue')}</p>
                        <p className="font-medium text-gray-900">{myProfile.profile.annual_revenue}</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Additional Information */}
                {myProfile.profile && (() => {
                  const knownKeys = new Set([
                    'full_name', 'owner_name', 'fullName', 'email', 'email_address',
                    'gender', 'age', 'education', 'state', 'district',
                    'business_name', 'sector', 'business_type', 'year_started',
                    'ownership_type', 'role', 'products_services', 'total_employees',
                    'annual_revenue', 'phone', 'owner_contact'
                  ]);
                  const extraFields = Object.entries(myProfile.profile).filter(
                    ([key, value]) => !knownKeys.has(key) && value
                  );
                  if (extraFields.length === 0) return null;
                  return (
                    <Card className="p-5 sm:p-6 border-gray-200 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-accent" />
                        </div>
                        <h3 className="font-semibold text-gray-900">{t('dashboard.profile.additionalInfo')}</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {extraFields.map(([key, value]) => (
                          <div key={key} className="p-3 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-500 mb-1">
                              {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </p>
                            <p className="font-medium text-gray-900 text-sm break-words">{value}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                })()}

                {/* Account Status */}
                <Card className="p-5 sm:p-6 border-gray-200 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{t('dashboard.profile.accountStatus')}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">{t('dashboard.profile.onboardingStatus')}</p>
                      <p className="font-medium text-gray-900 capitalize">{myProfile.status?.replace('_', ' ') || '-'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">{t('dashboard.profile.dateJoined')}</p>
                      <p className="font-medium text-gray-900">
                        {myProfile.date_joined
                          ? new Date(myProfile.date_joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '-'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">{t('dashboard.profile.voiceRecordings')}</p>
                      <p className="font-medium text-gray-900">{myProfile.audio_count || 0}</p>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      
    </div>
  );
}
