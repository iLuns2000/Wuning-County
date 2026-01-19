import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Dices, Target, Trophy, Coins, Sparkles, ScrollText } from 'lucide-react';
import { LogPanel } from '@/components/LogPanel';

// Fortune Teller Component
const FortuneTeller: React.FC = () => {
  const { playerStats, dailyCounts, divineFortune } = useGameStore();

  return (
    <div className="p-4 space-y-4 rounded-lg border shadow-sm bg-card text-card-foreground">
      <div className="flex gap-2 items-center pb-2 border-b">
        <Sparkles className="text-purple-500" />
        <h2 className="text-xl font-bold">天机阁</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        "天机不可泄露..." 一位老者闭目养神，身前摆着签筒。<br/>
        费用：5 文/次。每日限一次。
      </p>

      <div className="flex flex-col items-center gap-4">
        <button
            onClick={divineFortune}
            disabled={dailyCounts.fortune > 0 || playerStats.money < 5}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
            <ScrollText size={20} />
            {dailyCounts.fortune > 0 ? '今日已算过' : '求签问卜 (5文)'}
        </button>
      </div>
    </div>
  );
};

// Gambling House Component
const GamblingHouse: React.FC = () => {
  const { playerStats, addLog, handleEventOption } = useGameStore();
  const [betAmount, setBetAmount] = useState<string>('10');
  const [lastResult, setLastResult] = useState<{ dice: number[], sum: number, win: boolean } | null>(null);

  const handleGamble = (choice: 'big' | 'small') => {
    const amount = parseInt(betAmount);
    if (isNaN(amount) || amount <= 0) {
      addLog('请输入有效的赌注金额！');
      return;
    }
    if (amount > playerStats.money) {
      addLog('囊中羞涩，没那么多钱！');
      return;
    }

    // 3d6 logic
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const d3 = Math.floor(Math.random() * 6) + 1;
    const sum = d1 + d2 + d3;
    const resultType = sum >= 11 ? 'big' : 'small';
    const isWin = choice === resultType;

    setLastResult({ dice: [d1, d2, d3], sum, win: isWin });

    if (isWin) {
      handleEventOption({ money: amount }, `【小司赌坊】买${choice === 'big' ? '大' : '小'}中了！掷出 ${d1}+${d2}+${d3}=${sum}点，赢了 ${amount} 文钱。`);
    } else {
      handleEventOption({ money: -amount }, `【小司赌坊】买${choice === 'big' ? '大' : '小'}输了... 掷出 ${d1}+${d2}+${d3}=${sum}点，损失 ${amount} 文钱。`);
    }
  };

  return (
    <div className="p-4 space-y-4 rounded-lg border shadow-sm bg-card text-card-foreground">
      <div className="flex gap-2 items-center pb-2 border-b">
        <Dices className="text-primary" />
        <h2 className="text-xl font-bold">小司赌坊</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        "买定离手！" 喧闹的赌坊里，骰子声此起彼伏。<br/>
        规则：三颗骰子总和 3-10 为小，11-18 为大。赔率 1:1。
      </p>

      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium">赌注:</span>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 max-w-[120px]"
            min="1"
            max={playerStats.money}
          />
          <span className="text-sm text-muted-foreground">文 (持有: {playerStats.money})</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleGamble('big')}
            disabled={playerStats.money <= 0}
            className="flex flex-col justify-center items-center p-6 rounded-lg border-2 transition-all border-primary/20 hover:bg-primary/10 hover:border-primary group"
          >
            <span className="mb-1 text-2xl font-bold transition-transform group-hover:scale-110">大</span>
            <span className="text-xs text-muted-foreground">11-18 点</span>
          </button>
          <button
            onClick={() => handleGamble('small')}
            disabled={playerStats.money <= 0}
            className="flex flex-col justify-center items-center p-6 rounded-lg border-2 transition-all border-primary/20 hover:bg-primary/10 hover:border-primary group"
          >
            <span className="mb-1 text-2xl font-bold transition-transform group-hover:scale-110">小</span>
            <span className="text-xs text-muted-foreground">3-10 点</span>
          </button>
        </div>

        {lastResult && (
          <div className={`p-3 rounded-md text-center font-medium animate-in fade-in zoom-in duration-300 ${lastResult.win ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
            <div className="flex gap-2 justify-center mb-1 text-lg">
              {lastResult.dice.map((d, i) => (
                <span key={i} className="flex justify-center items-center w-8 h-8 rounded border shadow-sm bg-background">
                  {d}
                </span>
              ))}
            </div>
            {lastResult.sum}点 {lastResult.sum >= 11 ? '大' : '小'} —— {lastResult.win ? '赢啦！' : '输了...'}
          </div>
        )}
      </div>
    </div>
  );
};

// Archery Range Component
const ArcheryRange: React.FC = () => {
  const { playerStats, handleEventOption } = useGameStore();
  const [shotResult, setShotResult] = useState<{ hit: boolean, message: string } | null>(null);
  const [consecutiveMisses, setConsecutiveMisses] = useState(0);

  const COST_MONEY = 10;
  const COST_HEALTH = 5;

  const handleShoot = () => {
    if (playerStats.money < COST_MONEY) {
      handleEventOption(undefined, '【箭坊】钱不够，老板不给弓箭。');
      return;
    }
    if (playerStats.health < COST_HEALTH) {
      handleEventOption(undefined, '【箭坊】你手臂酸软，拉不开弓了。');
      return;
    }

    // Hit chance: 0 ability = 0%, 100 ability = 80%
    // Formula: (ability / 100) * 0.8
    const maxChance = 0.8;
    const abilityFactor = Math.min(100, Math.max(0, playerStats.ability)) / 100;
    const hitChance = abilityFactor * maxChance;
    
    const isHit = Math.random() < hitChance;
    const rewardMoney = 20; // Double the cost reward
    const rewardRep = 2;

    if (isHit) {
      setShotResult({ hit: true, message: '正中靶心！' });
      setConsecutiveMisses(0);
      handleEventOption({
        money: -COST_MONEY + rewardMoney, // Net +10
        health: -COST_HEALTH,
        reputation: rewardRep
      }, `【箭坊】嗖的一声，正中靶心！赢得彩头 ${rewardMoney} 文，周围人一片叫好。`);
    } else {
      const newConsecutiveMisses = consecutiveMisses + 1;
      setConsecutiveMisses(newConsecutiveMisses);
      setShotResult({ hit: false, message: '脱靶了...' });
      
      let msg = `【箭坊】可惜，箭矢偏出了靶心。`;
      let reputationChange = 0;

      if (newConsecutiveMisses >= 3) {
        reputationChange = -5;
        msg = `【箭坊】连续三次脱靶，围观群众发出了嘘声，你的面子有点挂不住了。`;
        setConsecutiveMisses(0); // Reset after penalty
      }

      handleEventOption({
        money: -COST_MONEY,
        health: -COST_HEALTH,
        reputation: reputationChange
      }, msg);
    }
  };

  return (
    <div className="p-4 space-y-4 rounded-lg border shadow-sm bg-card text-card-foreground">
      <div className="flex gap-2 items-center pb-2 border-b">
        <Target className="text-primary" />
        <h2 className="text-xl font-bold">无宁建馆(馆主:关山)</h2>
      </div>
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>这里聚集了不少神射手。你可以花钱挑战射箭，射中靶心可赢取彩头。</p>
        <div className="flex gap-4 mt-2 text-xs">
          <span className="flex gap-1 items-center"><Coins size={12}/> 费用: {COST_MONEY}文/次</span>
          <span className="flex gap-1 items-center"><Trophy size={12}/> 奖励: {20}文 + {2}声望</span>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center py-4 space-y-4">
        <div className="flex relative justify-center items-center w-32 h-32">
            {/* Simple Target Visualization */}
            <div className="absolute w-32 h-32 bg-red-100 rounded-full border-4 border-red-500"></div>
            <div className="absolute w-24 h-24 bg-white rounded-full border-4 border-red-500"></div>
            <div className="absolute w-16 h-16 bg-red-100 rounded-full border-4 border-red-500"></div>
            <div className="absolute w-8 h-8 bg-red-500 rounded-full"></div>
            
            {shotResult && (
               <div className={`absolute text-2xl font-bold ${shotResult.hit ? 'text-green-600' : 'text-gray-500'} animate-in zoom-in duration-200`}>
                 {shotResult.hit ? '🎯' : '❌'}
               </div>
            )}
        </div>

        <div className="text-center">
          <p className="mb-1 text-sm font-medium">当前命中率: {Math.floor((Math.min(100, Math.max(0, playerStats.ability)) / 100 * 0.8) * 100)}%</p>
          <p className="text-xs text-muted-foreground">(取决于武学/能力值)</p>
        </div>

        <button
          onClick={handleShoot}
          disabled={playerStats.money < COST_MONEY || playerStats.health < COST_HEALTH}
          className="flex gap-2 justify-center items-center px-4 py-3 w-full max-w-xs font-bold rounded-lg transition-all bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Target size={18} />
          开弓射箭
        </button>
        
        {shotResult && (
           <p className={`text-sm font-bold ${shotResult.hit ? 'text-green-600' : 'text-muted-foreground'}`}>
             {shotResult.message}
           </p>
        )}
      </div>
    </div>
  );
};

export const Facilities: React.FC = () => {
  const navigate = useNavigate();
  const { logs } = useGameStore();

  return (
    <div className="flex justify-center p-4 min-h-screen bg-background">
      <div className="grid grid-cols-1 gap-6 w-full max-w-5xl md:grid-cols-2 md:h-[calc(100vh-2rem)]">
        
        {/* Left: Facilities List */}
        <div className="flex overflow-y-auto flex-col gap-4 mx-auto w-full max-w-md h-full md:max-w-none no-scrollbar">
          <header className="flex gap-4 items-center py-2 shrink-0">
            <button 
              onClick={() => navigate('/game')}
              className="p-2 rounded-full transition-colors hover:bg-secondary"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">游乐坊</h1>
          </header>

          <FortuneTeller />
          <GamblingHouse />
          <ArcheryRange />
        </div>

        {/* Right: Log Panel */}
        <div className="mx-auto w-full max-w-md h-64 md:h-full md:max-w-none">
          <LogPanel logs={logs} />
        </div>
      </div>
    </div>
  );
};
