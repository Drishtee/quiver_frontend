import { useState, useEffect } from "react";
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
  Sparkles,
  AudioLines,
  Play,
  Pause,
  Trash2,
  RefreshCw,
  FileAudio,
  Calendar,
  User,
  Building2
} from "lucide-react";

// Tab type
type TabType = 'entrepreneurs' | 'recordings';

// Audio record type from API
interface AudioRecordAPI {
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

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('entrepreneurs');
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");

  // Audio recordings state
  const [audioRecordings, setAudioRecordings] = useState<AudioRecordAPI[]>([]);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [audioSearchQuery, setAudioSearchQuery] = useState("");
  const [screenFilter, setScreenFilter] = useState("all");

  const stats = [
    { label: "Total Signups", value: "1,247", icon: Users, color: "bg-blue-500" },
    { label: "Completed", value: "892", icon: CheckCircle2, color: "bg-green-500" },
    { label: "In Progress", value: "355", icon: Clock, color: "bg-amber-500" },
    { label: "Voice Recordings", value: audioRecordings.length.toString(), icon: AudioLines, color: "bg-purple-500" }
  ];

  const entrepreneurs = [
    {
      id: 1,
      name: "Rajesh Kumar",
      phone: "+91 98765 43210",
      industry: "Food Processing",
      status: "Completed",
      date: "Dec 20, 2024"
    },
    {
      id: 2,
      name: "Priya Singh",
      phone: "+91 98765 43211",
      industry: "Textile",
      status: "In Progress",
      date: "Dec 21, 2024"
    },
    {
      id: 3,
      name: "Mohammed Ali",
      phone: "+91 98765 43212",
      industry: "Livestock",
      status: "Completed",
      date: "Dec 22, 2024"
    },
    {
      id: 4,
      name: "Lakshmi Devi",
      phone: "+91 98765 43213",
      industry: "Food Processing",
      status: "In Progress",
      date: "Dec 22, 2024"
    },
    {
      id: 5,
      name: "Amit Patel",
      phone: "+91 98765 43214",
      industry: "Other",
      status: "Completed",
      date: "Dec 23, 2024"
    }
  ];

