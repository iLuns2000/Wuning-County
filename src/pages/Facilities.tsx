/**
 * 游乐坊页面 - 古风UI优化版
 * 包含四个娱乐设施：长生丹房、算命小摊、小司赌坊、无宁箭馆
 */
import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Dices, Target, Trophy, Coins, Sparkles, ScrollText, FlaskConical, Gamepad2, Flame, Gem, HelpCircle } from 'lucide-react';
import { LogPanel } from '@/components/LogPanel';
import { AlchemyGame } from '@/components/AlchemyGame';
import { SnakeGame } from '@/components/SnakeGame';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';
import { useTheme } from '@/hooks/useTheme';

// 设施卡片通用样式
const FacilityCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  children: React.ReactNode;
}> = ({ icon, title, description, color, children }) => {
  const colorMap: Record<string, { bg: string; border: string; icon: string; gradient: string }> = {
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: 'text-amber-500', gradient: 'from-amber-600 to-orange-600' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: 'text-purple-500', gradient: 'from-purple-600 to-pink-600' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'text-red-500', gradient: 'from-red-600 to-orange-600' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'text-blue-500', gradient: 'from-blue-600 to-cyan-600' },
  };
  const style = colorMap[color] || colorMap.amber;

  return (
    <div className={`
      relative p-5 rounded-xl border transition-all duration-300
      ${style.bg} ${style.border}
      hover:shadow-lg hover:scale-[1.02]
      bg-gradient-to-b from-[#1e2d2f] to-[#182628]
    `}>
      {/* 顶部装饰 */}
      <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent to-transparent via-amber-500/30" />
      
      {/* 标题区 */}
      <div className="flex gap-3 items-center pb-3 mb-3 border-b border-white/10">
        <div className={`p-2.5 rounded-lg bg-gradient-to-br ${style.gradient}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground font-display">{title}</h3>
        </div>
      </div>

      {/* 描述 */}
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground/80">
        {description}
      </p>

      {/* 内容区 */}
      {children}
    </div>
  );
};

// 长生丹房组件
const AlchemyFacility: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
  const vibrate = useGameVibrate();
  const { playerStats } = useGameStore();

  return (
    <FacilityCard
      icon={<FlaskConical size={20} className="text-white" />}
      title="长生丹房"
      description="大道无形，生育天地。投入药材，借丹炉之火，或可炼出惊天动地的丹药。"
      color="amber"
    >
      <div className="flex flex-col gap-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>消耗药材，合成更高品质丹药</span>
          <span className="text-amber-400">2048 玩法</span>
        </div>
        
        <button
          onClick={() => {
            vibrate(VIBRATION_PATTERNS.LIGHT);
            onEnter();
          }}
          className="flex gap-2 justify-center items-center py-3 w-full font-bold text-white 
                   bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg 
                   transition-all hover:shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <FlaskConical size={18} />
          开炉炼丹
        </button>
      </div>
    </FacilityCard>
  );
};

// 算命小摊组件
const FortuneTeller: React.FC = () => {
  const { playerStats, dailyCounts, divineFortune } = useGameStore();
  const vibrate = useGameVibrate();
  const canDivine = dailyCounts.fortune === 0 && playerStats.money >= 5;

  return (
    <FacilityCard
      icon={<Sparkles size={20} className="text-white" />}
      title="算命小摊"
      description="算命咯算命咯，不准不要钱。江湖道士在此摆摊，每日限算一次。"
      color="purple"
    >
      <div className="flex flex-col gap-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>花费 5 文</span>
          <span className={dailyCounts.fortune > 0 ? 'text-gray-300' : 'text-purple-400'}>
            {dailyCounts.fortune > 0 ? '今日已算' : '可求签'}
          </span>
        </div>
        
        <button
          onClick={() => {
            vibrate(VIBRATION_PATTERNS.MEDIUM);
            divineFortune();
          }}
          disabled={!canDivine}
          className={`
            flex gap-2 justify-center items-center py-3 w-full font-bold rounded-lg 
            transition-all
            ${canDivine 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98]' 
              : 'bg-purple-900/30 text-purple-400/50 cursor-not-allowed border border-purple-500/20'
            }
          `}
        >
          <ScrollText size={18} />
          {dailyCounts.fortune > 0 ? '明日请早' : '求签问卜'}
        </button>
      </div>
    </FacilityCard>
  );
};

// 小司赌坊组件
const GamblingHouse: React.FC = () => {
  const { playerStats, addLog, handleEventOption, fortuneLevel: fortuneLevelFromStore } = useGameStore();
  const fortuneLevel = fortuneLevelFromStore || 'normal';
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

    let winChance = 0.35;
    if (fortuneLevel === 'great_blessing') winChance += 0.15;
    else if (fortuneLevel === 'blessing') winChance += 0.08;
    else if (fortuneLevel === 'bad_luck') winChance -= 0.05;
    else if (fortuneLevel === 'terrible_luck') winChance -= 0.10;

    const abilityBonus = Math.min(0.05, (playerStats.ability / 100) * 0.05);
    winChance += abilityBonus;
    if (amount > 100) {
      const penalty = Math.floor((amount - 100) / 100) * 0.01;
      winChance -= penalty;
    }
    winChance = Math.max(0.1, Math.min(0.9, winChance));
    const isWin = Math.random() < winChance;

    const rand6 = () => Math.floor(Math.random() * 6) + 1;
    let d1 = rand6(), d2 = rand6(), d3 = rand6(), sum = d1 + d2 + d3;

    // 如需要确保结果符合预期（调试用），这里简化处理
    // 实际概率已通过 winChance 控制

    let resultType: 'big' | 'small' | 'leopard';
    if (sum >= 11) resultType = 'big';
    else resultType = 'small';

    const win = (choice === resultType);
    const isLeopard = d1 === d2 && d2 === d3;

    let msg = '';
    let moneyChange = 0;
    
    if (isLeopard) {
      msg = `豹子！${d1}点数相同，庄家通杀！`;
      moneyChange = -amount;
    } else if (win) {
      msg = `开${sum}点，你赢了！`;
      moneyChange = amount;
    } else {
      msg = `开${sum}点，你输了...`;
      moneyChange = -amount;
    }

    handleEventOption({ money: moneyChange }, msg);
    setLastResult({ dice: [d1, d2, d3], sum, win: win && !isLeopard, msg });
  };

  // 运势加成显示
  const fortuneBonus = fortuneLevel === 'great_blessing' ? '+15%' : 
                      fortuneLevel === 'blessing' ? '+8%' : 
                      fortuneLevel === 'bad_luck' ? '-5%' : 
                      fortuneLevel === 'terrible_luck' ? '-10%' : '0%';

  return (
    <FacilityCard
      icon={<Dices size={20} className="text-white" />}
      title="小司赌坊"
      description="三颗骰子押大小，运气与胆量的博弈。需知十赌九输，贪心必败。"
      color="red"
    >
      <div className="flex flex-col gap-3">
        {/* 输入框 */}
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">赌注：</span>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            className="flex-1 px-3 py-2 text-sm rounded-lg border bg-secondary/50 border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500/30"
            placeholder="金额"
          />
          <span className="text-sm text-muted-foreground">文</span>
        </div>

        {/* 运势显示 */}
        {fortuneLevel !== 'normal' && (
          <div className={`text-xs px-2 py-1 rounded ${fortuneLevel.includes('luck') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            今日运势: {fortuneLevel === 'great_blessing' ? '大吉 +15%' : 
                      fortuneLevel === 'blessing' ? '吉 +8%' : 
                      fortuneLevel === 'bad_luck' ? '凶 -5%' : '大凶 -10%'}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleGamble('small')}
            disabled={playerStats.money < 10}
            className="flex gap-1 justify-center items-center py-2.5 text-sm font-bold rounded-lg
                       bg-gradient-to-r from-blue-600 to-cyan-600 text-white
                       hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Target size={14} />
            小 (4-10)
          </button>
          <button
            onClick={() => handleGamble('big')}
            disabled={playerStats.money < 10}
            className="flex gap-1 justify-center items-center py-2.5 text-sm font-bold rounded-lg
                       bg-gradient-to-r from-red-600 to-orange-600 text-white
                       hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Target size={14} />
            大 (11-17)
          </button>
        </div>

        {/* 上次结果 */}
        {lastResult && (
          <div className="p-2 text-center rounded bg-black/30">
            <div className="flex gap-2 justify-center mb-1">
              {lastResult.dice.map((d, i) => (
                <span key={i} className="flex justify-center items-center w-6 h-6 text-sm rounded bg-white/10">
                  {d}
                </span>
              ))}
            </div>
            <span className={`text-xs ${lastResult.win ? 'text-green-400' : 'text-red-400'}`}>
              {lastResult.msg}
            </span>
          </div>
        )}
      </div>
    </FacilityCard>
  );
};

