import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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

const stageIcons = [Target, Users, FileCheck, Banknote, Rocket];
const stageGradients = [
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600"
];

function VisionCard({
  stageIndex,
  isActive,
  userProfile
}: {
  stageIndex: number;
  isActive: boolean;
  userProfile?: GrowthPlanSectionProps["userProfile"];
}) {
  const { t } = useTranslation();
  const Icon = stageIcons[stageIndex];
  const gradient = stageGradients[stageIndex];
  const stageKey = `stage${stageIndex + 1}`;

  const whatWeDoForYou = t(`growthPlan.stages.${stageKey}.whatWeDoForYou`, { returnObjects: true }) as string[];

  return (
    <div className="h-full flex flex-col">
      {/* Stage Header */}
      <div className={`bg-gradient-to-br ${gradient} p-6 sm:p-8 text-white relative overflow-hidden min-h-[200px]`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2">
          <div className="w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] bg-white/10 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-white/20">
            <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-white/60 mb-1" />
          </div>
        </div>

        <div className="relative z-10 pr-[130px] sm:pr-[180px]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {t(`growthPlan.stages.${stageKey}.stage`)}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight">
            {t(`growthPlan.stages.${stageKey}.headline`)}
          </h2>
          <p className="text-white/80 text-sm sm:text-base">
            {t(`growthPlan.stages.${stageKey}.subheadline`)}
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 p-5 sm:p-6 space-y-5 overflow-y-auto">
        <div>
          <p className="text-gray-600 leading-relaxed">
            {t(`growthPlan.stages.${stageKey}.description`)}
          </p>

          {userProfile?.businessName && isActive && (
            <div className="mt-3 p-3 bg-gradient-to-r from-accent/5 to-purple-500/5 rounded-xl border border-accent/20">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-accent">{t('growthPlan.forBusiness', { name: userProfile.businessName })}:</span>{" "}
                  {t(`growthPlan.stages.${stageKey}.aiInsight`, { sector: userProfile.sector || t('growthPlan.yourBusiness') })}
                </p>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" />
            {t('growthPlan.whatWeDo')}
          </h3>
          <div className="space-y-2">
            {whatWeDoForYou.map((item: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Outcome Metric */}
        <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white`}>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold">
                {t(`growthPlan.stages.${stageKey}.outcome.metric`)}
              </p>
              <p className="text-white/80 text-sm">
                {t(`growthPlan.stages.${stageKey}.outcome.description`)}
              </p>
            </div>
            <div className="flex-1 h-px bg-white/20" />
            <TrendingUp className="w-8 h-8 text-white/60" />
          </div>
        </div>

        {/* Testimonial */}
        <div className="bg-gray-50 rounded-2xl p-5 relative">
          <Quote className="absolute top-4 right-4 w-8 h-8 text-gray-200" />
          <p className="text-gray-700 italic mb-4 pr-8 text-sm sm:text-base">
            "{t(`growthPlan.stages.${stageKey}.testimonial.quote`)}"
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-semibold text-sm">
              {(t(`growthPlan.stages.${stageKey}.testimonial.name`) as string).charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {t(`growthPlan.stages.${stageKey}.testimonial.name`)}
              </p>
              <p className="text-gray-500 text-xs">
                {t(`growthPlan.stages.${stageKey}.testimonial.business`)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GrowthPlanSection({
  currentStage,
  userProfile,
  onScheduleMeeting,
  onClose,
  isExpanded = false
}: GrowthPlanSectionProps) {
  const { t } = useTranslation();
  const [showVision, setShowVision] = useState(isExpanded);
  const [activeSlide, setActiveSlide] = useState(currentStage - 1);
  const [animateIn, setAnimateIn] = useState(false);

  const totalStages = 5;

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
    setActiveSlide(Math.max(0, Math.min(totalStages - 1, index)));
  };

  const progress = ((currentStage) / totalStages) * 100;
  const currentStageKey = `stage${currentStage}`;
  const activeStageKey = `stage${activeSlide + 1}`;

  // Preview Card (Dashboard)
  if (!showVision) {
    return (
      <div
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden cursor-pointer group"
        onClick={() => setShowVision(true)}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/30 transition-colors duration-500" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-purple-500/30 transition-colors duration-500" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{t('growthPlan.title')}</h3>
                  <p className="text-white/60 text-sm">{t('growthPlan.poweredBy')}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{Math.round(progress)}%</p>
              <p className="text-white/60 text-xs">{t('growthPlan.journeyProgress')}</p>
            </div>
          </div>

          {/* Stage Progress Bars */}
          <div className="flex items-center gap-2 mb-6">
            {Array.from({ length: totalStages }).map((_, idx) => (
              <div
                key={idx}
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
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stageGradients[currentStage - 1] || "from-accent to-purple-500"} flex items-center justify-center flex-shrink-0`}>
                {(() => {
                  const StageIcon = stageIcons[currentStage - 1];
                  return StageIcon ? <StageIcon className="w-6 h-6 text-white" /> : null;
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/60 uppercase tracking-wider mb-0.5">
                  {t('growthPlan.youreAt', { stage: t(`growthPlan.stages.${currentStageKey}.stage`) })}
                </p>
                <p className="font-semibold truncate">
                  {t(`growthPlan.stages.${currentStageKey}.headline`)}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowVision(true);
            }}
            className="w-full bg-white text-gray-900 font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-white/95 active:scale-[0.98] transition-all"
          >
            <Play className="w-4 h-4" />
            {t('growthPlan.seeWhatQuiverCanDo')}
          </button>

          <p className="text-center text-white/50 text-xs mt-3">
            {t('growthPlan.discoverJourney')}
          </p>
        </div>
      </div>
    );
  }

  // Full Vision Modal
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
              <p className="text-white font-semibold text-sm">{t('growthPlan.title')}</p>
              <p className="text-white/60 text-xs">{t('growthPlan.withQuiver')}</p>
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
            {Array.from({ length: totalStages }).map((_, idx) => {
              const stageKey = `stage${idx + 1}`;
              return (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    idx === activeSlide
                      ? `bg-gradient-to-r ${stageGradients[idx]} text-white`
                      : idx < currentStage
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {idx < currentStage && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                  {t(`growthPlan.stages.${stageKey}.stage`)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vision Card Content */}
        <div className="flex-1 overflow-hidden">
          <VisionCard
            stageIndex={activeSlide}
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

            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalStages }).map((_, idx) => (
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
              disabled={activeSlide === totalStages - 1}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {activeSlide === currentStage - 1 ? (
            <button
              onClick={() => {
                onScheduleMeeting();
                setShowVision(false);
                onClose?.();
              }}
              className={`w-full bg-gradient-to-r ${stageGradients[activeSlide]} text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.98] transition-all`}
            >
              {t('growthPlan.startThisStage')}
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : activeSlide < currentStage - 1 ? (
            <div className="w-full bg-emerald-50 text-emerald-700 font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              {t('growthPlan.stageCompleted')}
            </div>
          ) : (
            <button
              onClick={() => goToSlide(currentStage - 1)}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
            >
              {t('growthPlan.goToCurrentStage')}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

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