  // Fetch audio recordings from API
  const fetchAudioRecordings = async () => {
    setLoadingAudio(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/onboarding/admin/audio-records/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAudioRecordings(data.audio_records || []);
      } else {
        // Mock data for development
        setAudioRecordings([
          {
            id: 1,
            audio_url: "https://example.com/audio1.wav",
            transcript: "My name is Rajesh Kumar and I am 35 years old",
            duration_seconds: 5.2,
            file_size_bytes: 125000,
            screen: "profile",
            field_key: "fullName",
            recorded_at: "2024-12-20T10:30:00Z",
            created_at: "2024-12-20T10:30:05Z",
            entrepreneur_name: "Rajesh Kumar",
            entrepreneur_phone: "+91 98765 43210"
          },
          {
            id: 2,
            audio_url: "https://example.com/audio2.wav",
            transcript: "I run a food processing business since 2018",
            duration_seconds: 4.8,
            file_size_bytes: 115000,
            screen: "industry",
            field_key: "businessName",
            recorded_at: "2024-12-20T10:32:00Z",
            created_at: "2024-12-20T10:32:05Z",
            entrepreneur_name: "Rajesh Kumar",
            entrepreneur_phone: "+91 98765 43210"
          },
          {
            id: 3,
            audio_url: "https://example.com/audio3.wav",
            transcript: "I am Priya Singh from Bihar",
            duration_seconds: 3.5,
            file_size_bytes: 84000,
            screen: "profile",
            field_key: "state",
            recorded_at: "2024-12-21T14:15:00Z",
            created_at: "2024-12-21T14:15:05Z",
            entrepreneur_name: "Priya Singh",
            entrepreneur_phone: "+91 98765 43211"
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch audio recordings:', error);
      // Use mock data on error
      setAudioRecordings([]);
    } finally {
      setLoadingAudio(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'recordings') {
      fetchAudioRecordings();
    }
  }, [activeTab]);

  // Audio playback
  const handlePlayPause = (recording: AudioRecordAPI) => {
    if (playingId === recording.id) {
      // Pause current
      audioElement?.pause();
      setPlayingId(null);
    } else {
      // Stop previous
      audioElement?.pause();

      // Play new
      const audio = new Audio(recording.audio_url);
      audio.onended = () => setPlayingId(null);
      audio.onerror = () => {
        console.error('Failed to play audio');
        setPlayingId(null);
      };
      audio.play();
      setAudioElement(audio);
      setPlayingId(recording.id);
    }
  };

  // Filter audio recordings
  const filteredRecordings = audioRecordings.filter(rec => {
    const matchesSearch = audioSearchQuery === "" ||
      rec.transcript?.toLowerCase().includes(audioSearchQuery.toLowerCase()) ||
      rec.entrepreneur_name?.toLowerCase().includes(audioSearchQuery.toLowerCase()) ||
      rec.entrepreneur_phone?.includes(audioSearchQuery);

    const matchesScreen = screenFilter === "all" || rec.screen === screenFilter;

    return matchesSearch && matchesScreen;
  });

  const getStatusColor = (status: string) => {
    return status === "Completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700";
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
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Quiver Admin</h1>
              <p className="text-sm text-muted-foreground">Entrepreneur Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-border">
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-2xl border border-border shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-semibold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="border-b border-border">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('entrepreneurs')}
                  className={`px-6 py-4 text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeTab === 'entrepreneurs'
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Entrepreneurs
                </button>
                <button
                  onClick={() => setActiveTab('recordings')}
                  className={`px-6 py-4 text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeTab === 'recordings'
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <AudioLines className="w-4 h-4" />
                  Voice Recordings
                </button>
              </div>
            </div>

            {/* Entrepreneurs Tab */}
            {activeTab === 'entrepreneurs' && (
              <>
                {/* Filters */}
                <div className="p-6 border-b border-border">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-input-background border-border"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-[180px] bg-input-background border-border">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={industryFilter} onValueChange={setIndustryFilter}>
                      <SelectTrigger className="w-full md:w-[180px] bg-input-background border-border">
                        <SelectValue placeholder="Industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Industries</SelectItem>
                        <SelectItem value="food">Food Processing</SelectItem>
                        <SelectItem value="textile">Textile</SelectItem>
                        <SelectItem value="livestock">Livestock</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Entrepreneurs Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">Name</TableHead>
                        <TableHead className="font-semibold">Phone</TableHead>
                        <TableHead className="font-semibold">Industry</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entrepreneurs.map((person) => (
                        <TableRow key={person.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-foreground">{person.name}</TableCell>
                          <TableCell className="text-muted-foreground">{person.phone}</TableCell>
                          <TableCell className="text-foreground">{person.industry}</TableCell>
                          <TableCell>
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(person.status)}`}>
                              {person.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{person.date}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-blue-50 hover:text-primary"
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
                <div className="p-6 border-t border-border flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing 1-5 of 1,247 entrepreneurs
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-border">
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" className="border-border">
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Voice Recordings Tab */}
            {activeTab === 'recordings' && (
              <>
                {/* Filters */}
                <div className="p-6 border-b border-border">
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by transcript, name, or phone..."
                        value={audioSearchQuery}
                        onChange={(e) => setAudioSearchQuery(e.target.value)}
                        className="pl-10 bg-input-background border-border"
                      />
                    </div>
                    <Select value={screenFilter} onValueChange={setScreenFilter}>
                      <SelectTrigger className="w-full md:w-[180px] bg-input-background border-border">
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchAudioRecordings}
                      disabled={loadingAudio}
                      className="border-border"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loadingAudio ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>

                {/* Recordings Table */}
                <div className="overflow-x-auto">
                  {loadingAudio ? (
                    <div className="p-12 text-center">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                      <p className="text-muted-foreground">Loading recordings...</p>
                    </div>
                  ) : filteredRecordings.length === 0 ? (
                    <div className="p-12 text-center">
                      <FileAudio className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium text-foreground mb-2">No recordings found</p>
                      <p className="text-muted-foreground">Voice recordings from entrepreneurs will appear here.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold w-12"></TableHead>
                          <TableHead className="font-semibold">Entrepreneur</TableHead>
                          <TableHead className="font-semibold">Screen</TableHead>
                          <TableHead className="font-semibold">Transcript</TableHead>
                          <TableHead className="font-semibold">Duration</TableHead>
                          <TableHead className="font-semibold">Size</TableHead>
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecordings.map((recording) => (
                          <TableRow key={recording.id} className="hover:bg-gray-50">
                            <TableCell>
                              <button
                                onClick={() => handlePlayPause(recording)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                  playingId === recording.id
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 hover:bg-primary/10 text-gray-600 hover:text-primary'
                                }`}
                              >
                                {playingId === recording.id ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4 ml-0.5" />
                                )}
                              </button>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                                  <User className="w-4 h-4 text-violet-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-foreground text-sm">
                                    {recording.entrepreneur_name || 'Unknown'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {recording.entrepreneur_phone || '-'}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                <Building2 className="w-3 h-3" />
                                {getScreenLabel(recording.screen)}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <p className="text-sm text-foreground truncate" title={recording.transcript}>
                                {recording.transcript || <span className="text-muted-foreground italic">No transcript</span>}
                              </p>
                              {recording.field_key && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Field: {recording.field_key}
                                </p>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatDuration(recording.duration_seconds)}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatFileSize(recording.file_size_bytes)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                <Calendar className="w-3 h-3" />
                                {formatDate(recording.recorded_at || recording.created_at)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-blue-50 hover:text-blue-600"
                                  onClick={() => window.open(recording.audio_url, '_blank')}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>

                {/* Summary */}
                {filteredRecordings.length > 0 && (
                  <div className="p-6 border-t border-border flex items-center justify-between bg-gray-50">
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredRecordings.length} recording{filteredRecordings.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Total Duration: {formatDuration(filteredRecordings.reduce((acc, r) => acc + (r.duration_seconds || 0), 0))}
                      </span>
                      <span>
                        Total Size: {formatFileSize(filteredRecordings.reduce((acc, r) => acc + (r.file_size_bytes || 0), 0))}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
