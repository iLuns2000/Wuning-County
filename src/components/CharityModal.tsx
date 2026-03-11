import React from 'react';
import { X, HeartHandshake, Coins, TrendingUp } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { charities } from '@/data/charities';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

interface CharityModalProps {
  onClose: () => void;
}

export const CharityModal: React.FC<CharityModalProps> = ({ onClose }) => {
  const { playerStats, performCharity } = useGameStore();
  const vibrate = useGameVibrate();

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/50">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl border border-border">
        <div className="flex justify-between items-center p-4 bg-rose-50 border-b border-border dark:bg-rose-950/30">
          <h2 className="flex gap-2 items-center text-xl font-bold text-rose-900 dark:text-rose-100">
            <HeartHandshake className="w-5 h-5" />
            善行义举
          </h2>
          <button onClick={() => {
              vibrate(VIBRATION_PATTERNS.LIGHT);
              onClose();
          }} className="p-1 rounded-full transition-colors hover:bg-rose-100 dark:hover:bg-rose-900/50">
            <X className="w-5 h-5 text-rose-900 dark:text-rose-100" />
          </button>
        </div>
        
        <div className="flex justify-between items-center p-4 border-b bg-rose-50/50 dark:bg-rose-950/20 border-border">
            <div className="flex gap-2 items-center text-rose-800 dark:text-rose-200">
                <Coins className="w-4 h-4" />
                <span className="font-bold">持有资金: {playerStats.money} 文</span>
            </div>
            <div className="text-xs text-rose-600 dark:text-rose-400">
                * 积善之家，必有余庆
            </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4 bg-muted/30">
          {charities.map((charity) => {
            const canAfford = playerStats.money >= charity.cost;
            
            return (
              <div key={charity.id} className="overflow-hidden relative p-4 rounded-lg border border-rose-100 shadow-sm bg-card dark:border-rose-900/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{charity.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{charity.description}</p>
                  </div>
                </div>

                <div className="flex gap-2 items-center p-2 my-2 text-xs text-rose-600 bg-rose-50 rounded dark:text-rose-400 dark:bg-rose-950/30 w-fit">
                    <TrendingUp className="w-3 h-3" />
                    <span>声望提升: +{charity.effect.reputation}</span>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <div className="p-2 font-mono font-bold rounded bg-muted text-foreground">
                        {charity.cost.toLocaleString()} 文
                    </div>
                    
                    <button
                      onClick={() => {
                          vibrate(VIBRATION_PATTERNS.SUCCESS);
                          performCharity(charity.id);
                      }}
                      disabled={!canAfford}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                        ${canAfford 
                            ? 'text-white bg-rose-600 shadow-md hover:bg-rose-700 hover:shadow-lg' 
                            : 'cursor-not-allowed bg-muted text-muted-foreground'}
                      `}
                    >
                      <HeartHandshake className="w-4 h-4" />
                      {canAfford ? '行善积德' : '力不从心'}
                    </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
