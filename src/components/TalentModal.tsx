import React from 'react';
import { X, Zap, ArrowUp } from 'lucide-react';
import { talents } from '@/data/talents';
import { useGameStore } from '@/store/gameStore';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

interface TalentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TalentModal: React.FC<TalentModalProps> = ({ isOpen, onClose }) => {
  const { talents: playerTalents, playerStats, upgradeTalent } = useGameStore();
  const vibrate = useGameVibrate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-card border rounded-xl shadow-xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold">天赋树</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">当前阅历</span>
            <span className="text-xl font-bold text-primary">{playerStats.experience || 0}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {talents.map((talent) => {
            const currentLevel = playerTalents[talent.id] || 0;
            const isMaxed = currentLevel >= talent.maxLevel;
            const cost = talent.baseCost * (currentLevel + 1);
            const canAfford = (playerStats.experience || 0) >= cost;

            return (
              <div key={talent.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold">{talent.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        Lv.{currentLevel} / {talent.maxLevel}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{talent.description}</p>
                    <div className="text-xs text-muted-foreground">
                      当前加成: {Math.round(currentLevel * talent.effectValue * (talent.effectType === 'action_cost' || talent.effectType === 'max_health' ? 1 : 100))}%
                      {talent.effectType !== 'action_cost' && talent.effectType !== 'max_health' && ' 效率'}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {!isMaxed ? (
                      <button
                        onClick={() => {
                          vibrate(VIBRATION_PATTERNS.SUCCESS);
                          upgradeTalent(talent.id);
                        }}
                        disabled={!canAfford}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          canAfford
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                        }`}
                      >
                        <ArrowUp className="w-4 h-4" />
                        <span>升级 ({cost} 阅历)</span>
                      </button>
                    ) : (
                      <span className="px-4 py-2 rounded-lg bg-green-500/10 text-green-600 text-sm font-medium border border-green-200">
                        已满级
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
