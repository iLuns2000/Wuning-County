import React from 'react';
import { GameEvent, PlayerStats, Effect } from '@/types/game';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

interface EventModalProps {
  event: GameEvent;
  playerStats: PlayerStats;
  onOptionSelect: (optionIndex: number) => void;
  styleMatch?: {
    preferred: string[];
    totalScore: number;
    matchScore: number;
    tier: 'none' | 'normal' | 'good' | 'excellent';
    bonusPercent: number;
  };
}

export const EventModal: React.FC<EventModalProps> = ({ event, playerStats, onOptionSelect, styleMatch }) => {
  const vibrate = useGameVibrate();
  
  const checkRequirement = (effect?: Effect) => {
    if (!effect) return { allowed: true, reason: '' };
    
    let moneyCost = 0;
    if (effect.money && effect.money < 0) moneyCost += Math.abs(effect.money);
    if (effect.playerStats?.money && effect.playerStats.money < 0) moneyCost += Math.abs(effect.playerStats.money);
    
    if (moneyCost > 0 && playerStats.money < moneyCost) {
      return { allowed: false, reason: `金钱不足 (需 ${moneyCost} 文)` };
    }

    let healthCost = 0;
    if (effect.health && effect.health < 0) healthCost += Math.abs(effect.health);
    if (effect.playerStats?.health && effect.playerStats.health < 0) healthCost += Math.abs(effect.playerStats.health);
    
    if (healthCost > 0 && playerStats.health < healthCost) {
      return { allowed: false, reason: `体力不足 (需 ${healthCost} 点)` };
    }
    
    return { allowed: true, reason: '' };
  };
  
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
          {event.options.map((option, index) => {
            const { allowed, reason } = checkRequirement(option.effect);
            
            return (
              <button
                key={index}
                disabled={!allowed}
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.MEDIUM);
                  onOptionSelect(index);
                }}
                className={`w-full p-3 text-left rounded-md transition-colors border ${
                  allowed 
                    ? 'bg-secondary hover:bg-secondary/80 border-transparent hover:border-primary/20' 
                    : 'bg-secondary/50 border-transparent cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{option.label}</span>
                  {!allowed && (
                    <span className="text-xs text-destructive">{reason}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
