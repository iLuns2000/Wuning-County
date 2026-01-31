import React from 'react';
import { X, Gem, Coins } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { treasures, treasurePrices } from '@/data/treasures';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

interface TreasureModalProps {
  onClose: () => void;
}

export const TreasureModal: React.FC<TreasureModalProps> = ({ onClose }) => {
  const { inventory, playerStats, buyTreasure } = useGameStore();
  const vibrate = useGameVibrate();

  const getOwnedCount = (id: string) => {
    return inventory.filter(itemId => itemId === id).length;
  };

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl border border-border">
        <div className="flex justify-between items-center p-4 bg-amber-50/50 dark:bg-amber-950/30 border-b border-border">
          <h2 className="flex gap-2 items-center text-xl font-bold text-amber-900 dark:text-amber-100">
            <Gem className="w-5 h-5" />
            珍宝阁
          </h2>
          <button onClick={() => {
              vibrate(VIBRATION_PATTERNS.LIGHT);
              onClose();
          }} className="p-1 rounded-full transition-colors hover:bg-amber-100 dark:hover:bg-amber-900/50">
            <X className="w-5 h-5 text-amber-900 dark:text-amber-100" />
          </button>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-amber-50/30 dark:bg-amber-950/20 border-b border-border">
            <div className="flex gap-2 items-center text-amber-800 dark:text-amber-200">
                <Coins className="w-4 h-4" />
                <span className="font-bold">持有资金: {playerStats.money} 文</span>
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400">
                * 稀世珍宝，身份的象征，并无实际用途
            </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4 bg-muted/30">
          {treasures.map((treasure) => {
            const price = treasurePrices[treasure.id];
            const owned = getOwnedCount(treasure.id);
            const canBuy = playerStats.money >= price;
            
            return (
              <div key={treasure.id} className="overflow-hidden relative p-4 bg-card rounded-lg border border-amber-100 dark:border-amber-900/50 shadow-sm">
                {owned > 0 && (
                    <div className="absolute top-0 right-0 px-2 py-1 text-xs font-bold text-amber-800 dark:text-amber-100 bg-amber-100 dark:bg-amber-900/60 rounded-bl-lg">
                        已收藏: {owned}
                    </div>
                )}
                
                <div className="flex justify-between items-start pr-12 mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{treasure.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{treasure.description}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <div className="p-2 font-mono font-bold text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 rounded">
                        {price.toLocaleString()} 文
                    </div>
                    
                    <button
                      onClick={() => {
                          vibrate(VIBRATION_PATTERNS.SUCCESS);
                          buyTreasure(treasure.id);
                      }}
                      disabled={!canBuy}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                        ${canBuy 
                            ? 'text-white bg-amber-600 shadow-md hover:bg-amber-700 hover:shadow-lg dark:bg-amber-700 dark:hover:bg-amber-600' 
                            : 'cursor-not-allowed bg-muted text-muted-foreground'}
                      `}
                    >
                      <Coins className="w-4 h-4" />
                      {canBuy ? '购买收藏' : '囊中羞涩'}
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
