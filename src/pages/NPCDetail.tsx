import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Scroll, Lock, Briefcase, Package, Fingerprint } from 'lucide-react';
import { npcs } from '@/data/npcs';
import { useGameStore } from '@/store/gameStore';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

export const NPCDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { npcRelations } = useGameStore();
  const vibrate = useGameVibrate();

  const npc = npcs.find(n => n.id === id);
  const relation = npcRelations[id || ''] || 0;
  const isDanqingUnlocked = relation >= 20;

  if (!npc) {
    return <div className="p-4 text-center">NPC 不存在</div>;
  }

  return (
    <div className="flex flex-col p-4 min-h-screen bg-background">
      <header className="flex gap-4 items-center py-4 mb-4 border-b">
        <button 
          onClick={() => {
            vibrate(VIBRATION_PATTERNS.LIGHT);
            navigate('/npcs');
          }}
          className="p-2 rounded-full hover:bg-secondary"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">{npc.name} 的详情</h1>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <div className="p-6 space-y-4 rounded-lg border bg-card text-card-foreground">
          <div className="flex gap-4 items-center">
            <div className="p-4 rounded-full bg-primary/10">
              <User size={48} className="text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{npc.name}</h2>
              <div className="flex gap-2 items-center mt-1">
                <span className="px-2 py-1 text-sm rounded-full bg-secondary text-muted-foreground">
                  {npc.title}
                </span>
                {npc.identityCode && (
                  <span className="flex gap-1 items-center px-2 py-1 font-mono text-xs rounded-full bg-secondary/50 text-muted-foreground/70">
                    <Fingerprint size={12} />
                    {npc.identityCode}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">好感度</span>
              <span className="text-xl font-bold text-primary">{relation}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-secondary">
              <div 
                className="h-full rounded-full transition-all duration-500 bg-primary"
                style={{ width: `${Math.min(100, relation)}%` }}
              />
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-muted-foreground">简介</h3>
            <p>{npc.description}</p>
          </div>

          {relation >= 80 && npc.dailyLife && (
            <div className="p-4 rounded-md bg-secondary/30">
               <h3 className="flex gap-2 items-center mb-2 font-semibold text-primary">
                 <Briefcase size={16} />
                 <span>县居日常</span>
               </h3>
               <p className="text-sm">{npc.dailyLife}</p>
            </div>
          )}

          {relation >= 100 && npc.background && (
            <div className="p-4 rounded-md bg-secondary/50">
               <h3 className="flex gap-2 items-center mb-2 font-semibold text-primary">
                 <Scroll size={16} />
                 <span>身世背景</span>
               </h3>
               <p className="text-sm">{npc.background}</p>
            </div>
          )}

          {relation >= 100 && npc.hiddenTreasure && (
            <div className="p-4 rounded-md bg-primary/5">
               <h3 className="flex gap-2 items-center mb-2 font-semibold text-primary">
                 <Package size={16} />
                 <span>藏珍匣</span>
               </h3>
               <p className="text-sm italic">{npc.hiddenTreasure}</p>
            </div>
          )}

          {/* Special Buttons */}
          {npc.id === 'shayu_tixudao' && (
            <div className="pt-4 border-t border-border/50">
              <button
                onClick={() => {
                  window.open('https://f.wps.cn/g/JZcuQ1nM/', '_blank');
                  vibrate(VIBRATION_PATTERNS.MEDIUM);
                }}
                className="flex gap-2 justify-center items-center px-6 py-3 w-full text-sm font-medium text-orange-400 rounded-lg transition-colors bg-orange-500/10 hover:bg-orange-500/20"
                title="NPC入住申请"
              >
                <span className="text-xl">📝</span>
                <span className="text-lg">NPC入住申请</span>
              </button>
            </div>
          )}
        </div>

        {/* Danqing Portrait */}
        <div className="p-6 space-y-4 rounded-lg border bg-card text-card-foreground">
          <h3 className="flex gap-2 items-center text-xl font-bold">
            <span>丹青画像</span>
            {!isDanqingUnlocked && <Lock size={16} className="text-muted-foreground" />}
          </h3>
          
          <div className="flex flex-col justify-center items-center p-8 min-h-[300px] rounded-lg border-2 border-dashed border-border bg-secondary/20">
            {isDanqingUnlocked ? (
              <div className="space-y-4 text-center">
                {/* If it's a description */}
                {npc.danqing ? (
                  <p className="text-lg italic leading-relaxed text-foreground/80">
                    “{npc.danqing}”
                  </p>
                ) : (
                  <p className="text-muted-foreground">暂无画像描述</p>
                )}
                {/* Placeholder for actual image if added later */}
                {npc.avatar && (
                   <img src={npc.avatar} alt={npc.name} className="mt-4 max-w-full h-auto rounded shadow-lg" />
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Lock size={48} className="mx-auto mb-4 opacity-50" />
                <p>与 {npc.name} 的好感度达到 20 解锁</p>
                <p className="mt-2 text-sm opacity-70">当前好感度: {relation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
