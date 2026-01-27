import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Video,
  Link as LinkIcon,
  Copy,
  Check,
  Share2,
  CalendarPlus
} from 'lucide-react';
import { generateWhatsAppShareUrl } from '../../services/whatsapp';

interface MeetingDetails {
  id: string;
  title: string;
  date: Date;
  time: string;
  mentor: string;
  mentorExpertise?: string;
  type: string;
  meetLink: string;
}

interface MeetingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: MeetingDetails | null;
}

export const MeetingConfirmationModal: React.FC<MeetingConfirmationModalProps> = ({
  isOpen,
  onClose,
  meeting
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);

  if (!meeting) return null;

  const formattedDate = meeting.date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(meeting.meetLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleAddToCalendar = () => {
    const startDate = meeting.date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(meeting.date.getTime() + 60 * 60 * 1000)
      .toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0] + 'Z';

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(meeting.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(`Meeting with ${meeting.mentor}\n\nJoin: ${meeting.meetLink}`)}&location=${encodeURIComponent(meeting.meetLink)}`;

    window.open(calendarUrl, '_blank');
  };

  const handleShareWhatsApp = () => {
    const url = generateWhatsAppShareUrl({
      title: meeting.title,
      date: formattedDate,
      time: meeting.time,
      mentor: meeting.mentor,
      meetLink: meeting.meetLink
    });
    window.open(url, '_blank');
    setWhatsappSent(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center mb-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-bounce-once">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <DialogTitle className="text-center text-2xl">
              {t('meeting.confirmation.title')}
            </DialogTitle>
            <p className="text-gray-500 text-center mt-1">
              {t('meeting.confirmation.subtitle')}
            </p>
          </div>
        </DialogHeader>

        {/* Meeting Details */}
        <div className="space-y-3 bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('meeting.confirmation.details.date')}</p>
              <p className="font-medium text-gray-900">{formattedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('meeting.confirmation.details.time')}</p>
              <p className="font-medium text-gray-900">{meeting.time}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('meeting.confirmation.details.mentor')}</p>
              <p className="font-medium text-gray-900">{meeting.mentor}</p>
              {meeting.mentorExpertise && (
                <p className="text-xs text-gray-500">{meeting.mentorExpertise}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Video className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">{t('meeting.confirmation.details.link')}</p>
              <div className="flex items-center gap-2">
                <p className="font-medium text-primary truncate text-sm">
                  {meeting.meetLink}
                </p>
                <button
                  onClick={handleCopyLink}
                  className="flex-shrink-0 p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                  title={t('meeting.confirmation.actions.copyLink')}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddToCalendar}
              className="flex items-center justify-center gap-2 h-11 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-medium transition-colors"
            >
              <CalendarPlus className="w-4 h-4" />
              <span className="text-sm">{t('meeting.confirmation.actions.addCalendar')}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-2 h-11 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-medium transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">{t('meeting.confirmation.actions.shareWhatsApp')}</span>
            </button>
          </div>

          {whatsappSent && (
            <p className="text-center text-sm text-green-600 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {t('meeting.confirmation.whatsappSent')}
            </p>
          )}

          <button
            onClick={onClose}
            className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:from-secondary hover:to-primary transition-all"
          >
            {t('meeting.confirmation.actions.done')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingConfirmationModal;
