/**
 * 古风事件弹窗 - EventModal 优化版
 * 包含墨韵边框、古风按钮和入场动画
 */
import React from 'react';
import { GameEvent, PlayerStats, Effect } from '@/types/game';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';
import { X, Sparkles, ArrowRight } from 'lucide-react';

interface EventModalProps {
  event: GameEvent;
  playerStats: PlayerStats;
  onOptionSelect: (optionIndex: number) => void;
  onClose?: () => void;
  styleMatch?: {
    preferred: string[];
    totalScore: number;
    matchScore: number;
    tier: 'none' | 'normal' | 'good' | 'excellent';
    bonusPercent: number;
  };
}

// 事件类型徽章颜色
const eventTypeStyles: Record<string, { bg: string; text: string; label: string }> = {
  daily: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: '日常' },
  opportunity: { bg: 'bg-purple-500/10', text: 'text-purple-400', label: '机遇' },
  challenge: { bg: 'bg-red-500/10', text: 'text-red-400', label: '挑战' },
  npc: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'NPC' },
};

// 风格等级徽章
const tierStyles: Record<string, { bg: string; text: string; stars: string }> = {
  excellent: { bg: 'bg-amber-500/20', text: 'text-amber-300', stars: '★★★★★' },
  good: { bg: 'bg-green-500/20', text: 'text-green-400', stars: '★★★★☆' },
  normal: { bg: 'bg-blue-500/20', text: 'text-blue-400', stars: '★★★☆☆' },
  none: { bg: 'bg-gray-500/20', text: 'text-gray-300', stars: '★☆☆☆☆' },
};

