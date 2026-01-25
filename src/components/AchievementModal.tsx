import React from 'react';
import { X, Trophy, Lock, CheckCircle2 } from 'lucide-react';
import { achievements } from '@/data/achievements';
import { useGameStore } from '@/store/gameStore';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementModal: React.FC<AchievementModalProps> = ({ isOpen, onClose }) => {
  const { achievements: unlockedIds } = useGameStore();

  if (!isOpen) return null;

  const unlockedCount = unlockedIds.length;
  const totalCount = achievements.length;
  const progress = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/50">
      <div className="w-full max-w-2xl bg-card border rounded-xl shadow-xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex gap-2 items-center">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold">成就</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b bg-muted/20">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">完成度</span>
              <span className="font-medium">{unlockedCount} / {totalCount}</span>
            </div>
            <div className="overflow-hidden w-full h-2 rounded-full bg-muted">
              <div 
                className="h-full bg-yellow-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {achievements.map((ach) => {
            const isUnlocked = unlockedIds.includes(ach.id);

            return (
              <div 
                key={ach.id} 
                className={`p-4 border rounded-lg transition-colors ${
                  isUnlocked ? 'bg-yellow-500/5 border-yellow-500/20' : 'border-dashed bg-muted/30'
                }`}
              >
                <div className="flex gap-4 items-center">
                  <div className={`p-3 rounded-full ${
                    isUnlocked ? 'text-yellow-600 bg-yellow-500/10' : 'bg-muted text-muted-foreground'
                  }`}>
                    {isUnlocked ? <Trophy className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`font-bold ${!isUnlocked && 'text-muted-foreground'}`}>
                      {ach.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isUnlocked ? ach.description : '???'}
                    </p>
                    {isUnlocked && (
                      <div className="mt-1 text-xs text-muted-foreground flex gap-4">
                        <span>奖励: {ach.rewardExp} 阅历</span>
                        {ach.provider && <span>提供人: {ach.provider}</span>}
                      </div>
                    )}
                  </div>

                  {isUnlocked && (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
