import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';

interface VideoExplainerProps {
  videoId?: string;
  videoUrl?: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  variant?: 'card' | 'inline' | 'modal';
  className?: string;
}

export const VideoExplainer: React.FC<VideoExplainerProps> = ({
  videoId = 'dQw4w9WgXcQ', // Default placeholder
  videoUrl,
  title,
  description,
  thumbnailUrl,
  variant = 'card',
  className = ''
}) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);

  const displayTitle = title || t('landing.video.title');
  const displayDescription = description || t('landing.video.description');

  // Generate YouTube embed URL
  const embedUrl = videoUrl || `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  const thumbnail = thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  if (variant === 'inline') {
    return (
      <div className={`relative aspect-video rounded-2xl overflow-hidden ${className}`}>
        {isPlaying ? (
          <iframe
            src={embedUrl}
            title={displayTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <div
            className="absolute inset-0 cursor-pointer group"
            onClick={() => setIsPlaying(true)}
          >
            <img
              src={thumbnail}
              alt={displayTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }}
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all flex items-center justify-center shadow-xl">
                <Play className="w-10 h-10 text-primary ml-1" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <button className={`flex items-center gap-3 px-6 py-3 bg-white hover:bg-gray-50 rounded-xl border-2 border-primary/20 hover:border-primary transition-all shadow-lg ${className}`}>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Play className="w-6 h-6 text-primary ml-0.5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">{t('landing.video.watchNow')}</p>
              <p className="text-sm text-gray-600">{displayDescription}</p>
            </div>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              title={displayTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Default card variant
  return (
    <div className={`bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-primary/10 ${className}`}>
      <div className="relative aspect-video">
        {isPlaying ? (
          <>
            <iframe
              src={embedUrl}
              title={displayTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
            <button
              onClick={() => setIsPlaying(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div
            className="absolute inset-0 cursor-pointer group"
            onClick={() => setIsPlaying(true)}
          >
            <img
              src={thumbnail}
              alt={displayTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all flex items-center justify-center shadow-2xl">
                <Play className="w-10 h-10 text-primary ml-1" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-xl font-bold text-white mb-1">{displayTitle}</h3>
              <p className="text-white/80 text-sm">{displayDescription}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoExplainer;
