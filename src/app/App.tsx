import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Landing } from "./screens/landing";
import { Login } from "./screens/login";
import { OTPVerification } from "./screens/otp-verification";
import { BusinessModelConfirmation } from "./screens/business-model-confirmation";
import { UnderstandingConsent } from "./screens/understanding-consent";
import { ProfileCreation } from "./screens/profile-creation";
import type { ProfileData } from "./screens/profile-creation";

import { IndustrySelection } from "./screens/industry-selection";
import type { EnterpriseData } from "./screens/industry-selection";
import { GrowthPathway } from "./screens/growth-pathway";
import { AIGrowthPathway } from "./screens/ai-growth-pathway";
import { BusinessQuestionnaire } from "./screens/business-questionnaire";
import { EquityPartnership } from "./screens/equity-partnership";
import { DocumentUpload } from "./screens/document-upload";
import { ReviewSubmit } from "./screens/review-submit";
import { AdminDashboard } from "./screens/admin-dashboard";
import { EntrepreneurDashboard } from "./screens/entrepreneur-dashboard";
import { ScheduleMeeting } from "./screens/schedule-meeting";
import type { MeetingDetails } from "./screens/schedule-meeting";
import { GoogleMeetMeeting } from "./screens/google-meet-meeting";
import { ResumeJourneyModal } from "./components/resume-journey-modal";
import { MeetingConfirmationModal } from "./components/meeting-confirmation-modal";
import { AvatarContainer } from "./components/avatar/AvatarContainer";
import { VoiceOnboarding } from "./screens/voice-onboarding";
import { QuiverAIAssistant } from "./components/voice/QuiverAIAssistant";
import type { ScreenType } from "../config/formFieldMappings";
import { sendOTP, verifyOTP, startOnboarding, updateField, bulkUpdateFields, getOnboardingData, logout as apiLogout } from "../services/api";
import type { VerifyOTPResponse } from "../types/api";
import { useOnboarding } from "../contexts/OnboardingContext";
import { onboardingStorage } from "../utils/storage";

type Screen =
  | "landing"
  | "login"
  | "otp"
  | "business-model"
  | "consent"
  | "profile"
  | "enterprise"
  | "industry"
  | "pathway"
  | "ai-pathway"
  | "questionnaire"
  | "equity"
  | "documents"
  | "review"
  | "admin"
  | "success"
  | "dashboard"
  | "schedule"
  | "video-meeting"
  | "voice-onboarding";

