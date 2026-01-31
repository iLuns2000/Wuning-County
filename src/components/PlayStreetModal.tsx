import React, { useMemo, useState } from 'react';
import { X, ShoppingBag, Gem, Star, Coins } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { items } from '@/data/items';
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

  const apparelItems = useMemo(() => items.filter(i => i.type === 'apparel'), []);
  const accessoryItems = useMemo(() => items.filter(i => i.type === 'accessory'), []);

  const ownedItems = useMemo(() => {
    const uniqueIds = Array.from(new Set(inventory));
    return uniqueIds.map(id => itemMap.get(id)).filter((i): i is Item => !!i);
  }, [inventory, itemMap]);

  const ownedApparelItems = useMemo(() => ownedItems.filter(i => i.type === 'apparel'), [ownedItems]);
  const ownedAccessoryItems = useMemo(() => ownedItems.filter(i => i.type === 'accessory'), [ownedItems]);

  const styleSummary = useMemo(() => {
    const styleScores: Record<'清雅' | '华贵' | '英气' | '俏皮' | '典雅', number> = {
      清雅: 0,
      华贵: 0,
      英气: 0,
      俏皮: 0,
      典雅: 0
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

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 duration-200 bg-black/60 animate-in fade-in backdrop-blur-sm">
      <div className="bg-[#fff9e6] dark:bg-card rounded-xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border-4 border-amber-800 dark:border-amber-900">
        <div className="flex justify-between items-center p-4 text-amber-50 bg-amber-800 dark:bg-amber-900 shadow-md">
          <div className="flex gap-3 items-center">
            <ShoppingBag className="w-6 h-6" />
            <h2 className="text-2xl font-bold tracking-wider">游乐街</h2>
          </div>
          <button
            onClick={() => {
              vibrate(VIBRATION_PATTERNS.LIGHT);
              onClose();
            }}
            className="p-2 rounded-full transition-colors hover:bg-amber-700 dark:hover:bg-amber-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex justify-between items-center p-3 px-6 bg-amber-100 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/40">
          <div className="flex gap-2 items-center font-bold text-amber-900 dark:text-amber-100">
            <Coins className="w-5 h-5" />
            <span>{playerStats.money} 文</span>
          </div>
          <div className="text-sm text-amber-700 dark:text-amber-300">
            * 选购古风衣饰，梳妆更显风采
          </div>
        </div>

        <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900/40">
          <button
            onClick={() => setTab('apparel')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'apparel' ? 'bg-amber-600 text-white' : 'bg-white dark:bg-card text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800'}`}
          >
            <div className="flex gap-2 items-center">
              <ShoppingBag className="w-4 h-4" />
              服装店
            </div>
          </button>
          <button
            onClick={() => setTab('accessory')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'accessory' ? 'bg-amber-600 text-white' : 'bg-white dark:bg-card text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800'}`}
          >
            <div className="flex gap-2 items-center">
              <Gem className="w-4 h-4" />
              首饰店
            </div>
          </button>
          <button
            onClick={() => setTab('dressing')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'dressing' ? 'bg-amber-600 text-white' : 'bg-white dark:bg-card text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800'}`}
          >
            <div className="flex gap-2 items-center">
              <Star className="w-4 h-4" />
              梳妆台
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[url('https://www.transparenttextures.com/patterns/paper.png')] dark:bg-none dark:bg-transparent">
          {tab === 'apparel' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {apparelItems.map(item => {
                const price = getPrice(item);
                const canBuy = playerStats.money >= price;
                const slotLabel = item.slot ? apparelSlots.find(s => s.id === item.slot)?.label : undefined;
                return (
                  <div key={item.id} className="p-4 bg-white dark:bg-card rounded-lg border border-amber-200 dark:border-amber-800 shadow-md transition-all hover:shadow-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-amber-900">{item.name}</h3>
                      <span className="px-2 py-1 text-xs font-bold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/40 rounded-full">
                        {price} 文
                      </span>
                    </div>
                    <p className="mb-3 h-10 text-sm text-gray-600 dark:text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex gap-2 mb-3 text-xs text-amber-700 dark:text-amber-300">
                      {slotLabel && <span className="px-2 py-1 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-200 rounded">{slotLabel}</span>}
                      {item.style && <span className="px-2 py-1 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-200 rounded">{item.style}</span>}
                    </div>
                    <button
                      onClick={() => {
                        vibrate(VIBRATION_PATTERNS.LIGHT);
                        buyItem(item.id, price);
                      }}
                      disabled={!canBuy}
                      className={`w-full py-2 rounded text-sm font-medium transition-colors ${canBuy ? 'text-white bg-amber-600 hover:bg-amber-700' : 'text-amber-300 bg-amber-100 dark:bg-amber-900/30 cursor-not-allowed'}`}
                    >
                      {canBuy ? '购买' : '囊中羞涩'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'accessory' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accessoryItems.map(item => {
                const price = getPrice(item);
                const canBuy = playerStats.money >= price;
                const slotLabel = item.slot ? accessorySlotLabels[item.slot as AccessorySlot] : undefined;
                return (
                  <div key={item.id} className="p-4 bg-white dark:bg-card rounded-lg border border-amber-200 dark:border-amber-800 shadow-md transition-all hover:shadow-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-amber-900">{item.name}</h3>
                      <span className="px-2 py-1 text-xs font-bold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/40 rounded-full">
                        {price} 文
                      </span>
                    </div>
                    <p className="mb-3 h-10 text-sm text-gray-600 dark:text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex gap-2 mb-3 text-xs text-amber-700 dark:text-amber-300">
                      {slotLabel && <span className="px-2 py-1 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-200 rounded">{slotLabel}</span>}
                      {item.style && <span className="px-2 py-1 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-200 rounded">{item.style}</span>}
                    </div>
                    <button
                      onClick={() => {
                        vibrate(VIBRATION_PATTERNS.LIGHT);
                        buyItem(item.id, price);
                      }}
                      disabled={!canBuy}
                      className={`w-full py-2 rounded text-sm font-medium transition-colors ${canBuy ? 'text-white bg-amber-600 hover:bg-amber-700' : 'text-amber-300 bg-amber-100 cursor-not-allowed'}`}
                    >
                      {canBuy ? '购买' : '囊中羞涩'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'dressing' && (
            <div className="space-y-6">
              <div className="p-4 bg-white dark:bg-card rounded-lg border border-amber-200 dark:border-amber-800 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">风格评分</h3>
                  <div className="text-sm text-amber-700 dark:text-amber-300">总分 {styleSummary.totalScore}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-amber-800 dark:text-amber-200 md:grid-cols-5">
                  {Object.entries(styleSummary.styleScores).map(([style, score]) => (
                    <div key={style} className="px-2 py-2 text-center bg-amber-50 dark:bg-amber-950/30 rounded">
                      <div className="font-semibold">{style}</div>
                      <div>{score}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-card rounded-lg border border-amber-200 dark:border-amber-800 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-amber-900 dark:text-amber-100">衣装搭配</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {apparelSlots.map(slot => {
                    const equippedId = equippedApparel[slot.id];
                    const equippedItem = equippedId ? itemMap.get(equippedId) : undefined;
                    const slotItems = ownedApparelItems.filter(i => i.slot === slot.id);
                    return (
                      <div key={slot.id} className="p-3 rounded-lg border border-amber-100 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm font-semibold text-amber-800 dark:text-amber-200">{slot.label}</div>
                          {equippedItem && (
                            <button
                              onClick={() => {
                                vibrate(VIBRATION_PATTERNS.LIGHT);
                                unequipApparel(slot.id);
                              }}
                              className="text-xs text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
                            >
                              卸下
                            </button>
                          )}
                        </div>
                        <div className="mb-2 text-sm font-medium text-amber-900 dark:text-amber-100">
                          {equippedItem ? equippedItem.name : '未装备'}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {slotItems.length === 0 && (
                            <span className="text-xs text-amber-600 dark:text-amber-400">暂无该部位衣装</span>
                          )}
                          {slotItems.map(item => (
                            <button
                              key={item.id}
                              onClick={() => {
                                vibrate(VIBRATION_PATTERNS.LIGHT);
                                equipApparel(slot.id, item.id);
                              }}
                              className={`px-2 py-1 rounded text-xs border transition-colors ${equippedItem?.id === item.id ? 'bg-amber-600 text-white border-amber-600' : 'bg-white dark:bg-card text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30'}`}
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

              <div className="p-4 bg-white dark:bg-card rounded-lg border border-amber-200 dark:border-amber-800 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">首饰佩戴</h3>
                  <div className="text-xs text-amber-700 dark:text-amber-300">已佩戴 {equippedAccessories.length}/3</div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {equippedAccessories.length === 0 && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">暂无佩戴首饰</span>
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
                        className="px-2 py-1 text-xs text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/50 rounded border border-amber-200 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900/70"
                      >
                        {item.name}
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {ownedAccessoryItems.map(item => {
                    const isEquipped = equippedAccessories.includes(item.id);
                    const slotLabel = item.slot ? accessorySlotLabels[item.slot as AccessorySlot] : undefined;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          vibrate(VIBRATION_PATTERNS.LIGHT);
                          equipAccessory(item.id);
                        }}
                        className={`p-3 rounded-lg border text-left transition-colors ${isEquipped ? 'bg-amber-200 dark:bg-amber-800 border-amber-300 dark:border-amber-700' : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30'}`}
                      >
                        <div className="text-sm font-semibold text-amber-900 dark:text-amber-100">{item.name}</div>
                        <div className="flex gap-2 mt-1 text-xs text-amber-700 dark:text-amber-300">
                          {slotLabel && <span>{slotLabel}</span>}
                          {item.style && <span>{item.style}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
