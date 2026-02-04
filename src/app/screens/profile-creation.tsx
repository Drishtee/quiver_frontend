import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { AIAssistant } from "../components/ai-assistant";
import { ProgressIndicator } from "../components/progress-indicator";
import { LanguageSelector } from "../components/language-selector";
import { User, ArrowLeft, ChevronRight } from "lucide-react";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { useLanguage } from "../../i18n/LanguageContext";
import '../screens/landing.css';

interface ProfileCreationProps {
  onContinue: (data: ProfileData) => void;
  onBack?: () => void;
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

// District data by state (key districts for each state)
const districtsByState: Record<string, string[]> = {
  "andhra-pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
  "arunachal-pradesh": ["Changlang", "East Kameng", "East Siang", "Lohit", "Lower Subansiri", "Papum Pare", "Tawang", "Tirap", "Upper Subansiri", "West Kameng", "West Siang"],
  "assam": ["Barpeta", "Bongaigaon", "Cachar", "Darrang", "Dhubri", "Dibrugarh", "Goalpara", "Golaghat", "Hailakandi", "Jorhat", "Kamrup", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "Tinsukia"],
  "bihar": ["Araria", "Aurangabad", "Begusarai", "Bhagalpur", "Bhojpur", "Darbhanga", "Gaya", "Gopalganj", "Jamui", "Katihar", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sitamarhi", "Siwan", "Vaishali"],
  "chhattisgarh": ["Bastar", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Janjgir-Champa", "Jashpur", "Kanker", "Korba", "Koriya", "Mahasamund", "Raigarh", "Raipur", "Rajnandgaon", "Surguja"],
  "goa": ["North Goa", "South Goa"],
  "gujarat": ["Ahmedabad", "Amreli", "Anand", "Banaskantha", "Bharuch", "Bhavnagar", "Dahod", "Gandhinagar", "Jamnagar", "Junagadh", "Kachchh", "Kheda", "Mahesana", "Narmada", "Navsari", "Panchmahals", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Vadodara", "Valsad"],
  "haryana": ["Ambala", "Bhiwani", "Faridabad", "Fatehabad", "Gurgaon", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
  "himachal-pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
  "jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribag", "Jamtara", "Koderma", "Lohardaga", "Pakur", "Palamu", "Ranchi", "Sahibganj", "Seraikela-Kharsawan", "West Singhbhum"],
  "karnataka": ["Bagalkot", "Bangalore Rural", "Bangalore Urban", "Belgaum", "Bellary", "Bidar", "Bijapur", "Chamrajnagar", "Chikmagalur", "Chitradurga", "Dakshina Kannada", "Davangere", "Dharwad", "Gadag", "Gulbarga", "Hassan", "Haveri", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysore", "Raichur", "Shimoga", "Tumkur", "Udupi", "Uttara Kannada"],
  "kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
  "madhya-pradesh": ["Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Guna", "Gwalior", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Shivpuri", "Sidhi", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
  "maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
  "manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Senapati", "Tamenglong", "Thoubal", "Ukhrul"],
  "meghalaya": ["East Garo Hills", "East Khasi Hills", "Jaintia Hills", "Ri-Bhoi", "South Garo Hills", "West Garo Hills", "West Khasi Hills"],
  "mizoram": ["Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip"],
  "nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
  "odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Keonjhar", "Khurda", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"],
  "punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Pathankot", "Patiala", "Rupnagar", "Sangrur", "SAS Nagar", "SBS Nagar", "Tarn Taran"],
  "rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
  "sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
  "tamil-nadu": ["Ariyalur", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kanchipuram", "Kanniyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Perambalur", "Pudukkottai", "Ramanathapuram", "Salem", "Sivaganga", "Thanjavur", "The Nilgiris", "Theni", "Tiruchirappalli", "Tirunelveli", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Villupuram", "Virudhunagar"],
  "telangana": ["Adilabad", "Hyderabad", "Karimnagar", "Khammam", "Mahabubnagar", "Medak", "Nalgonda", "Nizamabad", "Rangareddy", "Warangal"],
  "tripura": ["Dhalai", "North Tripura", "South Tripura", "West Tripura"],
  "uttar-pradesh": ["Agra", "Aligarh", "Allahabad", "Ambedkar Nagar", "Auraiya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Faizabad", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hardoi", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kaushambi", "Kushinagar", "Lakhimpur Kheri", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Rae Bareli", "Rampur", "Saharanpur", "Sant Kabir Nagar", "Sant Ravidas Nagar", "Shahjahanpur", "Shrawasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
  "uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
  "west-bengal": ["Bankura", "Bardhaman", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Kolkata", "Malda", "Medinipur East", "Medinipur West", "Murshidabad", "Nadia", "North 24 Parganas", "Purulia", "South 24 Parganas", "Uttar Dinajpur"]
};

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

export function ProfileCreation({ onContinue, onBack }: ProfileCreationProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
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

  // Get districts for selected state
  const getDistrictsForState = (stateKey: string): string[] => {
    return districtsByState[stateKey] || [];
  };

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-20 mobile-full-screen">
      {/* Header - Mobile-first with back button and language selector */}
      <header className="bg-white shadow-sm py-3 px-4 md:py-4 md:px-6 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            {onBack && (
              <button
                onClick={onBack}
                className="mr-2 md:mr-3 p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={t('common.back')}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div className="w-8 h-8 md:w-10 md:h-10 bg-accent rounded-lg flex items-center justify-center mr-2 md:mr-3">
              <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="text-base md:text-xl font-display font-bold text-primary truncate">Quiver</span>
          </div>
          <LanguageSelector variant="compact" />
        </div>
      </header>

      {/* Main Content - Mobile-first */}
      <main className="max-w-2xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="space-y-6 md:space-y-8">
          {/* Step Indicator - Clear progression from Step 1 to Step 2 */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-6 h-6 rounded-full bg-accent/20 text-accent font-semibold text-xs flex items-center justify-center">1</span>
              <span className="hidden sm:inline">{t('consent.title', 'Understanding QUIVER')}</span>
            </span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <span className="flex items-center gap-1">
              <span className="w-6 h-6 rounded-full bg-accent text-white font-semibold text-xs flex items-center justify-center">2</span>
              <span className="font-medium text-gray-900">{t('profile.stepTitle', 'Your Profile')}</span>
            </span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 font-semibold text-xs flex items-center justify-center">3</span>
          </div>

          {/* Progress Bar */}
          <ProgressIndicator current={2} total={9} />

          {/* Section Header - Single heading with supportive text */}
          <div className="text-center space-y-2">
            <h2 className="text-xl md:text-2xl font-display font-bold text-gray-900">
              {currentLanguage === 'hi' ? 'उद्यमी की जानकारी' : t('profile.stepTitle', 'Your Profile')}
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              {t('profile.stepSubtitle', 'Tell us about yourself')}
            </p>
          </div>

          {/* Form Card - Clean layout */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm p-4 md:p-8 space-y-6 md:space-y-7">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-base font-medium text-gray-900">
                {currentLanguage === 'hi' ? 'पूरा नाम' : t('profile.fullName')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder={currentLanguage === 'hi' ? 'अपना पूरा नाम दर्ज करें' : t('profile.fullNamePlaceholder')}
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-accent focus:ring-accent/20 text-base"
              />
            </div>

            {/* Gender - Simplified radio without box containers */}
            <div className="space-y-3">
              <label className="text-base font-medium text-gray-900">
                {currentLanguage === 'hi' ? 'लिंग' : t('profile.gender')} <span className="text-red-500">*</span>
              </label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => updateField('gender', value)}
                className="flex flex-wrap gap-6 md:gap-8"
              >
                {genderOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`gender-${option.value}`}
                      className="w-5 h-5 border-2 border-gray-300 data-[state=checked]:border-accent data-[state=checked]:bg-accent"
                    />
                    <span className={`text-base ${formData.gender === option.value ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                      {currentLanguage === 'hi' ? option.labelHi : option.labelEn}
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Age */}
            <div className="space-y-2">
              <label className="text-base font-medium text-gray-900">
                {currentLanguage === 'hi' ? 'आयु' : t('profile.age')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder={currentLanguage === 'hi' ? 'आयु दर्ज करें (जैसे: 35)' : t('profile.agePlaceholder')}
                value={formData.age}
                onChange={(e) => updateField('age', e.target.value)}
                min="18"
                max="100"
                className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-accent focus:ring-accent/20 text-base"
              />
            </div>

            {/* Education Level - Simplified radio without box containers */}
            <div className="space-y-3">
              <label className="text-base font-medium text-gray-900">
                {currentLanguage === 'hi' ? 'शिक्षा स्तर' : t('profile.education')} <span className="text-red-500">*</span>
              </label>
              <RadioGroup
                value={formData.education}
                onValueChange={(value) => updateField('education', value)}
                className="space-y-3"
              >
                {educationLevels.map((level) => (
                  <label
                    key={level.value}
                    className="flex items-center gap-3 cursor-pointer py-1"
                  >
                    <RadioGroupItem
                      value={level.value}
                      id={`edu-${level.value}`}
                      className="w-5 h-5 border-2 border-gray-300 data-[state=checked]:border-accent data-[state=checked]:bg-accent"
                    />
                    <span className={`text-base ${formData.education === level.value ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                      {currentLanguage === 'hi' ? level.labelHi : level.labelEn}
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* State */}
            <div className="space-y-2">
              <label className="text-base font-medium text-gray-900">
                {currentLanguage === 'hi' ? 'राज्य' : t('profile.state')} <span className="text-red-500">*</span>
              </label>
              <Select value={formData.state} onValueChange={(value) => { updateField('state', value); updateField('district', ''); }}>
                <SelectTrigger className="h-12 bg-gray-50 border-gray-200 rounded-xl text-base">
                  <SelectValue placeholder={currentLanguage === 'hi' ? 'राज्य चुनें' : t('profile.statePlaceholder')} />
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

            {/* District - Dropdown selector */}
            <div className="space-y-2">
              <label className="text-base font-medium text-gray-900">
                {currentLanguage === 'hi' ? 'जिला' : t('profile.district')} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.district}
                onValueChange={(value) => updateField('district', value)}
                disabled={!formData.state}
              >
                <SelectTrigger className="h-12 bg-gray-50 border-gray-200 rounded-xl text-base disabled:opacity-50">
                  <SelectValue placeholder={
                    !formData.state
                      ? (currentLanguage === 'hi' ? 'पहले राज्य चुनें' : t('profile.selectDistrictFirst'))
                      : (currentLanguage === 'hi' ? 'जिला चुनें' : t('profile.districtPlaceholder'))
                  } />
                </SelectTrigger>
                <SelectContent>
                  {getDistrictsForState(formData.state).map((district) => (
                    <SelectItem key={district} value={district.toLowerCase().replace(/\s+/g, '-')}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Email (Optional) */}
            <div className="space-y-2">
              <label className="text-base font-medium text-gray-900">
                {currentLanguage === 'hi' ? 'ईमेल' : t('profile.email')} <span className="text-gray-400 text-sm">({currentLanguage === 'hi' ? 'वैकल्पिक' : t('common.optional')})</span>
              </label>
              <Input
                type="email"
                placeholder={t('profile.emailPlaceholder', 'your.email@example.com')}
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:border-accent focus:ring-accent/20 text-base"
              />
            </div>

            {/* Submit Button - Mobile-first with sticky positioning on mobile */}
            <div className="sticky bottom-0 -mx-4 md:mx-0 px-4 py-4 md:p-0 bg-white md:bg-transparent border-t md:border-0 border-gray-200">
              <Button
                className="w-full min-h-[52px] md:h-14 bg-accent hover:bg-accent/90 active:bg-accent/80 text-base md:text-lg font-semibold rounded-xl transition-all"
                disabled={!isValid}
                onClick={handleSubmit}
              >
                {currentLanguage === 'hi' ? 'आगे बढ़ें' : t('common.continue')}
              </Button>
            </div>
          </div>

          {/* AI Assistant - Hidden on small mobile for cleaner UI */}
          <div className="hidden sm:block">
            <AIAssistant
              position="inline"
              message={currentLanguage === 'hi'
                ? 'फॉर्म भरने में मदद चाहिए? बोलकर भी भर सकते हैं!'
                : 'Need help filling the form? You can also speak to fill it!'
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}
