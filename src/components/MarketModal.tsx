import React from 'react';
import { X, TrendingUp, TrendingDown, Coins, Store } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { goods } from '@/data/goods';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

interface MarketModalProps {
  onClose: () => void;
}

export const MarketModal: React.FC<MarketModalProps> = ({ onClose }) => {
  const { marketPrices, marketInventory, ownedGoods, playerStats, buyGood, sellGood, marketState, flags, npcRelations } = useGameStore();
  const vibrate = useGameVibrate();

  const getEffectivePrices = (goodId: string, basePrice: number) => {
    const marketPrice = marketPrices[goodId] || basePrice;
    
    // Calculate Buy Price
    let buyPrice = marketPrice;
    if (marketState === 'cooperative') {
        buyPrice = Math.ceil(buyPrice * 1.1);
    }
    if (flags.group_buy_active_daily) {
        buyPrice = Math.floor(buyPrice * 0.8);
    }
    const highRelationsCount = Object.values(npcRelations || {}).filter(r => r > 50).length;
    const discount = Math.min(0.2, highRelationsCount * 0.02);
    buyPrice = Math.floor(buyPrice * (1 - discount));

    // Calculate Sell Price
    let sellPrice = marketPrice;
    if (marketState === 'undercut') {
        sellPrice = Math.floor(sellPrice * 0.7);
    } else if (marketState === 'cooperative') {
        sellPrice = Math.floor(sellPrice * 1.1);
    }

    return { buyPrice, sellPrice };
  };

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm duration-200 bg-black/50 animate-in fade-in">
      <div className="bg-card text-card-foreground rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-border">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border bg-muted/20">
          <div className="flex gap-2 items-center">
            <div className="p-2 rounded-lg bg-primary/10">
                <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
                <h2 className="text-xl font-bold">西市集</h2>
                <p className="text-xs text-muted-foreground">低买高卖，商贾之道</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Status Bar */}
        <div className="flex z-10 justify-between items-center px-6 py-3 border-b shadow-sm bg-card border-border">
            <div className="flex gap-2 items-center font-medium text-primary">
                <div className="flex justify-center items-center w-8 h-8 text-yellow-600 bg-yellow-100 rounded-full border border-yellow-200">
                    <Coins className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">持有资金</span>
                    <span className="font-mono text-lg font-bold leading-none">{playerStats.money.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">文</span></span>
                </div>
            </div>
            {marketState && (
                <div className="px-3 py-1 text-xs font-medium rounded-full border bg-primary/5 text-primary border-primary/10">
                    市场状态: {
                        marketState === 'normal' ? '平稳' :
                        marketState === 'boom' ? '繁荣' :
                        marketState === 'crash' ? '萧条' :
                        marketState === 'cooperative' ? '商会合作' :
                        marketState === 'undercut' ? '恶性竞争' : marketState
                    }
                </div>
            )}
        </div>

        {/* Goods List */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3 bg-muted/10 scrollbar-thin scrollbar-thumb-border">
          {goods.map((good) => {
            const currentPrice = marketPrices[good.id] || good.basePrice;
            const { buyPrice, sellPrice } = getEffectivePrices(good.id, good.basePrice);
            const owned = ownedGoods[good.id] || 0;
            const stock = marketInventory[good.id] || 0;
            const priceRatio = currentPrice / good.basePrice;
            
            let trendColor = 'text-muted-foreground';
            let trendIcon = null;
            let trendBg = 'bg-muted';
            
            if (priceRatio > 1.1) {
                trendColor = 'text-red-600 dark:text-red-400';
                trendBg = 'bg-red-50 dark:bg-red-950/20';
                trendIcon = <TrendingUp className="w-3 h-3" />;
            } else if (priceRatio < 0.9) {
                trendColor = 'text-green-600 dark:text-green-400';
                trendBg = 'bg-green-50 dark:bg-green-950/20';
                trendIcon = <TrendingDown className="w-3 h-3" />;
            }

            return (
              <div key={good.id} className="p-4 rounded-xl border shadow-sm transition-shadow bg-card border-border hover:shadow-md">
                <div className="flex flex-col gap-4 justify-between sm:flex-row sm:items-center">
                  
                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-2 items-center mb-1">
                        <h3 className="text-base font-bold">{good.name}</h3>
                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${trendBg} ${trendColor}`}>
                            {trendIcon}
                            {Math.round(priceRatio * 100)}%
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{good.description}</p>
                    <div className="flex gap-3 items-center mt-2 text-xs">
                        <div className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground border border-border/50">
                            市场库存: <span className="font-bold">{stock}</span>
                        </div>
                        <div className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            持有: <span className="font-bold">{owned}</span>
                        </div>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex flex-col gap-3 items-end shrink-0">
                    <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-0.5">当前市价</div>
                        <div className="flex gap-1 items-baseline font-mono text-xl font-bold">
                            {currentPrice} <span className="text-xs font-normal text-muted-foreground">文</span>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Area */}
                <div className="flex gap-4 justify-between items-center pt-3 mt-4 border-t border-dashed border-border">
                    <div className="flex gap-2 items-center text-xs text-muted-foreground">
                        {buyPrice !== currentPrice && (
                             <span className="flex gap-1 items-center text-orange-600 dark:text-orange-400">
                                实际买入: {buyPrice}
                             </span>
                        )}
                         {sellPrice !== currentPrice && (
                             <span className="flex gap-1 items-center text-blue-600 dark:text-blue-400">
                                实际卖出: {sellPrice}
                             </span>
                        )}
                    </div>

                    <div className="flex gap-2 items-center">
                        {/* Sell Group */}
                        <div className="flex gap-1 items-center p-1 rounded-lg bg-secondary/50">
                            <button
                                onClick={() => {
                                    vibrate(VIBRATION_PATTERNS.LIGHT);
                                    sellGood(good.id, 10);
                                }}
                                disabled={owned < 10}
                                className="px-2 py-1 text-xs font-medium rounded transition-colors hover:bg-background disabled:opacity-40"
                                title="卖出10个"
                            >
                                卖10
                            </button>
                            <button
                                onClick={() => {
                                    vibrate(VIBRATION_PATTERNS.LIGHT);
                                    sellGood(good.id, 1);
                                }}
                                disabled={owned < 1}
                                className="px-3 py-1 text-xs font-bold rounded border shadow-sm transition-all bg-background border-border hover:border-primary/50 disabled:opacity-40 active:scale-95"
                            >
                                卖出
                            </button>
                        </div>

                        {good.id !== 'leek' && (
                        <div className="flex gap-1 items-center p-1 rounded-lg bg-primary/5">
                            <button
                                onClick={() => {
                                    vibrate(VIBRATION_PATTERNS.LIGHT);
                                    buyGood(good.id, 1);
                                }}
                                disabled={playerStats.money < buyPrice || stock < 1}
                                className="px-3 py-1 text-xs font-bold rounded shadow-sm transition-all bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 active:scale-95"
                            >
                                买入
                            </button>
                            <button
                                onClick={() => {
                                    vibrate(VIBRATION_PATTERNS.LIGHT);
                                    buyGood(good.id, 10);
                                }}
                                disabled={playerStats.money < buyPrice * 10 || stock < 10}
                                className="px-2 py-1 text-xs font-medium rounded transition-colors hover:bg-background disabled:opacity-40"
                                title="买入10个"
                            >
                                买10
                            </button>
                        </div>
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
