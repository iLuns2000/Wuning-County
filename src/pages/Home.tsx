import React from 'react';
import { roles } from '@/data/roles';
import { useGameStore } from '@/store/gameStore';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, Sword } from 'lucide-react';

export const Home: React.FC = () => {
  const startGame = useGameStore(state => state.startGame);
  const navigate = useNavigate();

  const handleRoleSelect = (roleId: any) => {
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-2">无宁县</h1>
      <p className="text-muted-foreground mb-8">选择你的身份，开启县城生活</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {roles.map(role => (
          <button
            key={role.id}
            onClick={() => handleRoleSelect(role.id)}
            className="bg-card hover:bg-accent hover:text-accent-foreground border rounded-xl p-6 transition-all hover:scale-105 flex flex-col items-center text-center gap-4 group"
          >
            <div className="p-4 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors">
              {getIcon(role.id)}
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">{role.name}</h3>
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </div>
            <div className="w-full mt-4 space-y-2 text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg">
              <div className="flex justify-between">
                <span>金钱: {role.initialStats.money}</span>
                <span>声望: {role.initialStats.reputation}</span>
              </div>
              <div className="flex justify-between">
                <span>能力: {role.initialStats.ability}</span>
                <span>健康: {role.initialStats.health}</span>
              </div>
              <div className="pt-2 border-t border-border/50 text-left space-y-1">
                <p><span className="font-bold text-primary">技能:</span> {role.specialAbility.name} - {role.specialAbility.description}</p>
                <p><span className="font-bold text-primary">被动:</span> {role.passiveEffect.name} - {role.passiveEffect.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
