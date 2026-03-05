/*
 * @Author: xyZhan
 * @Date: 2026-01-27 19:29:55
 * @LastEditors: xyZhan
 * @LastEditTime: 2026-01-27 19:57:49
 * @FilePath: \textgame\src\pages\Home.tsx
 * @Description: 
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
      {/* 背景图层 - 固定高度 100vh */}
      <div 
        className="fixed top-0 left-0 w-full h-screen bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          opacity: 1,
          zIndex: -1 
        }}
      />
      
      {/* 内容区域 - 添加半透明背景提升可读性 */}
      <div className="relative z-10 flex flex-col justify-center items-center w-full">
        <h1 className="mb-2 text-4xl font-bold text-white drop-shadow-lg">无宁县</h1>
        <p className="mb-8 text-white/90 drop-shadow-md">选择你的身份，开启县城生活</p>
      
      <div className="grid grid-cols-1 gap-6 w-full max-w-4xl md:grid-cols-3">
        {roles.map(role => (
          <button
            key={role.id}
            onClick={() => handleRoleSelect(role.id)}
            className="flex flex-col gap-4 items-center p-6 text-center rounded-xl border border-white/20 transition-all bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:scale-105 group"
          >
            <div className="p-4 rounded-full transition-colors bg-white/20 backdrop-blur-sm group-hover:bg-white/30">
              {getIcon(role.id)}
            </div>
            <div>
              <h3 className="mb-2 text-xl font-bold text-white drop-shadow-md">{role.name}</h3>
              <p className="text-sm text-white/80 drop-shadow-sm">{role.description}</p>
            </div>
            <div className="p-3 mt-4 space-y-2 w-full text-xs rounded-lg text-white/90 bg-black/20 backdrop-blur-sm">
              <div className="flex justify-between">
                <span>金钱: {role.initialStats.money}</span>
                <span>声望: {role.initialStats.reputation}</span>
              </div>
              <div className="flex justify-between">
                <span>能力: {role.initialStats.ability}</span>
                <span>体力: {role.initialStats.health}</span>
              </div>
              <div className="pt-2 space-y-1 text-left border-t border-white/20">
                <p><span className="font-bold text-white">技能:</span> {role.specialAbility.name} - {role.specialAbility.description}</p>
                <p><span className="font-bold text-white">被动:</span> {role.passiveEffect.name} - {role.passiveEffect.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      </div>
    </div>
  );
};
