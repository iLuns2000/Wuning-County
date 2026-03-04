import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bird, Dumbbell, Flag, Trophy, AlertTriangle, Clock, Pencil, Check } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { LogPanel } from '@/components/LogPanel';
import { Pigeon, PigeonCondition, PigeonRaceType } from '@/types/game';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

const CONDITION_LABELS: Record<PigeonCondition, { text: string; className: string }> = {
  healthy: { text: '健康', className: 'text-green-600 bg-green-100 dark:bg-green-950/30 dark:text-green-400' },
  tired:   { text: '疲倦', className: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-950/30 dark:text-yellow-400' },
  injured: { text: '受伤', className: 'text-red-600 bg-red-100 dark:bg-red-950/30 dark:text-red-400' },
  lost:    { text: '迷路', className: 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400' },
};

const TRAIN_MODES: { mode: 'speed' | 'endurance' | 'homing'; label: string; cost: string }[] = [
  { mode: 'speed',     label: '速度训练', cost: '-4体 -8文' },
  { mode: 'endurance', label: '耐力训练', cost: '-5体 -10文' },
  { mode: 'homing',    label: '归巢训练', cost: '-3体 -6文' },
];

function ConditionTag({ condition }: { condition: PigeonCondition }) {
  const c = CONDITION_LABELS[condition];
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full shrink-0 ${c.className}`}>
      {c.text}
    </span>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-10 text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-secondary">
        <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${value}%` }} />
      </div>
      <span className="w-6 text-right tabular-nums">{value}</span>
    </div>
  );
}

const weatherNames: Record<string, string> = {
  sunny: '晴', cloudy: '阴', rain_light: '小雨',
  rain_heavy: '大雨', snow_light: '小雪', snow_heavy: '大雪',
};

