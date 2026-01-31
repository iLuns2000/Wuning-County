import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';
import { Scissors, Sparkles } from 'lucide-react';

export const BarberShop: React.FC = () => {
  const { playerStats, handleEventOption, inventory, flags } = useGameStore();
  const vibrate = useGameVibrate();

  const hasCoupon = inventory.includes('barber_discount_coupon');
  const firstDone = !!flags['barber_first_done'];

  const haircutBasePrice = 15;
  const haircutPrice = hasCoupon ? Math.ceil(haircutBasePrice * 0.8) : haircutBasePrice; // 八折

  const handleHaircut = () => {
    vibrate(VIBRATION_PATTERNS.LIGHT);
    if (playerStats.money < haircutPrice) {
      handleEventOption(undefined, '【梦幻只雕剃肆】囊中羞涩，理不起发。');
      return;
    }

    const messageParts: string[] = [];
    messageParts.push('【梦幻只雕剃肆】洗剪吹完成，焕然一新。');

    // Consume coupon if present
    const effect: import('@/types/game').Effect = {
      money: -haircutPrice,
      experience: 10,
    };

    if (hasCoupon) {
      effect.itemsRemove = ['barber_discount_coupon'];
      messageParts.push('使用了八折优惠券。');
    } else if (!firstDone) {
      effect.itemsAdd = ['barber_discount_coupon'];
      effect.flagsSet = { barber_first_done: true };
      messageParts.push('首次到店，获赠“理发八折优惠券”。');
    }

    handleEventOption(effect, messageParts.join(' '));
  };

  const handleBuyConditioner = () => {
    vibrate(VIBRATION_PATTERNS.MEDIUM);
    if (playerStats.money < 8) {
      handleEventOption(undefined, '【梦幻只雕剃肆】钱不够，买不起护发素。');
      return;
    }

    handleEventOption({
      money: -8,
      experience: 15,
      itemsAdd: ['gaza_conditioner']
    }, '【梦幻只雕剃肆】你购买了“嘎炸护发素”。岭南的知名动物所制，芦花自主研发，而你有幸成为她的第一只小白鼠。');
  };

  return (
    <div className="p-4 space-y-4 rounded-lg border shadow-sm bg-card text-card-foreground">
      <div className="flex gap-2 items-center pb-2 border-b">
        <Scissors className="text-pink-600" />
        <h2 className="text-xl font-bold">梦幻只雕剃肆</h2>
      </div>
      <p className="text-sm text-muted-foreground">剪染烫洗一条龙，传说中只服务“有故事的你”。</p>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleHaircut}
          disabled={playerStats.money < haircutPrice}
          className="flex flex-col justify-center items-center p-4 rounded-lg border transition-all hover:bg-secondary disabled:opacity-50"
        >
          <Scissors className="mb-2" />
          <span className="font-bold">洗剪吹</span>
          <span className="text-xs text-muted-foreground">-{haircutPrice}文 / 阅历+10</span>
          {!firstDone && !hasCoupon && (
            <span className="text-[10px] text-primary mt-1">首次到店赠八折券</span>
          )}
          {hasCoupon && (
            <span className="text-[10px] text-amber-600 mt-1">已持券（八折）</span>
          )}
        </button>

        <button
          onClick={handleBuyConditioner}
          disabled={playerStats.money < 8}
          className="flex flex-col justify-center items-center p-4 rounded-lg border transition-all hover:bg-secondary disabled:opacity-50"
        >
          <Sparkles className="mb-2" />
          <span className="font-bold">购买嘎炸护发素</span>
          <span className="text-xs text-muted-foreground">-8文 / 阅历+15</span>
          <span className="text-[10px] text-muted-foreground mt-1">芦花自主研发·小白鼠体验</span>
        </button>
      </div>
    </div>
  );
};

