import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getDebuffConfig } from '@/data/debuffs';
import { ActiveDebuff } from '@/types/game';
import { AlertTriangle, Flame, Skull, ChevronDown, ChevronUp } from 'lucide-react';

// 严重程度颜色
const severityStyle = {
  minor: { border: 'border-yellow-500/60', bg: 'bg-yellow-950/40', icon: 'text-yellow-400', badge: 'bg-yellow-600/30 text-yellow-300' },
  moderate: { border: 'border-orange-500/60', bg: 'bg-orange-950/40', icon: 'text-orange-400', badge: 'bg-orange-600/30 text-orange-300' },
  severe: { border: 'border-red-500/70', bg: 'bg-red-950/50', icon: 'text-red-400', badge: 'bg-red-600/30 text-red-300' },
};

const SeverityIcon = ({ severity }: { severity: 'minor' | 'moderate' | 'severe' }) => {
  if (severity === 'severe') return <Skull size={13} />;
  if (severity === 'moderate') return <Flame size={13} />;
  return <AlertTriangle size={13} />;
};

/** 将 DebuffEffect 转成可读摘要 */
const buildEffectSummary = (debuff: ActiveDebuff): string => {
  const config = getDebuffConfig(debuff.configId);
  if (!config) return '';
  const e = config.effects;
  const stacks = debuff.stacks;
  const parts: string[] = [];

  const fmt = (label: string, val: number) =>
    val !== 0 ? `${label}${val > 0 ? '+' : ''}${val * stacks}/天` : '';

  if (e.economy) parts.push(fmt('经济', e.economy));
  if (e.order) parts.push(fmt('治安', e.order));
  if (e.culture) parts.push(fmt('文化', e.culture));
  if (e.livelihood) parts.push(fmt('民生', e.livelihood));
  if (e.money) parts.push(fmt('金钱', e.money));
  if (e.facilityIncomeMultiplier) parts.push(`产业${(e.facilityIncomeMultiplier * 100).toFixed(0)}%`);
  if (e.cultureGainMultiplier) parts.push(`文化增益${(e.cultureGainMultiplier * 100).toFixed(0)}%`);

  return parts.filter(Boolean).join('，') || '无持续效果';
};

const DebuffCard: React.FC<{ debuff: ActiveDebuff }> = ({ debuff }) => {
  const config = getDebuffConfig(debuff.configId);
  const { tryClearDebuff, playerStats } = useGameStore();
  const [expanded, setExpanded] = useState(false);
  const [clearMsg, setClearMsg] = useState<string | null>(null);

  if (!config) return null;

  const style = severityStyle[config.severity];
  const remainText = debuff.remainingDays === -1 ? '持续中' : `剩余 ${debuff.remainingDays} 天`;
  const effectSummary = buildEffectSummary(debuff);

  const handleClear = (methodId: string) => {
    const result = tryClearDebuff(debuff.configId, methodId);
    setClearMsg(result.message);
    setTimeout(() => setClearMsg(null), 2500);
  };

  return (
    <div className={`rounded-lg border ${style.border} ${style.bg} p-2 text-xs mb-1.5`}>
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={style.icon}><SeverityIcon severity={config.severity} /></span>
          <span className="font-bold text-white/90">{config.name}</span>
          {debuff.stacks > 1 && (
            <span className={`text-[10px] px-1 py-0.5 rounded ${style.badge}`}>×{debuff.stacks}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${style.badge}`}>{remainText}</span>
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-white/40 hover:text-white/80 transition-colors"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* 效果摘要（常显） */}
      <div className="mt-1 text-white/60 text-[11px]">{effectSummary}</div>

      {/* 来源 */}
      {debuff.source && (
        <div className="mt-0.5 text-white/30 text-[10px]">来源：{debuff.source}</div>
      )}

      {/* 展开详情 */}
      {expanded && (
        <div className="mt-2 pt-2 border-t border-white/10">
          {/* 描述 */}
          <p className="text-white/50 text-[11px] mb-2 leading-relaxed">{config.description}</p>

          {/* 解除方式 */}
          <div className="text-white/70 mb-1 font-medium">可用解除方式：</div>
          <div className="space-y-1">
            {config.clearMethods.map(method => {
              const canAffordMoney = !method.moneyCost || playerStats.money >= method.moneyCost;
              const canAffordRep = !method.reputationCost || playerStats.reputation >= method.reputationCost;
              const isManual = !!(method.moneyCost || method.reputationCost || method.healthCost);
              const canExecute = canAffordMoney && canAffordRep && isManual;

              return (
                <div key={method.id} className="flex items-center justify-between gap-2">
                  <span className="text-white/60 flex-1 text-[11px]">{method.label}</span>
                  {isManual && (
                    <button
                      onClick={() => handleClear(method.id)}
                      disabled={!canExecute}
                      className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                        canExecute
                          ? 'bg-white/15 hover:bg-white/25 text-white/80'
                          : 'bg-white/5 text-white/25 cursor-not-allowed'
                      }`}
                    >
                      {canExecute ? '执行' : '资源不足'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* 操作反馈 */}
          {clearMsg && (
            <div className="mt-2 text-[11px] text-emerald-400">{clearMsg}</div>
          )}
        </div>
      )}
    </div>
  );
};

export const DebuffPanel: React.FC = () => {
  const { activeDebuffs } = useGameStore();
  const debuffs = activeDebuffs || [];

  if (debuffs.length === 0) return null;

  const severeCount = debuffs.filter(d => getDebuffConfig(d.configId)?.severity === 'severe').length;

  return (
    <div className="mt-2 p-3 rounded-lg border border-white/10 bg-black/30 backdrop-blur-md">
      <div className="flex items-center gap-1.5 mb-1.5">
        <AlertTriangle size={13} className="text-orange-400" />
        <span className="text-xs font-semibold text-orange-300">
          当前负面效果 ({debuffs.length})
          {severeCount > 0 && <span className="ml-1 text-red-400">⚠ {severeCount} 严重</span>}
        </span>
      </div>
      <div>
        {debuffs.map(d => (
          <DebuffCard key={`${d.configId}_${d.triggeredDay}`} debuff={d} />
        ))}
      </div>
    </div>
  );
};
