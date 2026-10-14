/**
 * 古风天赋面板 - TalentModal 优化版
 */
import React, { useEffect, useRef } from 'react';
import { X, Zap, ArrowUp, Star, Sparkles } from 'lucide-react';
import { talents } from '@/data/talents';
import { useGameStore } from '@/store/gameStore';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

interface TalentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 稀有度颜色
const rarityColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  common: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400', glow: 'shadow-gray-500/20' },
  rare: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
  epic: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
  legend: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
};

export const TalentModal: React.FC<TalentModalProps> = ({ isOpen, onClose }) => {
  const { talents: playerTalents, playerStats, upgradeTalent } = useGameStore();
  const vibrate = useGameVibrate();
  const panel = useRef<HTMLDivElement>(null);
  const closeHandler = useRef(onClose);
  closeHandler.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeHandler.current();
      if (event.key === 'Tab' && panel.current) {
        const controls = Array.from(panel.current.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // 遮罩层
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* 弹窗主体 */}
      <div 
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="talent-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-2xl bg-card text-card-foreground
                   rounded-2xl border border-border shadow-2xl max-h-[calc(100dvh-2rem)] sm:max-h-[85dvh] flex flex-col overflow-hidden"
        style={{ animation: 'modalIn 0.3s ease-out forwards' }}
        onClick={e => e.stopPropagation()}
      >
        {/* 顶部装饰 */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        
        {/* 标题栏 */}
        <div className="flex shrink-0 items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h2 id="talent-modal-title" className="text-xl font-bold font-display">天赋树</h2>
          </div>
          <button 
            onClick={onClose} 
            aria-label="关闭天赋树"
            className="p-3 rounded-lg hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        
        {/* 阅历显示 */}
        <div className="shrink-0 p-4 bg-muted/50 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">当前阅历</span>
            </div>
            <span className="text-2xl font-bold text-primary font-mono" aria-live="polite">
              {playerStats.experience || 0}
            </span>
          </div>
        </div>

        {/* 天赋列表 */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-3">
          {talents.map((talent) => {
            const currentLevel = playerTalents[talent.id] || 0;
            const isMaxed = currentLevel >= talent.maxLevel;
            const cost = talent.baseCost * (currentLevel + 1);
            const canAfford = (playerStats.experience || 0) >= cost;
            const rarity = talent.rarity || 'common';
            const rarityStyle = rarityColors[rarity] || rarityColors.common;

            return (
              <div 
                key={talent.id} 
                className={`
                  p-3 sm:p-4 rounded-xl border transition-all duration-300
                  ${rarityStyle.bg} ${rarityStyle.border}
                  hover:border-primary/50 hover:shadow-lg ${rarityStyle.glow}
                `}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {/* 稀有度标识 */}
                      <span className={`w-1.5 h-1.5 rounded-full ${rarityStyle.bg.replace('/10', '').replace('bg-', 'bg-')}`} />
                      <h3 className="font-bold text-foreground">{talent.name}</h3>
                      <span className={`
                        text-xs px-2 py-0.5 rounded-full 
                        ${rarityStyle.bg} text-muted-foreground border ${rarityStyle.border}
                      `}>
                        Lv.{currentLevel} / {talent.maxLevel}
                      </span>
                      {isMaxed && (
                        <Sparkles size={12} className="text-amber-400" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{talent.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        当前加成: <span className="text-primary font-mono">
                          {talent.effectType === 'max_health'
                            ? `体力上限 +${currentLevel * talent.effectValue} 点`
                            : talent.effectType === 'action_cost'
                              ? `体力消耗 -${currentLevel * talent.effectValue} 点`
                              : `+${Math.round(currentLevel * talent.effectValue * 100)}%`}
                        </span>
                      </span>
                      {talent.effectType !== 'action_cost' && talent.effectType !== 'max_health' && (
                        <span>效率</span>
                      )}
                    </div>
                  </div>

                  {/* 升级按钮 */}
                  <button
                    onClick={() => {
                      if (!isMaxed && canAfford) {
                        vibrate(VIBRATION_PATTERNS.MEDIUM);
                        upgradeTalent(talent.id);
                      }
                    }}
                    disabled={isMaxed || !canAfford}
                    aria-label={isMaxed ? `${talent.name}已满级` : `升级${talent.name}，消耗${cost}阅历${canAfford ? '' : '，阅历不足'}`}
                    className={`
                      shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary
                      ${isMaxed 
                        ? 'bg-muted text-muted-foreground cursor-default'
                        : canAfford 
                          ? 'bg-primary text-primary-foreground hover:opacity-90 active:scale-95'
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }
                    `}
                  >
                    <ArrowUp size={16} />
                    <span className="text-xs">{isMaxed ? '已满级' : canAfford ? '升级' : '阅历不足'}</span>
                    {!isMaxed && <span className="text-[10px] font-mono">{cost} 阅历</span>}
                  </button>
                </div>
                
                {/* 进度条 */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>天赋等级</span>
                    <span>{currentLevel}/{talent.maxLevel}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${rarityStyle.text.replace('text-', 'bg-')}`}
                      style={{ width: `${(currentLevel / talent.maxLevel) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 底部装饰 */}
        <div className="shrink-0 p-3 border-t border-border text-xs text-muted-foreground text-center">
          上下滑动查看全部天赋，升级消耗阅历。
        </div>
      </div>
      
      <style>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(15px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
