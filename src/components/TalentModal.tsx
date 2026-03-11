/**
 * 古风天赋面板 - TalentModal 优化版
 */
import React from 'react';
import { X, Zap, ArrowUp, Star, Sparkles } from 'lucide-react';
import { talents } from '@/data/talents';
import { useGameStore } from '@/store/gameStore';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';
import { useTheme } from '@/hooks/useTheme';

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
  const { theme } = useTheme();
  const isLightMode = theme === 'light' || (theme === 'system' && typeof window !== 'undefined' && !window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (!isOpen) return null;

  return (
    // 遮罩层
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* 弹窗主体 */}
      <div 
        className="relative w-full max-w-2xl bg-gradient-to-b from-[#1e2d2f] to-[#182628] 
                   rounded-2xl border border-white/10 shadow-2xl max-h-[80vh] flex flex-col overflow-hidden"
        style={{ animation: 'modalIn 0.3s ease-out forwards' }}
        onClick={e => e.stopPropagation()}
      >
        {/* 顶部装饰 */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold font-display">天赋树</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        
        {/* 阅历显示 */}
        <div className="p-4 bg-gradient-to-r from-amber-500/10 to-transparent border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-muted-foreground">当前阅历</span>
            </div>
            <span className="text-2xl font-bold text-amber-400 font-mono">
              {playerStats.experience || 0}
            </span>
          </div>
        </div>

        {/* 天赋列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                  p-4 rounded-xl border transition-all duration-300
                  ${rarityStyle.bg} ${rarityStyle.border}
                  hover:border-primary/50 hover:shadow-lg ${rarityStyle.glow}
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      {/* 稀有度标识 */}
                      <span className={`w-1.5 h-1.5 rounded-full ${rarityStyle.bg.replace('/10', '').replace('bg-', 'bg-')}`} />
                      <h3 className={`font-bold ${rarityStyle.text}`}>{talent.name}</h3>
                      <span className={`
                        text-xs px-2 py-0.5 rounded-full 
                        ${rarityStyle.bg} ${rarityStyle.text} border ${rarityStyle.border}
                      `}>
                        Lv.{currentLevel} / {talent.maxLevel}
                      </span>
                      {isMaxed && (
                        <Sparkles size={12} className="text-amber-400" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{talent.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground/70">
                      <span>
                        当前加成: <span className="text-amber-400 font-mono">
                          +{Math.round(currentLevel * talent.effectValue * (talent.effectType === 'action_cost' || talent.effectType === 'max_health' ? 1 : 100))}%
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
                    className={`
                      flex flex-col items-center gap-1 p-3 rounded-xl transition-all
                      ${isMaxed 
                        ? 'bg-amber-500/20 text-amber-400 cursor-default'
                        : canAfford 
                          ? 'bg-gradient-to-b from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:from-emerald-500/30 hover:to-emerald-600/30 hover:scale-105 active:scale-95'
                          : 'bg-secondary/50 text-muted-foreground opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    <ArrowUp size={16} />
                    <span className="text-xs font-mono">{isMaxed ? 'MAX' : cost}</span>
                  </button>
                </div>
                
                {/* 进度条 */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-muted-foreground/50 mb-1">
                    <span>经验积累</span>
                    <span>{currentLevel}/{talent.maxLevel}</span>
                  </div>
                  <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
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
        <div className="p-3 border-t border-white/5">
          <div className="flex justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500/40" />
            <span className="w-2 h-2 rounded-full bg-amber-500/20" />
          </div>
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