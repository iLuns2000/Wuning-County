import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Sun, Moon, Clock, Pause, Play, Settings } from 'lucide-react';

interface TimeManagerProps {
  onNightWarning?: () => void;
}

export const TimeManager: React.FC<TimeManagerProps> = ({ onNightWarning }) => {
  const { 
    timeSettings, 
    nextDay, 
    updateTimeSettings, 
    resetDayTimer, 
    togglePause,
    currentEvent,
    dailyCounts,
    triggerSpecificEvent,
    day,
    flags,
    achievements,
    updateStats // Needed to update flags manually
  } = useGameStore();

  const [timeLeft, setTimeLeft] = useState(timeSettings.dayDurationSeconds);
  const [showSettings, setShowSettings] = useState(false);
  const [durationInput, setDurationInput] = useState(timeSettings.dayDurationSeconds / 60);

  // Effect to handle timer tick
  useEffect(() => {
    if (!timeSettings.isTimeFlowEnabled || timeSettings.isPaused || !!currentEvent) {
        return;
    }

    const interval = setInterval(() => {
        const elapsed = (Date.now() - timeSettings.dayStartTime) / 1000;
        const remaining = Math.max(0, timeSettings.dayDurationSeconds - elapsed);
        
        setTimeLeft(remaining);

        if (remaining <= 60 && remaining > 59) {
            onNightWarning?.();
        }

        if (remaining <= 0) {
            // Check for slacking off condition
            // Condition: All daily actions are 0 AND not already triggered today AND achievement not yet obtained
            const isIdle = dailyCounts.work === 0 && 
                           dailyCounts.rest === 0 && 
                           dailyCounts.chatTotal === 0 && 
                           dailyCounts.fortune === 0;
            
            // Check flag to ensure we only trigger it once per specific day instance 
            // (though nextDay will change the day, so check against current day)
            const alreadyTriggered = flags['slacking_event_day'] === day;
            const hasSlackingAchievement = achievements.includes('slacking_off_song');

            if (isIdle && !alreadyTriggered && !hasSlackingAchievement) {
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
  }, [timeSettings, currentEvent, nextDay, onNightWarning, dailyCounts, day, flags, triggerSpecificEvent, updateStats]);

  // Sync local state when store updates
  useEffect(() => {
     if (showSettings) return; // Don't overwrite input while editing
     setDurationInput(timeSettings.dayDurationSeconds / 60);
  }, [timeSettings.dayDurationSeconds, showSettings]);

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

  const handleDurationSave = () => {
    const seconds = Math.max(60, Math.floor(durationInput * 60)); // Min 1 minute
    updateTimeSettings({ dayDurationSeconds: seconds });
    setShowSettings(false);
    resetDayTimer(); // Reset timer when changing duration
  };

  const isNight = timeLeft <= 60;
  const progress = Math.min(100, ((timeSettings.dayDurationSeconds - timeLeft) / timeSettings.dayDurationSeconds) * 100);

  if (!timeSettings.isTimeFlowEnabled) return null;

  return (
    <div className="flex fixed top-4 right-4 z-40 gap-2 items-center">
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
        <button 
            onClick={() => setShowSettings(true)}
            className="p-1.5 hover:bg-secondary rounded-full transition-colors"
            title="时间设置"
        >
            <Settings size={14} />
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute right-0 top-12 z-50 p-4 w-64 rounded-lg border shadow-xl bg-card animate-in fade-in slide-in-from-top-2">
            <h3 className="flex gap-2 items-center mb-3 font-bold">
                <Clock size={16} /> 时间流速设置
            </h3>
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="flex justify-between text-xs text-muted-foreground">
                        <span>一天时长 (分钟)</span>
                        <span className="font-bold">{durationInput} 分钟</span>
                    </label>
                    <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        step="0.5"
                        value={durationInput}
                        onChange={(e) => setDurationInput(parseFloat(e.target.value))}
                        className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                        <span>1m</span>
                        <span>5m</span>
                        <span>10m</span>
                    </div>
                </div>
                
                <p className="p-2 text-xs rounded text-muted-foreground bg-secondary/50">
                    最后1分钟为“夜晚”，结束后自动进入下一天。
                </p>

                <div className="flex gap-2 justify-end pt-2 border-t">
                    <button 
                        onClick={() => setShowSettings(false)}
                        className="px-3 py-1.5 text-xs font-medium hover:bg-secondary rounded"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleDurationSave}
                        className="px-3 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded hover:bg-primary/90"
                    >
                        保存并重置
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
