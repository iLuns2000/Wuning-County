import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';
import { Dumbbell } from 'lucide-react';

export const ArcheryHall: React.FC = () => {
  const { playerStats, handleEventOption, flags } = useGameStore();
  const vibrate = useGameVibrate();

  const currentBonus = flags['archery_baduanjin_bonus'] || 0;
  const nextBonus = Math.min(10, currentBonus + 0.5);

  const handleBaduanjin = () => {
    vibrate(VIBRATION_PATTERNS.MEDIUM);
    if (playerStats.health < 3) {
      handleEventOption(undefined, '【无宁箭馆】体力不足，无法练习八段锦。');
      return;
    }

    handleEventOption({
      health: -3,
      flagsSet: { archery_baduanjin_bonus: nextBonus }
    }, `【无宁箭馆】你认真练习了八段锦。每日自动恢复体力额外增加 ${nextBonus.toFixed(1)}（上限 10）。`);
  };

  return (
    <div className="p-4 space-y-4 rounded-lg border shadow-sm bg-card text-card-foreground">
      <div className="flex gap-2 items-center pb-2 border-b">
        <Dumbbell className="text-teal-600" />
        <h2 className="text-xl font-bold">无宁箭馆</h2>
      </div>
      <p className="text-sm text-muted-foreground">修身强体之所，讲究气定神闲，心稳手准。</p>

      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={handleBaduanjin}
          disabled={playerStats.health < 3 || currentBonus >= 10}
          className="flex flex-col justify-center items-center p-4 rounded-lg border transition-all hover:bg-secondary disabled:opacity-50"
        >
          <span className="font-bold">八段锦</span>
          <span className="text-xs text-muted-foreground">-3体力 / 提升每日恢复 +0.5（上限10）</span>
          <span className="text-[10px] text-muted-foreground mt-1">当前加成：{currentBonus.toFixed(1)}</span>
        </button>
      </div>
    </div>
  );
};

