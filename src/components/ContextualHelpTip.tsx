import React, { useState, useEffect } from 'react';
import { HelpCircle, X, ChevronRight } from 'lucide-react';
import { HelpTrigger, showModuleHelp } from '@/hooks/useContextualHelp';

interface ContextualHelpTipProps {
  moduleId: string;
  visible: boolean;
  onClose: () => void;
  onAction?: (hint: HelpTrigger) => void;
}

export const ContextualHelpTip: React.FC<ContextualHelpTipProps> = ({
  moduleId,
  visible,
  onClose,
  onAction,
}) => {
  const [hint, setHint] = useState<HelpTrigger | null>(null);

  useEffect(() => {
    if (visible) {
      const help = showModuleHelp(moduleId);
      setHint(help);
    }
  }, [visible, moduleId]);

  if (!visible || !hint) return null;

  const handleAction = () => {
    onAction?.(hint);
    onClose();
  };

  return (
    <div className="absolute top-2 right-2 z-50 w-72 bg-card border rounded-xl shadow-lg overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
      <div className="p-3">
        <div className="flex items-start gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <HelpCircle className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-sm">{hint.hintContent.title}</h3>
              <button
                onClick={onClose}
                className="p-0.5 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {hint.hintContent.message}
            </p>
          </div>
        </div>
      </div>
      {hint.hintContent.cta && (
        <div className="px-3 py-2 bg-muted/50 border-t">
          <button
            onClick={handleAction}
            className="flex items-center justify-center gap-1 w-full py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="text-xs font-medium">{hint.hintContent.cta}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

interface HelpButtonProps {
  moduleId: string;
  className?: string;
}

export const HelpButton: React.FC<HelpButtonProps> = ({ moduleId, className = '' }) => {
  const [showTip, setShowTip] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowTip(true)}
        className={`p-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors ${className}`}
        title="查看引导"
      >
        <HelpCircle className="w-4 h-4 text-muted-foreground" />
      </button>
      <ContextualHelpTip
        moduleId={moduleId}
        visible={showTip}
        onClose={() => setShowTip(false)}
      />
    </>
  );
};