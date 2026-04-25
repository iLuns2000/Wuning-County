import React from 'react';
import { X, ChevronRight, Sparkles } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';
import { getGuideStepsForRole } from '@/data/onboarding';

export const OnboardingGuide: React.FC = () => {
  const { onboardingStep, onboardingDismissed, onboardingCompleted, role, skipOnboarding, nextOnboardingStep } = useGameStore();
  const vibrate = useGameVibrate();

  if (onboardingDismissed || onboardingCompleted || onboardingStep === 0) {
    return null;
  }

  const steps = getGuideStepsForRole(role);
  const currentStepIndex = onboardingStep - 1;
  const currentStep = steps[currentStepIndex];

  if (!currentStep) {
    return null;
  }

  const handleSkip = () => {
    vibrate(VIBRATION_PATTERNS.LIGHT);
    skipOnboarding();
  };

  const handleNext = () => {
    vibrate(VIBRATION_PATTERNS.LIGHT);
    nextOnboardingStep();
  };

  return (
    <div className="flex fixed inset-0 z-[100] justify-center items-center p-4 backdrop-blur-sm bg-black/40">
      <div className="w-full max-w-md bg-card border rounded-xl shadow-2xl overflow-hidden">
        <div className="relative p-6 pb-4">
          <div className="absolute top-4 right-4">
            <button
              onClick={handleSkip}
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
              aria-label="关闭引导"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">新手引导</span>
          </div>

          <h2 className="text-xl font-bold mb-2">{currentStep.title}</h2>
          <p className="text-muted-foreground leading-relaxed">{currentStep.content}</p>
        </div>

        <div className="px-6 py-3 border-t bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentStepIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSkip}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                跳过
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <span className="text-sm font-medium">
                  {onboardingStep === steps.length ? '完成' : '下一步'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};