export const EventModal: React.FC<EventModalProps> = ({ event, playerStats, onOptionSelect, onClose, styleMatch }) => {
  const vibrate = useGameVibrate();
  const typeStyle = eventTypeStyles[event.type] || eventTypeStyles.daily;
  
  const checkRequirement = (effect?: Effect) => {
    if (!effect) return { allowed: true, reason: '' };
    
    let moneyCost = 0;
    if (effect.money && effect.money < 0) moneyCost += Math.abs(effect.money);
    if (effect.playerStats?.money && effect.playerStats.money < 0) moneyCost += Math.abs(effect.playerStats.money);
    
    if (moneyCost > 0 && playerStats.money < moneyCost) {
      return { allowed: false, reason: `金钱不足 (需 ${moneyCost} 文)` };
    }

    let healthCost = 0;
    if (effect.health && effect.health < 0) healthCost += Math.abs(effect.health);
    if (effect.playerStats?.health && effect.playerStats.health < 0) healthCost += Math.abs(effect.playerStats.health);
    
    if (healthCost > 0 && playerStats.health < healthCost) {
      return { allowed: false, reason: `体力不足 (需 ${healthCost} 点)` };
    }
    
    return { allowed: true, reason: '' };
  };
  
  return (
    // 遮罩层
    <div 
      className="flex fixed inset-0 z-50 justify-center items-center p-4"
      onClick={onClose}
    >
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* 弹窗主体 */}
      <div 
        className="relative w-full max-w-md p-6 rounded-2xl overflow-hidden
                   bg-gradient-to-b from-[#1e2d2f] to-[#182628]
                   border border-white/10 shadow-2xl shadow-black/50"
        style={{
          animation: 'modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 墨韵装饰 - 顶部 */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        <div className="absolute top-0 left-0 w-8 h-8 border-l border-t border-amber-500/30 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-amber-500/30 rounded-tr-lg" />
        
        {/* 墨韵装饰 - 底部 */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-l border-b border-primary/30 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-r border-b border-primary/30 rounded-br-lg" />
        
        {/* 左侧装饰线 */}
        <div className="absolute left-0 top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-amber-500/30 to-transparent" />
        
        {/* 关闭按钮 */}
        {onClose && (
          <button
            onClick={() => {
              vibrate(VIBRATION_PATTERNS.LIGHT);
              onClose();
            }}
            className="absolute top-3 right-3 p-2 rounded-lg transition-all hover:bg-white/10 z-10"
            title="关闭"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
        
        {/* 事件类型标签 */}
        <div className="mb-4">
          <span className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 
            text-xs font-bold uppercase rounded-full
            border
            ${typeStyle.bg} ${typeStyle.text} border-current/20
          `}>
            <Sparkles size={12} />
            {typeStyle.label}
          </span>
        </div>
        
        {/* 标题 */}
        <h2 className="mb-3 text-2xl font-bold font-display flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-amber-500 to-primary rounded-full" />
          {event.title}
        </h2>
        
        {/* 描述 */}
        <p className="mb-5 leading-relaxed text-muted-foreground/90 text-sm">
          {event.description}
        </p>

        {/* 穿搭风格匹配提示 */}
        {styleMatch && styleMatch.preferred.length > 0 && (
          <div className="p-4 mb-5 rounded-xl border bg-gradient-to-r from-secondary/30 to-transparent">
            <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
              <span>场景偏好：{styleMatch.preferred.join('、')}</span>
              <span className="font-mono">评分：{styleMatch.matchScore}/{styleMatch.totalScore}</span>
            </div>
            <div className="flex items-center gap-2">
              {(() => {
                const tier = tierStyles[styleMatch.tier];
                return (
                  <>
                    <span className={`text-xs ${tier.text}`}>{tier.stars}</span>
                    <span className="text-xs text-muted-foreground">|</span>
                    <span className={`text-sm font-medium ${tier.text}`}>
                      {styleMatch.tier === 'excellent' && `穿搭契合：极佳 (+${styleMatch.bonusPercent}%)`}
                      {styleMatch.tier === 'good' && `穿搭契合：良好 (+${styleMatch.bonusPercent}%)`}
                      {styleMatch.tier === 'normal' && `穿搭契合：一般 (+${styleMatch.bonusPercent}%)`}
                      {styleMatch.tier === 'none' && '穿搭契合：不足 (无加成)'}
                    </span>
                  </>
                );
              })()}
            </div>
          </div>
        )}
        
        {/* 选项按钮 */}
        <div className="space-y-2.5">
          {(event.options || []).map((option, index) => {
            const { allowed, reason } = checkRequirement(option.effect);
            
            return (
              <button
                key={index}
                disabled={!allowed}
                onClick={() => {
                  vibrate(VIBRATION_PATTERNS.MEDIUM);
                  onOptionSelect(index);
                }}
                className={`
                  w-full p-3.5 text-left rounded-xl transition-all duration-300
                  border relative overflow-hidden group
                  ${allowed 
                    ? `border-white/5 bg-gradient-to-r from-secondary/50 to-transparent
                       hover:from-secondary/70 hover:border-primary/30 
                       hover:translate-x-1 hover:shadow-lg hover:shadow-primary/5
                       active:translate-x-0`
                    : 'border-transparent opacity-60 cursor-not-allowed bg-secondary/30'
                  }
                `}
              >
                {/* 悬停光效 */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity
                              bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                
                <div className="relative flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {/* 选项序号 */}
                    <span className={`
                      w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                      ${allowed ? 'bg-primary/20 text-primary' : 'bg-gray-500/20 text-gray-400'}
                    `}>
                      {index + 1}
                    </span>
                    <span className={`font-medium ${allowed ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {option.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!allowed ? (
                      <span className="text-xs text-red-400">{reason}</span>
                    ) : (
                      <ArrowRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
                
                {/* 选项描述（二级信息） */}
                {option.description && (
                  <p className="mt-1.5 ml-9 text-xs text-muted-foreground/70">
                    {option.description}
                  </p>
                )}
              </button>
            );
          })}
          
          {/* NPC 类型的关闭按钮 */}
          {event.type === 'npc' && onClose && (
            <button
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                onClose();
              }}
              className="w-full p-3 text-center rounded-xl border border-white/10 
                         bg-transparent text-muted-foreground
                         hover:bg-white/5 hover:text-foreground
                         transition-all duration-300"
            >
              拜拜了您嘞，下次再见
            </button>
          )}
        </div>
        
        {/* 底部装饰点 */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/40" />
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/20" />
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/10" />
        </div>
      </div>
      
      {/* 动画样式 */}
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