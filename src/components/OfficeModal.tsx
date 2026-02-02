import React, { useState, useEffect } from 'react';
import { X, Building2, ArrowUpCircle, Hammer, Timer, Zap } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { officeUpgrades } from '@/data/officeUpgrades';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

interface OfficeModalProps {
  onClose: () => void;
}

export const OfficeModal: React.FC<OfficeModalProps> = ({ onClose }) => {
  const { 
    playerStats, 
    officeState, 
    inventory,
    startUpgradeOffice,
    speedUpUpgrade,
    completeUpgrade,
    checkUpgradeStatus,
    cancelUpgradeOffice
  } = useGameStore();
  
  // Safety check for legacy saves
  const currentOfficeState = officeState || { level: 1, isUpgrading: false };
  
  const vibrate = useGameVibrate();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
        setNow(Date.now());
        checkUpgradeStatus();
    }, 1000);
    return () => clearInterval(timer);
  }, [checkUpgradeStatus]);

  const currentLevel = currentOfficeState.level;
  const isUpgrading = currentOfficeState.isUpgrading;
  const nextConfig = officeUpgrades.find(u => u.level === currentLevel + 1);
  
  // Calculate resources
  const woodCount = inventory.filter(id => id === 'wood').length;
  const stoneCount = inventory.filter(id => id === 'stone').length;
  const constructionOrderCount = inventory.filter(id => id === 'construction_order').length;
  const rareStoneCount = inventory.filter(id => id === 'rare_stone').length;

  // Calculate progress
  let progress = 0;
  let remainingMs = 0;
  let canFreeSpeedup = false;

  if (isUpgrading && currentOfficeState.upgradeStartTime && currentOfficeState.upgradeEndTime) {
      const total = currentOfficeState.upgradeEndTime - currentOfficeState.upgradeStartTime;
      const elapsed = now - currentOfficeState.upgradeStartTime;
      progress = Math.min(100, (elapsed / total) * 100);
      remainingMs = Math.max(0, currentOfficeState.upgradeEndTime - now);
      canFreeSpeedup = remainingMs <= 15 * 60 * 1000; // 15 mins
  }

  const formatTime = (ms: number) => {
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      if (hours > 0) return `${hours}小时${minutes}分`;
      return `${minutes}分${seconds}秒`;
  };

  const renderContent = () => {
    if (currentLevel >= 20 && !nextConfig) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center min-h-[300px]">
                <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
                    <Building2 className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">官邸已臻化境</h3>
                <p className="text-muted-foreground">您的官邸已达到最高等级，威震一方。</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Current Status */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg border border-indigo-100 dark:border-indigo-800 text-center">
                <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">当前官邸等级</div>
                <div className="text-4xl font-bold text-indigo-900 dark:text-indigo-100">LV.{currentLevel}</div>
                {currentOfficeState.level < 20 && (
                     <div className="text-xs text-muted-foreground mt-2">
                        下一级解锁: {nextConfig?.benefits.unlocks?.join('、') || '更高资源产量与仓库容量'}
                     </div>
                )}
            </div>

            {isUpgrading ? (
                <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold flex items-center gap-2">
                            <Hammer className="w-5 h-5 text-orange-500 animate-bounce" />
                            官邸修缮中...
                        </h3>
                        <span className="text-orange-600 font-mono font-bold">{formatTime(remainingMs)}</span>
                    </div>
                    
                    <div className="w-full bg-secondary h-4 rounded-full overflow-hidden">
                        <div 
                            className="bg-orange-500 h-full transition-all duration-1000 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="flex justify-center pt-4 gap-4">
                        {remainingMs <= 0 ? (
                            <button
                                onClick={() => {
                                    vibrate(VIBRATION_PATTERNS.SUCCESS);
                                    completeUpgrade();
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-bold shadow-lg animate-pulse"
                            >
                                完成修缮
                            </button>
                        ) : (
                            <>
                                {canFreeSpeedup ? (
                                    <button
                                        onClick={() => {
                                            vibrate(VIBRATION_PATTERNS.LIGHT);
                                            speedUpUpgrade('free', 15 * 60 * 1000);
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2"
                                    >
                                        <Zap className="w-4 h-4" />
                                        免费完成
                                    </button>
                                ) : (
                                    <div className="text-sm text-muted-foreground self-center">
                                        正在施工中...
                                    </div>
                                )}
                                
                                <button
                                    onClick={() => {
                                        if (window.confirm('确定要取消修缮吗？投入的资源将全部返还。')) {
                                            vibrate(VIBRATION_PATTERNS.LIGHT);
                                            cancelUpgradeOffice();
                                        }
                                    }}
                                    className="bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-4 py-2 rounded-full text-sm font-bold transition-colors border border-red-200 dark:border-red-800"
                                >
                                    取消
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ) : nextConfig ? (
                <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                     <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <ArrowUpCircle className="w-5 h-5 text-green-600" />
                        升级至 LV.{nextConfig.level}
                     </h3>

                     <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">所需资源</div>
                            <div className={`flex justify-between text-sm ${playerStats.money >= nextConfig.cost.money ? 'text-green-600' : 'text-red-500'}`}>
                                <span>银两</span>
                                <span>{playerStats.money}/{nextConfig.cost.money}</span>
                            </div>
                            <div className={`flex justify-between text-sm ${woodCount >= nextConfig.cost.wood ? 'text-green-600' : 'text-red-500'}`}>
                                <span>木材</span>
                                <span>{woodCount}/{nextConfig.cost.wood}</span>
                            </div>
                            <div className={`flex justify-between text-sm ${stoneCount >= nextConfig.cost.stone ? 'text-green-600' : 'text-red-500'}`}>
                                <span>石料</span>
                                <span>{stoneCount}/{nextConfig.cost.stone}</span>
                            </div>
                             {nextConfig.cost.constructionOrder && (
                                <div className={`flex justify-between text-sm ${constructionOrderCount >= nextConfig.cost.constructionOrder ? 'text-green-600' : 'text-red-500'}`}>
                                    <span>建材令</span>
                                    <span>{constructionOrderCount}/{nextConfig.cost.constructionOrder}</span>
                                </div>
                            )}
                             {nextConfig.cost.rareStone && (
                                <div className={`flex justify-between text-sm ${rareStoneCount >= nextConfig.cost.rareStone ? 'text-green-600' : 'text-red-500'}`}>
                                    <span>稀有石料</span>
                                    <span>{rareStoneCount}/{nextConfig.cost.rareStone}</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2 border-l pl-4 border-border">
                            <div className="text-sm font-medium text-muted-foreground">预计耗时</div>
                            <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                                <Timer className="w-4 h-4" />
                                {formatTime(nextConfig.durationSeconds * 1000)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                                收益: 资源产量 +{Math.round((nextConfig.benefits.resourceRate - 1)*100)}%
                            </div>
                        </div>
                     </div>

                     <button
                        onClick={() => {
                            vibrate(VIBRATION_PATTERNS.HEAVY);
                            startUpgradeOffice();
                        }}
                        disabled={
                            playerStats.money < nextConfig.cost.money ||
                            woodCount < nextConfig.cost.wood ||
                            stoneCount < nextConfig.cost.stone ||
                            (nextConfig.cost.constructionOrder ? constructionOrderCount < nextConfig.cost.constructionOrder : false) ||
                            (nextConfig.cost.rareStone ? rareStoneCount < nextConfig.cost.rareStone : false)
                        }
                        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground py-3 rounded-lg font-bold transition-colors"
                     >
                        开始修缮
                     </button>
                </div>
            ) : null}
        </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl border border-border">
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-indigo-50 dark:bg-indigo-950/30">
          <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            官邸修缮
          </h2>
          <button onClick={() => {
              vibrate(VIBRATION_PATTERNS.LIGHT);
              onClose();
          }} className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-full transition-colors">
            <X className="w-5 h-5 text-indigo-900 dark:text-indigo-100" />
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto p-4 flex-1 bg-muted/10">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};
