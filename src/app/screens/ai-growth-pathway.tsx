import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { generateGrowthPathway } from '../../services/ai-pathway';
import type { AIGrowthPathwayData, BusinessDataPayload } from '../../services/ai-pathway';
import {
  Sparkles,
  ArrowLeft,
  Volume2,
  TrendingUp,
  Target,
  Briefcase,
  DollarSign,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Handshake,
  GraduationCap,
  Store
} from 'lucide-react';

interface AIGrowthPathwayProps {
  businessData: BusinessDataPayload;
  onBack?: () => void;
  onContinue?: () => void;
}

export const AIGrowthPathway: React.FC<AIGrowthPathwayProps> = ({
  businessData,
  onBack,
  onContinue
}) => {
  const { t } = useTranslation();
  const [pathway, setPathway] = useState<AIGrowthPathwayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['overview', 'detailed', 'support', 'changes'])
  );

  useEffect(() => {
    loadPathway();
  }, []);

  const loadPathway = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateGrowthPathway(businessData);
      setPathway(result);
    } catch (err) {
      console.error('Error loading pathway:', err);
      setError('Unable to generate growth pathway. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const speakPathway = () => {
    if (!pathway) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const overviewText = pathway.overview
      .map(r => `${r.year}: Goal is ${r.mainGoal}, targeting ${r.revenueTarget} revenue with ${r.teamSize}.`)
      .join(' ');

    const text = `Your growth pathway. ${pathway.businessSummary}. ${overviewText}. ${pathway.closingNote}`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Color for year columns
  const getYearColor = (timeline: string) => {
    if (timeline.includes('Current')) return 'bg-gray-50';
    if (timeline.includes('Year 1')) return 'bg-blue-50';
    if (timeline.includes('Year 2')) return 'bg-emerald-50';
    if (timeline.includes('Year 3')) return 'bg-purple-50';
    return 'bg-white';
  };

  const getYearBadgeColor = (year: string) => {
    if (year.includes('1')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (year.includes('2')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (year.includes('3')) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-gray-100 text-gray-800';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-6 p-8 max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center animate-pulse">
            <Sparkles className="w-10 h-10 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('growthPathway.generating', 'Generating your personalized growth pathway...')}
            </h2>
            <p className="text-gray-600">
              {t('growthPathway.based', 'Analyzing your business profile with AI')}
            </p>
          </div>
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-sm text-gray-400">This may take 15-30 seconds...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !pathway) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-700 mb-4">{error || 'Unable to generate pathway. Please try again.'}</p>
          <button
            onClick={loadPathway}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="block mx-auto mt-3 text-gray-500 hover:text-gray-700 text-sm"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 flex items-center justify-center gap-2">
            <img src="/logo.jpg" alt="Quiver" className="w-8 h-8 rounded-lg object-cover" />
            <h1 className="text-lg font-bold text-gray-900">
              {t('growthPathway.title', 'Your Growth Pathway')}
            </h1>
          </div>
          <button
            onClick={speakPathway}
            className={`p-2 rounded-lg transition-colors ${isSpeaking ? 'bg-accent text-white' : 'hover:bg-gray-100'}`}
            title="Listen"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* AI Disclaimer Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 font-medium">
              {t('growthPathway.disclaimer', 'This is AI generated. Quiver team will share additional insights and guidance upon further engagement.')}
            </p>
          </div>
        </div>

        {/* Business Summary */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-gray-700 leading-relaxed">{pathway.businessSummary}</p>
        </div>

        {/* ===================== QUICK 3-YEAR OVERVIEW ===================== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('overview')}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Quick 3-Year Overview</h2>
            </div>
            {expandedSections.has('overview') ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.has('overview') && (
            <div className="px-5 pb-5">
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-primary text-white">
                      <th className="px-3 py-2.5 text-left font-semibold rounded-tl-lg">Year</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Main Goal</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Revenue Target</th>
                      <th className="px-3 py-2.5 text-left font-semibold">What You Build</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Where You Sell</th>
                      <th className="px-3 py-2.5 text-left font-semibold rounded-tr-lg">Team Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pathway.overview.map((row, idx) => (
                      <tr key={idx} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                        <td className="px-3 py-3 font-bold text-primary whitespace-nowrap">{row.year}</td>
                        <td className="px-3 py-3 text-gray-700">{row.mainGoal}</td>
                        <td className="px-3 py-3 font-semibold text-accent whitespace-nowrap">{row.revenueTarget}</td>
                        <td className="px-3 py-3 text-gray-600">{row.whatYouBuild}</td>
                        <td className="px-3 py-3 text-gray-600">{row.whereYouSell}</td>
                        <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.teamSize}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ===================== DETAILED GROWTH PATHWAY ===================== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('detailed')}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Detailed Growth Pathway</h2>
            </div>
            {expandedSections.has('detailed') ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.has('detailed') && (
            <div className="px-5 pb-5">
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-primary text-white">
                      <th className="px-3 py-2.5 text-left font-semibold rounded-tl-lg">Timeline</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Monthly Revenue</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Monthly Profit</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Customers/Month</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Workers</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Key Actions</th>
                      <th className="px-3 py-2.5 text-left font-semibold rounded-tr-lg">Sales Area</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pathway.detailed.map((row, idx) => (
                      <tr key={idx} className={`border-b border-gray-100 ${getYearColor(row.timeline)}`}>
                        <td className="px-3 py-3 font-bold text-gray-900 whitespace-nowrap text-xs">{row.timeline}</td>
                        <td className="px-3 py-3 font-semibold text-accent whitespace-nowrap">{row.monthlyRevenue}</td>
                        <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{row.monthlyProfit}</td>
                        <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{row.customersPerMonth}</td>
                        <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.workers}</td>
                        <td className="px-3 py-3 text-gray-600 text-xs leading-relaxed min-w-[200px]">{row.keyActions}</td>
                        <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.salesArea}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ===================== WHAT QUIVER SUPPORT ENABLES ===================== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('support')}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Handshake className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">What Quiver Support Enables</h2>
            </div>
            {expandedSections.has('support') ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.has('support') && (
            <div className="px-5 pb-5 space-y-5">
              {/* Mentorship */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-blue-900">Mentorship helps with:</h3>
                </div>
                <ul className="space-y-2">
                  {pathway.quiverSupport.mentorship.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Growth Capital */}
              <div className="bg-emerald-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-emerald-900">
                    {pathway.quiverSupport.growthCapital.totalAmount} Growth Capital used for:
                  </h3>
                </div>
                <div className="space-y-2">
                  {pathway.quiverSupport.growthCapital.breakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                      <span className="text-sm text-emerald-800">{item.item}</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-emerald-700">{item.amount}</span>
                        <span className="text-xs text-emerald-600 ml-2">({item.timeline})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Access */}
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Store className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-purple-900">Market Access opens:</h3>
                </div>
                <ul className="space-y-2">
                  {pathway.quiverSupport.marketAccess.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-purple-800">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* ===================== KEY CHANGES NEEDED ===================== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('changes')}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Key Changes Needed</h2>
            </div>
            {expandedSections.has('changes') ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.has('changes') && (
            <div className="px-5 pb-5 space-y-4">
              {pathway.keyChanges.map((yearData, idx) => (
                <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className={`px-4 py-2 ${getYearBadgeColor(yearData.year)} border-b font-bold text-sm`}>
                    {yearData.year} priorities:
                  </div>
                  <ul className="p-4 space-y-2">
                    {yearData.priorities.map((priority, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-3 text-sm text-gray-700">
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-500">
                          {pIdx + 1}
                        </span>
                        {priority}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Closing Note */}
        <div className="bg-accent rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="font-bold">Growth Summary</span>
          </div>
          <p className="text-white/90 leading-relaxed">{pathway.closingNote}</p>
        </div>

        {/* AI Disclaimer - Bottom */}
        <div className="bg-gray-100 border border-gray-200 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">
            {t('growthPathway.disclaimerShort', 'AI-generated pathway. Quiver team will provide personalized guidance upon engagement.')}
          </p>
        </div>

        {/* Continue Button */}
        {onContinue && (
          <div className="pt-2 pb-6">
            <button
              onClick={onContinue}
              className="w-full h-14 bg-accent hover:bg-accent/90 text-white rounded-xl font-bold text-lg transition-colors"
            >
              {t('common.continue', 'Continue')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIGrowthPathway;
