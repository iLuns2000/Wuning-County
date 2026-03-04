import React, { useState } from 'react';
import { X, Bird, Dumbbell, Flag, Trophy, AlertTriangle, Clock, Pencil, Check } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Pigeon, PigeonCondition, PigeonRaceType } from '@/types/game';

interface PigeonRaceModalProps {
  onClose: () => void;
}

const CONDITION_LABELS: Record<PigeonCondition, { text: string; className: string }> = {
  healthy:  { text: '健康',   className: 'text-green-600 bg-green-100 dark:bg-green-950/30 dark:text-green-400' },
  tired:    { text: '疲倦',   className: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-950/30 dark:text-yellow-400' },
  injured:  { text: '受伤',   className: 'text-red-600 bg-red-100 dark:bg-red-950/30 dark:text-red-400' },
  lost:     { text: '迷路',   className: 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400' },
};

const TRAIN_MODES: { mode: 'speed' | 'endurance' | 'homing'; label: string; stat: keyof Pigeon['stats']; cost: string }[] = [
  { mode: 'speed',     label: '速度训练', stat: 'speed',     cost: '-4体 -8文' },
  { mode: 'endurance', label: '耐力训练', stat: 'endurance', cost: '-5体 -10文' },
  { mode: 'homing',    label: '归巢训练', stat: 'homing',    cost: '-3体 -6文' },
];

function renderConditionTag(condition: PigeonCondition) {
  const c = CONDITION_LABELS[condition];
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${c.className}`}>
      {c.text}
    </span>
  );
}

function renderStatBar(label: string, value: number) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-10 text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-secondary">
        <div
          className="h-1.5 rounded-full bg-primary transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-6 text-right tabular-nums">{value}</span>
    </div>
  );
}

export const PigeonRaceModal: React.FC<PigeonRaceModalProps> = ({ onClose }) => {
  const {
    playerStats,
    dailyCounts,
    currentEvent,
    pigeons,
    pigeonRaceHistory,
    selectedPigeonId,
    buyPigeon,
    renamePigeon,
    trainPigeon,
    enterPigeonRace,
    selectPigeon,
  } = useGameStore();

  const [pendingAction, setPendingAction] = useState(false);
  // 金币不足提示
  const [showMoneyTip, setShowMoneyTip] = useState(false);
  // 改名状态：{ id, value }
  const [renaming, setRenaming] = useState<{ id: string; value: string } | null>(null);

  const selectedPigeon = pigeons.find(p => p.id === selectedPigeonId) ?? pigeons[0] ?? null;
  const raceUsedToday = (dailyCounts.pigeonRace || 0) >= 1;
  const isDisabled = !!currentEvent || pendingAction;

  const withDebounce = (fn: () => void) => {
    if (pendingAction) return;
    setPendingAction(true);
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

  const handleStartRename = (p: Pigeon) => {
    setRenaming({ id: p.id, value: p.name });
  };

  const handleConfirmRename = () => {
    if (!renaming) return;
    const trimmed = renaming.value.trim();
    if (trimmed) renamePigeon(renaming.id, trimmed);
    setRenaming(null);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleConfirmRename();
    if (e.key === 'Escape') setRenaming(null);
  };

  // Recent race history for selected pigeon
  const recentHistory = pigeonRaceHistory
    .filter(r => !selectedPigeon || r.pigeonId === selectedPigeon.id)
    .slice(0, 5);

  const weatherNames: Record<string, string> = {
    sunny: '晴', cloudy: '阴', rain_light: '小雨',
    rain_heavy: '大雨', snow_light: '小雪', snow_heavy: '大雪'
  };

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-start bg-black/50 overflow-y-auto p-4">
      <div className="relative w-full max-w-2xl rounded-xl border shadow-xl bg-card border-border mt-8 mb-8">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bird size={20} className="text-sky-500" />
            <h2 className="text-lg font-bold">赛鸽场</h2>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>💰 {playerStats.money} 文</span>
            <span className={raceUsedToday ? 'text-muted-foreground line-through' : 'text-primary'}>
              今日参赛：{raceUsedToday ? '已用' : '可参赛'}
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5 md:flex-row">
          {/* Left: Pigeon List */}
          <div className="flex flex-col gap-2 md:w-48 shrink-0">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-muted-foreground">鸽舍</h3>
              <div className="relative">
                <button
                  onClick={handleBuyPigeon}
                  disabled={isDisabled}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-50 ${
                    playerStats.money < 150
                      ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                  title="购买信鸽 (150文)"
                >
                  + 购鸽
                </button>
                {showMoneyTip && (
                  <div className="absolute right-0 top-full mt-1 z-10 whitespace-nowrap px-2 py-1 rounded-md text-xs bg-red-500 text-white shadow-lg animate-in fade-in slide-in-from-top-1">
                    金币不足，需 150 文
                  </div>
                )}
              </div>
            </div>

            {pigeons.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-dashed border-border text-muted-foreground text-sm text-center">
                <Bird size={28} className="opacity-40" />
                <p>鸽舍空空如也</p>
                <p className="text-xs">购鸽需 150 文</p>
              </div>
            ) : (
              pigeons.map(p => (
                <button
                  key={p.id}
                  onClick={() => selectPigeon(p.id)}
                  className={`flex flex-col gap-1 p-3 rounded-lg border text-left transition-all ${
                    (selectedPigeon?.id === p.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium truncate">{p.name}</span>
                    {renderConditionTag(p.condition)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    疲劳 {p.fatigue} · 胜{p.winCount}/{p.raceCount}场
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Right: Detail + Actions */}
          <div className="flex flex-col flex-1 gap-4 min-w-0">
            {!selectedPigeon ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm gap-2">
                <Bird size={36} className="opacity-30" />
                <p>选择一只信鸽</p>
              </div>
            ) : (
              <>
                {/* Pigeon Stats */}
                <div className="p-3 rounded-lg border border-border bg-secondary/20 space-y-1.5">
                  <div className="flex justify-between items-center mb-2">
                    {/* 改名区域 */}
                    {renaming?.id === selectedPigeon.id ? (
                      <div className="flex items-center gap-1 flex-1 mr-2">
                        <input
                          autoFocus
                          value={renaming.value}
                          onChange={e => setRenaming({ ...renaming, value: e.target.value })}
                          onKeyDown={handleRenameKeyDown}
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
                          onClick={() => handleStartRename(selectedPigeon)}
                          className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                          title="修改名字"
                        >
                          <Pencil size={12} />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                      {renderConditionTag(selectedPigeon.condition)}
                      {selectedPigeon.condition === 'injured' && selectedPigeon.injuredDaysLeft && (
                        <span className="flex items-center gap-1 text-red-500">
                          <Clock size={10} /> {selectedPigeon.injuredDaysLeft}天
                        </span>
                      )}
                    </div>
                  </div>
                  {renderStatBar('速度', selectedPigeon.stats.speed)}
                  {renderStatBar('耐力', selectedPigeon.stats.endurance)}
                  {renderStatBar('归巢', selectedPigeon.stats.homing)}
                  {renderStatBar('胆气', selectedPigeon.stats.courage)}
                  <div className="flex items-center gap-2 text-xs mt-1 pt-1 border-t border-border">
                    <span className="text-muted-foreground w-10 shrink-0">疲劳</span>
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

                {/* Training */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <Dumbbell size={12} /> 训练
                  </h4>
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
                        className="flex flex-col items-center gap-1 p-2 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50 transition-all text-center"
                      >
                        <span className="text-xs font-medium">{label}</span>
                        <span className="text-xs text-muted-foreground">{cost}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Race Entry */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <Flag size={12} /> 参赛（今日 {raceUsedToday ? '0' : '1'} 次可用）
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleEnterRace('sprint')}
                      disabled={
                        isDisabled || raceUsedToday ||
                        selectedPigeon.condition === 'injured' ||
                        selectedPigeon.condition === 'lost' ||
                        playerStats.money < 20
                      }
                      className="flex flex-col items-center gap-0.5 p-3 rounded-lg border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-400 disabled:opacity-50 transition-all"
                    >
                      <span className="text-sm font-semibold">短程飞行赛</span>
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
                      className="flex flex-col items-center gap-0.5 p-3 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-400 disabled:opacity-50 transition-all"
                    >
                      <span className="text-sm font-semibold">长程耐力赛</span>
                      <span className="text-xs opacity-80">报名费 35文</span>
                      <span className="text-xs opacity-70">奖励 130/70/30 文</span>
                    </button>
                  </div>
                </div>

                {/* Recent Race History */}
                {recentHistory.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                      <Trophy size={12} /> 近期战绩
                    </h4>
                    <div className="space-y-1">
                      {recentHistory.map((r, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center px-2 py-1.5 rounded text-xs bg-secondary/40"
                        >
                          <span className="text-muted-foreground">第{r.day}日 {r.raceType === 'sprint' ? '短程' : '长程'}</span>
                          <span className={r.rank === 1 ? 'font-bold text-yellow-500' : r.rank <= 3 ? 'text-primary' : 'text-muted-foreground'}>
                            第{r.rank}名
                          </span>
                          <span>{weatherNames[r.weather]}</span>
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
        </div>
      </div>
    </div>
  );
};
