import React, { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { StatsDisplay } from '@/components/StatsDisplay';
import { LogPanel } from '@/components/LogPanel';
import { EventModal } from '@/components/EventModal';
import { useNavigate } from 'react-router-dom';
import { Moon, Briefcase, Coffee, Users, Star, FileText, ScrollText, Scroll, ShoppingBag, Building2, Dices, Landmark } from 'lucide-react';
import { roles } from '@/data/roles';
import { tasks } from '@/data/tasks';
import { PolicyModal } from '@/components/PolicyModal';
import { policies } from '@/data/policies';
import { ProfileModal } from '@/components/ProfileModal';
import { TimeManager } from '@/components/TimeManager';
import { TalentModal } from '@/components/TalentModal';
import { AchievementModal } from '@/components/AchievementModal';
import { SettingsModal } from '@/components/SettingsModal';
import { MarketModal } from '@/components/MarketModal';
import { EstateModal } from '@/components/EstateModal';
import { InventoryModal } from '@/components/InventoryModal';
import { ExploreModal } from '@/components/ExploreModal';
import { AchievementPopup } from '@/components/AchievementPopup';
import { MobileLogToast } from '@/components/MobileLogToast';
import { Settings, Backpack, Compass } from 'lucide-react';
import { achievements as achievementData } from '@/data/achievements';

export const Game: React.FC = () => {
  const navigate = useNavigate();
  const [showPolicies, setShowPolicies] = React.useState(false);
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  const [showTalents, setShowTalents] = React.useState(false);
  const [showAchievements, setShowAchievements] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showMarket, setShowMarket] = React.useState(false);
  const [showEstates, setShowEstates] = React.useState(false);
  const [showInventory, setShowInventory] = React.useState(false);
  const [showExplore, setShowExplore] = React.useState(false);
  const [isNightWarning, setIsNightWarning] = React.useState(false);
  const [showTeaPopup, setShowTeaPopup] = React.useState(false);

  const { 
    role, 
    day, 
    weather,
    playerStats,
    playerProfile,
    setPlayerProfile,
    countyStats, 
    logs, 
    currentEvent, 
    nextDay, 
    handleEventOption,
    resetGame,
    addLog,
    currentTaskId,
    handleTaskAction,
    dailyCounts,
    incrementDailyCount,
    activePolicyId,
    setPolicy,
    cancelPolicy,
    flags,
    latestUnlockedAchievementId,
    dismissAchievementPopup
  } = useGameStore();

  const currentTask = (currentTaskId && tasks) ? tasks.find(t => t.id === currentTaskId) : null;
  const activePolicy = activePolicyId ? policies.find(p => p.id === activePolicyId) : null;
  const latestAchievement = latestUnlockedAchievementId ? achievementData.find(a => a.id === latestUnlockedAchievementId) : null;
  
  const MAX_DAILY_WORK = 3;
  const MAX_DAILY_REST = 1;

  // Meiwu Tea Seeking Logic
  const isTeaDay = ((day - 1) % 360 + 1) === 61 && weather === 'sunny';

  useEffect(() => {
    if (isTeaDay && !flags['tea_seeking_popup_shown']) {
      setShowTeaPopup(true);
      handleEventOption({
        flagsSet: { tea_seeking_popup_shown: true }
      });
    }
  }, [isTeaDay, flags, handleEventOption]);

  useEffect(() => {
    if (!role) {
      navigate('/');
    }
  }, [role, navigate]);

  useEffect(() => {
    if (isNightWarning) {
       addLog('【天色渐晚】太阳即将落山，这一天快要结束了...');
       // Reset warning after a few seconds to avoid spamming (or just let it be handled by log deduplication if any)
       const timer = setTimeout(() => setIsNightWarning(false), 5000);
       return () => clearTimeout(timer);
    }
  }, [isNightWarning]);

  if (!role) return null;

  const handleOptionSelect = (index: number) => {
    if (!currentEvent) return;
    const option = currentEvent.options[index];
    handleEventOption(option.effect, option.message);
  };

  const handleWork = () => {
    if (dailyCounts.work >= MAX_DAILY_WORK) {
      addLog('今天的工作已经够多了，要注意劳逸结合。');
      return;
    }

    // Simple work logic based on role
    let msg = '';
    let money = 0;
    let reputation = 0;
    const healthCost = -10;

    if (playerStats.health < 10) {
      addLog('你太累了，需要休息！');
      return;
    }

    if (role === 'magistrate') {
      msg = '你处理了一天的公务，县城治安有所改善。';
      reputation = 5;
    } else if (role === 'merchant') {
      msg = '你用心经营店铺，获得了一些收益。';
      // Passive effect: Merchant gains 20% more money
      money = Math.floor(20 * 1.2);
    } else {
      msg = '你在城中行侠仗义，帮助了几个路人。';
      reputation = 10;
    }
    
    incrementDailyCount('work');
    handleEventOption({ money, reputation, health: healthCost }, msg);
  };

  const handleRest = () => {
     if (dailyCounts.rest >= MAX_DAILY_REST) {
       addLog('你今天已经休息过了，不宜太过懒散。');
       return;
     }

     // Passive effect: Hero recovers more health
     const healAmount = role === 'hero' ? 30 : 20;
     const msg = role === 'hero' 
       ? '你运功调息，体力恢复得很快。' 
       : '你休息了一整天，感觉精力充沛。';
    
    incrementDailyCount('rest');
    handleEventOption({ health: healAmount }, msg);
  };

  const handleSaveProfile = (name: string, avatar: string) => {
    setPlayerProfile({ name, avatar });
    addLog(`你更新了个人资料，改名为“${name}”。`);
  };

  const handleSpecialAbility = () => {
    if (playerStats.health < 15) {
      addLog('体力不足，无法使用技能！');
      return;
    }

    if (role === 'magistrate') {
      // 巡视乡里: Cost 15 Health, +3 Random County Stat, +5 Rep
      const stats = ['economy', 'order', 'culture', 'livelihood'];
      const randomStat = stats[Math.floor(Math.random() * stats.length)];
      const statName = { economy: '经济', order: '治安', culture: '文化', livelihood: '民生' }[randomStat];
      
      handleEventOption({ 
        health: -15, 
        reputation: 5,
        ability: 2, // Add ability gain
        countyStats: { [randomStat]: 3 }
      }, `你深入乡里巡视，解决了百姓的实际困难，${statName}有所提升，处理政务的能力也得到了锻炼。`);
    } 
    else if (role === 'merchant') {
      // 风险投资: Cost 100 Money + 10 Health
      if (playerStats.money < 100) {
        addLog('资金不足，无法进行投资！');
        return;
      }
      
      const isSuccess = Math.random() > 0.5;
      if (isSuccess) {
        handleEventOption({
          money: 100, // +200 - 100 cost
          health: -10,
          ability: 2 // Add ability gain on success
        }, '你的眼光独到，投资大获成功！商业头脑更敏锐了。');
      } else {
        handleEventOption({
          money: -100,
          health: -10,
          ability: 1 // Learn from failure
        }, '市场风云变幻，这次投资血本无归... 但你从中吸取了教训。');
      }
    }
    else if (role === 'hero') {
      // 闭关修炼: Cost 30 Health, +5 Ability
      if (playerStats.health < 30) {
        addLog('体力不足，无法闭关！');
        return;
      }
      handleEventOption({
        health: -30,
        ability: 5
      }, '你闭关修炼，领悟了新的武学要义。');
    }
  };

  const currentRoleConfig = roles.find(r => r.id === role);
  
  const isHeavySnow = weather === 'snow_heavy';

  return (
    <div 
      className="flex justify-center p-4 min-h-screen transition-colors duration-1000 bg-background"
      style={{
        backgroundColor: isTeaDay ? 'rgb(0,191,255)' : undefined
      }}
    >
      <TimeManager onNightWarning={() => setIsNightWarning(true)} />
      <div className="grid grid-cols-1 gap-6 w-full max-w-7xl md:grid-cols-3 md:h-[calc(100vh-2rem)]">
        
        {/* Left Column: Stats */}
        <div className="flex overflow-y-auto flex-col gap-6 mx-auto w-full max-w-md h-full md:max-w-none no-scrollbar">
          <header className="flex justify-between items-center py-2 shrink-0">
            <h1 className="text-xl font-bold">无宁县</h1>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowSettings(true)}
                className="p-1 text-muted-foreground hover:text-foreground"
                title="系统设置"
              >
                <Settings size={20} />
              </button>
              <button 
                onClick={() => { resetGame(); navigate('/'); }}
                className="text-xs text-muted-foreground hover:text-foreground"
                title="退出游戏"
              >
                退出
              </button>
            </div>
          </header>

          <StatsDisplay 
            playerStats={playerStats} 
            countyStats={countyStats} 
            day={day} 
            weather={weather}
            playerProfile={playerProfile}
            onEditProfile={() => setShowProfileModal(true)}
            onOpenTalents={() => setShowTalents(true)}
            onOpenAchievements={() => setShowAchievements(true)}
          />
        </div>

        {/* Middle Column: Actions */}
        <div className="flex overflow-y-auto flex-col gap-6 mx-auto w-full max-w-md h-full md:max-w-none no-scrollbar">
          {currentTask && (
            <div className="space-y-1">
              <h2 className="ml-1 text-sm font-semibold text-muted-foreground">当前任务</h2>
              <div className="p-4 space-y-2 rounded-lg border shadow-sm bg-card text-card-foreground border-primary/20">
                <div className="flex gap-2 justify-between items-start">
                  <h3 className="flex gap-2 items-center text-base font-bold shrink-0">
                     <FileText size={18} className="text-primary" />
                     <span>{currentTask.title}</span>
                  </h3>
                  <span className="px-2 py-1 text-xs text-right rounded-full bg-primary/10 text-primary">
                    {currentTask.goalDescription}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{currentTask.description}</p>
                
                {currentTask.specialAction && (
                  <button
                    onClick={handleTaskAction}
                    disabled={!!currentEvent}
                    className="flex gap-2 justify-center items-center p-2 mt-2 w-full text-sm font-medium rounded border transition-colors bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 disabled:opacity-50"
                  >
                    <span>{currentTask.specialAction.label}</span>
                    <span className="text-xs opacity-70">({currentTask.specialAction.costText})</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleWork}
              disabled={!!currentEvent || dailyCounts.work >= MAX_DAILY_WORK || isHeavySnow}
              className="flex relative gap-2 justify-center items-center p-4 rounded-lg transition-colors bg-secondary hover:bg-secondary/80 disabled:opacity-50 group/btn"
              title={isHeavySnow ? "大雪封山，无法工作" : ""}
            >
              <Briefcase size={20} />
              <span>日常工作 ({dailyCounts.work}/{MAX_DAILY_WORK})</span>
              {isHeavySnow && (
                <div className="flex absolute inset-0 justify-center items-center text-xs font-bold rounded-lg opacity-0 transition-opacity bg-background/80 text-foreground group-hover/btn:opacity-100">
                  大雪停工
                </div>
              )}
            </button>
            <button 
              onClick={handleRest}
              disabled={!!currentEvent || dailyCounts.rest >= MAX_DAILY_REST}
              className="flex gap-2 justify-center items-center p-4 rounded-lg transition-colors bg-secondary hover:bg-secondary/80 disabled:opacity-50"
            >
              <Coffee size={20} />
              <span>休息整顿 ({dailyCounts.rest}/{MAX_DAILY_REST})</span>
            </button>
            
            {role === 'magistrate' && (
               <div className="flex flex-col col-span-2 gap-2">
                 <button 
                   onClick={() => setShowPolicies(true)}
                   disabled={!!currentEvent}
                   className="flex justify-between items-center p-4 w-full rounded-lg border transition-colors bg-card border-primary/20 hover:bg-primary/5 disabled:opacity-50"
                 >
                   <div className="flex gap-2 items-center">
                     <FileText size={20} className="text-primary" />
                     <span className="font-bold">施政方针</span>
                   </div>
                   <div className="text-sm text-muted-foreground">
                     {activePolicy ? (
                       <span className="font-medium text-primary">{activePolicy.name}</span>
                     ) : (
                       <span>暂无政令</span>
                     )}
                   </div>
                 </button>
               </div>
            )}

            <div className="flex flex-col col-span-2 gap-1">
              <button 
                onClick={handleSpecialAbility}
                disabled={!!currentEvent}
                className="flex flex-col gap-1 justify-center items-center p-3 w-full rounded-lg border transition-colors bg-primary/10 border-primary/20 hover:bg-primary/20 disabled:opacity-50 group"
              >
                <div className="flex gap-2 items-center font-bold text-primary">
                  <Star size={18} />
                  <span>{currentRoleConfig?.specialAbility?.name || '专属技能'}</span>
                </div>
                <span className="text-xs transition-colors text-muted-foreground group-hover:text-primary/80">
                  {currentRoleConfig?.specialAbility?.costText}
                </span>
              </button>
              <p className="px-4 text-xs text-center whitespace-pre-line text-muted-foreground">
                {currentRoleConfig?.specialAbility?.description}
              </p>
            </div>
            <button 
              onClick={() => navigate('/npcs')}
              disabled={!!currentEvent || isHeavySnow}
              className="flex relative gap-2 justify-center items-center p-4 rounded-lg transition-colors bg-secondary hover:bg-secondary/80 disabled:opacity-50 group/btn"
              title={isHeavySnow ? "大雪封山，无法出行" : ""}
            >
              <Users size={20} />
              <span>拜访 NPC</span>
              {isHeavySnow && (
                <div className="flex absolute inset-0 justify-center items-center text-xs font-bold rounded-lg opacity-0 transition-opacity bg-background/80 text-foreground group-hover/btn:opacity-100">
                  大雪封路
                </div>
              )}
            </button>
            <button 
              onClick={() => navigate('/tasks')}
              disabled={!!currentEvent}
              className="flex gap-2 justify-center items-center p-4 rounded-lg transition-colors bg-secondary hover:bg-secondary/80 disabled:opacity-50"
            >
              <ScrollText size={20} />
              <span>任务记录</span>
            </button>

            <button 
              onClick={() => setShowMarket(true)}
              disabled={!!currentEvent}
              className="flex gap-2 justify-center items-center p-4 text-amber-900 bg-amber-100 rounded-lg transition-colors hover:bg-amber-200 disabled:opacity-50"
            >
              <ShoppingBag size={20} />
              <span>西市集</span>
            </button>

            <button 
              onClick={() => setShowEstates(true)}
              disabled={!!currentEvent}
              className="flex gap-2 justify-center items-center p-4 text-indigo-900 bg-indigo-100 rounded-lg transition-colors hover:bg-indigo-200 disabled:opacity-50"
            >
              <Building2 size={20} />
              <span>产业置办</span>
            </button>
            <button 
              onClick={() => navigate('/facilities')}
              disabled={!!currentEvent}
              className="flex gap-2 justify-center items-center p-4 rounded-lg transition-colors bg-secondary hover:bg-secondary/80 disabled:opacity-50"
            >
              <Dices size={20} />
              <span>游乐坊</span>
            </button>

            <button 
              onClick={() => navigate('/buildings')}
              disabled={!!currentEvent}
              className="flex gap-2 justify-center items-center p-4 rounded-lg transition-colors bg-secondary hover:bg-secondary/80 disabled:opacity-50"
            >
              <Landmark size={20} />
              <span>建筑阁</span>
            </button>
            
            <button 
              onClick={() => setShowExplore(true)}
              disabled={!!currentEvent || dailyCounts.work >= MAX_DAILY_WORK || dailyCounts.rest >= MAX_DAILY_REST || isHeavySnow}
              className="flex relative gap-2 justify-center items-center p-4 text-emerald-900 bg-emerald-100 rounded-lg transition-colors hover:bg-emerald-200 disabled:opacity-50 group/btn"
              title={isHeavySnow ? "大雪封山，无法探险" : ""}
            >
              <Compass size={20} />
              <span>外出探险</span>
              {isHeavySnow && (
                <div className="flex absolute inset-0 justify-center items-center text-xs font-bold rounded-lg opacity-0 transition-opacity bg-background/80 text-foreground group-hover/btn:opacity-100">
                  无法探险
                </div>
              )}
            </button>

            <button 
              onClick={() => navigate('/collection')}
              disabled={!!currentEvent}
              className="flex gap-2 justify-center items-center p-4 rounded-lg transition-colors bg-secondary hover:bg-secondary/80 disabled:opacity-50"
            >
              <Scroll size={20} />
              <span>藏珍匣</span>
            </button>

            <button 
              onClick={() => setShowInventory(true)}
              disabled={!!currentEvent}
              className="flex col-span-2 gap-2 justify-center items-center p-4 rounded-lg transition-colors bg-secondary hover:bg-secondary/80 disabled:opacity-50"
            >
              <Backpack size={20} />
              <span>行囊</span>
            </button>
          </div>

          <button
            onClick={nextDay}
            disabled={!!currentEvent}
            className="flex gap-2 justify-center items-center p-4 w-full text-lg font-bold rounded-lg transition-all bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Moon size={24} />
            <span>结束这一天</span>
          </button>
        </div>

        {/* Right Column: Logs */}
        <div className="mx-auto w-full max-w-md h-96 md:h-[768px] md:max-w-none">
          <LogPanel logs={logs} />
        </div>

      </div>

      {currentEvent && (
        <EventModal event={currentEvent} onOptionSelect={handleOptionSelect} />
      )}

      {showPolicies && role === 'magistrate' && (
        <PolicyModal 
          activePolicyId={activePolicyId} 
          onSelect={setPolicy}
          onCancel={cancelPolicy}
          onClose={() => setShowPolicies(false)}
        />
      )}

      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        initialName={playerProfile?.name || ''}
        initialAvatar={playerProfile?.avatar || ''}
        onSave={handleSaveProfile}
      />

      <TalentModal isOpen={showTalents} onClose={() => setShowTalents(false)} />
      <AchievementModal isOpen={showAchievements} onClose={() => setShowAchievements(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      {showMarket && <MarketModal onClose={() => setShowMarket(false)} />}
      {showEstates && <EstateModal onClose={() => setShowEstates(false)} />}
      {showInventory && <InventoryModal onClose={() => setShowInventory(false)} />}
      {showExplore && <ExploreModal onClose={() => setShowExplore(false)} />}
      
      {showTeaPopup && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/50">
          <div className="p-6 max-w-sm text-center rounded-lg shadow-xl duration-300 bg-card border-primary/20 animate-in fade-in zoom-in">
             <div className="flex justify-center mb-4 text-primary">
                <ScrollText size={48} />
             </div>
             <h3 className="mb-2 text-xl font-bold">梅坞寻茶</h3>
             <p className="mb-4 text-muted-foreground">
               恭喜你今天是三月三，天水蓝，阳光照暖了青杉
             </p>
             <div className="p-2 mb-4 text-sm font-medium rounded bg-secondary/50 text-primary">
                获得成就《梅坞寻茶》
             </div>
             <button 
               onClick={() => setShowTeaPopup(false)}
               className="px-4 py-2 w-full font-bold rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
             >
               收下这份美好
             </button>
          </div>
        </div>
      )}

      {latestAchievement && (
        <AchievementPopup 
          achievement={latestAchievement} 
          onClose={dismissAchievementPopup} 
        />
      )}
      
      <MobileLogToast />
    </div>
  );
};
