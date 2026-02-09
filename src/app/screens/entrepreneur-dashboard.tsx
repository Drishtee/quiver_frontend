import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { UserMenu } from "../components/user-menu";
import { LanguageSelector } from "../components/language-selector";
import { GrowthPlanSection, GrowthProgressMini } from "../components/growth-plan-section";
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
  Building2,
  Rocket,
  BarChart3,
  Zap
} from "lucide-react";

interface EntrepreneurDashboardProps {
  profileData: any;
  onScheduleMeeting: () => void;
  onJoinMeeting: (meetingId: string) => void;
  onLogout: () => void;
  onViewGrowthPlan?: () => void;
  onUploadDocuments?: () => void;
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

// Animated gradient background component
function GradientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
    </div>
  );
}

// Stats card with icon
function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color = "accent"
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  color?: "accent" | "emerald" | "amber" | "blue";
}) {
  const colorClasses = {
    accent: "from-accent to-accent/80",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    blue: "from-blue-500 to-blue-600"
  };

  return (
    <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-3 md:p-4 hover:shadow-md hover:border-gray-200 transition-all">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs md:text-sm text-gray-500 mb-0.5 md:mb-1 truncate">{label}</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend.value >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={`w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

// Meeting card component
function MeetingCard({
  meeting,
  onJoin,
  isNext = false
}: {
  meeting: Meeting;
  onJoin: () => void;
  isNext?: boolean;
}) {
  const countdown = getCountdown(meeting.startTime);

  return (
    <div className={`rounded-2xl overflow-hidden ${
      isNext ? "bg-gradient-to-br from-accent to-accent/90 text-white shadow-lg" : "bg-white border border-gray-100"
    }`}>
      {isNext && countdown && (
        <div className="bg-black/10 px-4 py-2 flex items-center justify-between">
          <span className="text-sm text-white/80">Next Meeting</span>
          <span className="text-sm font-semibold bg-white/20 px-3 py-0.5 rounded-full">
            Starts in {countdown}
          </span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
            isNext ? "bg-white/20 text-white" : "bg-accent/10 text-accent"
          }`}>
            {meeting.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold mb-1 truncate ${isNext ? "text-white" : "text-gray-900"}`}>
              {meeting.title}
            </h4>
            <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm ${isNext ? "text-white/80" : "text-gray-500"}`}>
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                {meeting.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {meeting.time}
              </span>
            </div>
          </div>
        </div>
        <Button
          onClick={onJoin}
          className={`w-full mt-4 rounded-xl h-11 font-semibold ${
            isNext
              ? "bg-white text-accent hover:bg-white/90"
              : "bg-accent text-white hover:bg-accent/90"
          }`}
        >
          <Video className="w-4 h-4 mr-2" />
          Join Meeting
        </Button>
      </div>
    </div>
  );
}

// Quick action button
function QuickAction({
  icon: Icon,
  label,
  description,
  onClick,
  highlighted = false
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
  highlighted?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${
        highlighted
          ? "bg-gradient-to-br from-accent/5 to-purple-500/5 border-accent/20 hover:border-accent/40"
          : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          highlighted
            ? "bg-gradient-to-br from-accent to-purple-500"
            : "bg-gray-100"
        }`}>
          <Icon className={`w-5 h-5 ${highlighted ? "text-white" : "text-gray-600"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 mb-0.5">{label}</h4>
          <p className="text-sm text-gray-500 line-clamp-1">{description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 mt-2.5 flex-shrink-0" />
      </div>
    </button>
  );
}

export function EntrepreneurDashboard({
  profileData,
  onScheduleMeeting,
  onJoinMeeting,
  onLogout,
  onViewGrowthPlan,
  onUploadDocuments
}: EntrepreneurDashboardProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [pastMeetings, setPastMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [myProfile, setMyProfile] = useState<MyProfileResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showGrowthPlan, setShowGrowthPlan] = useState(false);

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
  const currentGrowthStage = 2; // This would come from actual data

  const greeting = getTimeGreeting(t);

  // User profile data for Growth Plan
  const userProfileData = {
    businessName: myProfile?.profile?.business_name || businessName,
    sector: myProfile?.profile?.sector || myProfile?.profile?.business_type,
    yearStarted: myProfile?.profile?.year_started,
    annualRevenue: myProfile?.profile?.annual_revenue
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header - Simplified & Professional */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="Quiver" className="w-9 h-9 object-contain rounded-lg" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Quiver</h1>
                <p className="text-xs text-gray-500 -mt-0.5">{t('dashboard.title')}</p>
              </div>
            </div>

            {/* Center - Growth Progress (Desktop) */}
            <div className="hidden md:block">
              <GrowthProgressMini
                currentStage={currentGrowthStage}
                onClick={() => setShowGrowthPlan(true)}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSelector variant="compact" />
              <button className="relative p-2.5 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full" />
              </button>
              <Button
                onClick={onScheduleMeeting}
                className="bg-accent hover:bg-accent/90 rounded-xl shadow-sm hidden md:flex h-10"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                {greeting}, {firstName}
              </h2>
              <p className="text-sm md:text-base text-gray-500 mt-0.5 md:mt-1 truncate">{businessName}</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-xl">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="text-sm font-semibold text-accent">{progressPercent}% Progress</span>
            </div>
          </div>
        </div>

        {/* Mobile Schedule Button */}
        <Button
          onClick={onScheduleMeeting}
          className="bg-accent hover:bg-accent/90 rounded-xl shadow-sm md:hidden w-full h-12 mb-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('dashboard.overview.scheduleMeeting')}
        </Button>

        {/* Growth Plan Card - THE HERO SECTION */}
        <div className="mb-6">
          <GrowthPlanSection
            currentStage={currentGrowthStage}
            userProfile={userProfileData}
            onStageAction={(stageId) => {
              console.log("Stage action:", stageId);
            }}
            onScheduleMeeting={onScheduleMeeting}
            onClose={() => setShowGrowthPlan(false)}
            isExpanded={showGrowthPlan}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            <TabsList className="bg-white border border-gray-100 p-1 rounded-xl shadow-sm w-max sm:w-auto flex">
              <TabsTrigger
                value="overview"
                className="rounded-lg data-[state=active]:bg-accent data-[state=active]:text-white px-4 sm:px-6 py-2.5 text-sm font-medium whitespace-nowrap"
              >
                {t('dashboard.tabs.overview')}
              </TabsTrigger>
              <TabsTrigger
                value="meetings"
                className="rounded-lg data-[state=active]:bg-accent data-[state=active]:text-white px-4 sm:px-6 py-2.5 text-sm font-medium whitespace-nowrap"
              >
                {t('dashboard.tabs.meetings')}
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="rounded-lg data-[state=active]:bg-accent data-[state=active]:text-white px-4 sm:px-6 py-2.5 text-sm font-medium whitespace-nowrap"
              >
                {t('dashboard.tabs.progress')}
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="rounded-lg data-[state=active]:bg-accent data-[state=active]:text-white px-4 sm:px-6 py-2.5 text-sm font-medium whitespace-nowrap"
              >
                {t('dashboard.tabs.profile')}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              <StatCard
                label={t('dashboard.overview.upcomingMeetings')}
                value={upcomingMeetings.length}
                icon={Video}
                color="accent"
              />
              <StatCard
                label={t('dashboard.overview.milestones')}
                value={`${completedMilestones}/${milestones.length}`}
                icon={CheckCircle2}
                color="emerald"
              />
              <StatCard
                label={t('dashboard.overview.pendingDocs')}
                value={2}
                icon={FileText}
                color="amber"
              />
              <StatCard
                label="Growth Stage"
                value={`${currentGrowthStage}/5`}
                icon={Rocket}
                color="blue"
              />
            </div>

            {/* Next Meeting + Quick Actions Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Next Meeting or Empty State */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('dashboard.overview.nextMeeting')}</h3>
                {loadingMeetings ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-3" />
                    <p className="text-gray-500">{t('common.loading')}</p>
                  </div>
                ) : upcomingMeetings.length > 0 ? (
                  <MeetingCard
                    meeting={upcomingMeetings[0]}
                    onJoin={() => {
                      if (upcomingMeetings[0].meetLink) {
                        window.open(upcomingMeetings[0].meetLink, '_blank');
                      } else {
                        onJoinMeeting(upcomingMeetings[0].id);
                      }
                    }}
                    isNext
                  />
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                      <CalendarIcon className="w-7 h-7 text-accent" />
                    </div>
                    <img
                      src="/GFX-DASH-001.png"
                      alt="Schedule your first meeting"
                      className="w-[200px] h-[160px] object-contain mx-auto"
                    />
                    <h4 className="font-semibold text-gray-900 mb-1">{t('dashboard.overview.noMeetings')}</h4>
                    <p className="text-sm text-gray-500 mb-4">{t('dashboard.overview.scheduleFirst')}</p>
                    <Button onClick={onScheduleMeeting} className="bg-accent hover:bg-accent/90 rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule Meeting
                    </Button>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-3">
                  <QuickAction
                    icon={Sparkles}
                    label="View Growth Plan"
                    description="See your personalized journey with Quiver"
                    onClick={() => setShowGrowthPlan(true)}
                    highlighted
                  />
                  <QuickAction
                    icon={CalendarIcon}
                    label={t('dashboard.overview.scheduleNew')}
                    description={t('dashboard.overview.scheduleNewDesc')}
                    onClick={onScheduleMeeting}
                  />
                  <QuickAction
                    icon={FileText}
                    label="Upload Documents"
                    description="Submit required business documents"
                    onClick={() => onUploadDocuments?.()}
                  />
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{t('dashboard.overview.recentActivity')}</h3>
                <button className="text-sm text-accent hover:text-accent/80 font-medium">{t('common.viewAll')}</button>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{t('dashboard.overview.onboardingCompleted')}</p>
                    <p className="text-sm text-gray-500">{t('dashboard.overview.profileVerified')}</p>
                  </div>
                  <span className="text-xs text-gray-400">2d</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <CalendarIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{t('dashboard.overview.meetingScheduled')}</p>
                    <p className="text-sm text-gray-500">{t('dashboard.overview.growthSession')}</p>
                  </div>
                  <span className="text-xs text-gray-400">3d</span>
                </div>
              </div>
            </div>
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
            <div className="grid sm:grid-cols-2 gap-4">
              {upcomingMeetings.map((meeting, idx) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onJoin={() => {
                    if (meeting.meetLink) {
                      window.open(meeting.meetLink, '_blank');
                    } else {
                      onJoinMeeting(meeting.id);
                    }
                  }}
                  isNext={idx === 0}
                />
              ))}
            </div>

            {loadingMeetings ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
                <p className="text-gray-500">{t('common.loading')}</p>
              </div>
            ) : upcomingMeetings.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('dashboard.meetings.noUpcoming')}</h3>
                <p className="text-gray-500 mb-6">{t('dashboard.meetings.scheduleFirst')}</p>
                <Button onClick={onScheduleMeeting} className="bg-accent hover:bg-accent/90 rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('dashboard.meetings.scheduleYourFirst')}
                </Button>
              </div>
            )}

            {/* Past Meetings */}
            {pastMeetings.length > 0 && (
              <div className="pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.meetings.past')}</h3>
                <div className="space-y-3">
                  {pastMeetings.slice(0, 5).map((meeting) => (
                    <div
                      key={meeting.id}
                      className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-semibold text-sm flex-shrink-0">
                        {meeting.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{meeting.title}</p>
                        <p className="text-sm text-gray-500">{meeting.date} at {meeting.time}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {t('dashboard.meetings.completed')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('dashboard.progress.title')}</h2>
              <p className="text-sm text-gray-500 mt-1">{t('dashboard.progress.subtitle')}</p>
            </div>

            {/* Progress Overview */}
            <div className="bg-gradient-to-br from-accent to-accent/80 rounded-xl md:rounded-2xl p-4 md:p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 flex items-center gap-4 md:gap-5">
                <div className="relative flex-shrink-0">
                  <svg width={64} height={64} className="md:w-[80px] md:h-[80px] transform -rotate-90">
                    <circle cx={40} cy={40} r={34} fill="none" stroke="currentColor" strokeWidth={6} className="text-white/20" />
                    <circle
                      cx={40} cy={40} r={34} fill="none" stroke="currentColor" strokeWidth={6}
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={2 * Math.PI * 34 - (progressPercent / 100) * 2 * Math.PI * 34}
                      strokeLinecap="round"
                      className="text-white transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-base md:text-xl font-bold">{progressPercent}%</span>
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="text-base md:text-xl font-bold">{t('dashboard.progress.overallProgress')}</h3>
                  <p className="text-white/80">{t('dashboard.progress.milestonesCompleted', { completed: completedMilestones, total: milestones.length })}</p>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-5">{t('dashboard.progress.journeyMilestones')}</h3>
              <div className="space-y-1">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="relative">
                    {index < milestones.length - 1 && (
                      <div className={`absolute left-[19px] top-[48px] w-0.5 h-6 ${
                        milestone.status === 'completed' ? 'bg-accent' : 'bg-gray-200'
                      }`} />
                    )}
                    <div className={`flex items-center gap-4 p-3 rounded-xl ${
                      milestone.status === 'completed' ? 'bg-emerald-50' :
                      milestone.status === 'in_progress' ? 'bg-accent/5' : 'bg-gray-50'
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        milestone.status === 'completed' ? 'bg-emerald-500' :
                        milestone.status === 'in_progress' ? 'bg-accent' : 'bg-gray-200'
                      }`}>
                        {milestone.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        ) : milestone.status === 'in_progress' ? (
                          <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                        ) : (
                          <milestone.icon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          milestone.status === 'completed' ? 'text-gray-900' :
                          milestone.status === 'in_progress' ? 'text-accent' : 'text-gray-400'
                        }`}>
                          {milestone.title}
                        </h4>
                        {milestone.date && <p className="text-sm text-gray-500">{milestone.date}</p>}
                      </div>
                      {milestone.status === 'in_progress' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent animate-pulse">
                          {t('dashboard.progress.inProgress')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Plan CTA */}
            {/* TODO: Replace with final illustration — see GRAPHIC_DESIGN_SPEC.md (GFX-DASH-003) */}
            <button
              onClick={() => setShowGrowthPlan(true)}
              className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl md:rounded-2xl p-4 md:p-5 text-left hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base md:text-lg">{t('dashboard.progress.aiGrowthPlan')}</h3>
                  <p className="text-white/70 text-xs md:text-sm truncate">{t('dashboard.progress.personalizedRec')}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-white/60" />
              </div>
            </button>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('dashboard.profile.title')}</h2>
              <p className="text-sm text-gray-500 mt-1">{t('dashboard.profile.subtitle')}</p>
            </div>

            {loadingProfile ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
                <p className="text-gray-500">{t('dashboard.profile.loadingProfile')}</p>
              </div>
            ) : !myProfile?.has_profile ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('dashboard.profile.noProfile')}</h3>
                <p className="text-gray-500">{t('dashboard.profile.completeOnboarding')}</p>
              </div>
            ) : (
              <>
                {/* Profile Header */}
                <div className="bg-gradient-to-br from-accent to-accent/80 rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold text-xl md:text-2xl flex-shrink-0">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-bold truncate">{userName}</h3>
                      <p className="text-white/80 text-sm md:text-base truncate">{businessName}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-white/70">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {myProfile.phone || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Sections */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Personal Info */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-5 h-5 text-accent" />
                      <h3 className="font-semibold text-gray-900">{t('dashboard.profile.personalInfo')}</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">{t('dashboard.profile.fullName')}</p>
                        <p className="font-medium text-gray-900">{myProfile.profile?.full_name || myProfile.profile?.owner_name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{t('dashboard.profile.email')}</p>
                        <p className="font-medium text-gray-900">{myProfile.profile?.email || myProfile.profile?.email_address || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{t('dashboard.profile.gender')}</p>
                        <p className="font-medium text-gray-900">{myProfile.profile?.gender || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-5 h-5 text-accent" />
                      <h3 className="font-semibold text-gray-900">{t('dashboard.profile.location')}</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">{t('dashboard.profile.state')}</p>
                        <p className="font-medium text-gray-900">{myProfile.profile?.state || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{t('dashboard.profile.district')}</p>
                        <p className="font-medium text-gray-900">{myProfile.profile?.district || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Info */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold text-gray-900">{t('dashboard.profile.businessInfo')}</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">{t('dashboard.profile.businessName')}</p>
                      <p className="font-medium text-gray-900">{myProfile.profile?.business_name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t('dashboard.profile.sector')}</p>
                      <p className="font-medium text-gray-900">{myProfile.profile?.sector || myProfile.profile?.business_type || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t('dashboard.profile.yearStarted')}</p>
                      <p className="font-medium text-gray-900">{myProfile.profile?.year_started || '-'}</p>
                    </div>
                    {myProfile.profile?.annual_revenue && (
                      <div>
                        <p className="text-xs text-gray-500">{t('dashboard.profile.revenue')}</p>
                        <p className="font-medium text-gray-900">{myProfile.profile.annual_revenue}</p>
                      </div>
                    )}
                    {myProfile.profile?.total_employees && (
                      <div>
                        <p className="text-xs text-gray-500">{t('dashboard.profile.employees')}</p>
                        <p className="font-medium text-gray-900">{myProfile.profile.total_employees}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Status */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold text-gray-900">{t('dashboard.profile.accountStatus')}</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">{t('dashboard.profile.onboardingStatus')}</p>
                      <p className="font-medium text-gray-900 capitalize">{myProfile.status?.replace('_', ' ') || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t('dashboard.profile.dateJoined')}</p>
                      <p className="font-medium text-gray-900">
                        {myProfile.date_joined
                          ? new Date(myProfile.date_joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t('dashboard.profile.voiceRecordings')}</p>
                      <p className="font-medium text-gray-900">{myProfile.audio_count || 0}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Growth Plan Modal */}
      {showGrowthPlan && (
        <GrowthPlanSection
          currentStage={currentGrowthStage}
          userProfile={userProfileData}
          onStageAction={(stageId) => {
            console.log("Stage action:", stageId);
          }}
          onScheduleMeeting={onScheduleMeeting}
          onClose={() => setShowGrowthPlan(false)}
          isExpanded={true}
        />
      )}
    </div>
  );
}
