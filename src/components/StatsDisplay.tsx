import React from 'react';
import { PlayerStats, CountyStats, PlayerProfile } from '@/types/game';
import { Coins, Trophy, Zap, Heart, TrendingUp, Shield, BookOpen, Users, User, Edit2 } from 'lucide-react';

interface StatsDisplayProps {
  playerStats: PlayerStats;
  countyStats: CountyStats;
  day: number;
  playerProfile?: PlayerProfile;
  onEditProfile?: () => void;
}

const StatItem = ({ icon: Icon, value, label, color }: any) => (
  <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-md">
    <Icon size={16} className={color} />
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="font-bold text-sm">{value}</span>
  </div>
);

export const StatsDisplay: React.FC<StatsDisplayProps> = ({ playerStats, countyStats, day, playerProfile, onEditProfile }) => {
  return (
    <div className="flex flex-col gap-4 bg-card p-4 rounded-lg shadow-sm border text-card-foreground">
      {/* Profile Section */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <div 
          className="relative w-16 h-16 shrink-0 rounded-full overflow-hidden bg-secondary border-2 border-primary/10 cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center"
          onClick={onEditProfile}
        >
          {playerProfile?.avatar ? (
            <img src={playerProfile.avatar} alt={playerProfile.name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg truncate">{playerProfile?.name || '无名'}</h2>
            <button 
                onClick={onEditProfile} 
                className="p-1 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-secondary"
                title="修改资料"
            >
                <Edit2 size={14}/>
            </button>
          </div>
          <p className="text-sm text-muted-foreground">第 {day} 天</p>
        </div>
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
