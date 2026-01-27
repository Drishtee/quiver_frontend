import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  generateGrowthPathway,
  getSavedPathway
} from '../../services/ai-pathway';
import type { GrowthPathway, PathwayStep } from '../../services/ai-pathway';
import {
  Sparkles,
  ChevronRight,
  ChevronDown,
  Clock,
  CheckCircle2,
  Download,
  Volume2,
  Target,
  TrendingUp,
  FileText,
  Video,
  BookOpen,
  Wrench,
  ArrowLeft
} from 'lucide-react';
import { ProgressIndicator } from '../components/progress-indicator';

interface AIGrowthPathwayProps {
  sessionId: string;
  industry: string;
  businessData?: Record<string, any>;
  onBack?: () => void;
  onContinue?: () => void;
}

export const AIGrowthPathway: React.FC<AIGrowthPathwayProps> = ({
  sessionId,
  industry,
  businessData = {},
  onBack,
  onContinue
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [pathway, setPathway] = useState<GrowthPathway | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    loadPathway();
  }, [sessionId, industry]);

  const loadPathway = async () => {
    setLoading(true);
    try {
      // Try to get saved pathway first
      let result = await getSavedPathway(sessionId);

      // Generate new if not found
      if (!result) {
        result = await generateGrowthPathway({
          sessionId,
          industry,
          businessData: {
            businessName: businessData.business_name,
            yearStarted: businessData.year_started,
            monthlyRevenue: businessData.monthly_revenue,
            employeeCount: businessData.employee_count,
            currentChallenges: businessData.challenges,
            goals: businessData.goals
          }
        });
      }

      setPathway(result);
      // Expand first step by default
      if (result.steps.length > 0) {
        setExpandedSteps(new Set([result.steps[0].id]));
      }
    } catch (error) {
      console.error('Error loading pathway:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const getLocalizedText = (step: PathwayStep, field: 'title' | 'description') => {
    if (currentLang === 'hi') {
      return field === 'title' ? step.titleHi : step.descriptionHi;
    } else if (currentLang === 'as') {
      return field === 'title' ? step.titleAs : step.descriptionAs;
    }
    return field === 'title' ? step.title : step.description;
  };

  const speakPathway = () => {
    if (!pathway) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = currentLang === 'hi'
      ? `आपका विकास पथ: ${pathway.steps.map(s => s.titleHi).join(', ')}`
      : `Your growth pathway: ${pathway.steps.map(s => s.title).join(', ')}`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLang === 'hi' ? 'hi-IN' : currentLang === 'as' ? 'as-IN' : 'en-IN';
    utterance.onend = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-red-500" />;
      case 'article': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'tool': return <Wrench className="w-4 h-4 text-green-500" />;
      case 'template': return <FileText className="w-4 h-4 text-purple-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('growthPathway.generating')}
            </h2>
            <p className="text-gray-600">{t('growthPathway.based')}</p>
          </div>
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!pathway) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-gray-600">Unable to generate pathway. Please try again.</p>
          <button onClick={loadPathway} className="mt-4 px-6 py-2 bg-primary text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-gray-900">{t('growthPathway.title')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={speakPathway}
              className={`p-2 rounded-lg transition-colors ${isSpeaking ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
              title={t('growthPathway.listenAudio')}
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={t('growthPathway.downloadPdf')}
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Industry Badge */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            {industry}
          </span>
          <p className="mt-2 text-gray-600">{t('growthPathway.subtitle')}</p>
        </div>

        {/* Growth Estimate Card */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6" />
            <h3 className="font-bold text-lg">{t('growthPathway.estimatedGrowth')}</h3>
          </div>
          <p className="text-2xl font-bold">
            {currentLang === 'hi' ? pathway.estimatedGrowthHi : pathway.estimatedGrowth}
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {t('growthPathway.timeline')}
          </h2>

          <div className="space-y-3">
            {pathway.steps.map((step, index) => {
              const isExpanded = expandedSteps.has(step.id);
              const isLast = index === pathway.steps.length - 1;

              return (
                <div key={step.id} className="relative">
                  {/* Connector line */}
                  {!isLast && (
                    <div className="absolute left-6 top-14 w-0.5 h-full bg-gray-200 -z-10" />
                  )}

                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Step Header */}
                    <button
                      onClick={() => toggleStep(step.id)}
                      className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">{step.order}</span>
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-bold text-gray-900">
                          {getLocalizedText(step, 'title')}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Clock className="w-4 h-4" />
                          <span>{step.duration}</span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 space-y-4 border-t border-gray-100">
                        <p className="text-gray-600 pl-16">
                          {getLocalizedText(step, 'description')}
                        </p>

                        {/* Milestones */}
                        <div className="pl-16">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            {t('growthPathway.milestones')}
                          </h4>
                          <ul className="space-y-2">
                            {(currentLang === 'hi' ? step.milestonesHi : step.milestones).map((milestone, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                {milestone}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Resources */}
                        {step.resources.length > 0 && (
                          <div className="pl-16">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                              {t('growthPathway.resources')}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {step.resources.map((resource) => (
                                <a
                                  key={resource.id}
                                  href={resource.url || '#'}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                                >
                                  {getResourceIcon(resource.type)}
                                  <span>{currentLang === 'hi' ? resource.titleHi : resource.title}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {t('growthPathway.recommendations')}
          </h3>
          <ul className="space-y-3">
            {(currentLang === 'hi' ? pathway.recommendationsHi : pathway.recommendations).map((rec, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-700 text-sm font-bold">{idx + 1}</span>
                </div>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Continue Button */}
        {onContinue && (
          <div className="pt-4">
            <button
              onClick={onContinue}
              className="w-full h-14 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-lg hover:from-secondary hover:to-primary transition-all shadow-lg"
            >
              {t('common.continue')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIGrowthPathway;
