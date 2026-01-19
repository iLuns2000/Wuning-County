import React from 'react';
import { PlayerStats, CountyStats } from '@/types/game';
import { Coins, Trophy, Zap, Heart, TrendingUp, Shield, BookOpen, Users } from 'lucide-react';

interface StatsDisplayProps {
  playerStats: PlayerStats;
  countyStats: CountyStats;
  day: number;
}

const StatItem = ({ icon: Icon, value, label, color }: any) => (
  <div className="flex items-center gap-2 bg-white/10 p-2 rounded-md">
    <Icon size={16} className={color} />
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="font-bold text-sm">{value}</span>
  </div>
);

export const StatsDisplay: React.FC<StatsDisplayProps> = ({ playerStats, countyStats, day }) => {
  return (
    <div className="flex flex-col gap-4 bg-card p-4 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-lg">第 {day} 天</h2>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">个人状态</h3>
        <div className="grid grid-cols-2 gap-2">
          <StatItem icon={Coins} value={playerStats.money} label="金钱" color="text-yellow-500" />
          <StatItem icon={Trophy} value={playerStats.reputation} label="声望" color="text-purple-500" />
          <StatItem icon={Zap} value={playerStats.ability} label="能力" color="text-blue-500" />
          <StatItem icon={Heart} value={playerStats.health} label="健康" color="text-red-500" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">县城状况</h3>
        <div className="grid grid-cols-2 gap-2">
          <StatItem icon={TrendingUp} value={countyStats.economy} label="经济" color="text-green-500" />
          <StatItem icon={Shield} value={countyStats.order} label="治安" color="text-slate-500" />
          <StatItem icon={BookOpen} value={countyStats.culture} label="文化" color="text-pink-500" />
          <StatItem icon={Users} value={countyStats.livelihood} label="民生" color="text-orange-500" />
        </div>
      </div>
    </div>
  );
};
