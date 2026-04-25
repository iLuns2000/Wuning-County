﻿﻿﻿﻿﻿﻿/**
 * 古风游乐街弹窗 - 游乐街
 * 服装店 + 首饰店 + 梳妆台
 * 淡雅古风设计 - 米色纸张质感 + 墨色线条
 */
import React, { useMemo, useState } from 'react';
import { X, ShoppingBag, Gem, Star, Coins } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { items, barberExclusiveHairItemIds } from '@/data/items';
import { AccessorySlot, ApparelSlot, Item } from '@/types/game';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

interface PlayStreetModalProps {
  onClose: () => void;
}

type TabKey = 'apparel' | 'accessory' | 'dressing';

const apparelSlots: { id: ApparelSlot; label: string }[] = [
  { id: 'hair', label: '发型' },
  { id: 'top', label: '上衣' },
  { id: 'bottom', label: '下装' },
  { id: 'outer', label: '外披' },
  { id: 'shoes', label: '鞋履' }
];

const accessorySlotLabels: Record<AccessorySlot, string> = {
  ear: '耳饰',
  neck: '颈饰',
  hand: '手饰',
  waist: '腰饰',
  head: '发饰'
};

const getPrice = (item: Item) => item.price ?? 200;
const getItemScore = (price?: number) => {
  const base = 10 + Math.floor((price || 0) / 200);
  return Math.min(30, Math.max(8, base));
};

