interface ProgressIndicatorProps {
  current: number;
  total: number;
  showPercentage?: boolean;
  showSteps?: boolean;
}

export function ProgressIndicator({
  current,
  total,
  showPercentage = true,
  showSteps = true
}: ProgressIndicatorProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="space-y-2">
      {(showSteps || showPercentage) && (
        <div className="flex justify-between items-center">
          {showSteps && (
            <span className="text-sm text-muted-foreground">
              Step {current} of {total}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm text-muted-foreground">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