export default function App() {
  const { t } = useTranslation();
  const onboarding = useOnboarding();

  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [phone, setPhone] = useState("");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [enterpriseData, setEnterpriseData] = useState<EnterpriseData | null>(null);
  const [industry, setIndustry] = useState("");
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, string | string[]>>({});
  const [equityAnswer, setEquityAnswer] = useState<string>("");
  const [currentMeeting, setCurrentMeeting] = useState<{
    id: string;
    title: string;
    mentor: string;
  } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Resume journey modal state
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedProgress, setSavedProgress] = useState<{ step: number; lastSaved: Date | null }>({ step: 0, lastSaved: null });

  // Meeting confirmation modal state
  const [showMeetingConfirmation, setShowMeetingConfirmation] = useState(false);
  const [confirmedMeeting, setConfirmedMeeting] = useState<{
    id: string;
    title: string;
    date: Date;
    time: string;
    mentor: string;
    type: string;
    meetLink: string;
  } | null>(null);

  // Show AI avatar on certain screens
  const showAvatar = ['consent', 'profile', 'industry', 'questionnaire', 'equity'].includes(currentScreen);

  // Show voice agent on onboarding screens
  const showVoiceAgent = ['consent', 'profile', 'industry', 'questionnaire', 'equity', 'schedule'].includes(currentScreen);

  // Map screen name to voice agent screen type
  const getVoiceAgentScreen = (): ScreenType | undefined => {
    const screenMap: Record<string, ScreenType> = {
      'consent': 'consent',
      'profile': 'profile',
      'industry': 'industry',
      'questionnaire': 'questionnaire',
      'equity': 'equity',
      'schedule': 'schedule'
    };
    return screenMap[currentScreen];
  };

  // Check authentication status and saved progress on mount
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      setIsAuthenticated(true);
      // Check for saved onboarding progress
      const savedData = onboardingStorage.getData();
      if (savedData.sessionId && !savedData.completedSteps.includes(5)) {
        // Has incomplete onboarding
        setSavedProgress({
          step: savedData.currentStep,
          lastSaved: savedData.lastSaved ? new Date(savedData.lastSaved) : null
        });
        setShowResumeModal(true);
      } else {
        setCurrentScreen("dashboard");
      }
    }
  }, []);

  // Handle resume journey
  const handleResumeJourney = async () => {
    setShowResumeModal(false);
    const savedData = onboardingStorage.getData();
    if (savedData.sessionId) {
      setSessionId(savedData.sessionId);
      onboarding.setSessionId(savedData.sessionId);
      // Map step number to screen
      const stepScreenMap: Record<number, Screen> = {
        0: 'consent',
        1: 'profile',
        2: 'industry',
        3: 'questionnaire',
        4: 'equity',
        5: 'review'
      };
      setCurrentScreen(stepScreenMap[savedData.currentStep] || 'consent');
    }
  };

  // Handle start fresh
  const handleStartFresh = async () => {
    setShowResumeModal(false);
    onboarding.clearProgress();
    try {
      const startResponse = await startOnboarding();
      setSessionId(startResponse.session_id);
      onboarding.setSessionId(startResponse.session_id);
      setCurrentScreen("consent");
    } catch (err) {
      setError('Failed to start onboarding');
    }
  };

  // Navigation handlers
  const handleGetStarted = async (phoneNumber: string) => {
    setLoading(true);
    setError(null);
    try {
      await sendOTP(phoneNumber);
      setPhone(phoneNumber);
      setCurrentScreen("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await sendOTP(phone);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    }
  };

  const handleOTPVerify = async (otp: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await verifyOTP(phone, otp);
      setIsAuthenticated(true);

      const { is_new_user, onboarding_completed, has_in_progress_onboarding } = response;

      // Route based on onboarding status (same logic as handleLogin)
      if (onboarding_completed) {
        console.log('User has completed onboarding, going to dashboard');
        setCurrentScreen("dashboard");
      } else if (has_in_progress_onboarding) {
        console.log('Resuming incomplete onboarding');
        const startResponse = await startOnboarding();
        setSessionId(startResponse.session_id);
        setCurrentScreen("questionnaire");
      } else {
        console.log(is_new_user ? 'New user, starting onboarding' : 'Starting fresh onboarding');
        // Start onboarding with consent screen
        const startResponse = await startOnboarding();
        setSessionId(startResponse.session_id);
        onboarding.setSessionId(startResponse.session_id);
        setCurrentScreen("consent");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessModelContinue = async () => {
    setLoading(true);
    setError(null);
    try {
      const startResponse = await startOnboarding();
      setSessionId(startResponse.session_id);
      setCurrentScreen("consent");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleConsentContinue = () => {
    setCurrentScreen("profile");
  };

  const handleProfileContinue = async (data: ProfileData) => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      await bulkUpdateFields(sessionId, [
        { key: 'full_name', value: data.fullName, source: 'ui' },
        { key: 'email', value: data.email || '', source: 'ui' },
        { key: 'gender', value: data.gender, source: 'ui' },
        { key: 'age', value: data.age, source: 'ui' },
        { key: 'education', value: data.education, source: 'ui' },
        { key: 'state', value: data.state, source: 'ui' },
        { key: 'district', value: data.district, source: 'ui' }
      ]);
      setProfileData(data);
      setCurrentScreen("industry");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEnterpriseContinue = async (data: EnterpriseData) => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      await bulkUpdateFields(sessionId, [
        { key: 'business_name', value: data.businessName, source: 'ui' },
        { key: 'sector', value: data.sector, source: 'ui' },
        { key: 'year_started', value: data.yearStarted, source: 'ui' },
        { key: 'ownership_type', value: data.ownershipType, source: 'ui' },
        { key: 'role', value: data.role, source: 'ui' }
      ]);
      setEnterpriseData(data);
      setIndustry(data.sector);
      setCurrentScreen("questionnaire");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save enterprise details');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaireContinue = async (answers: Record<string, string | string[]>) => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const fields = Object.entries(answers).map(([key, value]) => ({
        key,
        value: Array.isArray(value) ? value.join(',') : value,
        source: 'ui' as const
      }));
      await bulkUpdateFields(sessionId, fields);
      setQuestionnaireAnswers(answers);
      setCurrentScreen("equity");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save answers');
    } finally {
      setLoading(false);
    }
  };

  const handleEquityContinue = async (answer: string) => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      await updateField(sessionId, 'open_to_equity', answer, 'ui');
      setEquityAnswer(answer);
      setCurrentScreen("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save equity preference');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section: string) => {
    // Navigate to the appropriate screen for editing
    const sectionMap: Record<string, Screen> = {
      profile: "profile",
      enterprise: "industry",
      industry: "industry",
      questionnaire: "questionnaire",
      equity: "equity",
      documents: "review"
    };
    setCurrentScreen(sectionMap[section] || "profile");
  };

  const handleSubmit = () => {
    setCurrentScreen("success");
  };

  const handleBackToLanding = () => {
    setCurrentScreen("landing");
  };

  const handleGoToDashboard = () => {
    setCurrentScreen("dashboard");
  };

  const handleShowLogin = () => {
    setCurrentScreen("login");
  };

  const handleLogin = async (data: { phone: string; otp: string; response: VerifyOTPResponse }) => {
    // After successful login, user data is already in localStorage from verifyOTP
    setIsAuthenticated(true);
    setPhone(data.phone);

    const { is_new_user, onboarding_completed, has_in_progress_onboarding } = data.response;

    // Route based on onboarding status
    if (onboarding_completed) {
      // User has completed onboarding → Dashboard
      console.log('User has completed onboarding, going to dashboard');
      setCurrentScreen("dashboard");
    } else if (has_in_progress_onboarding) {
      // User has incomplete onboarding → Resume onboarding
      console.log('Resuming incomplete onboarding');
      try {
        const startResponse = await startOnboarding();
        setSessionId(startResponse.session_id);
        setCurrentScreen("questionnaire"); // Resume at questionnaire
      } catch (err) {
        console.error('Failed to resume onboarding:', err);
        setCurrentScreen("consent"); // Fallback to start
      }
    } else {
      // User has no onboarding session → Start onboarding
      console.log(is_new_user ? 'New user, starting onboarding' : 'Starting fresh onboarding');
      try {
        const startResponse = await startOnboarding();
        setSessionId(startResponse.session_id);
        setCurrentScreen("consent");
      } catch (err) {
        console.error('Failed to start onboarding:', err);
        setError('Failed to start onboarding. Please try again.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear state
    setIsAuthenticated(false);
    setPhone("");
    setProfileData(null);
    setEnterpriseData(null);
    setIndustry("");
    setQuestionnaireAnswers({});
    setEquityAnswer("");
    setSessionId(null);
    setCurrentMeeting(null);

    // Go back to landing
    setCurrentScreen("landing");
  };

  const handleScheduleMeeting = () => {
    setCurrentScreen("schedule");
  };

  const handleScheduleComplete = (details: MeetingDetails) => {
    // In a real app, this would save to backend
    console.log("Meeting scheduled:", details);
    setCurrentScreen("dashboard");
  };

  const handleJoinMeeting = (meetingId: string) => {
    setCurrentMeeting({
      id: meetingId,
      title: "Initial Consultation",
      mentor: "Priya Sharma"
    });
    setCurrentScreen("video-meeting");
  };

  const handleEndCall = () => {
    setCurrentMeeting(null);
    setCurrentScreen("dashboard");
  };

  // Render success screen
  if (currentScreen === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center space-y-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-display font-bold text-gray-900">
              Quiver में आपका स्वागत है!
            </h1>
            <h2 className="text-xl text-primary font-medium">
              Welcome to Quiver!
            </h2>
            <div className="bg-white rounded-2xl border-2 border-primary/20 p-6 shadow-lg">
              <p className="text-gray-700 leading-relaxed">
                आपकी जानकारी सफलतापूर्वक जमा हो गई है। हमारी टीम जल्द ही आपसे संपर्क करेगी।
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Your profile has been successfully submitted. Our team will contact you soon.
              </p>
            </div>
          </div>
          <div className="space-y-4 pt-4">
            <button
              onClick={handleGoToDashboard}
              className="w-full h-14 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-display font-bold text-lg hover:from-secondary hover:to-primary transition-all shadow-lg"
            >
              डैशबोर्ड पर जाएं | Go to Dashboard
            </button>
            <button
              onClick={() => setCurrentScreen("admin")}
              className="w-full h-12 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              View Admin Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render screens based on current state
  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Loading...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="fixed top-4 left-4 right-4 bg-red-500 text-white p-4 rounded-lg z-50">
          {error}
          <button 
            onClick={() => setError(null)}
            className="float-right ml-4 font-bold"
          >
            ×
          </button>
        </div>
      )}
      {currentScreen === "landing" && (
        <Landing
          onGetStarted={handleGetStarted}
          onLogin={handleShowLogin}
        />
      )}
      {currentScreen === "login" && (
        <Login
          onLogin={handleLogin}
          onBack={handleBackToLanding}
          onSwitchToSignup={handleBackToLanding}
        />
      )}
      {currentScreen === "otp" && (
        <OTPVerification
          phone={phone}
          onVerify={handleOTPVerify}
          onBack={handleBackToLanding}
          onResend={handleResendOTP}
          error={error}
          loading={loading}
        />
      )}
      {currentScreen === "business-model" && (
        <BusinessModelConfirmation
          onContinue={handleBusinessModelContinue}
        />
      )}
      {currentScreen === "consent" && (
        <UnderstandingConsent
          onContinue={handleConsentContinue}
          onVoiceOnboarding={() => setCurrentScreen("voice-onboarding")}
        />
      )}
      {currentScreen === "profile" && (
        <ProfileCreation onContinue={handleProfileContinue} />
      )}
      {currentScreen === "industry" && (
        <IndustrySelection onContinue={handleEnterpriseContinue} />
      )}
      {currentScreen === "questionnaire" && (
        <BusinessQuestionnaire onContinue={handleQuestionnaireContinue} />
      )}
      {currentScreen === "equity" && (
        <EquityPartnership onContinue={handleEquityContinue} />
      )}
      {currentScreen === "review" && (
        <ReviewSubmit
          profileData={profileData}
          enterpriseData={enterpriseData}
          businessAnswers={questionnaireAnswers}
          equityAnswer={equityAnswer}
          onEdit={handleEdit}
          onSubmit={handleSubmit}
        />
      )}
      {currentScreen === "admin" && (
        <AdminDashboard />
      )}
      {currentScreen === "dashboard" && (
        <EntrepreneurDashboard
          profileData={profileData}
          onScheduleMeeting={handleScheduleMeeting}
          onJoinMeeting={handleJoinMeeting}
          onLogout={handleLogout}
        />
      )}
      {currentScreen === "schedule" && (
        <ScheduleMeeting
          onBack={handleGoToDashboard}
          onSchedule={(details) => {
            // Show confirmation modal
            setConfirmedMeeting({
              id: Date.now().toString(),
              title: "Meeting with Quiver Team",
              date: details.date,
              time: details.time,
              mentor: "Quiver Team",
              type: details.type,
              meetLink: `https://meet.google.com/${Date.now()}`
            });
            setShowMeetingConfirmation(true);
          }}
        />
      )}
      {currentScreen === "ai-pathway" && sessionId && (
        <AIGrowthPathway
          sessionId={sessionId}
          industry={industry}
          businessData={enterpriseData ? {
            business_name: enterpriseData.businessName,
            year_started: enterpriseData.yearStarted,
            sector: enterpriseData.sector
          } : {}}
          onBack={() => setCurrentScreen("industry")}
          onContinue={() => setCurrentScreen("questionnaire")}
        />
      )}
      {currentScreen === "video-meeting" && currentMeeting && (
        <GoogleMeetMeeting
          meetingId={currentMeeting.id}
          meetingTitle={currentMeeting.title}
          onEndCall={handleEndCall}
        />
      )}
      {currentScreen === "voice-onboarding" && (
        <VoiceOnboarding
          phone={phone}
          onBack={() => setCurrentScreen("consent")}
          onComplete={(newSessionId) => {
            setSessionId(newSessionId);
            onboarding.setSessionId(newSessionId);
            setCurrentScreen("review");
          }}
        />
      )}

      {/* AI Avatar - shown on onboarding screens */}
      {showAvatar && (
        <AvatarContainer
          mode="floating"
          currentScreen={currentScreen}
          onMessage={(msg) => console.log('Avatar message:', msg)}
        />
      )}

      {/* Quiver AI Voice Assistant - shown on onboarding screens */}
      {showVoiceAgent && (
        <QuiverAIAssistant currentScreen={getVoiceAgentScreen()} />
      )}

      {/* Resume Journey Modal */}
      <ResumeJourneyModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        onResume={handleResumeJourney}
        onStartFresh={handleStartFresh}
        lastStep={savedProgress.step}
        lastSaved={savedProgress.lastSaved}
        completionPercentage={onboarding.getCompletionPercentage()}
      />

      {/* Meeting Confirmation Modal */}
      <MeetingConfirmationModal
        isOpen={showMeetingConfirmation}
        onClose={() => {
          setShowMeetingConfirmation(false);
          setCurrentScreen("dashboard");
        }}
        meeting={confirmedMeeting}
      />
    </>
  );
}