export const PlayStreetModal: React.FC<PlayStreetModalProps> = ({ onClose }) => {
  const [tab, setTab] = useState<TabKey>('apparel');
  const {
    playerStats,
    inventory,
    buyItem,
    equippedApparel,
    equippedAccessories,
    equipApparel,
    unequipApparel,
    equipAccessory,
    unequipAccessory
  } = useGameStore();
  const vibrate = useGameVibrate();

  const itemMap = useMemo(() => new Map(items.map(item => [item.id, item])), []);

  const barberExclusiveHairSet = useMemo(() => new Set(barberExclusiveHairItemIds), []);

  const apparelItems = useMemo(() => items.filter(i => i.type === 'apparel' && !barberExclusiveHairSet.has(i.id)), [barberExclusiveHairSet]);
  const accessoryItems = useMemo(() => items.filter(i => i.type === 'accessory'), []);

  const ownedItems = useMemo(() => {
    // 新格式 inventory: Record<string, number>
    const uniqueIds = Object.keys(inventory).filter(id => (inventory[id] || 0) > 0);
    return uniqueIds.map(id => itemMap.get(id)).filter((i): i is Item => !!i);
  }, [inventory, itemMap]);

  const ownedApparelItems = useMemo(() => ownedItems.filter(i => i.type === 'apparel'), [ownedItems]);
  const ownedAccessoryItems = useMemo(() => ownedItems.filter(i => i.type === 'accessory'), [ownedItems]);

  const styleSummary = useMemo(() => {
    const styleScores: Record<'清雅' | '华贵' | '英气' | '俏皮' | '典雅', number> = {
      清雅: 0, 华贵: 0, 英气: 0, 俏皮: 0, 典雅: 0
    };
    const equippedIds = [
      ...Object.values(equippedApparel).filter((id): id is string => !!id),
      ...equippedAccessories
    ];
    const equippedItems = equippedIds.map(id => itemMap.get(id)).filter((i): i is Item => !!i);
    let totalScore = 0;
    equippedItems.forEach(item => {
      if (!item.style) return;
      const score = getItemScore(item.price);
      styleScores[item.style] += score;
      totalScore += score;
    });
    return { totalScore, styleScores };
  }, [equippedApparel, equippedAccessories, itemMap]);

  // Tab配置 - 更淡雅的颜色
  const tabs = [
    { id: 'apparel' as const, label: '服装店', icon: ShoppingBag },
    { id: 'accessory' as const, label: '首饰店', icon: Gem },
    { id: 'dressing' as const, label: '梳妆台', icon: Star }
  ];

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4" onClick={onClose}>
      <div className="absolute inset-0 backdrop-blur-sm bg-black/50" />
      
      {/* 弹窗主体 - 淡雅米色纸张风格 */}
      <div 
        className="relative w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col rounded-lg
                   bg-[#f5f0e6] dark:bg-[#1a1815]
                   border border-[#d4c9b5] dark:border-[#3d3629]
                   shadow-2xl"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'modalIn 0.3s ease-out forwards' }}
      >
        {/* 纸张纹理背景 */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
             style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
        
        {/* 顶部装饰线 */}
        <div className="h-1 bg-gradient-to-r from-[#8b7355] via-[#a08060] to-[#8b7355]" />
        
        {/* 标题栏 */}
        <div className="relative px-6 py-4 bg-[#ebe5d8] dark:bg-[#2a2318] border-b border-[#d4c9b5] dark:border-[#3d3629]">
          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <div className="p-2 rounded-lg bg-[#8b7355]/10 border border-[#8b7355]/20">
                <ShoppingBag className="w-5 h-5 text-[#6b5544] dark:text-[#a08060]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#4a3f32] dark:text-[#e8e0d0] font-display">游乐街</h2>
                <p className="text-xs text-[#8b7355]/70 dark:text-[#a08060]/70">古装服饰 · 发型换装 · 梳妆打扮</p>
              </div>
            </div>
            <button
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                onClose();
              }}
              className="p-2 rounded-lg hover:bg-[#8b7355]/10 transition-colors"
            >
              <X className="w-5 h-5 text-[#6b5544] dark:text-[#a08060]" />
            </button>
          </div>
        </div>

        {/* 金钱显示 */}
        <div className="px-6 py-3 bg-[#f0ebe0] dark:bg-[#221e16] border-b border-[#d4c9b5] dark:border-[#3d3629]">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-2 text-[#6b5544] dark:text-[#c4a86a] font-bold">
                <Coins className="w-4 h-4" />
                <span className="font-mono">{playerStats.money}</span>
                <span className="text-sm text-[#8b7355]/60">文</span>
             </div>
          </div>
        </div>

        {/* Tab 切换 - 简洁线条风格 */}
        <div className="flex gap-1 p-3 px-6 bg-[#f8f4eb] dark:bg-[#1e1a12] border-b border-[#e0d9cc] dark:border-[#3d3629]">
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`
                  relative px-4 py-2 rounded text-sm font-medium transition-all duration-200
                  flex items-center gap-2
                  ${isActive 
                    ? 'text-[#4a3f32] dark:text-[#e8e0d0] bg-[#e8e0d8] dark:bg-[#3d3629] border-b-2 border-[#8b7355]' 
                    : 'text-[#8b7355] dark:text-[#a08060] hover:text-[#6b5544] dark:hover:text-[#c4a86a]'
                  }
                `}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* 内容区域 - 米白背景 */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#faf7f0] dark:bg-[#1a1815]">
          {/* 服装店 */}
          {tab === 'apparel' && (
            <>
            <div className="mb-3 p-3 rounded-lg border border-[#e0d9cc] dark:border-[#3d3629] bg-white/80 dark:bg-[#242018]/80 text-xs text-[#8b7355] dark:text-[#a08060]">
新增发型铺与帽子铺：可购买发型、帽子并在梳妆台随时切换；建筑阁的洗剪吹还会随机帮你换上新发样，并有 10% 概率触发限定杀马特。
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {apparelItems.map(item => {
                const price = getPrice(item);
                const canBuy = playerStats.money >= price;
                const slotLabel = item.slot ? apparelSlots.find(s => s.id === item.slot)?.label : undefined;
                return (
                  <div 
                    key={item.id} 
                    className="group p-4 rounded-lg border border-[#e0d9cc] dark:border-[#3d3629] 
                               bg-white dark:bg-[#242018]
                               hover:border-[#8b7355]/40 hover:shadow-md
                               transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-base font-bold text-[#4a3f32] dark:text-[#e8e0d0]">{item.name}</h3>
                      <span className="px-2 py-0.5 text-xs font-medium text-[#8b7355] bg-[#f0ebe0] dark:bg-[#3d3629] rounded">
                        {price} 文
                      </span>
                    </div>
                    <p className="mb-2 text-xs text-[#8b7355] dark:text-[#a08060] line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {slotLabel && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-[#f8f4eb] dark:bg-[#2a2318] text-[#8b7355] dark:text-[#a08060] rounded">
                          {slotLabel}
                        </span>
                      )}
                      {item.style && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-[#f8f4eb] dark:bg-[#2a2318] text-[#8b7355] dark:text-[#a08060] rounded">
                          {item.style}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        vibrate(VIBRATION_PATTERNS.LIGHT);
                        buyItem(item.id, price);
                      }}
                      disabled={!canBuy}
                      className={`
                        w-full py-2 rounded text-sm font-medium transition-all duration-200
                        ${canBuy 
                          ? 'bg-[#4a3f32] dark:bg-[#5a4a38] text-[#f5f0e6] hover:bg-[#3d3228]' 
                          : 'bg-[#e8e0d8] dark:bg-[#2a2318] text-[#a08060] cursor-not-allowed'
                        }
                      `}
                    >
                      {canBuy ? '购买' : '囊中羞涩'}
                    </button>
                  </div>
                );
              })}
            </div>
            </>
          )}

          {/* 首饰店 */}
          {tab === 'accessory' && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {accessoryItems.map(item => {
                const price = getPrice(item);
                const canBuy = playerStats.money >= price;
                const slotLabel = item.slot ? accessorySlotLabels[item.slot as AccessorySlot] : undefined;
                return (
                  <div 
                    key={item.id} 
                    className="group p-4 rounded-lg border border-[#e0d9cc] dark:border-[#3d3629] 
                               bg-white dark:bg-[#242018]
                               hover:border-[#8b7355]/40 hover:shadow-md
                               transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-base font-bold text-[#4a3f32] dark:text-[#e8e0d0]">{item.name}</h3>
                      <span className="px-2 py-0.5 text-xs font-medium text-[#8b7355] bg-[#f0ebe0] dark:bg-[#3d3629] rounded">
                        {price} 文
                      </span>
                    </div>
                    <p className="mb-2 text-xs text-[#8b7355] dark:text-[#a08060] line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {slotLabel && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-[#f8f4eb] dark:bg-[#2a2318] text-[#8b7355] dark:text-[#a08060] rounded">
                          {slotLabel}
                        </span>
                      )}
                      {item.style && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-[#f8f4eb] dark:bg-[#2a2318] text-[#8b7355] dark:text-[#a08060] rounded">
                          {item.style}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        vibrate(VIBRATION_PATTERNS.LIGHT);
                        buyItem(item.id, price);
                      }}
                      disabled={!canBuy}
                      className={`
                        w-full py-2 rounded text-sm font-medium transition-all duration-200
                        ${canBuy 
                          ? 'bg-[#4a3f32] dark:bg-[#5a4a38] text-[#f5f0e6] hover:bg-[#3d3228]' 
                          : 'bg-[#e8e0d8] dark:bg-[#2a2318] text-[#a08060] cursor-not-allowed'
                        }
                      `}
                    >
                      {canBuy ? '购买' : '囊中羞涩'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 梳妆台 */}
          {tab === 'dressing' && (
            <div className="space-y-4">
              {/* 风格评分 */}
              <div className="p-4 rounded-lg border border-[#e0d9cc] dark:border-[#3d3629] bg-white dark:bg-[#242018]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-bold text-[#4a3f32] dark:text-[#e8e0d0]">风格评分</h3>
                  <span className="px-3 py-1 text-sm font-bold text-[#6b5544] bg-[#f0ebe0] dark:bg-[#3d3629] rounded">
                    总分 {styleSummary.totalScore}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(styleSummary.styleScores).map(([style, score]) => (
                    <div key={style} className="p-2 text-center bg-[#f8f4eb] dark:bg-[#2a2318] rounded">
                      <div className="text-[10px] text-[#8b7355] dark:text-[#a08060]">{style}</div>
                      <div className="text-lg font-bold text-[#6b5544] dark:text-[#c4a86a]">{score}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 衣装搭配 */}
              <div className="p-4 rounded-lg border border-[#e0d9cc] dark:border-[#3d3629] bg-white dark:bg-[#242018]">
                <h3 className="text-base font-bold text-[#4a3f32] dark:text-[#e8e0d0] mb-3">衣装搭配</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {apparelSlots.map(slot => {
                    const equippedId = equippedApparel[slot.id];
                    const equippedItem = equippedId ? itemMap.get(equippedId) : undefined;
                    const slotItems = ownedApparelItems.filter(i => i.slot === slot.id);
                    return (
                      <div key={slot.id} className="p-3 rounded border border-[#e8e0d8] dark:border-[#3d3629] bg-[#faf7f0] dark:bg-[#1e1a12]">
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="text-xs font-medium text-[#6b5544] dark:text-[#a08060]">{slot.label}</div>
                          {equippedItem && (
                            <button
                              onClick={() => {
                                vibrate(VIBRATION_PATTERNS.LIGHT);
                                unequipApparel(slot.id);
                              }}
                              className="text-[10px] text-[#8b7355] hover:text-[#6b5544]"
                            >
                              卸下
                            </button>
                          )}
                        </div>
                        <div className="text-sm text-[#4a3f32] dark:text-[#e8e0d0] mb-1.5">
                          {equippedItem ? equippedItem.name : '未装备'}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {slotItems.length === 0 && (
                            <span className="text-[10px] text-[#a08060]">暂无</span>
                          )}
                          {slotItems.map(item => (
                            <button
                              key={item.id}
                              onClick={() => {
                                vibrate(VIBRATION_PATTERNS.LIGHT);
                                equipApparel(slot.id, item.id);
                              }}
                              className={`
                                px-1.5 py-0.5 rounded text-[10px] border transition-colors
                                ${equippedItem?.id === item.id 
                                  ? 'bg-[#4a3f32] text-white border-[#4a3f32]' 
                                  : 'bg-white dark:bg-[#242018] text-[#6b5544] border-[#d4c9b5] dark:border-[#3d3629] hover:border-[#8b7355]'
                                }
                              `}
                            >
                              {item.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 首饰佩戴 */}
              <div className="p-4 rounded-lg border border-[#e0d9cc] dark:border-[#3d3629] bg-white dark:bg-[#242018]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-bold text-[#4a3f32] dark:text-[#e8e0d0]">首饰佩戴</h3>
                  <span className="text-xs text-[#8b7355]">已佩戴 {equippedAccessories.length}/3</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {equippedAccessories.length === 0 && (
                    <span className="text-xs text-[#a08060]">暂无佩戴首饰</span>
                  )}
                  {equippedAccessories.map(id => {
                    const item = itemMap.get(id);
                    if (!item) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          vibrate(VIBRATION_PATTERNS.LIGHT);
                          unequipAccessory(id);
                        }}
                        className="px-2 py-1 text-xs text-[#6b5544] bg-[#f0ebe0] dark:bg-[#3d3629] rounded border border-[#d4c9b5] hover:bg-[#e8e0d8]"
                      >
                        {item.name} ✕
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                  {ownedAccessoryItems.map(item => {
                    const isEquipped = equippedAccessories.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          vibrate(VIBRATION_PATTERNS.LIGHT);
                          equipAccessory(item.id);
                        }}
                        className={`
                          p-2 rounded border text-left transition-colors text-xs
                          ${isEquipped 
                            ? 'bg-[#4a3f32] text-white border-[#4a3f32]' 
                            : 'bg-white dark:bg-[#242018] text-[#4a3f32] dark:text-[#e8e0d0] border-[#d4c9b5] dark:border-[#3d3629] hover:border-[#8b7355]'
                          }
                        `}
                      >
                        {item.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部装饰 */}
        <div className="px-6 py-2 bg-[#ebe5d8] dark:bg-[#221e16] border-t border-[#d4c9b5] dark:border-[#3d3629]">
          <div className="flex gap-1 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8b7355]/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#8b7355]/30" />
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
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
