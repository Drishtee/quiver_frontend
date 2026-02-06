import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { ProgressIndicator } from "../components/progress-indicator";
import { AIAssistant } from "../components/ai-assistant";
import { useOnboarding } from "../../contexts/OnboardingContext";
import {
  Beef,
  Shirt,
  UtensilsCrossed,
  MoreHorizontal,
  Tractor,
  Wrench,
  Building2,
  Users,
  User,
  Handshake
} from "lucide-react";
import { IllustrationPlaceholder } from "../components/IllustrationPlaceholder";
import '../screens/landing.css';

interface IndustrySelectionProps {
  onContinue: (data: EnterpriseData) => void;
}

export interface EnterpriseData {
  businessName: string;
  sector: string;
  yearStarted: string;
  ownershipType: string;
  role: string;
}

export function IndustrySelection({ onContinue }: IndustrySelectionProps) {
  const onboarding = useOnboarding();

  // Initialize form data from onboarding context
  const [formData, setFormData] = useState<EnterpriseData>(() => ({
    businessName: onboarding.getField('businessName', '') || onboarding.getField('business_name', ''),
    sector: onboarding.getField('sector', ''),
    yearStarted: onboarding.getField('yearStarted', '') || onboarding.getField('year_started', ''),
    ownershipType: onboarding.getField('ownershipType', '') || onboarding.getField('ownership_type', ''),
    role: onboarding.getField('role', '')
  }));

  // Sync form data when voice fields are applied
  useEffect(() => {
    const handleVoiceFieldsApplied = (event: CustomEvent<Record<string, any>>) => {
      const fields = event.detail;
      setFormData(prev => ({
        businessName: fields.businessName || fields.business_name || prev.businessName,
        sector: fields.sector || prev.sector,
        yearStarted: fields.yearStarted || fields.year_started || prev.yearStarted,
        ownershipType: fields.ownershipType || fields.ownership_type || prev.ownershipType,
        role: fields.role || prev.role
      }));
    };

    window.addEventListener('voiceFieldsApplied', handleVoiceFieldsApplied as EventListener);
    return () => {
      window.removeEventListener('voiceFieldsApplied', handleVoiceFieldsApplied as EventListener);
    };
  }, []);

  // Also sync when onboarding context changes
  useEffect(() => {
    const businessName = onboarding.getField('businessName', '') || onboarding.getField('business_name', '');
    const sector = onboarding.getField('sector', '');
    const yearStarted = onboarding.getField('yearStarted', '') || onboarding.getField('year_started', '');
    const ownershipType = onboarding.getField('ownershipType', '') || onboarding.getField('ownership_type', '');
    const role = onboarding.getField('role', '');

    if (businessName || sector || yearStarted || ownershipType || role) {
      setFormData(prev => ({
        businessName: businessName || prev.businessName,
        sector: sector || prev.sector,
        yearStarted: yearStarted || prev.yearStarted,
        ownershipType: ownershipType || prev.ownershipType,
        role: role || prev.role
      }));
    }
  }, [onboarding.formData]);

  // Update local state and sync to context
  const updateField = (key: keyof EnterpriseData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    onboarding.setField(key, value);
  };

  const sectors = [
    {
      id: "food-processing",
      labelHi: "फूड प्रोसेसिंग",
      labelEn: "Food Processing",
      icon: UtensilsCrossed,
      color: "from-orange-50 to-yellow-50",
      borderColor: "border-orange-200"
    },
    {
      id: "agriculture",
      labelHi: "कृषि एवं संबद्ध गतिविधियाँ",
      labelEn: "Agriculture & Allied",
      icon: Tractor,
      color: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-200"
    },
    {
      id: "livestock",
      labelHi: "पशुपालन/डेयरी/पोल्ट्री",
      labelEn: "Livestock/Dairy/Poultry",
      icon: Beef,
      color: "from-amber-50 to-yellow-50",
      borderColor: "border-amber-200"
    },
    {
      id: "textile",
      labelHi: "टेक्सटाइल/हस्तशिल्प",
      labelEn: "Textile/Handicraft",
      icon: Shirt,
      color: "from-purple-50 to-pink-50",
      borderColor: "border-purple-200"
    },
    {
      id: "services",
      labelHi: "सेवाएं",
      labelEn: "Services",
      icon: Wrench,
      color: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200"
    },
    {
      id: "other",
      labelHi: "अन्य",
      labelEn: "Other",
      icon: MoreHorizontal,
      color: "from-gray-50 to-slate-50",
      borderColor: "border-gray-200"
    }
  ];

  const ownershipTypes = [
    { value: "individual", labelHi: "व्यक्तिगत", labelEn: "Individual", icon: User },
    { value: "family", labelHi: "परिवार", labelEn: "Family", icon: Users },
    { value: "shg", labelHi: "समूह (SHG/Collective)", labelEn: "SHG/Collective", icon: Building2 },
    { value: "partnership", labelHi: "साझेदारी", labelEn: "Partnership", icon: Handshake }
  ];

  const roles = [
    { value: "owner", labelHi: "मालिक", labelEn: "Owner" },
    { value: "cofounder", labelHi: "सह-संस्थापक", labelEn: "Co-founder" },
    { value: "manager", labelHi: "प्रबंधक", labelEn: "Manager" }
  ];

  const isValid = formData.businessName && formData.sector && formData.yearStarted && formData.ownershipType && formData.role;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-20 mobile-full-screen">
      {/* Header - Mobile-first */}
      <header className="bg-white shadow-sm py-3 px-4 md:py-4 md:px-6 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center">
          <img src="/logo.jpg" alt="Quiver" className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover mr-2 md:mr-3" />
          <span className="text-base md:text-xl font-display font-bold text-primary truncate">Quiver</span>
        </div>
      </header>

      {/* Main Content - Mobile-first */}
      <main className="max-w-2xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="space-y-6 md:space-y-8">
          {/* Progress - Sticky */}
          <ProgressIndicator current={3} total={9} sticky={true} />

          <div className="text-center space-y-1 md:space-y-2">
            <h2 className="text-xl md:text-2xl font-display font-bold text-gray-900">
              Section C: व्यवसाय की जानकारी
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              Enterprise Details | अपने व्यवसाय के बारे में बताएं
            </p>
          </div>

          {/* Business Name */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6 space-y-4">
            <label className="text-sm font-medium text-gray-900">
              व्यवसाय का नाम | Business Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="व्यवसाय का नाम दर्ज करें"
              value={formData.businessName}
              onChange={(e) => updateField('businessName', e.target.value)}
              className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-accent focus:ring-accent/20"
            />
          </div>

          {/* Sector Selection */}
          {/* TODO: Replace Lucide icons (UtensilsCrossed, Tractor, Beef, Shirt, Wrench, MoreHorizontal)
               with custom GFX-ONBD-008 illustrations for each sector card.
               See GRAPHIC_DESIGN_SPEC.md for per-sector illustration specs:
               - Food Processing: GFX-ONBD-008-food
               - Agriculture: GFX-ONBD-008-agri
               - Livestock/Dairy: GFX-ONBD-008-livestock
               - Textile/Handicraft: GFX-ONBD-008-textile
               - Services: GFX-ONBD-008-services
               - Other: GFX-ONBD-008-other */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6 space-y-4">
            <label className="text-sm font-medium text-gray-900">
              व्यवसाय क्षेत्र | Sector <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              {sectors.map((sector) => {
                const Icon = sector.icon;
                const isSelected = formData.sector === sector.id;
                return (
                  <button
                    key={sector.id}
                    onClick={() => updateField('sector', sector.id)}
                    className={`bg-gradient-to-br ${sector.color} rounded-2xl border-2 p-5 transition-all hover:shadow-md ${
                      isSelected
                        ? "border-accent ring-2 ring-accent/20"
                        : `${sector.borderColor} hover:border-gray-300`
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-accent text-white shadow-lg"
                          : "bg-white/80 text-gray-600"
                      }`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{sector.labelHi}</p>
                        <p className="text-xs text-gray-500">{sector.labelEn}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Year Started */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6 space-y-4">
            <label className="text-sm font-medium text-gray-900">
              व्यवसाय शुरू करने का वर्ष | Year Started <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              placeholder="जैसे: 2018"
              value={formData.yearStarted}
              onChange={(e) => updateField('yearStarted', e.target.value)}
              min="1950"
              max={currentYear}
              className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-accent focus:ring-accent/20"
            />
          </div>

          {/* Ownership Type */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6 space-y-4">
            <label className="text-sm font-medium text-gray-900">
              स्वामित्व | Ownership Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ownershipTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.ownershipType === type.value;
                return (
                  <button
                    key={type.value}
                    onClick={() => updateField('ownershipType', type.value)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-accent bg-accent/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-accent' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 text-sm">{type.labelHi}</p>
                      <p className="text-xs text-gray-500">{type.labelEn}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6 space-y-4">
            <label className="text-sm font-medium text-gray-900">
              आपकी भूमिका | Your Role <span className="text-red-500">*</span>
            </label>
            <RadioGroup
              value={formData.role}
              onValueChange={(value) => updateField('role', value)}
              className="flex flex-wrap gap-3"
            >
              {roles.map((role) => (
                <label
                  key={role.value}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.role === role.value
                      ? 'border-accent bg-accent/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <RadioGroupItem value={role.value} id={`role-${role.value}`} />
                  <span className="font-medium text-gray-900">{role.labelHi}</span>
                  <span className="text-sm text-gray-500">| {role.labelEn}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Submit Button - Sticky on mobile */}
          <div className="sticky bottom-0 -mx-4 md:mx-0 px-4 py-4 md:p-0 bg-white md:bg-transparent border-t md:border-0 border-gray-200">
            <Button
              className="w-full min-h-[52px] md:h-14 bg-accent hover:bg-accent/90 active:bg-accent/80 text-base md:text-lg font-semibold rounded-xl transition-all"
              disabled={!isValid}
              onClick={() => onContinue(formData)}
            >
              आगे बढ़ें | Continue
            </Button>
          </div>

          {/* AI Assistant - Hidden on small mobile */}
          <div className="hidden sm:block">
            <AIAssistant
              position="inline"
              message="व्यवसाय क्षेत्र समझ नहीं आ रहा? मैं मदद कर सकता हूँ! | Not sure about your sector? I can help!"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
