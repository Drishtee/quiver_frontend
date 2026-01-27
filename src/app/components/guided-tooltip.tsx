import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { HelpCircle, Info, Lightbulb } from 'lucide-react';

interface GuidedTooltipProps {
  content: string;
  contentKey?: string; // i18n key for content
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  variant?: 'help' | 'info' | 'tip';
  showIcon?: boolean;
  className?: string;
}

export const GuidedTooltip: React.FC<GuidedTooltipProps> = ({
  content,
  contentKey,
  children,
  position = 'top',
  variant = 'help',
  showIcon = true,
  className = ''
}) => {
  const { t } = useTranslation();
  const displayContent = contentKey ? t(contentKey) : content;

  const Icon = variant === 'help' ? HelpCircle :
               variant === 'info' ? Info : Lightbulb;

  const variantStyles = {
    help: 'bg-gray-900 text-white',
    info: 'bg-blue-600 text-white',
    tip: 'bg-amber-500 text-white'
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 ${className}`}>
            {children}
            {showIcon && (
              <Icon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side={position}
          className={`max-w-xs ${variantStyles[variant]}`}
        >
          <p className="text-sm">{displayContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Field helper - inline guidance below form fields
interface FieldHelperProps {
  text: string;
  textKey?: string;
  variant?: 'default' | 'hint' | 'example';
  className?: string;
}

export const FieldHelper: React.FC<FieldHelperProps> = ({
  text,
  textKey,
  variant = 'default',
  className = ''
}) => {
  const { t } = useTranslation();
  const displayText = textKey ? t(textKey) : text;

  const variantStyles = {
    default: 'text-gray-500',
    hint: 'text-blue-600',
    example: 'text-gray-400 italic'
  };

  const Icon = variant === 'hint' ? Lightbulb : null;

  return (
    <p className={`text-xs mt-1 flex items-center gap-1 ${variantStyles[variant]} ${className}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {displayText}
    </p>
  );
};

// Section explainer - introduction card for form sections
interface SectionExplainerProps {
  title: string;
  titleKey?: string;
  description: string;
  descriptionKey?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'highlight' | 'minimal';
  className?: string;
}

export const SectionExplainer: React.FC<SectionExplainerProps> = ({
  title,
  titleKey,
  description,
  descriptionKey,
  icon,
  variant = 'default',
  className = ''
}) => {
  const { t } = useTranslation();
  const displayTitle = titleKey ? t(titleKey) : title;
  const displayDescription = descriptionKey ? t(descriptionKey) : description;

  const variantStyles = {
    default: 'bg-gray-50 border-gray-200',
    highlight: 'bg-primary/5 border-primary/20',
    minimal: 'bg-transparent border-transparent'
  };

  return (
    <div className={`rounded-xl p-4 border ${variantStyles[variant]} ${className}`}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{displayTitle}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{displayDescription}</p>
        </div>
      </div>
    </div>
  );
};

export default GuidedTooltip;