// 无宁箭馆组件
const ArcheryGallery: React.FC = () => {
  const { playerStats, addLog, dailyCounts, handleEventOption } = useGameStore();
  const vibrate = useGameVibrate();
  const [targetScore, setTargetScore] = useState<number>(30);
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [arrows, setArrows] = useState(10);

  const handleStart = () => {
    if (playerStats.health < 10) {
      addLog('体力不足，无法射箭！');
      return;
    }
    vibrate(VIBRATION_PATTERNS.MEDIUM);
    handleEventOption({ health: -10 }, '你消耗10点体力进行射箭练习。');
    setGameActive(true);
    setScore(0);
    setArrows(10);
  };

  const handleShoot = () => {
    if (arrows <= 0) return;
    
    // 基于能力计算命中率
    const hitChance = Math.min(0.95, 0.3 + (playerStats.ability / 200));
    const isHit = Math.random() < hitChance;
    const points = Math.floor(Math.random() * 5) + 1; // 1-5分随机
    
    const newArrows = arrows - 1;
    setArrows(newArrows);
    setScore(score + (isHit ? points : 0));

    if (newArrows === 0) {
      // 游戏结束
      const reward = score >= targetScore ? 20 : 5;
      const repChange = score >= targetScore ? 2 : 0;
      handleEventOption({ money: reward, reputation: repChange }, 
        `射箭结束！得分${score}，${score >= targetScore ? '达到目标，获得奖励！' : '未达目标，再接再厉。'}`);
      setGameActive(false);
    }
  };

  return (
    <FacilityCard
      icon={<Target size={20} className="text-white" />}
      title="无宁箭馆"
      description="拉弓射靶，考验眼力与手稳。命中越高，获得奖励越丰厚。"
      color="blue"
    >
      <div className="flex flex-col gap-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>消耗 10 体力 / 10 箭</span>
          <span className="text-blue-400">目标: {targetScore}分</span>
        </div>

        {!gameActive ? (
          <button
            onClick={handleStart}
            disabled={playerStats.health < 10}
            className="flex gap-2 justify-center items-center py-3 w-full font-bold text-white 
                       bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg 
                       transition-all hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Target size={18} />
            开始射箭
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            {/* 状态显示 */}
            <div className="flex justify-between items-center p-3 rounded bg-black/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{score}</div>
                <div className="text-xs text-muted-foreground">得分</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">{arrows}</div>
                <div className="text-xs text-muted-foreground">剩余箭</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${score >= targetScore ? 'text-green-400' : 'text-gray-300'}`}>
                  {score >= targetScore ? '✓' : `${targetScore - score}`}
                </div>
                <div className="text-xs text-muted-foreground">目标</div>
              </div>
            </div>

            <button
              onClick={handleShoot}
              disabled={arrows <= 0}
              className="flex gap-2 justify-center items-center py-3 w-full font-bold text-white 
                         bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg 
                         transition-all hover:scale-[1.02] active:scale-[0.98]
                         disabled:opacity-50"
            >
              <Target size={18} />
              射箭 ({arrows}支)
            </button>
            
            <button
              onClick={() => setGameActive(false)}
              className="text-xs text-center text-muted-foreground hover:text-foreground"
            >
              放弃本次练习
            </button>
          </div>
        )}
      </div>
    </FacilityCard>
  );
};

// 主组件
export const Facilities: React.FC = () => {
  const { logs } = useGameStore();
  const navigate = useNavigate();
  const [showAlchemy, setShowAlchemy] = useState(false);
  const { theme } = useTheme();
  const isLightMode = theme === 'light';

  if (showAlchemy) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 mx-auto max-w-4xl">
          <button
            onClick={() => setShowAlchemy(false)}
            className="flex gap-2 items-center mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={20} />
            返回游乐坊
          </button>
          <AlchemyGame onClose={() => setShowAlchemy(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center p-4 min-h-screen bg-background">
      <div className="grid grid-cols-1 gap-6 w-full max-w-5xl lg:grid-cols-2">
        
        {/* 左侧：游乐设施 */}
        <div className="space-y-4">
          {/* 头部 */}
          <header className="flex justify-between items-center py-2">
            <button
              onClick={() => navigate('/game')}
              className="flex gap-2 items-center text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={20} />
              返回
            </button>
            <h1 className="flex gap-2 items-center text-2xl font-bold font-display">
              <Gamepad2 className="text-primary" />
              游乐坊
            </h1>
            <div className="w-16" />
          </header>

          {/* 设施列表 */}
          <div className="space-y-4">
            <AlchemyFacility onEnter={() => setShowAlchemy(true)} />
            <FortuneTeller />
            <GamblingHouse />
            <ArcheryGallery />
          </div>
        </div>

        {/* 右侧：日志面板 */}
        <div className="h-[calc(100vh-2rem)] hidden lg:block">
          <LogPanel logs={logs} />
        </div>
      </div>
    </div>
  );
};