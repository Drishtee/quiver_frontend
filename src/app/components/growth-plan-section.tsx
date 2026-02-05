import { useState, useEffect } from "react";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  X,
  Play,
  CheckCircle2,
  TrendingUp,
  Users,
  FileCheck,
  Banknote,
  Rocket,
  Quote,
  Target,
  Zap,
  ImageIcon
} from "lucide-react";

// ===========================================
// GRAPHIC DIMENSIONS GUIDE
// ===========================================
//
// 1. STAGE HERO ILLUSTRATION (right side of header)
//    - Dimensions: 160x160px (mobile) / 200x200px (desktop)
//    - Format: SVG or PNG with transparency
//    - Style: Illustrative, matches stage color gradient
//
// 2. STAGE BACKGROUND PATTERN
//    - Dimensions: Full width, 200px height
//    - Format: SVG pattern or PNG
//    - Style: Subtle, 10-20% opacity
//
// 3. PREVIEW CARD BACKGROUND
//    - Dimensions: Full card (responsive)
//    - Format: SVG or PNG
//    - Style: Abstract shapes, very subtle
//
// 4. TESTIMONIAL AVATAR
//    - Dimensions: 48x48px
//    - Format: JPG or PNG
//    - Style: Circular crop
//
// ===========================================

interface GrowthVisionStage {
  id: number;
  stage: string;
  headline: string;
  subheadline: string;
  description: string;
  whatWeDoForYou: string[];
  outcome: {
    metric: string;
    description: string;
  };
  testimonial?: {
    quote: string;
    name: string;
    business: string;
    avatarUrl?: string; // 48x48px
  };
  icon: React.ElementType;
  color: string;
  gradient: string;
  // GRAPHICS - Add your custom images here
  heroIllustration?: string;      // 160x160 / 200x200px - Main stage illustration
  backgroundPattern?: string;      // Full width pattern
  outcomeBadgeIcon?: string;       // 64x64px - Custom icon for outcome
}

interface GrowthPlanSectionProps {
  currentStage: number;
  userProfile?: {
    businessName?: string;
    sector?: string;
    yearStarted?: string;
    annualRevenue?: string;
  };
  onScheduleMeeting: () => void;
  onClose?: () => void;
  isExpanded?: boolean;
}

