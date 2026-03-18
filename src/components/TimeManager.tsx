import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Sun, Moon, Pause, Play } from 'lucide-react';

interface TimeManagerProps {
  onNightWarning?: () => void;
  onNightChange?: (isNight: boolean) => void;
}

export const TimeManager: React.FC<TimeManagerProps> = ({ onNightWarning, onNightChange }) => {
  const { 
    timeSettings, 
    nextDay, 
    togglePause,
    currentEvent,
    dailyCounts,
    triggerSpecificEvent,
    day,
    flags,
    updateStats, // Needed to update flags manually
    hasInteractedToday,
    markInteraction
  } = useGameStore();

  const [timeLeft, setTimeLeft] = useState(timeSettings.dayDurationSeconds);

  // Track user interaction
  useEffect(() => {
    if (!timeSettings.isTimeFlowEnabled || !!currentEvent) return;

    const handleInteraction = () => {
        if (!hasInteractedToday) {
            markInteraction();
        }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('keydown', handleInteraction);
    };
  }, [timeSettings.isTimeFlowEnabled, currentEvent, hasInteractedToday, markInteraction]);

  // Effect to handle timer tick
  useEffect(() => {
    if (!timeSettings.isTimeFlowEnabled || timeSettings.isPaused || !!currentEvent) {
        return;
    }

    const interval = setInterval(() => {
        // Check global state directly to ensure we don't run if an event is active
        // This prevents race conditions where the interval might run once more before cleanup
        const currentState = useGameStore.getState();
        if (!currentState.timeSettings.isTimeFlowEnabled || currentState.timeSettings.isPaused || !!currentState.currentEvent) {
            return;
        }

        const elapsed = (Date.now() - currentState.timeSettings.dayStartTime) / 1000;
        const remaining = Math.max(0, currentState.timeSettings.dayDurationSeconds - elapsed);
        
        // Check office upgrade status periodically
        currentState.checkUpgradeStatus();

        setTimeLeft(remaining);

        if (remaining <= 60 && remaining > 59) {
            onNightWarning?.();
        }

        if (remaining <= 0) {
            // Check for slacking off condition
            // Condition: All daily actions are 0 AND no interaction (clicks/keys) detected
            const isIdle = !hasInteractedToday &&
                           dailyCounts.work === 0 && 
                           dailyCounts.rest === 0 && 
                           dailyCounts.chatTotal === 0 && 
                           dailyCounts.fortune === 0;
            
            // Check flag to ensure we only trigger it once per specific day instance 
            // (though nextDay will change the day, so check against current day)
            const alreadyTriggered = flags['slacking_event_day'] === day;
            const achievementUnlocked = flags['achievement_slacking_unlocked'];

            if (isIdle && !alreadyTriggered && !achievementUnlocked) {
                // Trigger event
                triggerSpecificEvent('slacking_off');
                
                // Mark as triggered for this day to avoid loop
                updateStats({ flags: { ...flags, slacking_event_day: day } });
            } else {
                nextDay();
            }
        }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeSettings, currentEvent, nextDay, onNightWarning, dailyCounts, day, flags, triggerSpecificEvent, updateStats, hasInteractedToday]);

  // Update timeLeft immediately on re-render to avoid visual jump if paused
  useEffect(() => {
     const elapsed = (Date.now() - timeSettings.dayStartTime) / 1000;
     setTimeLeft(Math.max(0, timeSettings.dayDurationSeconds - elapsed));
  }, [timeSettings.dayStartTime, timeSettings.dayDurationSeconds]);


  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isNight = timeLeft <= 60;
  const progress = Math.min(100, ((timeSettings.dayDurationSeconds - timeLeft) / timeSettings.dayDurationSeconds) * 100);

  // 通知父组件夜间状态变化
  useEffect(() => {
    onNightChange?.(isNight);
  }, [isNight, onNightChange]);

  if (!timeSettings.isTimeFlowEnabled) return null;

  return (
    <div className="flex fixed top-1 right-4 z-40 gap-2 items-center">
      {/* Time Display Badge */}
      <div 
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all ${
          isNight 
            ? 'bg-indigo-950 text-indigo-100 border-indigo-800 animate-pulse' 
            : 'bg-background text-foreground border-border'
        }`}
      >
        {isNight ? <Moon size={16} className="text-yellow-200" /> : <Sun size={16} className="text-orange-500" />}
        <span className="w-12 font-mono text-sm font-bold text-center">
            {currentEvent ? '暂停' : formatTime(timeLeft)}
        </span>
        
        {/* Progress Ring Background */}
        <div className="overflow-hidden absolute bottom-0 left-0 w-full h-1 rounded-b-full bg-primary/20">
            <div 
                className={`h-full transition-all duration-1000 ${isNight ? 'bg-indigo-500' : 'bg-orange-500'}`} 
                style={{ width: `${progress}%` }}
            />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-1 p-1 rounded-full border shadow-sm bg-background">
        <button 
            onClick={() => togglePause(!timeSettings.isPaused)}
            disabled={!!currentEvent}
            className="p-1.5 hover:bg-secondary rounded-full transition-colors disabled:opacity-50"
            title={timeSettings.isPaused ? "继续时间" : "暂停时间"}
        >
            {timeSettings.isPaused ? <Play size={14} /> : <Pause size={14} />}
        </button>
      </div>
    </div>
  );
};
