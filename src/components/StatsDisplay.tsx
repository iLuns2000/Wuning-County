/**
 * 古风统计组件 - StatsDisplay 优化版
 * 包含资源变化动画和古风样式
 */
import React, { useState, useEffect } from 'react';
import { PlayerStats, CountyStats, PlayerProfile, WeatherType, ApparelSlot, ExternalThreatState } from '@/types/game';
import { 
  Coins, Trophy, Zap, Heart, TrendingUp, Shield, BookOpen, Users, User, 
  Edit2, Star, Award, Lightbulb, CloudSun, Building2, Flame, Wind, ThermometerSun 
} from 'lucide-react';
import { getDateInfo } from '@/store/gameStore';
import { items } from '@/data/items';
import { useTheme } from '@/hooks/useTheme';

interface StatsDisplayProps {
  playerStats: PlayerStats;
  countyStats: CountyStats;
  day: number;
  weather?: WeatherType;
  playerProfile?: PlayerProfile;
  onEditProfile?: () => void;
  onOpenTalents?: () => void;
  onOpenAchievements?: () => void;
  onOpenOffice?: () => void;
  equippedApparel: Partial<Record<ApparelSlot, string>>;
  equippedAccessories: string[];
  externalThreat?: ExternalThreatState;
}

// 资源变化动画组件
const AnimatedNumber: React.FC<{ 
  value: number; 
  prevValue?: number;
  color?: string;
  icon?: React.ReactNode;
  label: string;
}> = ({ value, prevValue, color = "text-foreground", icon, label }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (prevValue !== undefined && prevValue !== value) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsAnimating(false);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, prevValue]);
  
  const isPositive = prevValue !== undefined && value > prevValue;
  const isNegative = prevValue !== undefined && value < prevValue;
  
  return (
    <div className={`
      flex items-center gap-2 px-3 py-2 rounded-lg 
      bg-gradient-to-r from-transparent to-secondary/30
      transition-all duration-300
      ${isAnimating ? 'scale-105' : 'scale-100'}
    `}>
      {icon && <span className="opacity-70">{icon}</span>}
      <div className="flex flex-col">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className={`
          font-mono font-bold text-lg transition-all duration-300
          ${color}
          ${isPositive ? 'resource-pop positive' : ''}
          ${isNegative ? 'resource-pop negative' : ''}
        `}>
          {displayValue.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

const getWeatherName = (weather: WeatherType) => {
  const map: Record<WeatherType, string> = {
    'sunny': '晴',
    'cloudy': '阴',
    'rain_light': '小雨',
    'rain_heavy': '大雨',
    'snow_light': '小雪',
    'snow_heavy': '大雪'
  };
  return map[weather] || '晴';
};

const getWeatherIcon = (weather: WeatherType) => {
  const iconMap: Record<WeatherType, React.ReactNode> = {
    'sunny': <ThermometerSun size={14} className="text-amber-400" />,
    'cloudy': <CloudSun size={14} className="text-gray-400" />,
    'rain_light': <Wind size={14} className="text-blue-400" />,
    'rain_heavy': <Wind size={14} className="text-blue-500" />,
    'snow_light': <Wind size={14} className="text-cyan-300" />,
    'snow_heavy': <Wind size={14} className="text-white" />,
  };
  return iconMap[weather] || <CloudSun size={14} className="text-gray-400" />;
};

// 古风属性项
const AncientStatItem: React.FC<{ 
  icon: React.ReactNode; 
  value: number; 
  label: string; 
  color: string;
  maxValue?: number;
}> = ({ icon, value, label, color, maxValue }) => {
  const percentage = maxValue ? (value / maxValue) * 100 : null;
  
  return (
    <div className="relative group">
      <div className="flex items-center justify-between p-2 rounded-lg bg-black/20 border border-white/5">
        <div className="flex items-center gap-2">
          <span className={color}>{icon}</span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <span className={`font-mono font-bold ${color}`}>
          {value}{maxValue ? `/${maxValue}` : ''}
        </span>
      </div>
      {/* 进度条底色 */}
      {percentage !== null && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/30 rounded-b">
          <div 
            className={`h-full ${color.replace('text-', 'bg-')} transition-all duration-500`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      )}
    </div>
  );
};

export const StatsDisplay: React.FC<StatsDisplayProps> = ({ 
  playerStats, 
  countyStats, 
  day, 
  weather = 'sunny',
  playerProfile, 
  onEditProfile,
  onOpenTalents,
  onOpenAchievements,
  equippedApparel,
  equippedAccessories,
  onOpenOffice,
  externalThreat
}) => {
  const { year, season, dayOfSeason } = getDateInfo(day);
  const { theme } = useTheme();
  const itemMap = new Map(items.map(item => [item.id, item]));
  
  // 存储上一次的资源值用于动画
  const [prevStats, setPrevStats] = useState(playerStats);
  
  useEffect(() => {
    setPrevStats(playerStats);
  }, []);
  
  // 判断是否为浅色模式
  const isLightMode = theme === 'light' || (theme === 'system' && typeof window !== 'undefined' && !window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // 古风背景样式
  const bgClass = isLightMode 
    ? 'bg-card border-border' 
    : 'card-ancient';
  
  const getItemScore = (price?: number) => {
    const base = 10 + Math.floor((price || 0) / 200);
    return Math.min(30, Math.max(8, base));
  };
  const equippedIds = [
    ...Object.values(equippedApparel).filter((id): id is string => !!id),
    ...equippedAccessories
  ];
  const equippedItems = equippedIds.map(id => itemMap.get(id)).filter((i): i is typeof items[number] => !!i);
  const styleScores = { 清雅: 0, 华贵: 0, 英气: 0, 俏皮: 0, 典雅: 0 };
  let totalStyleScore = 0;
  equippedItems.forEach(item => {
    if (!item.style) return;
    const score = getItemScore(item.price);
    styleScores[item.style] += score;
    totalStyleScore += score;
  });


  return (
    <div className={`flex flex-col gap-4 ${bgClass} p-4`}>
      {/* 头部：玩家信息和日期天气 */}
      <div className="flex items-center gap-4 pb-4 border-b border-white/10">
        {/* 头像 */}
        <div 
          className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden 
                     bg-gradient-to-br from-primary/20 to-secondary
                     border-2 border-primary/20 cursor-pointer
                     hover:border-primary/50 transition-colors group"
          onClick={onEditProfile}
        >
          {playerProfile?.avatar ? (
            <img src={playerProfile.avatar} alt={playerProfile.name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          {/* 编辑图标 */}
          <div className="absolute inset-0 flex items-center justify-center 
                          bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
            <Edit2 size={14} className="text-white" />
          </div>
        </div>
        
        {/* 名称和时间 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg truncate font-display">
              {playerProfile?.name || '无名侠客'}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {/* 季节日期 */}
            <span className="flex items-center gap-1">
              <span className="text-amber-300">◆</span>
              第 {year} 年 {season} ({dayOfSeason}日)
            </span>
            {/* 天气 */}
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-secondary/50">
              {getWeatherIcon(weather)}
              <span className="text-xs">{getWeatherName(weather)}</span>
            </span>
          </div>
        </div>
      </div>
      
      {/* 玩家资源区 */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <span className="w-1 h-3 bg-primary rounded-full" />
          个人状态
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          <AnimatedNumber 
            value={playerStats.money} 
            prevValue={prevStats.money}
            color="text-yellow-400"
            icon={<Coins size={14} className="text-yellow-500" />}
            label="金钱"
          />
          <AnimatedNumber 
            value={playerStats.reputation} 
            prevValue={prevStats.reputation}
            color="text-purple-400"
            icon={<Trophy size={14} className="text-purple-500" />}
            label="声望"
          />
          <AnimatedNumber 
            value={playerStats.ability} 
            prevValue={prevStats.ability}
            color="text-cyan-400"
            icon={<Zap size={14} className="text-cyan-500" />}
            label="能力"
          />
          <AnimatedNumber 
            value={playerStats.health} 
            prevValue={prevStats.health}
            color="text-red-400"
            icon={<Heart size={14} className="text-red-500" />}
            label="体力"
          />
          <AnimatedNumber 
            value={playerStats.experience || 0} 
            prevValue={prevStats.experience}
            color="text-indigo-400"
            icon={<Star size={14} className="text-indigo-500" />}
            label="阅历"
          />
        </div>
        
        {/* 体力进度条 */}
        <div className="mt-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>体力</span>
            <span>{playerStats.health}/100</span>
          </div>
          <div className="h-2 bg-black/30 rounded-full overflow-hidden">
            <div 
              className={`
                h-full rounded-full transition-all duration-500
                ${playerStats.health > 60 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 
                  playerStats.health > 30 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 
                  'bg-gradient-to-r from-red-600 to-red-500'}
              `}
              style={{ width: `${Math.min(100, playerStats.health)}%` }}
            />
          </div>
        </div>
        
        {/* 天赋和成就按钮 */}
        <div className="grid grid-cols-2 gap-2 mt-2">
             <button 
                onClick={onOpenTalents}
                className="flex items-center justify-center gap-2 p-2 rounded-lg 
                         bg-gradient-to-r from-amber-500/10 to-yellow-500/10
                         border border-amber-500/20 
                         hover:border-amber-500/40 hover:from-amber-500/20 hover:to-yellow-500/20
                         transition-all group"
             >
                <Lightbulb size={14} className="text-amber-400 group-hover:text-amber-300" />
                <span className="text-xs font-medium">天赋</span>
             </button>
             <button 
                onClick={onOpenAchievements}
                className="flex items-center justify-center gap-2 p-2 rounded-lg 
                         bg-gradient-to-r from-orange-500/10 to-red-500/10
                         border border-orange-500/20
                         hover:border-orange-500/40 hover:from-orange-500/20 hover:to-red-500/20
                         transition-all group"
             >
                <Award size={14} className="text-orange-400 group-hover:text-orange-300" />
                <span className="text-xs font-medium">成就</span>
             </button>
        </div>
      </div>

      {/* 县城状态区 */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <span className="w-1 h-3 bg-cyan-500 rounded-full" />
          县城状况
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <AncientStatItem icon={<TrendingUp size={14} />} value={countyStats.economy} label="经济" color="text-green-400" maxValue={100} />
          <AncientStatItem icon={<Shield size={14} />} value={countyStats.order} label="治安" color="text-slate-400" maxValue={100} />
          <AncientStatItem icon={<BookOpen size={14} />} value={countyStats.culture} label="文化" color="text-pink-400" maxValue={100} />
          <AncientStatItem icon={<Users size={14} />} value={countyStats.livelihood} label="民生" color="text-orange-400" maxValue={100} />
        </div>
        
        {/* 战火系统 */}
        {externalThreat && (
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="grid grid-cols-3 gap-2">
              <AncientStatItem icon={<Flame size={12} />} value={externalThreat.banditThreat} label="匪患" color="text-red-500" maxValue={100} />
              <AncientStatItem icon={<Shield size={12} />} value={externalThreat.defense} label="边防" color="text-cyan-400" maxValue={100} />
              <AncientStatItem icon={<Flame size={12} />} value={externalThreat.warRisk} label="战火" color="text-rose-500" maxValue={100} />
            </div>
          </div>
        )}
        
        <button 
          onClick={onOpenOffice}
          className="w-full mt-3 flex items-center justify-center gap-2 p-2 rounded-lg 
                   bg-gradient-to-r from-indigo-500/10 to-purple-500/10
                   border border-indigo-500/20
                   hover:border-indigo-500/40 hover:from-indigo-500/20 hover:to-purple-500/20
                   transition-all group"
        >
           <Building2 size={14} className="text-indigo-400 group-hover:text-indigo-300" />
           <span className="text-xs font-medium text-indigo-300">官邸修缮</span>
        </button>
      </div>
    </div>
  );
};