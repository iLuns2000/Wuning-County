/**
 * 古风成就弹出 - AchievementPopup 优化版
 * 包含金灿灿的成就解锁动效
 */
import React, { useEffect, useState } from 'react';
import { Award, X, Sparkles, Star } from 'lucide-react';
import { Achievement } from '@/types/game';

interface AchievementPopupProps {
  achievement: Achievement;
  onClose: () => void;
}

// 成就稀有度颜色
const rarityColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  common: { bg: 'bg-gray-500/20', border: 'border-gray-500/40', text: 'text-gray-400', glow: 'shadow-gray-500/30' },
  rare: { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-400', glow: 'shadow-blue-500/30' },
  epic: { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-400', glow: 'shadow-purple-500/30' },
  legend: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', glow: 'shadow-amber-500/40' },
};

export const AchievementPopup: React.FC<AchievementPopupProps> = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const rarity = achievement.rarity || 'common';
  const rarityStyle = rarityColors[rarity] || rarityColors.common;

  useEffect(() => {
    // 入场动画
    setIsVisible(true);
    
    // 4秒后自动隐藏
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500); // 等待退场动画
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className={`
        fixed top-6 right-6 z-50 transition-all duration-500
        ${isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
    >
      <div 
        className={`
          relative p-5 rounded-2xl max-w-sm 
          bg-gradient-to-b from-[#1e2d2f] to-[#182628]
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
            <Award size={32} className={rarityStyle.text} />
            {/* 光芒效果 */}
            <div className={`
              absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent
              ${isVisible ? 'animate-pulse' : ''}
            `} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold uppercase tracking-wider ${rarityStyle.text}`}>
                  🎉 成就达成
                </span>
                {/* 稀有度标签 */}
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${rarityStyle.bg} ${rarityStyle.text} border ${rarityStyle.border}`}>
                  {rarity}
                </span>
              </div>
              <button 
                onClick={() => { setIsVisible(false); setTimeout(onClose, 500); }}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={14} className="text-muted-foreground" />
              </button>
            </div>
            
            <h5 className={`font-bold text-lg mb-1 ${rarityStyle.text}`}>
              {achievement.name}
            </h5>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {achievement.description}
            </p>
            
            {/* 奖励显示 */}
            <div className="flex items-center gap-3">
              <div className={`
                flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold
                bg-gradient-to-r from-amber-500/20 to-yellow-500/20 
                border border-amber-500/30 text-amber-300
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