export const PigeonRace: React.FC = () => {
  const navigate = useNavigate();
  const vibrate = useGameVibrate();

  const {
    playerStats,
    dailyCounts,
    currentEvent,
    pigeons,
    pigeonRaceHistory,
    selectedPigeonId,
    logs,
    buyPigeon,
    renamePigeon,
    trainPigeon,
    enterPigeonRace,
    selectPigeon,
  } = useGameStore();

  const [pendingAction, setPendingAction] = useState(false);
  const [showMoneyTip, setShowMoneyTip] = useState(false);
  const [renaming, setRenaming] = useState<{ id: string; value: string } | null>(null);

  const selectedPigeon = pigeons.find(p => p.id === selectedPigeonId) ?? pigeons[0] ?? null;
  const raceUsedToday = (dailyCounts.pigeonRace || 0) >= 1;
  const isDisabled = !!currentEvent || pendingAction;

  const withDebounce = (fn: () => void) => {
    if (pendingAction) return;
    setPendingAction(true);
    vibrate(VIBRATION_PATTERNS.LIGHT);
    fn();
    setTimeout(() => setPendingAction(false), 400);
  };

  const handleBuyPigeon = () => {
    if (playerStats.money < 150) {
      setShowMoneyTip(true);
      setTimeout(() => setShowMoneyTip(false), 2000);
      return;
    }
    withDebounce(() => buyPigeon());
  };

  const handleTrain = (mode: 'speed' | 'endurance' | 'homing') => {
    if (!selectedPigeon) return;
    withDebounce(() => trainPigeon(selectedPigeon.id, mode));
  };

  const handleEnterRace = (type: PigeonRaceType) => {
    if (!selectedPigeon) return;
    withDebounce(() => enterPigeonRace(selectedPigeon.id, type));
  };

  const handleConfirmRename = () => {
    if (!renaming) return;
    const trimmed = renaming.value.trim();
    if (trimmed) renamePigeon(renaming.id, trimmed);
    setRenaming(null);
  };

  const recentHistory = pigeonRaceHistory
    .filter(r => !selectedPigeon || r.pigeonId === selectedPigeon.id)
    .slice(0, 5);

  return (
    <div className="flex justify-center p-4 min-h-screen bg-background">
      <div className="grid grid-cols-1 gap-6 w-full max-w-5xl md:grid-cols-2 md:h-[calc(100vh-2rem)]">

        {/* Left: Main Content */}
        <div className="flex overflow-y-auto flex-col gap-4 mx-auto w-full max-w-md h-full md:max-w-none no-scrollbar">

          {/* Header */}
          <header className="flex gap-3 items-center py-2 shrink-0">
            <button
              onClick={() => { vibrate(VIBRATION_PATTERNS.LIGHT); navigate('/game'); }}
              className="p-2 rounded-full transition-colors hover:bg-secondary"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Bird size={22} className="text-sky-500" />
              <h1 className="text-xl font-bold">赛鸽场</h1>
            </div>
          </header>

          {/* 场地描述 */}
          <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/60 dark:border-sky-800 dark:bg-sky-950/20">
            <p className="text-sm text-sky-800 dark:text-sky-300 leading-relaxed">
              无宁县有很多鸽子，他们不按时交稿，不按时准备节目，不按时交节目，当你靠近鸽舍的时候，你就能听到咕咕咕的声音~
            </p>
          </div>

          {/* 状态栏 */}
          <div className="flex justify-between items-center px-1 text-sm text-muted-foreground">
            <span>💰 {playerStats.money} 文</span>
            <span className={raceUsedToday ? 'line-through' : 'text-primary font-medium'}>
              今日参赛：{raceUsedToday ? '已用' : '可参赛'}
            </span>
          </div>

          {/* 鸽舍 + 购鸽 */}
          <div className="p-4 space-y-3 rounded-xl border border-border bg-card">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-muted-foreground">鸽舍</h2>
              <div className="relative">
                <button
                  onClick={handleBuyPigeon}
                  disabled={isDisabled}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                    playerStats.money < 150
                      ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-950/30 dark:text-red-400'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  + 购鸽（150文）
                </button>
                {showMoneyTip && (
                  <div className="absolute right-0 top-full mt-1 z-10 whitespace-nowrap px-2 py-1 rounded-md text-xs bg-red-500 text-white shadow-lg animate-in fade-in slide-in-from-top-1">
                    金币不足，需 150 文
                  </div>
                )}
              </div>
            </div>

            {pigeons.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground text-sm text-center">
                <Bird size={32} className="opacity-30" />
                <p>鸽舍空空如也，购鸽需 150 文</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {pigeons.map(p => (
                  <button
                    key={p.id}
                    onClick={() => selectPigeon(p.id)}
                    className={`flex flex-col gap-1 p-3 rounded-lg border text-left transition-all ${
                      selectedPigeon?.id === p.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background hover:border-primary/40'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium truncate">{p.name}</span>
                      <ConditionTag condition={p.condition} />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      疲劳 {p.fatigue} · 胜 {p.winCount}/{p.raceCount} 场
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 选中鸽子详情 */}
          {selectedPigeon && (
            <>
              {/* 属性卡 */}
              <div className="p-4 space-y-2 rounded-xl border border-border bg-card">
                {/* 名字 + 改名 */}
                <div className="flex justify-between items-center mb-1">
                  {renaming?.id === selectedPigeon.id ? (
                    <div className="flex items-center gap-1 flex-1 mr-2">
                      <input
                        autoFocus
                        value={renaming.value}
                        onChange={e => setRenaming({ ...renaming, value: e.target.value })}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleConfirmRename();
                          if (e.key === 'Escape') setRenaming(null);
                        }}
                        onBlur={handleConfirmRename}
                        maxLength={12}
                        className="flex-1 min-w-0 text-sm font-semibold bg-transparent border-b border-primary outline-none px-0.5"
                      />
                      <button
                        onMouseDown={e => { e.preventDefault(); handleConfirmRename(); }}
                        className="p-0.5 text-primary hover:text-primary/80"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{selectedPigeon.name}</span>
                      <button
                        onClick={() => setRenaming({ id: selectedPigeon.id, value: selectedPigeon.name })}
                        className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                        title="修改名字"
                      >
                        <Pencil size={12} />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 shrink-0">
                    <ConditionTag condition={selectedPigeon.condition} />
                    {selectedPigeon.condition === 'injured' && selectedPigeon.injuredDaysLeft && (
                      <span className="flex items-center gap-1 text-xs text-red-500">
                        <Clock size={10} /> {selectedPigeon.injuredDaysLeft}天
                      </span>
                    )}
                  </div>
                </div>
                <StatBar label="速度" value={selectedPigeon.stats.speed} />
                <StatBar label="耐力" value={selectedPigeon.stats.endurance} />
                <StatBar label="归巢" value={selectedPigeon.stats.homing} />
                <StatBar label="胆气" value={selectedPigeon.stats.courage} />
                {/* 疲劳条 */}
                <div className="flex items-center gap-2 text-xs pt-1 border-t border-border">
                  <span className="w-10 text-muted-foreground shrink-0">疲劳</span>
                  <div className="flex-1 h-1.5 rounded-full bg-secondary">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        selectedPigeon.fatigue > 70 ? 'bg-red-500' :
                        selectedPigeon.fatigue > 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${selectedPigeon.fatigue}%` }}
                    />
                  </div>
                  <span className="w-6 text-right tabular-nums">{selectedPigeon.fatigue}</span>
                </div>
                {selectedPigeon.fatigue > 70 && (
                  <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={11} /> 疲劳过高，训练可能受伤
                  </div>
                )}
              </div>

              {/* 训练 */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                  <Dumbbell size={14} /> 训练
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {TRAIN_MODES.map(({ mode, label, cost }) => (
                    <button
                      key={mode}
                      onClick={() => handleTrain(mode)}
                      disabled={
                        isDisabled ||
                        selectedPigeon.condition === 'injured' ||
                        selectedPigeon.condition === 'lost'
                      }
                      className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border bg-background hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50 transition-all text-center"
                    >
                      <span className="text-xs font-medium">{label}</span>
                      <span className="text-xs text-muted-foreground">{cost}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 参赛 */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                  <Flag size={14} /> 参赛（今日 {raceUsedToday ? '0' : '1'} 次可用）
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleEnterRace('sprint')}
                    disabled={
                      isDisabled || raceUsedToday ||
                      selectedPigeon.condition === 'injured' ||
                      selectedPigeon.condition === 'lost' ||
                      playerStats.money < 20
                    }
                    className="flex flex-col items-center gap-1 p-4 rounded-xl border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-400 disabled:opacity-50 transition-all"
                  >
                    <span className="text-sm font-bold">短程飞行赛</span>
                    <span className="text-xs opacity-80">报名费 20文</span>
                    <span className="text-xs opacity-70">奖励 80/45/20 文</span>
                  </button>
                  <button
                    onClick={() => handleEnterRace('endurance')}
                    disabled={
                      isDisabled || raceUsedToday ||
                      selectedPigeon.condition === 'injured' ||
                      selectedPigeon.condition === 'lost' ||
                      playerStats.money < 35
                    }
                    className="flex flex-col items-center gap-1 p-4 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-400 disabled:opacity-50 transition-all"
                  >
                    <span className="text-sm font-bold">长程耐力赛</span>
                    <span className="text-xs opacity-80">报名费 35文</span>
                    <span className="text-xs opacity-70">奖励 130/70/30 文</span>
                  </button>
                </div>
              </div>

              {/* 近期战绩 */}
              {recentHistory.length > 0 && (
                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                    <Trophy size={14} /> 近期战绩
                  </h3>
                  <div className="space-y-1">
                    {recentHistory.map((r, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center px-3 py-2 rounded-lg text-xs bg-secondary/40"
                      >
                        <span className="text-muted-foreground">第{r.day}日 {r.raceType === 'sprint' ? '短程' : '长程'}</span>
                        <span className={r.rank === 1 ? 'font-bold text-yellow-500' : r.rank <= 3 ? 'text-primary' : 'text-muted-foreground'}>
                          第{r.rank}名
                        </span>
                        <span>{weatherNames[r.weather] ?? r.weather}</span>
                        <span className={r.rewardMoney > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                          {r.rewardMoney > 0 ? `+${r.rewardMoney}文` : '无奖'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Log Panel */}
        <div className="mx-auto w-full max-w-md h-64 md:h-full md:max-w-none">
          <LogPanel logs={logs} />
        </div>
      </div>
    </div>
  );
};