// ===========================================
// STAGE CONTENT - Edit headlines, copy, and add image URLs here
// ===========================================
const visionStages: GrowthVisionStage[] = [
  {
    id: 1,
    stage: "Stage 1",
    headline: "We Learn Your Story",
    subheadline: "Every great business starts with understanding",
    description: "Share your journey with us. Our AI-powered platform analyzes your business, identifies opportunities, and creates a personalized roadmap for your success.",
    whatWeDoForYou: [
      "Deep-dive into your business model",
      "AI analysis of growth opportunities",
      "Identify your unique strengths",
      "Map out your funding eligibility"
    ],
    outcome: {
      metric: "100%",
      description: "Clarity on your growth potential"
    },
    testimonial: {
      quote: "Quiver understood my business better than I did. They saw opportunities I never knew existed.",
      name: "Priya Sharma",
      business: "Organic Foods Co.",
      avatarUrl: undefined // Add: "/images/testimonials/priya.jpg"
    },
    icon: Target,
    color: "emerald",
    gradient: "from-emerald-500 to-teal-600",
    // ADD YOUR GRAPHICS:
    heroIllustration: undefined,    // Add: "/images/stages/stage1-discovery.svg"
    backgroundPattern: undefined,   // Add: "/images/patterns/pattern1.svg"
  },
  {
    id: 2,
    stage: "Stage 2",
    headline: "Your Personal Growth Advisor",
    subheadline: "Expert guidance, tailored for you",
    description: "Connect 1-on-1 with industry experts who understand your challenges. Get actionable strategies, not generic advice. Your success is our mission.",
    whatWeDoForYou: [
      "Match you with industry-specific mentors",
      "Create your custom growth blueprint",
      "Set achievable milestones",
      "Provide ongoing strategic support"
    ],
    outcome: {
      metric: "3x",
      description: "Faster path to funding readiness"
    },
    testimonial: {
      quote: "My advisor helped me see the bigger picture. Within months, I had a clear plan and the confidence to execute it.",
      name: "Rajesh Kumar",
      business: "Kumar Textiles",
      avatarUrl: undefined
    },
    icon: Users,
    color: "blue",
    gradient: "from-blue-500 to-indigo-600",
    heroIllustration: undefined,    // Add: "/images/stages/stage2-advisor.svg"
    backgroundPattern: undefined,
  },
  {
    id: 3,
    stage: "Stage 3",
    headline: "We Handle the Paperwork",
    subheadline: "You focus on business, we handle the rest",
    description: "Loan applications, registrations, compliance documents - we prepare everything. Our team ensures your documentation is investor-ready and error-free.",
    whatWeDoForYou: [
      "Complete loan & grant applications",
      "Business registration support",
      "Financial statement preparation",
      "Compliance documentation"
    ],
    outcome: {
      metric: "90%",
      description: "Reduction in paperwork stress"
    },
    testimonial: {
      quote: "I used to dread paperwork. Quiver made it effortless. My loan application was approved in record time.",
      name: "Meera Devi",
      business: "Handloom Creations",
      avatarUrl: undefined
    },
    icon: FileCheck,
    color: "violet",
    gradient: "from-violet-500 to-purple-600",
    heroIllustration: undefined,    // Add: "/images/stages/stage3-documents.svg"
    backgroundPattern: undefined,
  },
  {
    id: 4,
    stage: "Stage 4",
    headline: "Unlock Funding Opportunities",
    subheadline: "The capital your dreams deserve",
    description: "Access our network of banks, NBFCs, government schemes, and investors. We match you with the right funding sources and guide you through the entire process.",
    whatWeDoForYou: [
      "Connect with 50+ funding partners",
      "Government scheme applications",
      "Bank loan facilitation",
      "Investor introductions"
    ],
    outcome: {
      metric: "₹10L+",
      description: "Average funding secured"
    },
    testimonial: {
      quote: "I thought funding was impossible for small businesses like mine. Quiver connected me with a scheme I never knew existed. I got ₹15 lakhs!",
      name: "Arjun Singh",
      business: "Singh Dairy Farm",
      avatarUrl: undefined
    },
    icon: Banknote,
    color: "amber",
    gradient: "from-amber-500 to-orange-600",
    heroIllustration: undefined,    // Add: "/images/stages/stage4-funding.svg"
    backgroundPattern: undefined,
  },
  {
    id: 5,
    stage: "Stage 5",
    headline: "Scale to New Heights",
    subheadline: "From local success to market leader",
    description: "With funding secured, it's time to grow. We provide ongoing support, market linkages, and strategic guidance to help you scale sustainably.",
    whatWeDoForYou: [
      "Market expansion strategies",
      "Operational excellence training",
      "B2B & retail connections",
      "Continuous mentorship"
    ],
    outcome: {
      metric: "2-5x",
      description: "Revenue growth in 12 months"
    },
    testimonial: {
      quote: "From a small workshop to supplying major retailers - Quiver was with me every step. My revenue tripled in one year.",
      name: "Lakshmi Narayanan",
      business: "Spice Exports Ltd.",
      avatarUrl: undefined
    },
    icon: Rocket,
    color: "rose",
    gradient: "from-rose-500 to-pink-600",
    heroIllustration: undefined,    // Add: "/images/stages/stage5-scale.svg"
    backgroundPattern: undefined,
  }
];

// ===========================================
// GRAPHIC PLACEHOLDER COMPONENT
// Shows dimensions when no image is provided
// ===========================================
function GraphicPlaceholder({
  width,
  height,
  label,
  className = ""
}: {
  width: number;
  height: number;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-white/10 border-2 border-dashed border-white/30 rounded-2xl flex flex-col items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <ImageIcon className="w-8 h-8 text-white/40 mb-2" />
      <span className="text-white/40 text-xs font-medium">{width}x{height}</span>
      <span className="text-white/30 text-[10px]">{label}</span>
    </div>
  );
}

