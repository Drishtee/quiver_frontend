import { useState, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import {
  Eye,
  Download,
  Search,
  Users,
  CheckCircle2,
  Clock,
  AudioLines,
  Play,
  Pause,
  RefreshCw,
  FileAudio,
  Calendar,
  User,
  Building2,
  TrendingUp,
  UserCheck,
  UserPlus,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Filter,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Video,
  Plus,
  X,
  ExternalLink,
  Trash2,
  Edit,
  BarChart3,
  PieChart,
  Activity,
  Briefcase,
  Lock,
  Shield,
  LogOut
} from "lucide-react";
import { IllustrationPlaceholder } from "../components/IllustrationPlaceholder";
import { sendOTP, verifyOTP, logout } from "../../services/api";

// API Base URL
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Tab type
type TabType = 'overview' | 'entrepreneurs' | 'recordings' | 'meetings';

// Types
interface Metrics {
  total_users: number;
  verified_users: number;
  total_onboarding_sessions: number;
  completed_onboarding: number;
  completion_rate: number;
  signups_by_date: { date: string; count: number }[];
}

interface Funnel {
  total_signups: number;
  phone_verified: number;
  onboarding_started: number;
  onboarding_in_progress: number;
  onboarding_submitted: number;
  onboarding_reviewed: number;
}

interface Entrepreneur {
  session_id: string;
  status: string;
  phone: string;
  name: string;
  email?: string;
  gender?: string;
  age?: string;
  education?: string;
  business_name: string;
  business_type: string;
  state: string;
  district: string;
  year_started?: string;
  ownership_type?: string;
  role?: string;
  created_at: string;
}

interface AudioRecord {
  id: number;
  audio_url: string;
  transcript?: string;
  duration_seconds?: number;
  file_size_bytes?: number;
  screen?: string;
  field_key?: string;
  recorded_at?: string;
  created_at: string;
  session_id?: string;
  entrepreneur_name?: string;
  entrepreneur_phone?: string;
}

interface Meeting {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: string;
  meeting_link?: string;
  organizer_name?: string;
  participants?: { name: string; phone: string; status: string }[];
}

interface Slot {
  id: string;
  start_time: string;
  end_time: string;
  title: string;
  status: string;
  booked_by_name?: string;
  booked_by_phone?: string;
  meeting_link?: string;
}

interface Breakdown {
  total_filtered: number;
  status_breakdown: Record<string, number>;
  industry_breakdown: Record<string, number>;
  state_breakdown: Record<string, number>;
}

// Indian states for filter
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const INDUSTRIES = [
  { value: "food-processing", label: "Food Processing" },
  { value: "agriculture", label: "Agriculture & Allied" },
  { value: "livestock", label: "Livestock/Dairy/Poultry" },
  { value: "textile", label: "Textile/Handicraft" },
  { value: "services", label: "Services" },
  { value: "other", label: "Other" }
];

// Admin Login Component
function AdminLogin({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await sendOTP(phone);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await verifyOTP(phone, otp);
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          {/* TODO: Replace with final illustration — see GRAPHIC_DESIGN_SPEC.md */}
          <IllustrationPlaceholder
            id="GFX-ADMIN-001"
            label="Admin control room with multiple dashboard screens"
            width="400px"
            height="400px"
            className="hidden lg:block mx-auto"
          />
          <h1 className="text-2xl font-bold text-gray-900">Quiver Admin</h1>
          <p className="text-gray-500 mt-2">Enter your credentials to access the dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {step === "phone" ? (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-11 h-12"
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter the phone number associated with your admin account
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handleSendOtp}
                disabled={isLoading}
                className="w-full h-12 bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Lock className="w-5 h-5 mr-2" />
                )}
                Send OTP
              </Button>
            </>
          ) : (
            <>
              <div className="mb-4">
                <button
                  onClick={() => { setStep("phone"); setOtp(""); setError(null); }}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Change phone number
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="pl-11 h-12 text-center text-2xl tracking-widest font-mono"
                    maxLength={6}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  OTP sent to {phone}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handleVerifyOtp}
                disabled={isLoading || otp.length !== 6}
                className="w-full h-12 bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Shield className="w-5 h-5 mr-2" />
                )}
                Verify & Login
              </Button>

              <button
                onClick={handleSendOtp}
                disabled={isLoading}
                className="w-full mt-4 text-sm text-gray-500 hover:text-primary"
              >
                Resend OTP
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Only authorized administrators can access this dashboard.
          <br />
          Contact support if you need admin access.
        </p>
      </div>
    </div>
  );
}

// Main Admin Dashboard Export with Auth Check
export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
  };

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // Show dashboard if authenticated
  return <AdminDashboardContent onLogout={handleLogout} />;
}

