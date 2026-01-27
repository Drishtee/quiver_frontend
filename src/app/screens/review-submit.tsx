import { useState } from "react";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { ProgressIndicator } from "../components/progress-indicator";
import { AIAssistant } from "../components/ai-assistant";
import {
  Edit2,
  User,
  Building2,
  Briefcase,
  IndianRupee,
  Target,
  Handshake,
  CheckCircle2,
  Shield,
  Send
} from "lucide-react";
import '../screens/landing.css';

interface ReviewSubmitProps {
  profileData: any;
  enterpriseData: any;
  businessAnswers: Record<string, string | string[]>;
  equityAnswer: string;
  onEdit: (section: string) => void;
  onSubmit: () => void;
}

export function ReviewSubmit({
  profileData,
  enterpriseData,
  businessAnswers,
  equityAnswer,
  onEdit,
  onSubmit
}: ReviewSubmitProps) {
  const [declaration, setDeclaration] = useState(false);

  const sectorNames: Record<string, string> = {
    "food-processing": "फूड प्रोसेसिंग | Food Processing",
    "agriculture": "कृषि | Agriculture",
    "livestock": "पशुपालन | Livestock",
    "textile": "टेक्सटाइल | Textile",
    "services": "सेवाएं | Services",
    "other": "अन्य | Other"
  };

  const formatValue = (value: string | string[]): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value || '-';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-display font-bold text-primary">अंतिम पुष्टि | Final Confirmation</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Progress */}
          <ProgressIndicator current={9} total={9} />

          <div className="text-center space-y-2">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-900">
              Section I: अंतिम पुष्टि
            </h2>
            <p className="text-gray-600">Final Confirmation | कृपया अपनी जानकारी की समीक्षा करें</p>
          </div>

          {/* Profile Summary */}
          <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-primary" />
                <h3 className="font-display font-bold text-gray-900">उद्यमी की जानकारी | Entrepreneur Profile</h3>
              </div>
              <button
                onClick={() => onEdit("profile")}
                className="text-sm text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">नाम | Name</p>
                  <p className="font-medium text-gray-900">{profileData?.fullName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">लिंग | Gender</p>
                  <p className="font-medium text-gray-900 capitalize">{profileData?.gender || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">आयु | Age</p>
                  <p className="font-medium text-gray-900">{profileData?.age || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">शिक्षा | Education</p>
                  <p className="font-medium text-gray-900 capitalize">{profileData?.education || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">राज्य | State</p>
                  <p className="font-medium text-gray-900 capitalize">{profileData?.state || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">जिला | District</p>
                  <p className="font-medium text-gray-900 capitalize">{profileData?.district || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enterprise Summary */}
          <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-primary" />
                <h3 className="font-display font-bold text-gray-900">व्यवसाय की जानकारी | Enterprise Details</h3>
              </div>
              <button
                onClick={() => onEdit("enterprise")}
                className="text-sm text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">व्यवसाय का नाम | Business Name</p>
                  <p className="font-medium text-gray-900">{enterpriseData?.businessName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">क्षेत्र | Sector</p>
                  <p className="font-medium text-gray-900">{sectorNames[enterpriseData?.sector] || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">स्थापना वर्ष | Year Started</p>
                  <p className="font-medium text-gray-900">{enterpriseData?.yearStarted || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">स्वामित्व | Ownership</p>
                  <p className="font-medium text-gray-900 capitalize">{enterpriseData?.ownershipType || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">भूमिका | Role</p>
                  <p className="font-medium text-gray-900 capitalize">{enterpriseData?.role || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center gap-3">
                <IndianRupee className="w-6 h-6 text-primary" />
                <h3 className="font-display font-bold text-gray-900">वित्तीय स्थिति | Financial Snapshot</h3>
              </div>
              <button
                onClick={() => onEdit("questionnaire")}
                className="text-sm text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">मासिक बिक्री | Monthly Revenue</p>
                  <p className="font-medium text-gray-900">₹{businessAnswers?.monthlyRevenue || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">मासिक खर्च | Monthly Expenses</p>
                  <p className="font-medium text-gray-900">₹{businessAnswers?.monthlyExpenses || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">स्थिति | Status</p>
                  <p className="font-medium text-gray-900 capitalize">{formatValue(businessAnswers?.currentStatus)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Intent Summary */}
          <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-primary" />
                <h3 className="font-display font-bold text-gray-900">विकास की सोच | Growth Intent</h3>
              </div>
              <button
                onClick={() => onEdit("questionnaire")}
                className="text-sm text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">प्राथमिकता | Priority</p>
                  <p className="font-medium text-gray-900">{formatValue(businessAnswers?.priority)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Quiver से सहयोग | Support from Quiver</p>
                  <p className="font-medium text-gray-900">{formatValue(businessAnswers?.quiverSupport)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">निवेश राशि | Investment Amount</p>
                  <p className="font-medium text-gray-900">₹{businessAnswers?.investmentAmount || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Partnership Orientation Summary */}
          <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center gap-3">
                <Handshake className="w-6 h-6 text-primary" />
                <h3 className="font-display font-bold text-gray-900">साझेदारी की सोच | Partnership Orientation</h3>
              </div>
              <button
                onClick={() => onEdit("equity")}
                className="text-sm text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  equityAnswer === 'yes' ? 'bg-green-100' : equityAnswer === 'maybe' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <Handshake className={`w-5 h-5 ${
                    equityAnswer === 'yes' ? 'text-green-600' : equityAnswer === 'maybe' ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">इक्विटी साझेदारी के लिए खुले | Open to Equity Partnership</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {equityAnswer === 'yes' ? 'हाँ | Yes' : equityAnswer === 'maybe' ? 'शायद | Maybe' : 'नहीं | No'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Declaration */}
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-1">
            <div className="bg-white rounded-xl p-6 space-y-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-display font-bold text-gray-900 mb-2">घोषणा | Declaration</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    मैं पुष्टि करता/करती हूँ कि मेरे द्वारा दी गई सभी जानकारी सही है। मैं समझता/समझती हूँ कि Quiver इस जानकारी का उपयोग केवल मेरी प्रोफाइल बनाने और साझेदारी की संभावनाओं का मूल्यांकन करने के लिए करेगा।
                  </p>
                  <p className="text-gray-500 text-xs mt-2 leading-relaxed">
                    I confirm that all information provided by me is accurate. I understand that Quiver will use this information only to create my profile and assess partnership possibilities.
                  </p>
                </div>
              </div>

              <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-primary/50 cursor-pointer transition-all">
                <Checkbox
                  id="declaration"
                  checked={declaration}
                  onCheckedChange={(checked) => setDeclaration(checked as boolean)}
                  className="mt-1"
                />
                <span className="text-gray-700 text-sm leading-relaxed">
                  मैं ऊपर दी गई घोषणा से सहमत हूँ | I agree to the declaration above
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="space-y-4">
            <Button
              className="w-full h-16 bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-lg font-display font-bold rounded-xl transition-all shadow-lg"
              disabled={!declaration}
              onClick={onSubmit}
            >
              <Send className="w-5 h-5 mr-2" />
              जमा करें | Submit Application
            </Button>
            <p className="text-xs text-center text-gray-500">
              जमा करने के बाद Quiver की टीम आपसे संपर्क करेगी | After submission, the Quiver team will contact you
            </p>
          </div>

          {/* AI Assistant */}
          <AIAssistant
            position="inline"
            message="सब कुछ ठीक लग रहा है? जमा करने के लिए तैयार हैं! | Everything looks good? Ready to submit!"
          />
        </div>
      </main>
    </div>
  );
}
