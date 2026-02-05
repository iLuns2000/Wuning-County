import React from 'react';
import { GameEvent, PlayerStats, Effect } from '@/types/game';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';
import { X } from 'lucide-react';

interface EventModalProps {
  event: GameEvent;
  playerStats: PlayerStats;
  onOptionSelect: (optionIndex: number) => void;
  onClose?: () => void;
  styleMatch?: {
    preferred: string[];
    totalScore: number;
    matchScore: number;
    tier: 'none' | 'normal' | 'good' | 'excellent';
    bonusPercent: number;
  };
}

export const EventModal: React.FC<EventModalProps> = ({ event, playerStats, onOptionSelect, onClose, styleMatch }) => {
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
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/50">
      <div className="relative p-6 w-full max-w-md rounded-lg border shadow-lg duration-200 bg-card text-card-foreground border-border animate-in fade-in zoom-in">
        {onClose && (
          <button
            onClick={() => {
              vibrate(VIBRATION_PATTERNS.LIGHT);
              onClose();
            }}
            className="absolute top-3 right-3 p-2 rounded-full transition-colors hover:bg-muted"
            title="关闭"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
        <div className="mb-4">
          <span className="px-2 py-1 text-xs font-bold uppercase rounded bg-primary/10 text-primary">
            {event.type === 'daily' ? '日常' : event.type === 'opportunity' ? '机遇' : event.type === 'challenge' ? '挑战' : 'NPC'}
          </span>
        </div>
        <h2 className="mb-2 text-2xl font-bold">{event.title}</h2>
        <p className="mb-6 leading-relaxed text-muted-foreground">
          {event.description}
        </p>

        {styleMatch && styleMatch.preferred.length > 0 && (
          <div className="p-3 mb-6 text-sm rounded-md border bg-secondary/40">
            <div className="flex justify-between items-center text-muted-foreground">
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
                    ? 'border-transparent bg-secondary hover:bg-secondary/80 hover:border-primary/20' 
                    : 'border-transparent opacity-60 cursor-not-allowed bg-secondary/50'
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
          
          {event.type === 'npc' && onClose && (
            <button
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                onClose();
              }}
              className="p-3 w-full text-center rounded-md border border-transparent transition-colors bg-secondary hover:bg-secondary/80"
            >
              拜拜了您嘞下次再见
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
