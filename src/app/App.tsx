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
import { VoiceOnboarding } from "./screens/voice-onboarding";
import { QuiverAIAssistant } from "./components/voice/QuiverAIAssistant";
import type { ScreenType } from "../config/formFieldMappings";
import { sendOTP, verifyOTP, startOnboarding, updateField, bulkUpdateFields, getOnboardingData, submitOnboarding, logout as apiLogout } from "../services/api";
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

// Get initial screen from URL path
const getInitialScreen = (): Screen => {
  const path = window.location.pathname;
  if (path === '/admin') return 'admin';
  if (path === '/dashboard') return 'dashboard';
  if (path === '/login') return 'login';
  return 'landing';
};

export default function App() {
  const { t } = useTranslation();
  const onboarding = useOnboarding();

  const [currentScreen, setCurrentScreen] = useState<Screen>(getInitialScreen);
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
  const [submitting, setSubmitting] = useState(false);
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

  // Track if initial routing has been handled
  const [initialRouteHandled, setInitialRouteHandled] = useState(false);

  // Debug: Monitor screen changes and update URL
  useEffect(() => {
    console.log('>>> Screen changed to:', currentScreen);
    // Only update URL after initial routing is done
    if (!initialRouteHandled) return;

    // Update URL to reflect current screen (without page reload)
    const screenToPath: Record<string, string> = {
      'landing': '/',
      'admin': '/admin',
      'dashboard': '/dashboard',
      'login': '/login',
      'schedule': '/schedule'
    };
    const path = screenToPath[currentScreen];
    if (path && window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  }, [currentScreen, initialRouteHandled]);

  // Combined routing and auth check on mount
  useEffect(() => {
    const path = window.location.pathname;
    const accessToken = localStorage.getItem('access_token');

    console.log('Initial routing - path:', path, 'hasToken:', !!accessToken, 'currentScreen:', currentScreen);

    // Handle /admin route
    if (path === '/admin') {
      if (accessToken) {
        setIsAuthenticated(true);
        // Screen already set to 'admin' by getInitialScreen, just confirm auth
      } else {
        // Need to login first
        localStorage.setItem('redirect_after_login', '/admin');
        setCurrentScreen('login');
      }
      setInitialRouteHandled(true);
      return;
    }

    // Handle /dashboard route
    if (path === '/dashboard') {
      if (accessToken) {
        setIsAuthenticated(true);
        // Screen already set to 'dashboard' by getInitialScreen
      } else {
        localStorage.setItem('redirect_after_login', '/dashboard');
        setCurrentScreen('login');
      }
      setInitialRouteHandled(true);
      return;
    }

    // Handle /login route
    if (path === '/login') {
      // Screen already set to 'login' by getInitialScreen
      setInitialRouteHandled(true);
      return;
    }

    // Default behavior for root path or other paths
    if (accessToken) {
      setIsAuthenticated(true);
      const savedData = onboardingStorage.getData();
      if (savedData.sessionId && !savedData.completedSteps.includes(5)) {
        setSavedProgress({
          step: savedData.currentStep,
          lastSaved: savedData.lastSaved ? new Date(savedData.lastSaved) : null
        });
        setShowResumeModal(true);
      } else {
        setCurrentScreen('dashboard');
      }
    }
    // If no token and root path, stay on landing (default state)

    setInitialRouteHandled(true);
  }, []);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const accessToken = localStorage.getItem('access_token');

      if (path === '/admin' && accessToken) {
        setCurrentScreen('admin');
      } else if (path === '/dashboard' && accessToken) {
        setCurrentScreen('dashboard');
      } else if (path === '/login') {
        setCurrentScreen('login');
      } else if (path === '/') {
        setCurrentScreen('landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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

      // Check for redirect after login (e.g., /admin)
      const redirectPath = localStorage.getItem('redirect_after_login');
      if (redirectPath) {
        localStorage.removeItem('redirect_after_login');
        if (redirectPath === '/admin') {
          setCurrentScreen('admin');
          return;
        }
        if (redirectPath === '/dashboard') {
          setCurrentScreen('dashboard');
          return;
        }
      }

      const { onboarding_completed } = response;

      // Route based on onboarding status
      if (onboarding_completed) {
        console.log('User has completed onboarding, going to dashboard');
        // Clear any stale local data
        onboardingStorage.clear();
        setCurrentScreen("dashboard");
      } else {
        // Check for saved progress - but only for the SAME phone number
        const savedData = onboardingStorage.getData();
        const isSamePhone = savedData.phone === phone;

        // If different phone number, clear old data
        if (!isSamePhone && savedData.phone) {
          console.log('Different phone number detected, clearing old data');
          onboardingStorage.clear();
        }

        const startResponse = await startOnboarding();
        setSessionId(startResponse.session_id);
        onboarding.setSessionId(startResponse.session_id);

        // Save phone number for future checks
        onboardingStorage.setPhone(phone);
        onboardingStorage.setSessionId(startResponse.session_id);

        // If same phone and has saved progress beyond consent, resume from there
        if (isSamePhone && savedData.currentStep > 0 && savedData.completedSteps.length > 0) {
          console.log('Resuming onboarding from step:', savedData.currentStep);
          const stepScreenMap: Record<number, Screen> = {
            0: 'consent',
            1: 'profile',
            2: 'industry',
            3: 'questionnaire',
            4: 'equity',
            5: 'review'
          };
          setCurrentScreen(stepScreenMap[savedData.currentStep] || 'consent');
        } else {
          console.log('Starting fresh onboarding with consent screen');
          setCurrentScreen("consent");
        }
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
    // Mark consent step as completed and move to profile
    onboardingStorage.completeStep(0);
    onboardingStorage.setCurrentStep(1);
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
      // Mark profile step as completed and move to industry
      onboardingStorage.completeStep(1);
      onboardingStorage.setCurrentStep(2);
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
      // Mark industry step as completed and move to questionnaire
      onboardingStorage.completeStep(2);
      onboardingStorage.setCurrentStep(3);
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
      // Mark questionnaire step as completed and move to equity
      onboardingStorage.completeStep(3);
      onboardingStorage.setCurrentStep(4);
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
      // Mark equity step as completed and move to review
      onboardingStorage.completeStep(4);
      onboardingStorage.setCurrentStep(5);
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

  const handleSubmit = async () => {
    console.log('=== handleSubmit START ===');
    console.log('sessionId:', sessionId);
    console.log('currentScreen before:', currentScreen);

    setSubmitting(true);

    try {
      // Submit to backend
      if (sessionId) {
        console.log('Calling submitOnboarding API...');
        const result = await submitOnboarding(sessionId);
        console.log('API result:', result);
      } else {
        console.warn('No sessionId available for submission');
      }

      // Mark final step as completed and clear progress
      console.log('Clearing storage...');
      onboardingStorage.completeStep(5);
      onboardingStorage.clear();

      console.log('Setting screen to success...');
      setCurrentScreen("success");
      console.log('=== handleSubmit SUCCESS ===');

    } catch (error) {
      console.error('=== handleSubmit ERROR ===', error);
      // Still show success since data was saved via bulkUpdateFields earlier
      onboardingStorage.completeStep(5);
      onboardingStorage.clear();
      setCurrentScreen("success");
    } finally {
      setSubmitting(false);
    }
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

    // Check for redirect after login (e.g., /admin)
    const redirectPath = localStorage.getItem('redirect_after_login');
    if (redirectPath) {
      localStorage.removeItem('redirect_after_login');
      if (redirectPath === '/admin') {
        setCurrentScreen('admin');
        return;
      }
      if (redirectPath === '/dashboard') {
        setCurrentScreen('dashboard');
        return;
      }
    }

    const { onboarding_completed } = data.response;

    // Route based on onboarding status
    if (onboarding_completed) {
      // User has completed onboarding → Dashboard
      console.log('User has completed onboarding, going to dashboard');
      // Clear any stale local data
      onboardingStorage.clear();
      setCurrentScreen("dashboard");
    } else {
      // Check for saved progress - but only for the SAME phone number
      const savedData = onboardingStorage.getData();
      const isSamePhone = savedData.phone === data.phone;
      console.log('Saved progress:', savedData, 'Same phone:', isSamePhone);

      // If different phone number, clear old data
      if (!isSamePhone && savedData.phone) {
        console.log('Different phone number detected, clearing old data');
        onboardingStorage.clear();
      }

      try {
        const startResponse = await startOnboarding();
        setSessionId(startResponse.session_id);
        onboarding.setSessionId(startResponse.session_id);

        // Save phone number for future checks
        onboardingStorage.setPhone(data.phone);
        onboardingStorage.setSessionId(startResponse.session_id);

        // If same phone and has saved progress beyond consent, resume from there
        if (isSamePhone && savedData.currentStep > 0 && savedData.completedSteps.length > 0) {
          console.log('Resuming onboarding from step:', savedData.currentStep);
          const stepScreenMap: Record<number, Screen> = {
            0: 'consent',
            1: 'profile',
            2: 'industry',
            3: 'questionnaire',
            4: 'equity',
            5: 'review'
          };
          setCurrentScreen(stepScreenMap[savedData.currentStep] || 'consent');
        } else {
          console.log('Starting fresh onboarding with consent screen');
          setCurrentScreen("consent");
        }
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-6">
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
        <div className="fixed top-4 left-4 right-4 bg-amber-500 text-white p-4 rounded-lg z-50">
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
          isSubmitting={submitting}
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
            // Show confirmation modal with real data from API
            setConfirmedMeeting({
              id: details.meetingId || Date.now().toString(),
              title: "Meeting with Quiver Team",
              date: details.date,
              time: details.time,
              mentor: "Quiver Team",
              type: details.type,
              meetLink: details.meetLink || 'Link will be available shortly'
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