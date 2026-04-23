import React, { useState, useEffect } from 'react';
import { Lightbulb, X, ChevronRight } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { generateGuidance, Guidance } from '@/services/guidanceEngine';
import { useNavigate } from 'react-router-dom';

interface GuidanceCardProps {
  onNavigate?: (targetId: string) => void;
}

export const GuidanceCard: React.FC<GuidanceCardProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { onboardingCompleted } = useGameStore();
  const [guidance, setGuidance] = useState<Guidance | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [lastPriority, setLastPriority] = useState(0);

  useEffect(() => {
    if (!onboardingCompleted) {
      setDismissed(true);
      return;
    }

    const state = useGameStore.getState();
    const newGuidance = generateGuidance(state);

    if (newGuidance && newGuidance.priority > lastPriority + 20) {
      setGuidance(newGuidance);
      setDismissed(false);
      setLastPriority(newGuidance.priority);
    }
  }, [onboardingCompleted, lastPriority]);

  if (!onboardingCompleted || dismissed || !guidance) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
  };

  const handleAction = () => {
    if (onNavigate && guidance?.targetId) {
      onNavigate(guidance.targetId);
    } else if (guidance?.action) {
      guidance.action();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-card border rounded-xl shadow-lg overflow-hidden z-50">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-sm">{guidance.title}</h3>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {guidance.reason}
            </p>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 bg-muted/50 border-t">
        <button
          onClick={handleAction}
          className="flex items-center justify-center gap-1 w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span className="text-sm font-medium">{guidance.cta}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};