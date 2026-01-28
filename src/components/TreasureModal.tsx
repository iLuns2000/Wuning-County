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
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl">
        <div className="flex justify-between items-center p-4 bg-amber-50 border-b">
          <h2 className="flex gap-2 items-center text-xl font-bold text-amber-900">
            <Gem className="w-5 h-5" />
            珍宝阁
          </h2>
          <button onClick={() => {
              vibrate(VIBRATION_PATTERNS.LIGHT);
              onClose();
          }} className="p-1 rounded-full transition-colors hover:bg-amber-100">
            <X className="w-5 h-5 text-amber-900" />
          </button>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-amber-50 border-b">
            <div className="flex gap-2 items-center text-amber-800">
                <Coins className="w-4 h-4" />
                <span className="font-bold">持有资金: {playerStats.money} 文</span>
            </div>
            <div className="text-xs text-amber-600">
                * 稀世珍宝，身份的象征，并无实际用途
            </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4 bg-slate-50">
          {treasures.map((treasure) => {
            const price = treasurePrices[treasure.id];
            const owned = getOwnedCount(treasure.id);
            const canBuy = playerStats.money >= price;
            
            return (
              <div key={treasure.id} className="overflow-hidden relative p-4 bg-white rounded-lg border border-amber-100 shadow-sm">
                {owned > 0 && (
                    <div className="absolute top-0 right-0 px-2 py-1 text-xs font-bold text-amber-800 bg-amber-100 rounded-bl-lg">
                        已收藏: {owned}
                    </div>
                )}
                
                <div className="flex justify-between items-start pr-12 mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{treasure.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{treasure.description}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <div className="p-2 font-mono font-bold text-amber-800 bg-amber-50 rounded">
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
                            ? 'text-white bg-amber-600 shadow-md hover:bg-amber-700 hover:shadow-lg' 
                            : 'cursor-not-allowed bg-slate-100 text-slate-400'}
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
