import React from 'react';
import { GameEvent } from '@/types/game';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

interface EventModalProps {
  event: GameEvent;
  onOptionSelect: (optionIndex: number) => void;
  styleMatch?: {
    preferred: string[];
    totalScore: number;
    matchScore: number;
    tier: 'none' | 'normal' | 'good' | 'excellent';
    bonusPercent: number;
  };
}

export const EventModal: React.FC<EventModalProps> = ({ event, onOptionSelect, styleMatch }) => {
  const vibrate = useGameVibrate();
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground rounded-lg shadow-lg max-w-md w-full p-6 border border-border animate-in fade-in zoom-in duration-200">
        <div className="mb-4">
          <span className="text-xs font-bold px-2 py-1 rounded bg-primary/10 text-primary uppercase">
            {event.type === 'daily' ? '日常' : event.type === 'opportunity' ? '机遇' : event.type === 'challenge' ? '挑战' : 'NPC'}
          </span>
        </div>
        <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {event.description}
        </p>

        {styleMatch && styleMatch.preferred.length > 0 && (
          <div className="mb-6 p-3 rounded-md border bg-secondary/40 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>场景偏好：{styleMatch.preferred.join('、')}</span>
              <span>风格评分：{styleMatch.matchScore}/{styleMatch.totalScore}</span>
            </div>
            <div className="mt-2 font-medium">
              {styleMatch.tier === 'excellent' && `穿搭契合：极佳（加成 ${styleMatch.bonusPercent}%）`}
              {styleMatch.tier === 'good' && `穿搭契合：良好（加成 ${styleMatch.bonusPercent}%）`}
              {styleMatch.tier === 'normal' && `穿搭契合：一般（加成 ${styleMatch.bonusPercent}%）`}
              {styleMatch.tier === 'none' && '穿搭契合：不足（无加成）'}
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {event.options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.MEDIUM);
                onOptionSelect(index);
              }}
              className="w-full p-3 text-left bg-secondary hover:bg-secondary/80 rounded-md transition-colors border border-transparent hover:border-primary/20"
            >
              <div className="font-medium">{option.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
