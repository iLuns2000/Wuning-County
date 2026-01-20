import React from 'react';
import { X, TrendingUp, TrendingDown, ShoppingBag, Coins } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { goods } from '@/data/goods';

interface MarketModalProps {
  onClose: () => void;
}

export const MarketModal: React.FC<MarketModalProps> = ({ onClose }) => {
  const { marketPrices, ownedGoods, playerStats, buyGood, sellGood } = useGameStore();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl">
        <div className="p-4 border-b flex justify-between items-center bg-amber-50">
          <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            西市集
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-amber-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-amber-900" />
          </button>
        </div>
        
        <div className="p-4 bg-amber-50 border-b flex justify-between items-center">
            <div className="flex items-center gap-2 text-amber-800">
                <Coins className="w-4 h-4" />
                <span className="font-bold">持有资金: {playerStats.money} 文</span>
            </div>
            <div className="text-xs text-amber-600">
                * 价格每日浮动，低买高卖方为商贾之道
            </div>
        </div>

        <div className="overflow-y-auto p-4 space-y-4 bg-stone-50 flex-1">
          {goods.map((good) => {
            const currentPrice = marketPrices[good.id] || good.basePrice;
            const owned = ownedGoods[good.id] || 0;
            const priceRatio = currentPrice / good.basePrice;
            
            let trendColor = 'text-gray-600';
            let trendIcon = null;
            
            if (priceRatio > 1.1) {
                trendColor = 'text-red-600';
                trendIcon = <TrendingUp className="w-4 h-4" />;
            } else if (priceRatio < 0.9) {
                trendColor = 'text-green-600';
                trendIcon = <TrendingDown className="w-4 h-4" />;
            }

            return (
              <div key={good.id} className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-stone-800">{good.name}</h3>
                    <p className="text-sm text-stone-500">{good.description}</p>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-1 font-mono text-lg font-bold ${trendColor}`}>
                      {currentPrice} 文
                      {trendIcon}
                    </div>
                    <div className="text-xs text-stone-400">基准: {good.basePrice} 文</div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-3 border-t border-stone-100">
                  <div className="text-sm font-medium text-stone-700">
                    库存: <span className="text-amber-700 font-bold">{owned}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => sellGood(good.id, 1)}
                      disabled={owned < 1}
                      className="px-3 py-1 bg-amber-100 text-amber-800 rounded hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      卖出
                    </button>
                    <button
                      onClick={() => buyGood(good.id, 1)}
                      disabled={playerStats.money < currentPrice}
                      className="px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      买入
                    </button>
                    <div className="w-2"></div>
                    <button
                      onClick={() => sellGood(good.id, 10)}
                      disabled={owned < 10}
                      className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs transition-colors"
                    >
                      卖10
                    </button>
                    <button
                      onClick={() => buyGood(good.id, 10)}
                      disabled={playerStats.money < currentPrice * 10}
                      className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs transition-colors"
                    >
                      买10
                    </button>
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
