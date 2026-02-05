interface ProgressIndicatorProps {
  current: number;
  total: number;
  showPercentage?: boolean;
  showSteps?: boolean;
  sticky?: boolean;
}

export function ProgressIndicator({
  current,
  total,
  showPercentage = true,
  showSteps = true,
  sticky = false
}: ProgressIndicatorProps) {
  const percentage = (current / total) * 100;

  const content = (
    <div className="space-y-2">
      {(showSteps || showPercentage) && (
        <div className="flex justify-between items-center">
          {showSteps && (
            <span className="text-sm text-gray-500">
              Step {current} of {total}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );

  if (sticky) {
    return (
      <div className="sticky top-[52px] md:top-[60px] z-[9] bg-white py-3 px-4 md:px-6 -mx-4 md:-mx-6 border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
