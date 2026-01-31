import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Dices, Target, Trophy, Coins, Sparkles, ScrollText, FlaskConical } from 'lucide-react';
import { LogPanel } from '@/components/LogPanel';
import { AlchemyGame } from '@/components/AlchemyGame';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

// Alchemy Facility Component
const AlchemyFacility: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
  const vibrate = useGameVibrate();
  
  return (
    <div className="p-4 space-y-4 rounded-lg border shadow-sm bg-card text-card-foreground">
      <div className="flex gap-2 items-center pb-2 border-b">
        <FlaskConical className="text-amber-600" />
        <h2 className="text-xl font-bold">长生丹房</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        "大道无形，生育天地；大道无情，运行日月。" <br/>
        这里有一口古老的丹炉，投入药材，或许能炼出惊世骇俗的丹药。
      </p>
      
      <div className="flex flex-col gap-4 items-center">
         <button
            onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                onEnter();
            }}
            className="flex gap-2 justify-center items-center py-3 w-full font-bold text-white bg-amber-600 rounded-lg transition-all hover:bg-amber-700"
        >
            <FlaskConical size={20} />
            开炉炼丹 (小游戏)
        </button>
      </div>
    </div>
  );
};


// Fortune Teller Component
const FortuneTeller: React.FC = () => {
  const { playerStats, dailyCounts, divineFortune } = useGameStore();
  const vibrate = useGameVibrate();

  return (
    <div className="p-4 space-y-4 rounded-lg border shadow-sm bg-card text-card-foreground">
      <div className="flex gap-2 items-center pb-2 border-b">
        <Sparkles className="text-purple-500" />
        <h2 className="text-xl font-bold">算命小摊</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        "算命咯算命咯，不准不要钱"<br/> 一位手持招牌背着破口袋的江湖道士在茶馆面前晃悠吆喝<br/>
        费用：5 文/次。每日限一次。
      </p>

      <div className="flex flex-col gap-4 items-center">
        <button
            onClick={() => {
                vibrate(VIBRATION_PATTERNS.MEDIUM);
                divineFortune();
            }}
            disabled={dailyCounts.fortune > 0 || playerStats.money < 5}
            className="flex gap-2 justify-center items-center py-3 w-full text-white bg-purple-600 rounded-lg transition-all hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
  const { playerStats, addLog, handleEventOption, fortuneLevel } = useGameStore();
  const [betAmount, setBetAmount] = useState<string>('10');
  const [lastResult, setLastResult] = useState<{ dice: number[], sum: number, win: boolean, msg?: string } | null>(null);
  const vibrate = useGameVibrate();

  const handleGamble = (choice: 'big' | 'small') => {
    vibrate(VIBRATION_PATTERNS.MEDIUM);
    const amount = parseInt(betAmount);
    if (isNaN(amount) || amount <= 0) {
      addLog('请输入有效的赌注金额！');
      return;
    }
    if (amount > playerStats.money) {
      addLog('囊中羞涩，没那么多钱！');
      return;
    }

    // --- New Gambling Logic ---
    // 1. Base win rate: 35% (User requested)
    let winChance = 0.35;

    // 2. Fortune Modifier
    if (fortuneLevel === 'great_blessing') winChance += 0.15;
    else if (fortuneLevel === 'blessing') winChance += 0.08;
    else if (fortuneLevel === 'bad_luck') winChance -= 0.05;
    else if (fortuneLevel === 'terrible_luck') winChance -= 0.10;

    // 3. Ability Modifier (Cheating/Skill)
    // High ability can slightly increase odds (simulating observation/hearing dice)
    // But very low ability might decrease it? No, keep it positive bonus.
    // Max +5% from ability (at 100 ability)
    const abilityBonus = Math.min(0.05, (playerStats.ability / 100) * 0.05);
    winChance += abilityBonus;

    // 4. Black-hearted Banker Modifier (High stakes penalty)
    // Base 100, -1% win rate for every additional 100 bet
    if (amount > 100) {
        const penalty = Math.floor((amount - 100) / 100) * 0.01;
        winChance -= penalty;
        // console.log(`Bet: ${amount}, Penalty: ${penalty}, WinChance: ${winChance}`);
    }

    // Clamp win chance
    winChance = Math.max(0.1, Math.min(0.9, winChance));

    // Determine Win/Loss first based on probability
    const isWin = Math.random() < winChance;

    // Generate Dice to match result
    // Dealer Mechanic: "Leopard" (Triple) counts as Loss for player usually, but let's keep it simple:
    // If win, generate consistent dice. If loss, generate consistent dice.
    // Also need to respect "Big" (11-17) / "Small" (4-10). 
    // Note: 3 and 18 are usually Triples (111, 666) which are house wins in some rules, 
    // but here we just map sums.
    
    let d1, d2, d3, sum;
    let resultType: 'big' | 'small' | 'leopard'; // leopard is house win

    // Helper to generate random int
    const rand6 = () => Math.floor(Math.random() * 6) + 1;

    // We need to generate dice that match the outcome (Win/Loss) AND the player's choice.
    // However, pure random dice generation is the "physics". 
    // The "Probability" requested (40% win) implies the game is rigged or luck-based beyond physics.
    // So we generate dice repeatedly until they match the desired outcome? 
    // Or we just fake the dice? Let's generate valid dice.

    let attempts = 0;
    while (true) {
        attempts++;
        d1 = rand6();
        d2 = rand6();
        d3 = rand6();
        sum = d1 + d2 + d3;
        
        // Leopard check (House takes all usually) - 3 of a kind
        const isLeopard = d1 === d2 && d2 === d3;
        
        if (isLeopard) {
            resultType = 'leopard';
            // Leopard is always a loss for simple Big/Small bets
            if (!isWin) break; // If we are supposed to lose, Leopard is a valid outcome
            // If we are supposed to win, we can't accept Leopard, retry
        } else {
            resultType = sum >= 11 ? 'big' : 'small';
            
            if (isWin) {
                if (resultType === choice) break; // Match!
            } else {
                if (resultType !== choice) break; // Mismatch (Loss)!
            }
        }
        
        // Safety break to prevent infinite loops (though unlikely)
        if (attempts > 100) {
            // Fallback to pure random if stuck
             break; 
        }
    }
    
    // Recalculate isWin based on actual dice (in case we hit safety break)
    // and handle Leopard explicitly
    const finalIsLeopard = d1 === d2 && d2 === d3;
    const finalResultType = sum >= 11 ? 'big' : 'small';
    const finalIsWin = !finalIsLeopard && finalResultType === choice;

    setLastResult({ dice: [d1, d2, d3], sum, win: finalIsWin });

    let logMsg = '';
    if (finalIsWin) {
      vibrate(VIBRATION_PATTERNS.SUCCESS);
      logMsg = `【小司赌坊】买${choice === 'big' ? '大' : '小'}中了！掷出 ${d1}+${d2}+${d3}=${sum}点，赢了 ${amount} 文钱。`;
      handleEventOption({ money: amount }, logMsg);
    } else {
      vibrate(VIBRATION_PATTERNS.MEDIUM); // Failure vibration
      if (finalIsLeopard) {
          logMsg = `【小司赌坊】豹子通吃！掷出 ${d1}+${d2}+${d3} (${d1}围骰)，庄家收走所有筹码，损失 ${amount} 文钱。`;
      } else {
          logMsg = `【小司赌坊】买${choice === 'big' ? '大' : '小'}输了... 掷出 ${d1}+${d2}+${d3}=${sum}点，损失 ${amount} 文钱。`;
      }
      handleEventOption({ money: -amount }, logMsg);
    }
  };

  // Calculate current win rate for display (educational/transparency)
  let currentWinRate = 30;
  if (fortuneLevel === 'great_blessing') currentWinRate += 15;
  else if (fortuneLevel === 'blessing') currentWinRate += 8;
  else if (fortuneLevel === 'bad_luck') currentWinRate -= 5;
  else if (fortuneLevel === 'terrible_luck') currentWinRate -= 10;
  currentWinRate += Math.floor(Math.min(0.05, (playerStats.ability / 100) * 0.05) * 100);
  currentWinRate = Math.max(10, Math.min(90, currentWinRate));

  return (
    <div className="p-4 space-y-4 rounded-lg border shadow-sm bg-card text-card-foreground">
      <div className="flex gap-2 items-center pb-2 border-b">
        <Dices className="text-primary" />
        <h2 className="text-xl font-bold">小司赌坊</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        {playerStats.money <= 0 
          ? "快走 快走 别在这晃悠 一个铜板都没有 嘘"
          : "来来来都押上 六点晃起我坐庄"
        }
        <br/>
        {/* <span className="text-xs opacity-80">当前胜率估算: 约{currentWinRate}% (受运势与能力影响)</span> */}
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
            <span className="text-xs text-muted-foreground">11-17 点</span>
          </button>
          <button
            onClick={() => handleGamble('small')}
            disabled={playerStats.money <= 0}
            className="flex flex-col justify-center items-center p-6 rounded-lg border-2 transition-all border-primary/20 hover:bg-primary/10 hover:border-primary group"
          >
            <span className="mb-1 text-2xl font-bold transition-transform group-hover:scale-110">小</span>
            <span className="text-xs text-muted-foreground">4-10 点</span>
          </button>
        </div>

        {lastResult && (
          <div className={`p-3 rounded-md text-center font-medium animate-in fade-in zoom-in duration-300 ${lastResult.win ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
            <div className="flex gap-2 justify-center mb-1 text-lg">
              {lastResult.dice.map((d, i) => (
                <span key={i} className="flex justify-center items-center w-8 h-8 rounded border shadow-sm bg-background text-foreground">
                  {d}
                </span>
              ))}
            </div>
            {/* Logic to display result text correctly including Leopard */}
            {lastResult.dice[0] === lastResult.dice[1] && lastResult.dice[1] === lastResult.dice[2] 
                ? `豹子 (${lastResult.sum}点)` 
                : `${lastResult.sum}点 ${lastResult.sum >= 11 ? '大' : '小'}`
            } 
            —— {lastResult.win ? '赢啦！' : '输了...'}
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
  const vibrate = useGameVibrate();

  const COST_MONEY = 10;
  const COST_HEALTH = 5;

  const handleShoot = () => {
    vibrate(VIBRATION_PATTERNS.MEDIUM);
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
      vibrate(VIBRATION_PATTERNS.SUCCESS);
      setShotResult({ hit: true, message: '正中靶心！' });
      setConsecutiveMisses(0);
      handleEventOption({
        money: -COST_MONEY + rewardMoney, // Net +10
        health: -COST_HEALTH,
        reputation: rewardRep
      }, `【箭坊】嗖的一声，正中靶心！赢得彩头 ${rewardMoney} 文，周围人一片叫好。`);
    } else {
      vibrate(VIBRATION_PATTERNS.MEDIUM); // Miss vibration
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
        <h2 className="text-xl font-bold">无宁箭馆(馆主:关山)</h2>
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
  const [showAlchemy, setShowAlchemy] = useState(false);
  const vibrate = useGameVibrate();

  return (
    <div className="flex justify-center p-4 min-h-screen bg-background">
      <div className="grid grid-cols-1 gap-6 w-full max-w-5xl md:grid-cols-2 md:h-[calc(100vh-2rem)]">
        
        {/* Left: Facilities List */}
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
            <h1 className="text-xl font-bold">游乐坊</h1>
          </header>

          <FortuneTeller />
          <AlchemyFacility onEnter={() => setShowAlchemy(true)} />
          <GamblingHouse />
          <ArcheryRange />
        </div>

        {/* Right: Log Panel */}
        <div className="mx-auto w-full max-w-md h-64 md:h-full md:max-w-none">
          <LogPanel logs={logs} />
        </div>
      </div>
      
      {showAlchemy && <AlchemyGame onClose={() => setShowAlchemy(false)} />}
    </div>
  );
};
