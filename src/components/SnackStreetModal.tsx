/**
 * 古风小吃街弹窗 - 无宁小吃街
 * 暖色调设计，体现美食氛围
 */
import React from 'react';
import { X, Utensils, ShoppingBag, Coins, Flame } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { snacks } from '@/data/snacks';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';
import { useTheme } from '@/hooks/useTheme';

interface SnackStreetModalProps {
  onClose: () => void;
}

export const SnackStreetModal: React.FC<SnackStreetModalProps> = ({ onClose }) => {
  const gameStore = useGameStore();
  const playerStats = gameStore.playerStats;
  const { buyItem, useItem, addLog } = gameStore;
  const vibrate = useGameVibrate();
  const { theme } = useTheme();
  const isLightMode = theme === 'light' || (theme === 'system' && typeof window !== 'undefined' && !window.matchMedia('(prefers-color-scheme: dark)').matches);

  // 安全获取金钱值
  const money = playerStats?.money ?? 0;

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
    if (money < price) {
      addLog('囊中羞涩，买不起这美食。');
      return;
    }
    vibrate(VIBRATION_PATTERNS.MEDIUM);
    buyItem(snackId, price);
    useItem(snackId);
    addLog('当街品尝了美食，真是惬意！');
  };

  const handleTakeout = (snackId: string, price: number) => {
    if (money < price) {
      addLog('囊中羞涩，买不起这美食。');
      return;
    }
    vibrate(VIBRATION_PATTERNS.LIGHT);
    buyItem(snackId, price);
    addLog('打包了美食，准备路上吃。');
  };

  return (
    // 遮罩层
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* 弹窗主体 - 暖色调设计 */}
      <div 
        className={`relative w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col rounded-2xl
                   border shadow-2xl
                   ${isLightMode 
                     ? 'bg-[#fff9e6] border-amber-300' 
                     : 'bg-gradient-to-b from-[#2a1a10] to-[#1f1208] border-amber-500/30'
                   }`}
        onClick={e => e.stopPropagation()}
        style={{ animation: 'modalIn 0.3s ease-out forwards' }}
      >
        {/* 动态背景色支持 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a1a10] to-[#1f1208] -z-10 light:from-[#fff9e6] light:to-[#fff5d6] dark:from-[#2a1a10] dark:to-[#1f1208] rounded-2xl" />
        {/* 顶部装饰 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-orange-400 to-amber-600" />
        <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-amber-500/40 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-amber-500/40 rounded-tr-2xl" />
        
        {/* 标题栏 */}
        <div className={`relative p-5 border-b ${isLightMode 
          ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-200' 
          : 'bg-gradient-to-r from-amber-900/80 to-orange-900/80 border-amber-500/20'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold font-display ${isLightMode ? 'text-amber-900' : 'text-white'}`}>无宁小吃街</h2>
                <p className={`text-xs ${isLightMode ? 'text-amber-700' : 'text-amber-300/70'}`}>民以食为天，不吃饱怎么闯荡江湖？</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${isLightMode ? 'hover:bg-amber-200' : 'hover:bg-white/10'}`}
            >
              <X className={`w-6 h-6 ${isLightMode ? 'text-amber-700' : 'text-amber-200'}`} />
            </button>
          </div>
        </div>

        {/* 金钱显示 */}
        <div className={`px-6 py-3 border-b ${isLightMode 
          ? 'bg-amber-50 border-amber-200' 
          : 'bg-gradient-to-r from-amber-950/50 to-orange-950/50 border-amber-500/10'}`}>
           <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 font-bold ${isLightMode ? 'text-amber-800' : 'text-amber-400'}`}>
                 <Coins className="w-5 h-5" />
                 <span className="text-xl font-mono">{playerStats.money}</span>
                 <span className={`text-sm ${isLightMode ? 'text-amber-600' : 'text-amber-400/60'}`}>文</span>
              </div>
              <div className={`flex items-center gap-1 text-sm ${isLightMode ? 'text-orange-600' : 'text-orange-400/80'}`}>
                 <Flame size={14} />
                 <span>热气腾腾的美食街</span>
              </div>
           </div>
        </div>

        {/* 内容网格 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {snacks.map((snack, index) => {
              const price = getPrice(snack.id);
              const canBuy = money >= price;
              
              return (
                <div 
                  key={snack.id} 
                  className={`group relative p-4 rounded-xl border transition-all duration-300 hover:-translate-y-1
                    ${isLightMode 
                      ? 'border-amber-200 bg-white hover:border-amber-400 hover:shadow-lg' 
                      : 'border-amber-500/20 bg-gradient-to-b from-[#2a1a10] to-[#1f1208] hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-500/10'
                    }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* 悬停光效 */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-pointer-events-none pointer-events-none
                                bg-gradient-to-r from-transparent via-amber-500/5 to-transparent rounded-xl" />
                  
                  <div className="relative flex justify-between items-start mb-3">
                    <div>
                      <h3 className={`font-bold text-lg ${isLightMode ? 'text-amber-900' : 'text-amber-100'}`}>{snack.name}</h3>
                      <p className={`text-xs mt-0.5 ${isLightMode ? 'text-amber-600' : 'text-amber-400/60'}`}>{snack.category || '特色小吃'}</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-bold rounded-full shadow-lg ${isLightMode 
                      ? 'text-amber-900 bg-gradient-to-r from-amber-300 to-orange-300' 
                      : 'text-amber-900 bg-gradient-to-r from-amber-400 to-orange-400'}`}>
                      {price} 文
                    </span>
                  </div>
                  
                  <p className={`text-sm mb-4 line-clamp-2 min-h-[2.5rem] ${isLightMode ? 'text-amber-800' : 'text-amber-200/70'}`}>
                    {snack.description}
                  </p>

                  {/* 效果标签 */}
                  {snack.effect && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {snack.effect.health && (
                        <span className={`px-2 py-0.5 text-xs rounded ${isLightMode ? 'bg-red-100 text-red-700' : 'bg-red-500/20 text-red-300'}`}>体力+{snack.effect.health}</span>
                      )}
                      {snack.effect.culture && (
                        <span className={`px-2 py-0.5 text-xs rounded ${isLightMode ? 'bg-pink-100 text-pink-700' : 'bg-pink-500/20 text-pink-300'}`}>文化+{snack.effect.culture}</span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => handleTaste(snack.id, price)}
                      disabled={!canBuy}
                      className={`
                        flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
                        flex items-center justify-center gap-2
                        ${canBuy 
                          ? `bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98]` 
                          : isLightMode
                            ? 'bg-amber-100 text-amber-400 cursor-not-allowed border border-amber-200'
                            : 'bg-amber-900/30 text-amber-500/50 cursor-not-allowed border border-amber-500/20'
                        }
                      `}
                    >
                      <Utensils size={14} />
                      品尝
                    </button>
                    <button
                      onClick={() => handleTakeout(snack.id, price)}
                      disabled={!canBuy}
                      className={`
                        flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
                        flex items-center justify-center gap-2 border
                        ${canBuy 
                          ? isLightMode
                            ? 'bg-transparent border-amber-400 text-amber-700 hover:bg-amber-50'
                            : 'bg-transparent border-amber-400/40 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400'
                          : isLightMode
                            ? 'border-amber-200 text-amber-400 cursor-not-allowed'
                            : 'border-amber-500/20 text-amber-500/30 cursor-not-allowed'
                        }
                      `}
                    >
                      <ShoppingBag size={14} />
                      打包
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部装饰 */}
        <div className="px-6 py-3 border-t border-amber-500/10">
          <div className="flex justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500/40" />
            <span className="w-2 h-2 rounded-full bg-orange-500/30" />
            <span className="w-2 h-2 rounded-full bg-amber-500/20" />
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(15px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};