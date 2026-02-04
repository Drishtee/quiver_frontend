import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Clock, RefreshCw, PlayCircle, AlertTriangle } from 'lucide-react';
import { ONBOARDING_STEPS } from '../../contexts/OnboardingContext';

interface ResumeJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResume: () => void;
  onStartFresh: () => void;
  lastStep: number;
  lastSaved: Date | null;
  completionPercentage: number;
}

export const ResumeJourneyModal: React.FC<ResumeJourneyModalProps> = ({
  isOpen,
  onClose,
  onResume,
  onStartFresh,
  lastStep,
  lastSaved,
  completionPercentage
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const stepInfo = ONBOARDING_STEPS[lastStep];
  const stepName = currentLang === 'hi' ? stepInfo?.nameHi :
                   currentLang === 'as' ? stepInfo?.nameAs :
                   stepInfo?.name;

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} ${t('common.days', { defaultValue: days === 1 ? 'day' : 'days' })} ago`;
    } else if (hours > 0) {
      return `${hours} ${t('common.hours', { defaultValue: hours === 1 ? 'hour' : 'hours' })} ago`;
    } else if (minutes > 0) {
      return `${minutes} ${t('common.minutes', { defaultValue: minutes === 1 ? 'minute' : 'minutes' })} ago`;
    }
    return t('common.justNow', { defaultValue: 'Just now' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <PlayCircle className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">
            {t('resume.title')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t('resume.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Progress indicator */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{t('resume.progress', { percent: completionPercentage })}</span>
              <span className="font-medium text-primary">{completionPercentage}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Last step info */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold">{lastStep + 1}</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {t('resume.lastStep', { step: lastStep + 1 })}
              </p>
              <p className="font-medium text-gray-900">{stepName}</p>
            </div>
          </div>

          {/* Last saved time */}
          {lastSaved && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{t('resume.lastSaved', { time: formatLastSaved() })}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onResume}
            className="w-full h-12 bg-accent hover:bg-accent/90 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-5 h-5" />
            {t('resume.resume')}
          </button>

          <button
            onClick={onStartFresh}
            className="w-full h-12 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            {t('resume.startFresh')}
          </button>

          {/* Warning for start fresh */}
          <p className="flex items-center gap-2 text-xs text-amber-600 justify-center">
            <AlertTriangle className="w-4 h-4" />
            {t('resume.warning')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeJourneyModal;
