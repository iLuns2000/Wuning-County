import React from 'react';
import { X, Building2, Coins } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { facilities } from '@/data/facilities';

interface EstateModalProps {
  onClose: () => void;
}

export const EstateModal: React.FC<EstateModalProps> = ({ onClose }) => {
  const { ownedFacilities, playerStats, buyFacility } = useGameStore();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl">
        <div className="p-4 border-b flex justify-between items-center bg-indigo-50">
          <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            产业置办
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-indigo-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-indigo-900" />
          </button>
        </div>
        
        <div className="p-4 bg-indigo-50 border-b flex justify-between items-center">
            <div className="flex items-center gap-2 text-indigo-800">
                <Coins className="w-4 h-4" />
                <span className="font-bold">持有资金: {playerStats.money} 文</span>
            </div>
            <div className="text-xs text-indigo-600">
                * 产业每日自动产出收益，受县城经济状况影响
            </div>
        </div>

        <div className="overflow-y-auto p-4 space-y-4 bg-slate-50 flex-1">
          {facilities.map((facility) => {
            const owned = ownedFacilities[facility.id] || 0;
            const canBuy = playerStats.money >= facility.cost;
            
            return (
              <div key={facility.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden">
                {owned > 0 && (
                    <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-bl-lg font-bold">
                        已拥有: {owned}
                    </div>
                )}
                
                <div className="flex justify-between items-start mb-2 pr-12">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{facility.name}</h3>
                    <p className="text-sm text-slate-500">{facility.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 my-3 text-sm">
                    <div className="bg-slate-50 p-2 rounded">
                        <span className="text-slate-500 block text-xs">置办费用</span>
                        <span className="text-slate-800 font-mono font-bold">{facility.cost} 文</span>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                        <span className="text-green-600 block text-xs">预计日收</span>
                        <span className="text-green-800 font-mono font-bold">+{facility.dailyIncome} 文</span>
                        <span className="text-xs text-green-600 ml-1">({facility.incomeDescription})</span>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                      onClick={() => buyFacility(facility.id)}
                      disabled={!canBuy}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                        ${canBuy 
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
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
