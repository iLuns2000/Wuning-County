import React, { useState } from 'react';
import { X, Building2, Coins, Sprout, Trees, TrendingUp } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { facilities } from '@/data/facilities';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

interface EstateModalProps {
  onClose: () => void;
  embedded?: boolean;
}

export const EstateModal: React.FC<EstateModalProps> = ({ onClose, embedded = false }) => {
  const { ownedFacilities, playerStats, buyFacility } = useGameStore();
  const vibrate = useGameVibrate();
  const [category, setCategory] = useState<'all' | 'normal' | 'resource'>('all');

  if (embedded) {
    const income = facilities.reduce((sum, f) => sum + (f.type === 'resource' ? 0 : f.dailyIncome * (ownedFacilities[f.id] || 0)), 0);
    const total = facilities.reduce((sum, f) => sum + (ownedFacilities[f.id] || 0), 0);
    return <section className="mg-estate-page">
      <div className="mg-secondary-intro"><Building2 size={24}/><div><h2>置一份家业，收一份长利</h2><p>田庄、商铺与资源产业，都在这里经营。</p></div></div>
      <div className="mg-estate-overview">
        <div><span><Coins size={16}/>可用资金</span><strong>{playerStats.money.toLocaleString()}<small>文</small></strong></div>
        <div><span><TrendingUp size={16}/>产业基础日收</span><strong>{income.toLocaleString()}<small>文 / 日</small></strong></div>
        <div><span><Building2 size={16}/>持有规模</span><strong>{total.toLocaleString()}<small>份 / 级</small></strong></div>
      </div>
      <div className="mg-estate-toolbar"><div role="group" aria-label="产业分类">{([['all', '全部产业'], ['normal', '收租经营'], ['resource', '资源采集']] as const).map(([key, label]) => <button key={key} aria-pressed={category === key} className={category === key ? 'active' : ''} onClick={() => setCategory(key)}>{label}</button>)}</div><span>收益随县城经济变化</span></div>
      <div className="mg-estate-list">{facilities.filter(f => category === 'all' || (f.type === 'resource' ? 'resource' : 'normal') === category).map(f => {
        const owned = ownedFacilities[f.id] || 0;
        const resource = f.type === 'resource';
        const maximum = resource ? (f.maxLevel || 10) : (f.maxCount || 999);
        const maxed = owned >= maximum;
        const cost = resource ? Math.floor(f.cost * Math.pow(1.5, owned)) : f.cost;
        const affordable = playerStats.money >= cost;
        const Icon = resource ? Trees : Sprout;
        return <article key={f.id}>
          <div className="mg-estate-icon"><Icon size={24}/></div>
          <div className="mg-estate-description"><div><h3>{f.name}</h3><span>{resource ? `等级 ${owned} / ${maximum}` : `持有 ${owned} / ${maximum}`}</span></div><p>{f.description}</p><small>{f.incomeDescription}</small></div>
          <div className="mg-estate-yield"><span>{resource ? '当前产出 / 每2秒' : '每份基础日收'}</span><b>{resource ? `+${(f.resourceAmount || 0) * owned} ${f.resourceType === 'wood' ? '木材' : '石料'}` : `+${f.dailyIncome} 文`}</b>{resource && !maxed && <small>下一级 +{(f.resourceAmount || 0) * (owned + 1)}</small>}</div>
          <div className="mg-estate-purchase"><span>{maxed ? '已达上限' : `${cost.toLocaleString()} 文`}</span><button disabled={maxed || !affordable} onClick={() => { vibrate(VIBRATION_PATTERNS.SUCCESS); buyFacility(f.id); }}>{maxed ? '已达上限' : !affordable ? '资金不足' : resource && owned > 0 ? '升级产业' : '置办产业'}</button></div>
        </article>;
      })}</div>
      <p className="mg-estate-note">经营产业每日结算；资源产业持续采集，升级后提高产量。</p>
    </section>;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl border border-border">
        <div className="p-4 border-b border-border flex justify-between items-center bg-indigo-50 dark:bg-indigo-950/30">
          <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            产业置办
          </h2>
          <button onClick={() => {
              vibrate(VIBRATION_PATTERNS.LIGHT);
              onClose();
          }} className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-full transition-colors">
            <X className="w-5 h-5 text-indigo-900 dark:text-indigo-100" />
          </button>
        </div>
        
        <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-border flex justify-between items-center">
            <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200">
                <Coins className="w-4 h-4" />
                <span className="font-bold">持有资金: {playerStats.money} 文</span>
            </div>
            <div className="text-xs text-indigo-600 dark:text-indigo-400">
                * 产业每日自动产出收益，受县城经济状况影响
            </div>
        </div>

        <div className="overflow-y-auto p-4 space-y-4 bg-muted/30 flex-1">
          {facilities.map((facility) => {
            const owned = ownedFacilities[facility.id] || 0;
            const isResource = facility.type === 'resource';
            
            let cost = facility.cost;
            let canBuy = false;
            let isMax = false;
            let statusLabel = '';
            
            if (isResource) {
                // Upgrade logic
                const maxLevel = facility.maxLevel || 10;
                if (owned >= maxLevel) {
                    isMax = true;
                    statusLabel = '已满级';
                } else {
                    // Cost formula: base * 1.5 ^ level
                    cost = Math.floor(facility.cost * Math.pow(1.5, owned));
                    canBuy = playerStats.money >= cost;
                }
            } else {
                // Quantity logic
                const maxCount = facility.maxCount || 999;
                if (owned >= maxCount) {
                    isMax = true;
                    statusLabel = '已达上限';
                } else {
                    canBuy = playerStats.money >= cost;
                }
            }
            
            return (
              <div key={facility.id} className="bg-card p-4 rounded-lg border border-border shadow-sm relative overflow-hidden">
                {owned > 0 && (
                    <div className="absolute top-0 right-0 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 text-xs px-2 py-1 rounded-bl-lg font-bold">
                        {isResource ? `LV.${owned}` : `已拥有: ${owned}/${facility.maxCount || '∞'}`}
                    </div>
                )}
                
                <div className="flex justify-between items-start mb-2 pr-12">
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{facility.name}</h3>
                    <p className="text-sm text-muted-foreground">{facility.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 my-3 text-sm">
                    <div className="bg-muted p-2 rounded">
                        <span className="text-muted-foreground block text-xs">{isResource && owned > 0 ? '升级费用' : '置办费用'}</span>
                        {isMax ? (
                            <span className="text-muted-foreground font-bold">--</span>
                        ) : (
                            <span className="text-foreground font-mono font-bold">{cost} 文</span>
                        )}
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/30 p-2 rounded">
                        <span className="text-green-600 dark:text-green-400 block text-xs">
                          {isResource ? '预计产出 (每2秒)' : '预计日收'}
                        </span>
                        {isResource ? (
                            <span className="text-green-800 dark:text-green-200 font-mono font-bold">
                                {owned > 0 ? `+${(facility.resourceAmount || 0) * owned}` : `+${facility.resourceAmount}`} 
                                {facility.resourceType === 'wood' ? '木材' : '石料'}
                            </span>
                        ) : (
                            <span className="text-green-800 dark:text-green-200 font-mono font-bold">+{facility.dailyIncome} 文</span>
                        )}
                        <span className="text-xs text-green-600 dark:text-green-400 ml-1">({facility.incomeDescription})</span>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                          if (!isMax && canBuy) {
                              vibrate(VIBRATION_PATTERNS.SUCCESS);
                              buyFacility(facility.id);
                          } else {
                              vibrate(VIBRATION_PATTERNS.ERROR);
                          }
                      }}
                      disabled={isMax || !canBuy}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                        ${isMax 
                            ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                            : canBuy 
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg' 
                                : 'bg-muted text-muted-foreground cursor-not-allowed'}
                      `}
                    >
                      <Coins className="w-4 h-4" />
                      {isMax ? statusLabel : (canBuy ? (isResource && owned > 0 ? '立即升级' : '立即置办') : '资金不足')}
                    </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
