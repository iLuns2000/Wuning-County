/**
 * 古风成就弹出 - AchievementPopup 优化版
 * 包含金灿灿的成就解锁动效
 */
import React, { useEffect, useRef, useState } from 'react';
import { Award, X, Sparkles, Star } from 'lucide-react';
import { Achievement } from '@/types/game';
import { useInterfaceStore } from '@/store/interfaceStore';

interface AchievementPopupProps {
  achievement: Achievement;
  onClose: () => void;
}

// 成就稀有度颜色
const rarityColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  common: { bg: 'bg-gray-500/20', border: 'border-gray-500/40', text: 'text-gray-300', glow: 'shadow-gray-500/30' },
  rare: { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-400', glow: 'shadow-blue-500/30' },
  epic: { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-400', glow: 'shadow-purple-500/30' },
  legend: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', glow: 'shadow-amber-500/40' },
};

export const AchievementPopup: React.FC<AchievementPopupProps> = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const modern = useInterfaceStore(state => state.version === 'modern');
  const closeHandler = useRef(onClose);
  closeHandler.current = onClose;
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const rarity = achievement.rarity || 'common';
  const rarityStyle = rarityColors[rarity] || rarityColors.common;
  const rarityName = { common: '普通', rare: '稀有', epic: '史诗', legend: '传说' }[rarity as 'common' | 'rare' | 'epic' | 'legend'] || '普通';
  const dismiss = () => {
    clearTimeout(hideTimer.current);
    clearTimeout(closeTimer.current);
    setIsVisible(false);
    closeTimer.current = setTimeout(() => closeHandler.current(), 500);
  };

  useEffect(() => {
    // 入场动画
    setIsVisible(true);
    
    // 4秒后自动隐藏
    hideTimer.current = setTimeout(dismiss, 4000);

    return () => {
      clearTimeout(hideTimer.current);
      clearTimeout(closeTimer.current);
    };
  }, [achievement.id]);

  return (
    <div 
      className={`
        fixed right-3 sm:right-6 w-[calc(100%-1.5rem)] max-w-sm z-50 transition-all duration-500 motion-reduce:transition-none
        ${modern ? 'top-[calc(140px+0.75rem)] sm:top-6' : 'top-6'}
        ${isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
      role="status"
      aria-live="polite"
    >
      <div 
        className={`
          relative p-4 sm:p-5 rounded-2xl max-w-sm
          bg-card text-card-foreground
          border-2 ${rarityStyle.border}
          shadow-2xl ${rarityStyle.glow}
          overflow-hidden
        `}
      >
        {/* 顶部闪光装饰 */}
        <div className={`
          absolute top-0 left-0 right-0 h-px
          bg-gradient-to-r from-transparent via-amber-400 to-transparent
          ${isVisible ? 'animate-pulse' : ''}
        `} />
        
        {/* 左侧装饰条 */}
        <div className={`
          absolute left-0 top-0 bottom-0 w-1
          bg-gradient-to-b ${rarityStyle.text.replace('text-', 'from-')}/50 to-transparent
        `} />
        
        {/* 庆祝光效 */}
        {isVisible && (
          <>
            <Sparkles className={`absolute -top-2 -right-2 w-8 h-8 ${rarityStyle.text} animate-spin`} style={{ animationDuration: '3s' }} />
            <Star className="absolute top-2 right-8 w-4 h-4 text-amber-300 animate-pulse" />
            <Star className="absolute top-8 right-2 w-3 h-3 text-amber-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </>
        )}
        
        <div className="flex items-start gap-4">
          {/* 成就图标 */}
          <div className={`
            relative p-3 rounded-xl ${rarityStyle.bg} border ${rarityStyle.border}
            ${isVisible ? 'animate-bounce' : ''}
          `} style={{ animationDuration: '0.6s', animationDelay: '0.1s' }}>
            <Award size={28} className="text-primary" />
            {/* 光芒效果 */}
            <div className={`
              absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent
              ${isVisible ? 'animate-pulse' : ''}
            `} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-bold text-primary">
                  🎉 成就达成
                </span>
                {/* 稀有度标签 */}
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${rarityStyle.bg} text-muted-foreground border ${rarityStyle.border}`}>
                  {rarityName}
                </span>
              </div>
              <button 
                onClick={dismiss}
                aria-label="关闭成就提示"
                className="relative z-10 shrink-0 -mr-2 -mt-2 p-3 rounded-lg hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary transition-colors"
              >
                <X size={14} className="text-muted-foreground" />
              </button>
            </div>
            
            <h5 className="font-bold text-lg mb-1 text-foreground break-words">
              {achievement.name}
            </h5>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {achievement.description}
            </p>
            
            {/* 奖励显示 */}
            <div className="flex items-center gap-3">
              <div className={`
                flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold
                bg-accent border border-border text-accent-foreground
              `}>
                <Star size={12} />
                阅历 +{achievement.rewardExp}
              </div>
            </div>
          </div>
        </div>
        
        {/* 底部流光 */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5">
          <div 
            className={`
              h-full bg-gradient-to-r from-transparent via-amber-400 to-transparent
              ${isVisible ? 'animate-[shimmer_1s_ease-in-out_infinite]' : ''}
            `}
            style={{ width: '200%', animationDirection: 'reverse' }}
          />
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
