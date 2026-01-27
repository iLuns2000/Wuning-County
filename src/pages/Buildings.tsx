import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Hammer, Sword } from 'lucide-react';
import { LogPanel } from '@/components/LogPanel';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

// Blacksmith Shop Component
const BlacksmithShop: React.FC = () => {
  const { playerStats, handleEventOption, flags } = useGameStore();
  const vibrate = useGameVibrate();

  const handleStrikeIron = () => {
    vibrate(VIBRATION_PATTERNS.MEDIUM);
    if (playerStats.health < 10) {
      handleEventOption(undefined, '【豆沙铁匠铺】体力不足，无法打铁。');
      return;
    }

    const currentCount = (flags['blacksmith_count'] || 0) + 1;
    
    handleEventOption({
        health: -10,
        flagsSet: { blacksmith_count: currentCount }
    }, `【豆沙铁匠铺】你挥汗如雨，叮当打铁。（累计打铁 ${currentCount} 次）`);
  };

  const handleLearnSpear = () => {
     vibrate(VIBRATION_PATTERNS.MEDIUM);
     if (playerStats.health < 10) {
      handleEventOption(undefined, '【豆沙铁匠铺】体力不足，无法练枪。');
      return;
    }

    const currentCount = (flags['spear_count'] || 0) + 1;
    
    handleEventOption({
        health: -10,
        flagsSet: { spear_count: currentCount }
    }, `【豆沙铁匠铺】你舞动长枪，寒芒点点。（累计练枪 ${currentCount} 次）`);
  };

  return (
    <div className="p-4 space-y-4 rounded-lg border shadow-sm bg-card text-card-foreground">
      <div className="flex gap-2 items-center pb-2 border-b">
        <Hammer className="text-gray-600" />
        <h2 className="text-xl font-bold">豆沙铁匠铺</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        炉火纯青，百炼成钢。这里不仅可以打造兵器，还能切磋武艺。
      </p>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleStrikeIron}
          disabled={playerStats.health < 10}
          className="flex flex-col justify-center items-center p-4 rounded-lg border transition-all hover:bg-secondary disabled:opacity-50"
        >
          <Hammer className="mb-2" />
          <span className="font-bold">打铁</span>
          <span className="text-xs text-muted-foreground">消耗 10 体力</span>
          <span className="text-xs text-muted-foreground">累计: {flags['blacksmith_count'] || 0}</span>
        </button>

        <button
          onClick={handleLearnSpear}
          disabled={playerStats.health < 10}
          className="flex flex-col justify-center items-center p-4 rounded-lg border transition-all hover:bg-secondary disabled:opacity-50"
        >
          <Sword className="mb-2" />
          <span className="font-bold">学枪</span>
          <span className="text-xs text-muted-foreground">消耗 10 体力</span>
           <span className="text-xs text-muted-foreground">累计: {flags['spear_count'] || 0}</span>
        </button>
      </div>
    </div>
  );
};

export const Buildings: React.FC = () => {
  const navigate = useNavigate();
  const { logs } = useGameStore();
  const vibrate = useGameVibrate();

  return (
    <div className="flex justify-center p-4 min-h-screen bg-background">
      <div className="grid grid-cols-1 gap-6 w-full max-w-5xl md:grid-cols-2 md:h-[calc(100vh-2rem)]">
        
        {/* Left: Buildings List */}
        <div className="flex overflow-y-auto flex-col gap-4 mx-auto w-full max-w-md h-full md:max-w-none no-scrollbar">
          <header className="flex gap-4 items-center py-2 shrink-0">
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                navigate('/game');
              }}
              className="p-2 rounded-full transition-colors hover:bg-secondary"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">建筑阁</h1>
          </header>

          <BlacksmithShop />
          
          {/* Future buildings can be added here */}
          
        </div>

        {/* Right: Log Panel */}
        <div className="mx-auto w-full max-w-md h-64 md:h-full md:max-w-none">
          <LogPanel logs={logs} />
        </div>
      </div>
    </div>
  );
};