// The actual dashboard content (renamed from original AdminDashboard)
function AdminDashboardContent({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Metrics state
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Entrepreneurs state
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [loadingEntrepreneurs, setLoadingEntrepreneurs] = useState(false);
  const [entrepreneursPage, setEntrepreneursPage] = useState(1);
  const [totalEntrepreneurs, setTotalEntrepreneurs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("");

  // Audio recordings state
  const [audioRecordings, setAudioRecordings] = useState<AudioRecord[]>([]);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [audioSearchQuery, setAudioSearchQuery] = useState("");
  const [screenFilter, setScreenFilter] = useState("all");
  const [audioViewMode, setAudioViewMode] = useState<"table" | "grouped">("table");
  const [entrepreneurFilter, setEntrepreneurFilter] = useState("all");
  const [expandedTranscript, setExpandedTranscript] = useState<number | null>(null);
  const [audioDiagnostics, setAudioDiagnostics] = useState<{
    azure_configured?: boolean;
    total_records_in_db?: number;
    total_sessions?: number;
    user_tenant?: string | null;
  } | null>(null);

  // Meetings state
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({
    start_time: "",
    end_time: "",
    title: "",
    meeting_link: ""
  });

  // Selected entrepreneur for detail view
  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState<Entrepreneur | null>(null);
  const [selectedProfileData, setSelectedProfileData] = useState<Record<string, { value: string; status: string; source: string; updated_at: string }>>({});
  const [entrepreneurAudio, setEntrepreneurAudio] = useState<AudioRecord[]>([]);

  // Auth header helper
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json'
  });

  // Fetch metrics and funnel data
  const fetchMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    try {
      console.log('Fetching admin metrics...');
      console.log('API URL:', API_URL);
      console.log('Access token present:', !!localStorage.getItem('access_token'));

      const [metricsRes, funnelRes, breakdownRes] = await Promise.all([
        fetch(`${API_URL}/onboarding/admin/metrics/`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/onboarding/admin/funnel/`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/onboarding/admin/breakdown/`, { headers: getAuthHeaders() })
      ]);

      console.log('Metrics response:', metricsRes.status);
      console.log('Funnel response:', funnelRes.status);
      console.log('Breakdown response:', breakdownRes.status);

      // Check for authorization errors
      if (metricsRes.status === 403 || funnelRes.status === 403 || breakdownRes.status === 403) {
        setIsAuthorized(false);
        setAuthError('You need admin access to view this dashboard. Please contact an administrator to get admin privileges.');
        return;
      }

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        console.log('Metrics data:', data);
        setMetrics(data);
      } else {
        console.error('Metrics error:', await metricsRes.json().catch(() => ({})));
      }
      if (funnelRes.ok) {
        const data = await funnelRes.json();
        console.log('Funnel data:', data);
        setFunnel(data.funnel);
      } else {
        console.error('Funnel error:', await funnelRes.json().catch(() => ({})));
      }
      if (breakdownRes.ok) {
        const data = await breakdownRes.json();
        console.log('Breakdown data:', data);
        setBreakdown(data);
      } else {
        console.error('Breakdown error:', await breakdownRes.json().catch(() => ({})));
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  // Fetch entrepreneurs
  const fetchEntrepreneurs = useCallback(async () => {
    setLoadingEntrepreneurs(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams({
        page: entrepreneursPage.toString(),
        limit: '20'
      });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (industryFilter !== 'all') params.append('industry', industryFilter);
      if (stateFilter !== 'all') params.append('state', stateFilter);

      console.log('Fetching entrepreneurs with params:', params.toString());
      console.log('Auth headers:', getAuthHeaders());

      const response = await fetch(
        `${API_URL}/onboarding/admin/entrepreneurs/?${params}`,
        { headers: getAuthHeaders() }
      );

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Entrepreneurs data:', data);
        setEntrepreneurs(data.entrepreneurs || []);
        setTotalEntrepreneurs(data.total || 0);
        setTotalPages(data.total_pages || 1);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch entrepreneurs:', response.status, errorData);
        setFetchError(`Error ${response.status}: ${errorData.error || 'Failed to load entrepreneurs'}`);
      }
    } catch (error) {
      console.error('Failed to fetch entrepreneurs:', error);
      setFetchError(error instanceof Error ? error.message : 'Network error');
    } finally {
      setLoadingEntrepreneurs(false);
    }
  }, [entrepreneursPage, statusFilter, industryFilter, stateFilter]);

  // Fetch audio recordings
  const fetchAudioRecordings = useCallback(async () => {
    setLoadingAudio(true);
    try {
      const response = await fetch(
        `${API_URL}/onboarding/admin/audio-records/`,
        { headers: getAuthHeaders() }
      );

      if (response.ok) {
        const data = await response.json();
        setAudioRecordings(data.audio_records || []);
        if (data.diagnostics) {
          setAudioDiagnostics(data.diagnostics);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Audio records fetch failed:', response.status, errorData);
      }
    } catch (error) {
      console.error('Failed to fetch audio recordings:', error);
    } finally {
      setLoadingAudio(false);
    }
  }, []);

  // Fetch meetings and slots
  const fetchMeetings = useCallback(async () => {
    setLoadingMeetings(true);
    try {
      const [meetingsRes, slotsRes] = await Promise.all([
        fetch(`${API_URL}/meetings/list/`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/meetings/slots/`, { headers: getAuthHeaders() })
      ]);

      if (meetingsRes.ok) {
        const data = await meetingsRes.json();
        setMeetings(data.meetings || []);
      }
      if (slotsRes.ok) {
        const data = await slotsRes.json();
        setSlots(data.slots || []);
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    } finally {
      setLoadingMeetings(false);
    }
  }, []);

  // Fetch entrepreneur profile with audio
  const fetchEntrepreneurProfile = async (sessionId: string) => {
    try {
      const [profileRes, audioRes] = await Promise.all([
        fetch(`${API_URL}/onboarding/admin/profile/${sessionId}/`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/onboarding/admin/audio-records/`, { headers: getAuthHeaders() })
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        const ent = entrepreneurs.find(e => e.session_id === sessionId);
        if (ent) {
          // Extract plain values from profile_data for display
          const profileFields = data.profile_data || {};
          const extractedValues: Record<string, string> = {};
          for (const [key, fieldData] of Object.entries(profileFields)) {
            const fd = fieldData as { value: string; status: string; source: string; updated_at: string };
            extractedValues[key] = fd.value || '';
          }
          setSelectedEntrepreneur({
            ...ent,
            name: extractedValues.full_name || extractedValues.owner_name || extractedValues.fullName || ent.name,
            email: extractedValues.email || ent.email,
            business_name: extractedValues.business_name || ent.business_name,
            business_type: extractedValues.business_type || extractedValues.sector || ent.business_type,
            state: extractedValues.state || ent.state,
            district: extractedValues.district || ent.district,
            gender: extractedValues.gender || ent.gender,
            age: extractedValues.age || ent.age,
            education: extractedValues.education || ent.education,
            year_started: extractedValues.year_started || ent.year_started,
            ownership_type: extractedValues.ownership_type || ent.ownership_type,
            role: extractedValues.role || ent.role,
          });
          setSelectedProfileData(profileFields);
        }
      }
      if (audioRes.ok) {
        const data = await audioRes.json();
        // Filter audio records by session
        const sessionAudio = (data.audio_records || []).filter(
          (rec: AudioRecord) => rec.session_id === sessionId
        );
        setEntrepreneurAudio(sessionAudio.length > 0 ? sessionAudio : data.audio_records || []);
      }
    } catch (error) {
      console.error('Failed to fetch entrepreneur profile:', error);
    }
  };

  // Create new slot
  const createSlot = async () => {
    try {
      const response = await fetch(`${API_URL}/meetings/slots/create/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newSlot)
      });

      if (response.ok) {
        setShowAddSlot(false);
        setNewSlot({ start_time: "", end_time: "", title: "", meeting_link: "" });
        fetchMeetings();
      }
    } catch (error) {
      console.error('Failed to create slot:', error);
    }
  };

  // Effects
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    if (activeTab === 'entrepreneurs') {
      fetchEntrepreneurs();
    } else if (activeTab === 'recordings') {
      fetchAudioRecordings();
    } else if (activeTab === 'meetings') {
      fetchMeetings();
    }
  }, [activeTab, fetchEntrepreneurs, fetchAudioRecordings, fetchMeetings]);

  // Audio playback
  const handlePlayPause = (recording: AudioRecord) => {
    if (playingId === recording.id) {
      audioElement?.pause();
      setPlayingId(null);
    } else {
      // Check if audio URL is valid (not a placeholder from failed Azure upload)
      if (!recording.audio_url || recording.audio_url.startsWith('upload_failed://')) {
        console.warn('Audio file not available (Azure upload failed for this recording)');
        return;
      }
      audioElement?.pause();
      const audio = new Audio(recording.audio_url);
      audio.onended = () => setPlayingId(null);
      audio.onerror = () => setPlayingId(null);
      audio.play();
      setAudioElement(audio);
      setPlayingId(recording.id);
    }
  };

  // Filter entrepreneurs locally by search
  const filteredEntrepreneurs = entrepreneurs.filter(ent => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ent.name?.toLowerCase().includes(q) ||
      ent.phone?.includes(q) ||
      ent.business_name?.toLowerCase().includes(q) ||
      ent.district?.toLowerCase().includes(q)
    );
  });

  // Filter audio recordings
  const filteredRecordings = audioRecordings.filter(rec => {
    const matchesSearch = !audioSearchQuery ||
      rec.transcript?.toLowerCase().includes(audioSearchQuery.toLowerCase()) ||
      rec.entrepreneur_name?.toLowerCase().includes(audioSearchQuery.toLowerCase()) ||
      rec.entrepreneur_phone?.includes(audioSearchQuery);
    const matchesScreen = screenFilter === "all" || rec.screen === screenFilter;
    const matchesEntrepreneur = entrepreneurFilter === "all" ||
      rec.entrepreneur_phone === entrepreneurFilter ||
      rec.session_id === entrepreneurFilter;
    return matchesSearch && matchesScreen && matchesEntrepreneur;
  });

  // Get unique entrepreneurs for filter dropdown
  const uniqueEntrepreneurs = Array.from(
    new Map(
      audioRecordings
        .filter(rec => rec.entrepreneur_phone || rec.session_id)
        .map(rec => [
          rec.entrepreneur_phone || rec.session_id,
          {
            phone: rec.entrepreneur_phone,
            name: rec.entrepreneur_name,
            sessionId: rec.session_id
          }
        ])
    ).values()
  );

  // Group recordings by entrepreneur
  const groupedRecordings = filteredRecordings.reduce((acc, rec) => {
    const key = rec.entrepreneur_phone || rec.session_id || 'unknown';
    if (!acc[key]) {
      acc[key] = {
        name: rec.entrepreneur_name || 'Unknown',
        phone: rec.entrepreneur_phone || '-',
        sessionId: rec.session_id,
        recordings: [],
        totalDuration: 0
      };
    }
    acc[key].recordings.push(rec);
    acc[key].totalDuration += rec.duration_seconds || 0;
    return acc;
  }, {} as Record<string, { name: string; phone: string; sessionId?: string; recordings: AudioRecord[]; totalDuration: number }>);

  // Audio stats
  const audioStats = {
    totalRecordings: filteredRecordings.length,
    totalDuration: filteredRecordings.reduce((acc, r) => acc + (r.duration_seconds || 0), 0),
    totalSize: filteredRecordings.reduce((acc, r) => acc + (r.file_size_bytes || 0), 0),
    uniqueEntrepreneurs: Object.keys(groupedRecordings).length,
    withTranscript: filteredRecordings.filter(r => r.transcript).length
  };

  // Helpers
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'submitted': 'bg-green-100 text-green-700',
      'reviewed': 'bg-blue-100 text-blue-700',
      'in_progress': 'bg-amber-100 text-amber-700',
      'completed': 'bg-green-100 text-green-700',
      'available': 'bg-green-100 text-green-700',
      'booked': 'bg-blue-100 text-blue-700',
      'cancelled': 'bg-amber-100 text-amber-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getScreenLabel = (screen?: string) => {
    const labels: Record<string, string> = {
      'profile': 'Profile',
      'industry': 'Business Details',
      'questionnaire': 'Questionnaire',
      'equity': 'Partnership',
      'consent': 'Consent'
    };
    return labels[screen || ''] || screen || 'Unknown';
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Funnel step component
  const FunnelStep = ({ label, value, percentage, isLast = false }: { label: string; value: number; percentage: number; isLast?: boolean }) => (
    <div className="flex items-center">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-bold text-gray-900">{value.toLocaleString()}</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% conversion</p>
      </div>
      {!isLast && (
        <ArrowRight className="w-5 h-5 text-gray-300 mx-4 flex-shrink-0" />
      )}
    </div>
  );

  // Show authorization error
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          {/* TODO: Replace with final illustration — see GRAPHIC_DESIGN_SPEC.md (GFX-ADMIN-002: Access denied / locked gate illustration) */}
          <p className="text-gray-600 mb-6">{authError}</p>
          <p className="text-sm text-gray-500 mb-4">
            To grant admin access, run this command in Django shell:
          </p>
          <code className="block bg-gray-100 p-3 rounded-lg text-sm text-left mb-6 overflow-x-auto">
            User.objects.filter(phone='YOUR_PHONE').update(is_staff=True)
          </code>
          <Button onClick={() => window.location.reload()} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Quiver Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">Quiver Admin</h1>
              <p className="text-xs md:text-sm text-gray-500">Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchMetrics} className="hidden md:flex">
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingMetrics ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Export CSV</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <LogOut className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-[73px] z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'entrepreneurs', label: 'Entrepreneurs', icon: Users },
              { id: 'recordings', label: 'Recordings', icon: AudioLines },
              { id: 'meetings', label: 'Meetings', icon: CalendarDays }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-primary border-primary'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Total Signups</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                      {metrics?.total_users?.toLocaleString() || '-'}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Verified Users</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                      {metrics?.verified_users?.toLocaleString() || '-'}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Completed</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                      {metrics?.completed_onboarding?.toLocaleString() || '-'}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Completion Rate</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                      {metrics?.completion_rate?.toFixed(1) || 0}%
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Funnel Widget */}
            {funnel && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-gray-900">Signup Funnel</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <FunnelStep
                    label="Signups"
                    value={funnel.total_signups}
                    percentage={100}
                  />
                  <FunnelStep
                    label="Verified"
                    value={funnel.phone_verified}
                    percentage={funnel.total_signups ? (funnel.phone_verified / funnel.total_signups) * 100 : 0}
                  />
                  <FunnelStep
                    label="Started"
                    value={funnel.onboarding_started}
                    percentage={funnel.total_signups ? (funnel.onboarding_started / funnel.total_signups) * 100 : 0}
                  />
                  <FunnelStep
                    label="Submitted"
                    value={funnel.onboarding_submitted}
                    percentage={funnel.total_signups ? (funnel.onboarding_submitted / funnel.total_signups) * 100 : 0}
                  />
                  <FunnelStep
                    label="Reviewed"
                    value={funnel.onboarding_reviewed}
                    percentage={funnel.total_signups ? (funnel.onboarding_reviewed / funnel.total_signups) * 100 : 0}
                    isLast
                  />
                </div>
              </div>
            )}

            {/* Breakdown Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Breakdown */}
              {breakdown?.status_breakdown && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <PieChart className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-gray-900">By Status</h3>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(breakdown.status_breakdown).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${getStatusColor(status).split(' ')[0]}`} />
                          <span className="text-sm text-gray-700 capitalize">{status.replace('_', ' ')}</span>
                        </div>
                        <span className="font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Industry Breakdown */}
              {breakdown?.industry_breakdown && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-gray-900">By Industry</h3>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(breakdown.industry_breakdown).slice(0, 6).map(([industry, count]) => (
                      <div key={industry} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{industry || 'Not specified'}</span>
                        <span className="font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* State Breakdown */}
              {breakdown?.state_breakdown && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-gray-900">By State (Top 10)</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(breakdown.state_breakdown).slice(0, 10).map(([state, count]) => (
                      <div key={state} className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">{count}</p>
                        <p className="text-xs text-gray-500 truncate" title={state}>{state || 'Not specified'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ENTREPRENEURS TAB */}
        {activeTab === 'entrepreneurs' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search name, phone, business..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setEntrepreneursPage(1); }}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={industryFilter} onValueChange={(v) => { setIndustryFilter(v); setEntrepreneursPage(1); }}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {INDUSTRIES.map(ind => (
                      <SelectItem key={ind.value} value={ind.value}>{ind.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={stateFilter} onValueChange={(v) => { setStateFilter(v); setEntrepreneursPage(1); }}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {INDIAN_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Entrepreneurs Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {loadingEntrepreneurs ? (
                <div className="p-12 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-gray-500">Loading entrepreneurs...</p>
                </div>
              ) : fetchError ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                    <X className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-2">Failed to load entrepreneurs</p>
                  <p className="text-red-500 mb-4">{fetchError}</p>
                  <Button onClick={fetchEntrepreneurs} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              ) : filteredEntrepreneurs.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium text-gray-900 mb-2">No entrepreneurs found</p>
                  <p className="text-gray-500">
                    {totalEntrepreneurs === 0
                      ? "No entrepreneurs have registered yet"
                      : "Try adjusting your filters"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold">Name</TableHead>
                          <TableHead className="font-semibold">Phone</TableHead>
                          <TableHead className="font-semibold">Business</TableHead>
                          <TableHead className="font-semibold">Location</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEntrepreneurs.map((ent) => (
                          <TableRow key={ent.session_id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="w-4 h-4 text-primary" />
                                </div>
                                <span className="font-medium text-gray-900">{ent.name || '-'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {ent.phone}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{ent.business_name || '-'}</p>
                                <p className="text-xs text-gray-500">{ent.business_type || '-'}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-gray-600 text-sm">
                                <MapPin className="w-3 h-3" />
                                {ent.district && ent.state ? `${ent.district}, ${ent.state}` : ent.state || '-'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ent.status)}`}>
                                {ent.status?.replace('_', ' ')}
                              </span>
                            </TableCell>
                            <TableCell className="text-gray-500 text-sm">
                              {formatDate(ent.created_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => fetchEntrepreneurProfile(ent.session_id)}
                                className="hover:bg-primary/10 hover:text-primary"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Page {entrepreneursPage} of {totalPages} ({totalEntrepreneurs} total)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={entrepreneursPage <= 1}
                        onClick={() => setEntrepreneursPage(p => p - 1)}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={entrepreneursPage >= totalPages}
                        onClick={() => setEntrepreneursPage(p => p + 1)}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* RECORDINGS TAB */}
        {activeTab === 'recordings' && (
          <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                    <AudioLines className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-lg font-bold text-gray-900">{audioStats.totalRecordings}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-lg font-bold text-gray-900">{formatDuration(audioStats.totalDuration)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Entrepreneurs</p>
                    <p className="text-lg font-bold text-gray-900">{audioStats.uniqueEntrepreneurs}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <FileAudio className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">With Transcript</p>
                    <p className="text-lg font-bold text-gray-900">{audioStats.withTranscript}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Download className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Size</p>
                    <p className="text-lg font-bold text-gray-900">{formatFileSize(audioStats.totalSize)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search transcript, name, phone..."
                    value={audioSearchQuery}
                    onChange={(e) => setAudioSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={entrepreneurFilter} onValueChange={setEntrepreneurFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Entrepreneur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Entrepreneurs</SelectItem>
                    {uniqueEntrepreneurs.map((ent) => (
                      <SelectItem key={ent.phone || ent.sessionId} value={ent.phone || ent.sessionId || ''}>
                        {ent.name || ent.phone || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={screenFilter} onValueChange={setScreenFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Screen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Screens</SelectItem>
                    <SelectItem value="profile">Profile</SelectItem>
                    <SelectItem value="industry">Business Details</SelectItem>
                    <SelectItem value="questionnaire">Questionnaire</SelectItem>
                    <SelectItem value="equity">Partnership</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setAudioViewMode("table")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      audioViewMode === "table"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Table
                  </button>
                  <button
                    onClick={() => setAudioViewMode("grouped")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      audioViewMode === "grouped"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Grouped
                  </button>
                </div>
                <Button variant="outline" onClick={fetchAudioRecordings} disabled={loadingAudio}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingAudio ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                {audioRecordings.some(r => r.audio_url?.startsWith('upload_failed://')) && (
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={async () => {
                      if (!confirm('Remove recordings with failed audio uploads? (Transcripts will be lost)')) return;
                      try {
                        await fetch(`${API_URL}/onboarding/admin/audio-records/cleanup/`, {
                          method: 'DELETE',
                          headers: getAuthHeaders()
                        });
                        fetchAudioRecordings();
                      } catch (e) {
                        console.error('Cleanup failed:', e);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clean Failed
                  </Button>
                )}
              </div>
            </div>

            {/* Recordings Content */}
            {loadingAudio ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-gray-500">Loading recordings...</p>
              </div>
            ) : filteredRecordings.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <FileAudio className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-900 mb-2">No recordings found</p>
                <p className="text-gray-500 mb-4">Voice recordings will appear here when entrepreneurs use the AI assistant</p>
                {audioDiagnostics && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left max-w-md mx-auto">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Diagnostics</p>
                    <div className="space-y-1 text-xs text-gray-500">
                      <p>Records in DB: <span className="font-mono font-bold text-gray-700">{audioDiagnostics.total_records_in_db ?? 'N/A'}</span></p>
                      <p>Total sessions: <span className="font-mono font-bold text-gray-700">{audioDiagnostics.total_sessions ?? 'N/A'}</span></p>
                      <p>Azure configured: <span className={`font-mono font-bold ${audioDiagnostics.azure_configured ? 'text-green-600' : 'text-red-600'}`}>{audioDiagnostics.azure_configured ? 'Yes' : 'No'}</span></p>
                      {!audioDiagnostics.azure_configured && (
                        <p className="text-amber-600 mt-2">Azure storage is not configured. Set AZURE_STORAGE_SAS_TOKEN environment variable on the backend.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : audioViewMode === "table" ? (
              /* Table View */
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-12"></TableHead>
                        <TableHead className="font-semibold">Entrepreneur</TableHead>
                        <TableHead className="font-semibold">Screen</TableHead>
                        <TableHead className="font-semibold">Transcript</TableHead>
                        <TableHead className="font-semibold">Duration</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecordings.map((rec) => (
                        <TableRow key={rec.id} className="hover:bg-gray-50">
                          <TableCell>
                            {rec.audio_url && !rec.audio_url.startsWith('upload_failed://') ? (
                              <button
                                onClick={() => handlePlayPause(rec)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                  playingId === rec.id
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 hover:bg-primary/10 text-gray-600 hover:text-primary'
                                }`}
                              >
                                {playingId === rec.id ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4 ml-0.5" />
                                )}
                              </button>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center" title="Audio file unavailable">
                                <FileAudio className="w-4 h-4 text-gray-300" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                                <User className="w-4 h-4 text-violet-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{rec.entrepreneur_name || 'Unknown'}</p>
                                <p className="text-xs text-gray-500">{rec.entrepreneur_phone || '-'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {getScreenLabel(rec.screen)}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <button
                              onClick={() => setExpandedTranscript(expandedTranscript === rec.id ? null : rec.id)}
                              className="text-left w-full"
                            >
                              <p className={`text-sm text-gray-700 ${expandedTranscript === rec.id ? '' : 'truncate'}`} title={rec.transcript}>
                                {rec.transcript || <span className="text-gray-400 italic">No transcript</span>}
                              </p>
                              {rec.transcript && rec.transcript.length > 50 && (
                                <span className="text-xs text-primary hover:underline">
                                  {expandedTranscript === rec.id ? 'Show less' : 'Show more'}
                                </span>
                              )}
                            </button>
                          </TableCell>
                          <TableCell className="text-gray-500 text-sm">
                            {formatDuration(rec.duration_seconds)}
                          </TableCell>
                          <TableCell className="text-gray-500 text-sm">
                            {formatDateTime(rec.recorded_at || rec.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(rec.audio_url, '_blank')}
                              className="hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              /* Grouped View */
              <div className="space-y-4">
                {Object.entries(groupedRecordings).map(([key, group]) => (
                  <div key={key} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Entrepreneur Header */}
                    <div className="p-4 bg-gradient-to-r from-violet-50 to-white border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                            <User className="w-6 h-6 text-violet-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{group.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Phone className="w-3 h-3" />
                              <span>{group.phone}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-primary">{group.recordings.length}</p>
                              <p className="text-xs text-gray-500">Recordings</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600">{formatDuration(group.totalDuration)}</p>
                              <p className="text-xs text-gray-500">Total Duration</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recordings List */}
                    <div className="divide-y divide-gray-100">
                      {group.recordings.map((rec) => (
                        <div key={rec.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handlePlayPause(rec)}
                              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                                playingId === rec.id
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-100 hover:bg-primary/10 text-gray-600 hover:text-primary'
                              }`}
                            >
                              {playingId === rec.id ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4 ml-0.5" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                  {getScreenLabel(rec.screen)}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatDateTime(rec.recorded_at || rec.created_at)}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatDuration(rec.duration_seconds)}
                                </span>
                              </div>
                              <button
                                onClick={() => setExpandedTranscript(expandedTranscript === rec.id ? null : rec.id)}
                                className="text-left w-full"
                              >
                                <p className={`text-sm text-gray-700 ${expandedTranscript === rec.id ? '' : 'line-clamp-2'}`}>
                                  {rec.transcript || <span className="text-gray-400 italic">No transcript available</span>}
                                </p>
                                {rec.transcript && rec.transcript.length > 100 && (
                                  <span className="text-xs text-primary hover:underline">
                                    {expandedTranscript === rec.id ? 'Show less' : 'Show more'}
                                  </span>
                                )}
                              </button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(rec.audio_url, '_blank')}
                              className="hover:bg-blue-50 hover:text-blue-600 flex-shrink-0"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MEETINGS TAB */}
        {activeTab === 'meetings' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Total Meetings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{meetings.length}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Available Slots</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {slots.filter(s => s.status === 'available').length}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Booked Slots</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {slots.filter(s => s.status === 'booked').length}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Total Slots</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{slots.length}</p>
              </div>
            </div>

            {/* Add Slot Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Meeting Slots</h2>
              <Button onClick={() => setShowAddSlot(true)} className="bg-accent hover:bg-accent/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Slot
              </Button>
            </div>

            {/* Add Slot Modal */}
            {showAddSlot && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Add New Slot</h3>
                    <button onClick={() => setShowAddSlot(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <Input
                        value={newSlot.title}
                        onChange={(e) => setNewSlot(s => ({ ...s, title: e.target.value }))}
                        placeholder="Meeting with entrepreneur"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <Input
                        type="datetime-local"
                        value={newSlot.start_time}
                        onChange={(e) => setNewSlot(s => ({ ...s, start_time: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <Input
                        type="datetime-local"
                        value={newSlot.end_time}
                        onChange={(e) => setNewSlot(s => ({ ...s, end_time: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link (Optional)</label>
                      <Input
                        value={newSlot.meeting_link}
                        onChange={(e) => setNewSlot(s => ({ ...s, meeting_link: e.target.value }))}
                        placeholder="https://meet.google.com/..."
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" className="flex-1" onClick={() => setShowAddSlot(false)}>
                        Cancel
                      </Button>
                      <Button className="flex-1 bg-accent" onClick={createSlot}>
                        Create Slot
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Slots Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {loadingMeetings ? (
                <div className="p-12 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-gray-500">Loading slots...</p>
                </div>
              ) : slots.length === 0 ? (
                <div className="p-12 text-center">
                  <CalendarDays className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium text-gray-900 mb-2">No slots available</p>
                  <p className="text-gray-500">Create slots for entrepreneurs to book meetings</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">Title</TableHead>
                        <TableHead className="font-semibold">Date & Time</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Booked By</TableHead>
                        <TableHead className="font-semibold">Meeting Link</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {slots.map((slot) => (
                        <TableRow key={slot.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-gray-900">
                            {slot.title || 'Meeting Slot'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <div>
                                <p className="text-sm">{formatDate(slot.start_time)}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(slot.start_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                  {' - '}
                                  {new Date(slot.end_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(slot.status)}`}>
                              {slot.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {slot.booked_by_name ? (
                              <div>
                                <p className="text-sm font-medium text-gray-900">{slot.booked_by_name}</p>
                                <p className="text-xs text-gray-500">{slot.booked_by_phone}</p>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {slot.meeting_link ? (
                              <a
                                href={slot.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                              >
                                <Video className="w-4 h-4" />
                                Join
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="hover:bg-red-50 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Scheduled Meetings */}
            {meetings.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Meetings</h3>
                <div className="space-y-4">
                  {meetings.slice(0, 5).map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Video className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{meeting.title}</p>
                          <p className="text-sm text-gray-500">{formatDateTime(meeting.start_time)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                          {meeting.status}
                        </span>
                        {meeting.meeting_link && (
                          <a
                            href={meeting.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Entrepreneur Detail Modal */}
      {selectedEntrepreneur && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-gray-900">Entrepreneur Profile</h3>
              <button
                onClick={() => { setSelectedEntrepreneur(null); setSelectedProfileData({}); setEntrepreneurAudio([]); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Basic Info Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900">{selectedEntrepreneur.name || 'Unknown'}</h4>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Phone className="w-3.5 h-3.5" />
                      {selectedEntrepreneur.phone}
                    </span>
                    {selectedEntrepreneur.email && (
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Mail className="w-3.5 h-3.5" />
                        {selectedEntrepreneur.email}
                      </span>
                    )}
                  </div>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(selectedEntrepreneur.status)}`}>
                    {selectedEntrepreneur.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Personal Details */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Personal Information
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">{selectedEntrepreneur.name || '-'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="font-medium text-gray-900">{selectedEntrepreneur.gender || '-'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Age</p>
                    <p className="font-medium text-gray-900">{selectedEntrepreneur.age || '-'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Education</p>
                    <p className="font-medium text-gray-900">{selectedEntrepreneur.education || '-'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">State</p>
                    <p className="font-medium text-gray-900">{selectedEntrepreneur.state || '-'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">District</p>
                    <p className="font-medium text-gray-900">{selectedEntrepreneur.district || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Business Information
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Business Name</p>
                    <p className="font-medium text-gray-900">{selectedEntrepreneur.business_name || '-'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Industry / Sector</p>
                    <p className="font-medium text-gray-900">{selectedEntrepreneur.business_type || '-'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Year Started</p>
                    <p className="font-medium text-gray-900">{selectedEntrepreneur.year_started || '-'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Ownership Type</p>
                    <p className="font-medium text-gray-900">{selectedEntrepreneur.ownership_type || '-'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="font-medium text-gray-900">{selectedEntrepreneur.role || '-'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Registered</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedEntrepreneur.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* All Other Profile Fields from API */}
              {Object.keys(selectedProfileData).length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileAudio className="w-4 h-4 text-primary" />
                    All Onboarding Data
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(selectedProfileData).map(([key, fieldData]) => (
                      <div key={key} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-gray-500">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                          <div className="flex items-center gap-1">
                            {fieldData.source && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                fieldData.source === 'voice' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                              }`}>
                                {fieldData.source}
                              </span>
                            )}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                              fieldData.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                              {fieldData.status}
                            </span>
                          </div>
                        </div>
                        <p className="font-medium text-gray-900 text-sm break-words">{fieldData.value || '-'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audio Recordings */}
              {entrepreneurAudio.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AudioLines className="w-4 h-4 text-primary" />
                    Voice Recordings ({entrepreneurAudio.length})
                  </h5>
                  <div className="space-y-2">
                    {entrepreneurAudio.map((audio) => (
                      <div key={audio.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <button
                          onClick={() => handlePlayPause(audio)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            playingId === audio.id ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'
                          }`}
                        >
                          {playingId === audio.id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{getScreenLabel(audio.screen)}</p>
                          <p className="text-xs text-gray-500 truncate">{audio.transcript || 'No transcript'}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs text-gray-400 block">{formatDuration(audio.duration_seconds)}</span>
                          <span className="text-xs text-gray-400 block">{formatFileSize(audio.file_size_bytes)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
