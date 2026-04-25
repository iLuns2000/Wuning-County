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
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] leading-normal text-amber-700 dark:text-amber-400">
            <p className="font-bold mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 重要提示：数据存储
            </p>
            <p>
              本游戏除排行榜数据外其他数据全部存于您的浏览器缓存，如果是用微信直接打开建议切换到其他浏览器打开，且不要长期清理缓存。
              <br />
              如果有长期清理缓存习惯可以下载 APK（目前仅限安卓），只要不清理应用缓存即可。下载地址：<a href="https://pan.quark.cn/s/bb182ad58c74" target="_blank" rel="noopener noreferrer" className="underline font-bold">https://pan.quark.cn/s/bb182ad58c74</a>
            </p>
          </div>

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