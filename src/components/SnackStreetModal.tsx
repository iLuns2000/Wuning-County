import React from 'react';
import { X, Utensils, ShoppingBag, Coins } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { snacks } from '@/data/snacks';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

interface SnackStreetModalProps {
  onClose: () => void;
}

export const SnackStreetModal: React.FC<SnackStreetModalProps> = ({ onClose }) => {
  const { playerStats, buyItem, useItem, addLog } = useGameStore();
  const vibrate = useGameVibrate();

  // Simple pricing strategy based on health effect
  const getPrice = (snackId: string) => {
    const snack = snacks.find(s => s.id === snackId);
    if (!snack?.effect) return 10;
    
    let price = 10;
    if (snack.effect.health) price += Math.abs(snack.effect.health) * 2;
    if (snack.effect.culture) price += snack.effect.culture * 5;
    if (snack.effect.ability) price += snack.effect.ability * 10;
    if (snack.effect.reputation) price += Math.abs(snack.effect.reputation) * 5;
    
    return price;
  };

  const handleTaste = (snackId: string, price: number) => {
    if (playerStats.money < price) {
      addLog('囊中羞涩，买不起这美食。');
      return;
    }
    vibrate(VIBRATION_PATTERNS.MEDIUM);
    buyItem(snackId, price);
    useItem(snackId); // Immediately consume
    addLog('当街品尝了美食，真是惬意！');
  };

  const handleTakeout = (snackId: string, price: number) => {
    if (playerStats.money < price) {
      addLog('囊中羞涩，买不起这美食。');
      return;
    }
    vibrate(VIBRATION_PATTERNS.LIGHT);
    buyItem(snackId, price);
    addLog('打包了美食，准备路上吃。');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-[#fff9e6] rounded-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border-4 border-amber-800">
        
        {/* Header */}
        <div className="p-4 bg-amber-800 text-amber-50 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
            <Utensils className="w-6 h-6" />
            <h2 className="text-2xl font-bold tracking-wider">武宁小吃街</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-amber-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="bg-amber-100 p-3 px-6 flex justify-between items-center border-b border-amber-200">
           <div className="flex items-center gap-2 text-amber-900 font-bold">
              <Coins className="w-5 h-5" />
              <span>{playerStats.money} 文</span>
           </div>
           <div className="text-sm text-amber-700">
              * 民以食为天，不吃饱怎么闯荡江湖？
           </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-[url('https://www.transparenttextures.com/patterns/paper.png')]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {snacks.map((snack) => {
              const price = getPrice(snack.id);
              
              return (
                <div key={snack.id} className="bg-white p-4 rounded-lg shadow-md border border-amber-200 hover:shadow-lg transition-all transform hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-amber-900">{snack.name}</h3>
                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-bold">
                      {price} 文
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 h-10 line-clamp-2">
                    {snack.description}
                  </p>

                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => handleTaste(snack.id, price)}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Utensils className="w-3 h-3" />
                      品尝
                    </button>
                    <button
                      onClick={() => handleTakeout(snack.id, price)}
                      className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-800 py-2 rounded text-sm font-medium transition-colors border border-orange-200 flex items-center justify-center gap-1"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      打包
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
