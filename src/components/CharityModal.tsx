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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl">
        <div className="p-4 border-b flex justify-between items-center bg-rose-50">
          <h2 className="text-xl font-bold text-rose-900 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5" />
            善行义举
          </h2>
          <button onClick={() => {
              vibrate(VIBRATION_PATTERNS.LIGHT);
              onClose();
          }} className="p-1 hover:bg-rose-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-rose-900" />
          </button>
        </div>
        
        <div className="p-4 bg-rose-50 border-b flex justify-between items-center">
            <div className="flex items-center gap-2 text-rose-800">
                <Coins className="w-4 h-4" />
                <span className="font-bold">持有资金: {playerStats.money} 文</span>
            </div>
            <div className="text-xs text-rose-600">
                * 积善之家，必有余庆
            </div>
        </div>

        <div className="overflow-y-auto p-4 space-y-4 bg-slate-50 flex-1">
          {charities.map((charity) => {
            const canAfford = playerStats.money >= charity.cost;
            
            return (
              <div key={charity.id} className="bg-white p-4 rounded-lg border border-rose-100 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{charity.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{charity.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 my-2 text-xs text-rose-600 bg-rose-50 p-2 rounded w-fit">
                    <TrendingUp className="w-3 h-3" />
                    <span>声望提升: +{charity.effect.reputation}</span>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <div className="bg-slate-50 p-2 rounded text-slate-800 font-mono font-bold">
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
                            ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-md hover:shadow-lg' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
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
