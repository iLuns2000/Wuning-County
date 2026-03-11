/*
 * @Author: xyZhan
 * @Date: 2026-01-27 19:29:55
 * @LastEditors: xyZhan
 * @LastEditTime: 2026-03-11
 * @FilePath: \textgame\src\pages\Home.tsx
 * @Description: 首页 - 角色选择页面（古风UI优化版）
 * 
 * Copyright (c) 2026 by , All Rights Reserved. 
 */
import React from 'react';
import { roles } from '@/data/roles';
import { useGameStore } from '@/store/gameStore';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, Sword } from 'lucide-react';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';
import { useScreenOrientation } from '@/hooks/useScreenOrientation';
import { getBackgroundImage, BACKGROUND_IMAGES } from '@/constants';

// 角色图标颜色映射
const roleColors: Record<string, string> = {
  magistrate: 'from-blue-500/30 to-blue-600/20 border-blue-400/30',
  merchant: 'from-amber-500/30 to-amber-600/20 border-amber-400/30',
  hero: 'from-red-500/30 to-red-600/20 border-red-400/30',
};

const roleIconColors: Record<string, string> = {
  magistrate: 'text-blue-400 bg-blue-500/20',
  merchant: 'text-amber-400 bg-amber-500/20',
  hero: 'text-red-400 bg-red-500/20',
};

export const Home: React.FC = () => {
  const startGame = useGameStore(state => state.startGame);
  const role = useGameStore(state => state.role);
  const navigate = useNavigate();
  const vibrate = useGameVibrate();
  const screenOrientation = useScreenOrientation();
  
  // 根据屏幕方向获取背景图片
  const isVertical = screenOrientation === 'vertical';
  const backgroundImage = getBackgroundImage(isVertical, BACKGROUND_IMAGES.HOME);

  React.useEffect(() => {
    if (role) {
      navigate('/game');
    }
  }, [role, navigate]);

  const handleRoleSelect = (roleId: any) => {
    vibrate(VIBRATION_PATTERNS.MEDIUM);
    startGame(roleId);
    navigate('/game');
  };

  const getIcon = (id: string) => {
    switch (id) {
      case 'magistrate': return <User size={32} />;
      case 'merchant': return <Briefcase size={32} />;
      case 'hero': return <Sword size={32} />;
      default: return <User size={32} />;
    }
  };

  return (
    <div className="relative flex flex-col justify-center items-center p-4 min-h-screen overflow-hidden">
      {/* 背景图层 */}
      <div 
        className="fixed top-0 left-0 w-full h-screen bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          opacity: 1,
          zIndex: -1 
        }}
      />
      
      {/* 背景遮罩 - 增强文字可读性 */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50 z-0" />
      
      {/* 内容区域 */}
      <div className="relative z-10 flex flex-col justify-center items-center w-full">
        {/* 标题 - 古风字体效果 */}
        <h1 
          className="mb-2 text-5xl md:text-6xl font-bold text-white drop-shadow-lg font-display"
          style={{
            textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)',
            animation: 'titleFadeIn 1s ease-out forwards'
          }}
        >
          无宁县志
        </h1>
        
        {/* 副标题 */}
        <p 
          className="mb-12 text-lg md:text-xl text-white/80 drop-shadow-md font-display"
          style={{
            animation: 'titleFadeIn 1s ease-out 0.2s forwards',
            opacity: 0
          }}
        >
          选择你的身份，开启县城生活
        </p>
      
      {/* 角色卡片网格 */}
      <div className="grid grid-cols-1 gap-6 w-full max-w-5xl md:grid-cols-3">
        {roles.map((roleItem, index) => (
          <button
            key={roleItem.id}
            onClick={() => handleRoleSelect(roleItem.id)}
            // 古风卡片样式 + 入场动画
            className={`
              relative flex flex-col gap-4 items-center p-6 text-center
              rounded-2xl border transition-all duration-500
              bg-gradient-to-b from-white/10 to-white/5
              backdrop-blur-sm
              hover:from-white/15 hover:to-white/10
              hover:scale-105 hover:-translate-y-2
              group cursor-pointer
              ${roleColors[roleItem.id] || 'border-white/20'}
            `}
            style={{
              animation: `cardFloatIn 0.6s ease-out ${0.1 + index * 0.15}s forwards`,
              opacity: 0,
              transform: 'translateY(30px)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
            }}
          >
            {/* 悬浮光晕效果 */}
            <div 
              className={`
                absolute inset-0 rounded-2xl opacity-0
                transition-all duration-500
                bg-gradient-to-r from-transparent via-white/5 to-transparent
                group-hover:opacity-100
              `}
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
              }}
            />
            
            {/* 角色图标 */}
            <div 
              className={`
                relative p-5 rounded-full transition-all duration-300
                border backdrop-blur-md
                ${roleIconColors[roleItem.id]}
                group-hover:scale-110 group-hover:shadow-lg
              `}
              style={{
                boxShadow: '0 0 30px rgba(255,255,255,0.1)'
              }}
            >
              {getIcon(roleItem.id)}
            </div>
            
            {/* 角色名称 */}
            <div>
              <h3 
                className="mb-2 text-2xl font-bold text-white drop-shadow-md font-display"
                style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
              >
                {roleItem.name}
              </h3>
              <p className="text-sm text-white/70 drop-shadow-sm">
                {roleItem.description}
              </p>
            </div>
            
            {/* 初始属性面板 */}
            <div 
              className="p-4 mt-2 w-full space-y-2 text-sm rounded-xl
                        bg-black/30 backdrop-blur-sm border border-white/10"
            >
              {/* 属性行 */}
              <div className="flex justify-between items-center text-white/90">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  金钱
                </span>
                <span className="font-mono font-bold text-yellow-400">
                  {roleItem.initialStats.money}
                </span>
              </div>
              <div className="flex justify-between items-center text-white/90">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  声望
                </span>
                <span className="font-mono font-bold text-purple-400">
                  {roleItem.initialStats.reputation}
                </span>
              </div>
              <div className="flex justify-between items-center text-white/90">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  能力
                </span>
                <span className="font-mono font-bold text-cyan-400">
                  {roleItem.initialStats.ability}
                </span>
              </div>
              <div className="flex justify-between items-center text-white/90">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  体力
                </span>
                <span className="font-mono font-bold text-red-400">
                  {roleItem.initialStats.health}
                </span>
              </div>
              
              {/* 技能与被动 - 分隔线 */}
              <div className="pt-3 mt-2 space-y-2 border-t border-white/10">
                <p className="text-left text-xs">
                  <span className="font-bold text-amber-300">◆ 技能：</span>
                  <span className="text-white/80"> {roleItem.specialAbility.name}</span>
                </p>
                <p className="text-left text-xs">
                  <span className="font-bold text-emerald-300">◆ 被动：</span>
                  <span className="text-white/80"> {roleItem.passiveEffect.name}</span>
                </p>
              </div>
            </div>
            
            {/* 悬浮时的装饰角标 */}
            <div className="absolute -top-1 -right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            </div>
          </button>
        ))}
      </div>
      </div>
      
      {/* 底部提示 */}
      <div 
        className="absolute bottom-8 left-0 right-0 text-center text-white/50 text-sm"
        style={{
          animation: 'titleFadeIn 1s ease-out 0.8s forwards',
          opacity: 0
        }}
      >
        <span className="inline-flex items-center gap-2">
          <span className="animate-bounce">↓</span>
          选择你的身份开始游戏
        </span>
      </div>
      
      {/* 全局动画样式 */}
      <style>{`
        @keyframes titleFadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes cardFloatIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};