// ===========================================
// VISION CARD COMPONENT
// ===========================================
function VisionCard({
  stage,
  isActive,
  userProfile
}: {
  stage: GrowthVisionStage;
  isActive: boolean;
  userProfile?: GrowthPlanSectionProps["userProfile"];
}) {
  const Icon = stage.icon;

  return (
    <div className="h-full flex flex-col">
      {/* ========================================= */}
      {/* STAGE HEADER - 200px height */}
      {/* Hero illustration: 160x160 mobile, 200x200 desktop */}
      {/* ========================================= */}
      <div className={`bg-gradient-to-br ${stage.gradient} p-6 sm:p-8 text-white relative overflow-hidden min-h-[200px]`}>

        {/* BACKGROUND PATTERN PLACEHOLDER */}
        {/* Dimensions: Full width x 200px height */}
        {/* Add subtle patterns or abstract shapes */}
        {stage.backgroundPattern ? (
          <img
            src={stage.backgroundPattern}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        ) : (
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>
        )}

        {/* HERO ILLUSTRATION AREA */}
        {/* Mobile: 120x120px | Desktop: 160x160px */}
        <div className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2">
          {stage.heroIllustration ? (
            <img
              src={stage.heroIllustration}
              alt={stage.headline}
              className="w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] object-contain"
            />
          ) : (
            // Placeholder showing expected dimensions
            <div className="w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] bg-white/10 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-white/20">
              <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-white/60 mb-1" />
              <span className="text-white/30 text-[10px] hidden sm:block">160x160px</span>
            </div>
          )}
        </div>

        {/* Stage Header Text */}
        <div className="relative z-10 pr-[130px] sm:pr-[180px]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {stage.stage}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight">{stage.headline}</h2>
          <p className="text-white/80 text-sm sm:text-base">{stage.subheadline}</p>
        </div>
      </div>

      {/* ========================================= */}
      {/* SCROLLABLE CONTENT AREA */}
      {/* ========================================= */}
      <div className="flex-1 p-5 sm:p-6 space-y-5 overflow-y-auto">

        {/* Description + AI Personalization */}
        <div>
          <p className="text-gray-600 leading-relaxed">{stage.description}</p>

          {/* AI INSIGHT - Personalized based on user data */}
          {userProfile?.businessName && isActive && (
            <div className="mt-3 p-3 bg-gradient-to-r from-accent/5 to-purple-500/5 rounded-xl border border-accent/20">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-accent">For {userProfile.businessName}:</span>{" "}
                  {stage.id === 1 && `We'll analyze your ${userProfile.sector || "business"} to find the best growth opportunities.`}
                  {stage.id === 2 && `Connect with advisors who specialize in ${userProfile.sector || "your industry"}.`}
                  {stage.id === 3 && `Get all your ${userProfile.sector || "business"} documentation prepared professionally.`}
                  {stage.id === 4 && `Access funding schemes perfect for ${userProfile.sector || "businesses"} like yours.`}
                  {stage.id === 5 && `Scale ${userProfile.businessName} to reach new markets and customers.`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* What Quiver Does For You */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" />
            What Quiver Does For You
          </h3>
          <div className="space-y-2">
            {stage.whatWeDoForYou.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${stage.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================= */}
        {/* OUTCOME METRIC CARD */}
        {/* Optional: Add 64x64px custom icon */}
        {/* ========================================= */}
        <div className={`bg-gradient-to-br ${stage.gradient} rounded-2xl p-5 text-white`}>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold">{stage.outcome.metric}</p>
              <p className="text-white/80 text-sm">{stage.outcome.description}</p>
            </div>
            <div className="flex-1 h-px bg-white/20" />
            {stage.outcomeBadgeIcon ? (
              <img src={stage.outcomeBadgeIcon} alt="" className="w-12 h-12 sm:w-16 sm:h-16" />
            ) : (
              <TrendingUp className="w-8 h-8 text-white/60" />
            )}
          </div>
        </div>

        {/* ========================================= */}
        {/* TESTIMONIAL CARD */}
        {/* Avatar: 48x48px circular */}
        {/* ========================================= */}
        {stage.testimonial && (
          <div className="bg-gray-50 rounded-2xl p-5 relative">
            <Quote className="absolute top-4 right-4 w-8 h-8 text-gray-200" />
            <p className="text-gray-700 italic mb-4 pr-8 text-sm sm:text-base">"{stage.testimonial.quote}"</p>
            <div className="flex items-center gap-3">
              {/* AVATAR PLACEHOLDER - 48x48px */}
              {stage.testimonial.avatarUrl ? (
                <img
                  src={stage.testimonial.avatarUrl}
                  alt={stage.testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-semibold text-sm">
                  {stage.testimonial.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 text-sm">{stage.testimonial.name}</p>
                <p className="text-gray-500 text-xs">{stage.testimonial.business}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================
// MAIN GROWTH PLAN SECTION
// ===========================================
export function GrowthPlanSection({
  currentStage,
  userProfile,
  onScheduleMeeting,
  onClose,
  isExpanded = false
}: GrowthPlanSectionProps) {
  const [showVision, setShowVision] = useState(isExpanded);
  const [activeSlide, setActiveSlide] = useState(currentStage - 1);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (showVision) {
      setTimeout(() => setAnimateIn(true), 50);
    } else {
      setAnimateIn(false);
    }
  }, [showVision]);

  useEffect(() => {
    if (isExpanded) {
      setShowVision(true);
    }
  }, [isExpanded]);

  const goToSlide = (index: number) => {
    setActiveSlide(Math.max(0, Math.min(visionStages.length - 1, index)));
  };

  const activeStageData = visionStages[activeSlide];
  const progress = ((currentStage) / visionStages.length) * 100;

  // ===========================================
  // PREVIEW CARD (Shown on Dashboard)
  // Background graphic area: Full card size
  // ===========================================
  if (!showVision) {
    return (
      <div
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden cursor-pointer group"
        onClick={() => setShowVision(true)}
      >
        {/* ========================================= */}
        {/* PREVIEW CARD BACKGROUND */}
        {/* Add your custom background graphic here */}
        {/* Recommended: Abstract shapes, subtle glow effects */}
        {/* ========================================= */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Replace these with your custom graphics */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/30 transition-colors duration-500" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-purple-500/30 transition-colors duration-500" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Your Growth Vision</h3>
                  <p className="text-white/60 text-sm">Powered by Quiver AI</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{Math.round(progress)}%</p>
              <p className="text-white/60 text-xs">Journey Progress</p>
            </div>
          </div>

          {/* Stage Progress Bars */}
          <div className="flex items-center gap-2 mb-6">
            {visionStages.map((stage, idx) => (
              <div
                key={stage.id}
                className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                  idx < currentStage
                    ? "bg-gradient-to-r from-accent to-purple-500"
                    : idx === currentStage
                    ? "bg-white/40"
                    : "bg-white/10"
                }`}
              />
            ))}
          </div>

          {/* Current Stage Preview */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-5 border border-white/10 group-hover:bg-white/15 transition-colors">
            <div className="flex items-center gap-4">
              {/* Stage Icon - Could be replaced with 48x48 custom icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${visionStages[currentStage - 1]?.gradient || "from-accent to-purple-500"} flex items-center justify-center flex-shrink-0`}>
                {(() => {
                  const stage = visionStages[currentStage - 1];
                  if (!stage) return null;
                  const StageIcon = stage.icon;
                  return <StageIcon className="w-6 h-6 text-white" />;
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/60 uppercase tracking-wider mb-0.5">You're at {visionStages[currentStage - 1]?.stage}</p>
                <p className="font-semibold truncate">{visionStages[currentStage - 1]?.headline}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowVision(true);
            }}
            className="w-full bg-white text-gray-900 font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-white/95 active:scale-[0.98] transition-all"
          >
            <Play className="w-4 h-4" />
            See What Quiver Can Do For You
          </button>

          <p className="text-center text-white/50 text-xs mt-3">
            Discover your personalized growth journey
          </p>
        </div>
      </div>
    );
  }

  // ===========================================
  // FULL VISION EXPERIENCE (Modal)
  // ===========================================
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div
        className={`bg-white w-full sm:max-w-lg sm:rounded-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 ${
          animateIn ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
        style={{
          borderTopLeftRadius: "1.5rem",
          borderTopRightRadius: "1.5rem"
        }}
      >
        {/* Navigation Header */}
        <div className="bg-gray-900 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Your Growth Vision</p>
              <p className="text-white/60 text-xs">with Quiver</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowVision(false);
              onClose?.();
            }}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Stage Navigation Pills */}
        <div className="bg-gray-50 px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {visionStages.map((stage, idx) => (
              <button
                key={stage.id}
                onClick={() => goToSlide(idx)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  idx === activeSlide
                    ? `bg-gradient-to-r ${stage.gradient} text-white`
                    : idx < currentStage
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {idx < currentStage && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                {stage.stage}
              </button>
            ))}
          </div>
        </div>

        {/* Vision Card Content */}
        <div className="flex-1 overflow-hidden">
          <VisionCard
            stage={activeStageData}
            isActive={activeSlide === currentStage - 1}
            userProfile={userProfile}
          />
        </div>

        {/* Bottom Navigation & CTA */}
        <div className="bg-white border-t border-gray-100 p-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => goToSlide(activeSlide - 1)}
              disabled={activeSlide === 0}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            {/* Slide Dots */}
            <div className="flex items-center gap-1.5">
              {visionStages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === activeSlide
                      ? "w-6 bg-accent"
                      : "w-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => goToSlide(activeSlide + 1)}
              disabled={activeSlide === visionStages.length - 1}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Dynamic CTA Button */}
          {activeSlide === currentStage - 1 ? (
            <button
              onClick={() => {
                onScheduleMeeting();
                setShowVision(false);
                onClose?.();
              }}
              className={`w-full bg-gradient-to-r ${activeStageData.gradient} text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.98] transition-all`}
            >
              Start This Stage
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : activeSlide < currentStage - 1 ? (
            <div className="w-full bg-emerald-50 text-emerald-700 font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Stage Completed
            </div>
          ) : (
            <button
              onClick={() => goToSlide(currentStage - 1)}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
            >
              Go to Current Stage
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================================
// MINI PROGRESS INDICATOR (For Header)
// ===========================================
export function GrowthProgressMini({
  currentStage,
  totalStages = 5,
  onClick
}: {
  currentStage: number;
  totalStages?: number;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full hover:bg-accent/20 transition-colors group"
    >
      <Sparkles className="w-4 h-4 text-accent" />
      <div className="flex items-center gap-1">
        {Array.from({ length: totalStages }).map((_, idx) => (
          <div
            key={idx}
            className={`w-4 h-1.5 rounded-full transition-all ${
              idx < currentStage ? "bg-accent" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
      <ChevronRight className="w-4 h-4 text-accent group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
}
