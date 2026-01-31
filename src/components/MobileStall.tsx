import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';
import { Store, Hammer, ShoppingBag } from 'lucide-react';
import { items } from '@/data/items';

export const MobileStall: React.FC = () => {
  const { playerStats, handleEventOption, inventory, checkAchievements } = useGameStore();
  const vibrate = useGameVibrate();
  const [tab, setTab] = useState<'shop' | 'craft'>('shop');

  // Count resources
  const woodCount = inventory.filter(id => id === 'wood').length;
  const stoneCount = inventory.filter(id => id === 'stone').length;
  const fragmentCount = inventory.filter(id => id === 'wuning_fragment').length;

  // Shop items
  const shopItems = ['clay_shopkeeper', 'wooden_gold_fridge', 'wood_carving_spongebob'];

  const handleBuy = (itemId: string, price: number) => {
    vibrate(VIBRATION_PATTERNS.LIGHT);
    if (playerStats.money < price) {
      handleEventOption(undefined, '【流动手作小摊】囊中羞涩，买不起这个。');
      return;
    }
    handleEventOption({
      money: -price,
      itemsAdd: [itemId]
    }, `【流动手作小摊】购买了${items.find(i => i.id === itemId)?.name}。`);
  };

  const handleCraftFragment = () => {
    vibrate(VIBRATION_PATTERNS.MEDIUM);
    if (woodCount < 10 || stoneCount < 30) {
      handleEventOption(undefined, '【流动手作小摊】材料不足，需要10根木头和30块石头。');
      return;
    }
    
    // Remove materials
    const itemsRemove = [];
    for(let i=0; i<10; i++) itemsRemove.push('wood');
    for(let i=0; i<30; i++) itemsRemove.push('stone');

    handleEventOption({
      itemsRemove,
      itemsAdd: ['wuning_fragment']
    }, '【流动手作小摊】你用木头和石头制作了一个微缩景观碎片。');
  };

  const handleExchangeSet = () => {
    vibrate(VIBRATION_PATTERNS.SUCCESS);
    if (fragmentCount < 12) {
      handleEventOption(undefined, '【流动手作小摊】碎片不足，需要12个碎片。');
      return;
    }
    if (playerStats.money < 30) {
        handleEventOption(undefined, '【流动手作小摊】手工费不足，需要30文钱。');
        return;
    }

    const itemsRemove = [];
    for(let i=0; i<12; i++) itemsRemove.push('wuning_fragment');

    handleEventOption({
      money: -30,
      itemsRemove,
      itemsAdd: ['wuning_landscape']
    }, '【流动手作小摊】你集齐了碎片，兑换了一套无宁县微缩景观！获得“无宁收藏家”称号。');
    
    setTimeout(() => checkAchievements(), 500);
  };

  return (
    <div className="p-4 space-y-4 rounded-lg border shadow-sm bg-card text-card-foreground">
      <div className="flex gap-2 items-center pb-2 border-b">
        <Store className="text-amber-600" />
        <h2 className="text-xl font-bold">流动手作小摊</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        一个流动的小摊位，出售各种精美的手工艺品。
      </p>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-lg bg-secondary/50">
        <button
          onClick={() => setTab('shop')}
          className={`flex-1 px-3 py-1 text-sm font-medium rounded-md transition-all ${
            tab === 'shop' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-background/50'
          }`}
        >
          <ShoppingBag className="inline-block mr-1 w-4 h-4" /> 商品
        </button>
        <button
          onClick={() => setTab('craft')}
          className={`flex-1 px-3 py-1 text-sm font-medium rounded-md transition-all ${
            tab === 'craft' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-background/50'
          }`}
        >
          <Hammer className="inline-block mr-1 w-4 h-4" /> 手作兑换
        </button>
      </div>

      {tab === 'shop' ? (
        <div className="grid grid-cols-1 gap-2">
          {shopItems.map(id => {
            const item = items.find(i => i.id === id);
            if (!item) return null;
            return (
              <button
                key={id}
                onClick={() => handleBuy(id, item.price || 0)}
                disabled={playerStats.money < (item.price || 0)}
                className="flex justify-between items-center p-3 rounded-lg border transition-all hover:bg-secondary disabled:opacity-50"
              >
                <div className="text-left">
                  <div className="font-bold">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
                <div className="text-sm font-bold text-amber-600 shrink-0">
                  {item.price} 文
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
            <div className="p-3 text-sm rounded-lg bg-secondary/50">
                <div className="font-semibold mb-1">当前持有:</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                        <div className="text-muted-foreground text-xs">木头</div>
                        <div className="font-mono">{woodCount}</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground text-xs">石头</div>
                        <div className="font-mono">{stoneCount}</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground text-xs">碎片</div>
                        <div className="font-mono">{fragmentCount}/12</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
                <button
                    onClick={handleCraftFragment}
                    disabled={woodCount < 10 || stoneCount < 30}
                    className="flex flex-col justify-center items-center p-3 rounded-lg border transition-all hover:bg-secondary disabled:opacity-50"
                >
                    <span className="font-bold">制作碎片</span>
                    <span className="text-xs text-muted-foreground">消耗: 10木头 + 30石头</span>
                    <span className="text-[10px] text-muted-foreground mt-1">（材料可在草地树林采集）</span>
                </button>

                <button
                    onClick={handleExchangeSet}
                    disabled={fragmentCount < 12 || playerStats.money < 30}
                    className="flex flex-col justify-center items-center p-3 rounded-lg border transition-all hover:bg-secondary disabled:opacity-50"
                >
                    <span className="font-bold">兑换全套景观</span>
                    <span className="text-xs text-muted-foreground">消耗: 12碎片 + 30文钱</span>
                    <span className="text-[10px] text-muted-foreground mt-1">获得称号“无宁收藏家”</span>
                </button>
            </div>
        </div>
      )}
    </div>
  );
};
