import React from 'react';
import { X, Building2, Coins } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { facilities } from '@/data/facilities';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

interface EstateModalProps {
  onClose: () => void;
}

export const EstateModal: React.FC<EstateModalProps> = ({ onClose }) => {
  const { ownedFacilities, playerStats, buyFacility } = useGameStore();
  const vibrate = useGameVibrate();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl border border-border">
        <div className="p-4 border-b border-border flex justify-between items-center bg-indigo-50 dark:bg-indigo-950/30">
          <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            产业置办
          </h2>
          <button onClick={() => {
              vibrate(VIBRATION_PATTERNS.LIGHT);
              onClose();
          }} className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-full transition-colors">
            <X className="w-5 h-5 text-indigo-900 dark:text-indigo-100" />
          </button>
        </div>
        
        <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-border flex justify-between items-center">
            <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200">
                <Coins className="w-4 h-4" />
                <span className="font-bold">持有资金: {playerStats.money} 文</span>
            </div>
            <div className="text-xs text-indigo-600 dark:text-indigo-400">
                * 产业每日自动产出收益，受县城经济状况影响
            </div>
        </div>

        <div className="overflow-y-auto p-4 space-y-4 bg-muted/30 flex-1">
          {facilities.map((facility) => {
            const owned = ownedFacilities[facility.id] || 0;
            const canBuy = playerStats.money >= facility.cost;
            
            return (
              <div key={facility.id} className="bg-card p-4 rounded-lg border border-border shadow-sm relative overflow-hidden">
                {owned > 0 && (
                    <div className="absolute top-0 right-0 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 text-xs px-2 py-1 rounded-bl-lg font-bold">
                        已拥有: {owned}
                    </div>
                )}
                
                <div className="flex justify-between items-start mb-2 pr-12">
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{facility.name}</h3>
                    <p className="text-sm text-muted-foreground">{facility.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 my-3 text-sm">
                    <div className="bg-muted p-2 rounded">
                        <span className="text-muted-foreground block text-xs">置办费用</span>
                        <span className="text-foreground font-mono font-bold">{facility.cost} 文</span>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/30 p-2 rounded">
                        <span className="text-green-600 dark:text-green-400 block text-xs">预计日收</span>
                        <span className="text-green-800 dark:text-green-200 font-mono font-bold">+{facility.dailyIncome} 文</span>
                        <span className="text-xs text-green-600 dark:text-green-400 ml-1">({facility.incomeDescription})</span>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                          vibrate(VIBRATION_PATTERNS.SUCCESS);
                          buyFacility(facility.id);
                      }}
                      disabled={!canBuy}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                        ${canBuy 
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg' 
                            : 'bg-muted text-muted-foreground cursor-not-allowed'}
                      `}
                    >
                      <Coins className="w-4 h-4" />
                      {canBuy ? '立即置办' : '资金不足'}
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
