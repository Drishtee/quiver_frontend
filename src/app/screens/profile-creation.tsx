import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { AIAssistant } from "../components/ai-assistant";
import { ProgressIndicator } from "../components/progress-indicator";
import { Mic, User, Users } from "lucide-react";
import { useOnboarding } from "../../contexts/OnboardingContext";
import '../screens/landing.css';

interface ProfileCreationProps {
  onContinue: (data: ProfileData) => void;
}

export interface ProfileData {
  fullName: string;
  email: string;
  gender: string;
  age: string;
  education: string;
  state: string;
  district: string;
}

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const educationLevels = [
  { value: "no-formal", labelHi: "औपचारिक शिक्षा नहीं", labelEn: "No formal schooling" },
  { value: "primary", labelHi: "प्राथमिक", labelEn: "Primary" },
  { value: "secondary", labelHi: "माध्यमिक", labelEn: "Secondary" },
  { value: "graduate", labelHi: "स्नातक या अधिक", labelEn: "Graduate+" }
];

const genderOptions = [
  { value: "female", labelHi: "महिला", labelEn: "Female" },
  { value: "male", labelHi: "पुरुष", labelEn: "Male" },
  { value: "other", labelHi: "अन्य", labelEn: "Other" }
];

export function ProfileCreation({ onContinue }: ProfileCreationProps) {
  const onboarding = useOnboarding();

  // Initialize form data from onboarding context
  const [formData, setFormData] = useState<ProfileData>(() => ({
    fullName: onboarding.getField('fullName', '') || onboarding.getField('full_name', ''),
    email: onboarding.getField('email', ''),
    gender: onboarding.getField('gender', ''),
    age: onboarding.getField('age', ''),
    education: onboarding.getField('education', ''),
    state: onboarding.getField('state', ''),
    district: onboarding.getField('district', '')
  }));

  // Sync form data when voice fields are applied
  useEffect(() => {
    const handleVoiceFieldsApplied = (event: CustomEvent<Record<string, any>>) => {
      const fields = event.detail;
      setFormData(prev => ({
        fullName: fields.fullName || fields.full_name || prev.fullName,
        email: fields.email || prev.email,
        gender: fields.gender || prev.gender,
        age: fields.age || prev.age,
        education: fields.education || prev.education,
        state: fields.state || prev.state,
        district: fields.district || prev.district
      }));
    };

    window.addEventListener('voiceFieldsApplied', handleVoiceFieldsApplied as EventListener);
    return () => {
      window.removeEventListener('voiceFieldsApplied', handleVoiceFieldsApplied as EventListener);
    };
  }, []);

  // Also sync when onboarding context changes
  useEffect(() => {
    const fullName = onboarding.getField('fullName', '') || onboarding.getField('full_name', '');
    const email = onboarding.getField('email', '');
    const gender = onboarding.getField('gender', '');
    const age = onboarding.getField('age', '');
    const education = onboarding.getField('education', '');
    const state = onboarding.getField('state', '');
    const district = onboarding.getField('district', '');

    // Only update if we have actual values from context
    if (fullName || email || gender || age || education || state || district) {
      setFormData(prev => ({
        fullName: fullName || prev.fullName,
        email: email || prev.email,
        gender: gender || prev.gender,
        age: age || prev.age,
        education: education || prev.education,
        state: state || prev.state,
        district: district || prev.district
      }));
    }
  }, [onboarding.formData]);

  // Update local state and sync to context
  const updateField = (key: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    onboarding.setField(key, value);
  };

  const handleSubmit = () => {
    onContinue(formData);
  };

  const isValid = formData.fullName && formData.gender && formData.age && formData.education && formData.state && formData.district;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
            <User className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-display font-bold text-primary">उद्यमी की जानकारी | Entrepreneur Profile</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Progress */}
          <ProgressIndicator current={2} total={9} />

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-display font-bold text-gray-900">
              Section B: उद्यमी की जानकारी
            </h2>
            <p className="text-gray-600">
              Entrepreneur Profile | अपने बारे में बताएं
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-8 space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                पूरा नाम | Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="अपना पूरा नाम दर्ज करें"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200 pr-12 rounded-xl focus:border-primary focus:ring-primary"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-green-50 rounded-lg transition-colors">
                  <Mic className="w-5 h-5 text-primary" />
                </button>
              </div>
              <p className="text-xs text-gray-500">बोलकर भी भर सकते हैं | You can speak instead of typing</p>
            </div>

            {/* Gender */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-900">
                लिंग | Gender <span className="text-red-500">*</span>
              </label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => updateField('gender', value)}
                className="flex flex-wrap gap-3"
              >
                {genderOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.gender === option.value
                        ? 'border-primary bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <RadioGroupItem value={option.value} id={`gender-${option.value}`} />
                    <span className="font-medium text-gray-900">{option.labelHi}</span>
                    <span className="text-sm text-gray-500">| {option.labelEn}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Age */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                आयु | Age <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="आयु दर्ज करें (जैसे: 35)"
                value={formData.age}
                onChange={(e) => updateField('age', e.target.value)}
                min="18"
                max="100"
                className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-primary focus:ring-primary"
              />
            </div>

            {/* Education Level */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-900">
                शिक्षा स्तर | Education Level <span className="text-red-500">*</span>
              </label>
              <RadioGroup
                value={formData.education}
                onValueChange={(value) => updateField('education', value)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {educationLevels.map((level) => (
                  <label
                    key={level.value}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.education === level.value
                        ? 'border-primary bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <RadioGroupItem value={level.value} id={`edu-${level.value}`} />
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{level.labelHi}</span>
                      <span className="text-xs text-gray-500">{level.labelEn}</span>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* State */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                राज्य | State <span className="text-red-500">*</span>
              </label>
              <Select value={formData.state} onValueChange={(value) => { updateField('state', value); updateField('district', ''); }}>
                <SelectTrigger className="h-12 bg-gray-50 border-gray-200 rounded-xl">
                  <SelectValue placeholder="राज्य चुनें | Select your state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state.toLowerCase().replace(/\s+/g, '-')}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* District */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                जिला | District <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="जिले का नाम लिखें | Enter district name"
                  value={formData.district}
                  onChange={(e) => updateField('district', e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200 pr-12 rounded-xl focus:border-primary focus:ring-primary"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-green-50 rounded-lg transition-colors">
                  <Mic className="w-5 h-5 text-primary" />
                </button>
              </div>
            </div>

            {/* Email (Optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                ईमेल | Email <span className="text-gray-400">(वैकल्पिक | Optional)</span>
              </label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-primary focus:ring-primary"
              />
            </div>

            <Button
              className="w-full h-14 bg-primary hover:bg-secondary text-lg font-semibold rounded-xl transition-all"
              disabled={!isValid}
              onClick={handleSubmit}
            >
              आगे बढ़ें | Continue
            </Button>
          </div>

          {/* AI Assistant */}
          <AIAssistant
            position="inline"
            message="फॉर्म भरने में मदद चाहिए? बोलकर भी भर सकते हैं! | Need help? You can also speak to fill the form!"
          />
        </div>
      </main>
    </div>
  );
}
