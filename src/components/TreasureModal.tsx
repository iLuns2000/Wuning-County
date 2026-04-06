/**
 * 古风珍宝阁弹窗 - 珍宝阁
 * 金色调，体现稀世珍宝、身份象征
 */
import React from 'react';
import { X, Gem, Coins, Sparkles, Crown } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { treasures, treasurePrices, TAX_RELIEF_EDICT_ID } from '@/data/treasures';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';
import { useTheme } from '@/hooks/useTheme';

interface TreasureModalProps {
  onClose: () => void;
}

// 珍宝稀有度颜色
const rarityColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  common: { bg: 'bg-gray-500/20', border: 'border-gray-500/40', text: 'text-gray-300', glow: 'shadow-gray-500/20' },
  rare: { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-300', glow: 'shadow-blue-500/30' },
  epic: { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-300', glow: 'shadow-purple-500/30' },
  legend: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-300', glow: 'shadow-amber-500/40' },
};

export const TreasureModal: React.FC<TreasureModalProps> = ({ onClose }) => {
  const { inventory, playerStats, buyTreasure, propertyTaxHalvingDaysLeft } = useGameStore();
  const vibrate = useGameVibrate();
  const { theme } = useTheme();
  const isLightMode = theme === 'light' || (theme === 'system' && typeof window !== 'undefined' && !window.matchMedia('(prefers-color-scheme: dark)').matches);

  const getOwnedCount = (id: string) => {
    return inventory[id] || 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* 弹窗主体 - 金色调 */}
      <div 
        className={`relative w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col rounded-2xl
                   border shadow-2xl
                   ${isLightMode 
                     ? 'bg-gradient-to-b from-[#fef9e7] to-[#fdf5d8] border-amber-300' 
                     : 'bg-gradient-to-b from-[#1a1810] to-[#0f0d08] border-amber-500/30'
                   }`}
        onClick={e => e.stopPropagation()}
        style={{ animation: 'modalIn 0.3s ease-out forwards' }}
      >
        {/* 顶部装饰 */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-700" />
        <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-amber-500/40 rounded-tl-3xl" />
        <div className="absolute top-0 right-0 w-16 h-16 border-r-4 border-t-4 border-amber-500/40 rounded-tr-3xl" />
        
        {/* 荣誉装饰 */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2">
          <Crown className="w-6 h-6 text-amber-400 animate-pulse" />
        </div>
        
        {/* 标题栏 */}
        <div className="relative p-5 pt-8 bg-gradient-to-r from-amber-950/80 to-yellow-900/80 border-b border-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 shadow-lg shadow-amber-500/30">
                <Gem className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white font-display">珍宝阁</h2>
                <p className="text-xs text-amber-300/70">稀世珍宝，身份的象征</p>
              </div>
            </div>
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                onClose();
              }} 
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6 text-amber-200" />
            </button>
          </div>
        </div>

        {/* 金钱显示 */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-950/50 to-yellow-950/50 border-b border-amber-500/10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Coins className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-xl text-amber-400 font-mono">{playerStats.money}</span>
                    <span className="text-sm text-amber-400/60">文</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500/80 text-sm">
                   <Sparkles size={14} />
                   <span>稀世奇珍·价值连城</span>
                </div>
            </div>
        </div>

        {/* 珍宝列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {treasures.map((treasure, index) => {
            const price = treasurePrices[treasure.id];
            const owned = getOwnedCount(treasure.id);
            const isTaxEdict = treasure.id === TAX_RELIEF_EDICT_ID;
            const taxHalvingLeft = propertyTaxHalvingDaysLeft ?? 0;
            const taxEdictActive = isTaxEdict && taxHalvingLeft > 0;
            const canAfford = playerStats.money >= price;
            const canBuy = canAfford && !taxEdictActive;
            const rarity = treasure.rarity || 'common';
            const rarityStyle = rarityColors[rarity] || rarityColors.common;
            
            return (
              <div 
                key={treasure.id} 
                className={`
                  group relative p-3 sm:p-5 rounded-xl border transition-all duration-300
                  ${rarityStyle.bg} ${rarityStyle.border}
                  hover:shadow-lg ${rarityStyle.glow}
                  ${isLightMode 
                    ? 'bg-gradient-to-b from-[#fffbf0] to-[#fff5d8]' 
                    : 'bg-gradient-to-b from-[#1f1a10] to-[#151008]'
                  }
                `}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* 稀有度标识 */}
                <div className="absolute top-0 right-0">
                  <span className={`
                    inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-bl-xl rounded-tr-lg
                    ${rarityStyle.bg} ${rarityStyle.text} ${rarityStyle.border}
                  `}>
                    <Sparkles size={12} />
                    {rarity === 'legend' ? '传说' : rarity === 'epic' ? '史诗' : rarity === 'rare' ? '稀有' : '普通'}
                  </span>
                </div>

                {/* 已有数量（降税令不入背包，改显示生效天数） */}
                {!isTaxEdict && owned > 0 && (
                  <div className="absolute -top-1 -left-1 w-8 h-8 flex items-center justify-center 
                                bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full shadow-lg">
                    <span className="text-sm font-bold text-white">×{owned}</span>
                  </div>
                )}
                {taxEdictActive && (
                  <div className="absolute -top-1 -left-1 px-2 py-0.5 flex items-center justify-center 
                                bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg shadow-lg border border-emerald-400/40">
                    <span className="text-[10px] sm:text-xs font-bold text-white whitespace-nowrap">剩余{taxHalvingLeft}天</span>
                  </div>
                )}
                
                <div className="flex justify-between items-start pr-24 mb-3">
                  <div>
                    <h3 className={`text-sm sm:text-lg font-bold ${isLightMode ? 'text-amber-900' : rarityStyle.text}`}>{treasure.name}</h3>
                    <p className={`mt-0.5 sm:mt-1 text-xs sm:text-sm ${isLightMode ? 'text-amber-700/70' : 'text-amber-200/60'} line-clamp-2`}>{treasure.description}</p>
                    {taxEdictActive && (
                      <p className={`mt-1 text-xs font-medium ${isLightMode ? 'text-emerald-800' : 'text-emerald-300/90'}`}>
                        降税令生效中 · 剩余 {taxHalvingLeft} 个游戏日
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-2 sm:mt-4">
                    <div className={`
                      px-2 sm:px-4 py-1 sm:py-2 font-mono font-bold text-sm sm:text-lg rounded-lg
                      bg-gradient-to-r from-amber-600/30 to-yellow-600/30 
                      border border-amber-500/30 ${isLightMode ? 'text-amber-800' : rarityStyle.text}
                    `}>
                        {price.toLocaleString()} 文
                    </div>
                    
                    <button
                      onClick={() => {
                          vibrate(VIBRATION_PATTERNS.SUCCESS);
                          buyTreasure(treasure.id);
                      }}
                      disabled={!canAfford || taxEdictActive}
                      className={`
                        flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 w-full sm:w-auto
                        ${canBuy 
                            ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-lg hover:shadow-amber-500/30 hover:scale-105 active:scale-95' 
                            : 'bg-amber-900/30 text-amber-500/50 cursor-not-allowed border border-amber-500/20'
                        }
                      `}
                    >
                      <Gem size={14} />
                      {taxEdictActive ? '降税令生效中' : canAfford ? '购买收藏' : '囊中羞涩'}
                    </button>
                </div>

                {/* 悬停光效 */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity
                              bg-gradient-to-r from-transparent via-amber-500/5 to-transparent rounded-xl pointer-events-none" />
              </div>
            );
          })}
        </div>

        {/* 底部提示 */}
        <div className="px-6 py-3 border-t border-amber-500/10 bg-amber-950/20">
          <div className="flex justify-center">
            <span className="text-xs text-amber-500/60 flex items-center gap-1">
              <Gem size={12} />
              多数珍宝用于收藏；建材令与稀有石料可用于官邸升级
            </span>
          </div>
        </div>

        {/* 底部装饰 */}
        <div className="px-6 py-2 border-t border-amber-500/10">
          <div className="flex justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500/50" />
            <span className="w-2 h-2 rounded-full bg-yellow-500/30" />
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
        
        @keyframes glow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
        }
      `}</style>
    </div>
  );
};
